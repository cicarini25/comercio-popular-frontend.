import { Product } from '../types';
import { API_BASE_URL, getAuthToken } from './api';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUPPORTED_AFFILIATE_PLATFORMS = new Set(['shopee', 'shein']);
const categories: Record<string, string> = {
  'Home & Living': 'Casa & Construção',
  'Sports & Outdoors': 'Esportes & Lazer',
};

// O UUID da oferta é a origem segura do redirecionamento; o link de afiliado não é montado no navegador.
export function mapCatalogProduct(row: any): Product | null {
  const offer = Array.isArray(row?.offers)
    ? row.offers
      .filter((item: any) =>
        SUPPORTED_AFFILIATE_PLATFORMS.has(item?.platform?.code) &&
        item.offerType === 'afiliada' &&
        item.currency === 'BRL' &&
        UUID.test(item.id) &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) > 0)
      .sort((a: any, b: any) => Number(a.price) - Number(b.price))[0]
    : null;
  if (!offer || !UUID.test(row.id) || typeof row.title !== 'string' || !row.title.trim()) return null;
  const price = Number(offer.price);
  const original = Number(offer.originalPrice);
  const stock = offer.stockUnits == null ? null : Number(offer.stockUnits);
  let image = '/favicon.png';
  try { const url = new URL(row.image_url); if (url.protocol === 'https:') image = url.href; } catch { /* fallback */ }
  return {
    id: row.id, catalogSource: 'api', title: row.title.trim(), description: row.description || '',
    price, originalPrice: original > price ? original : undefined,
    discountPercentage: original > price ? Math.round((original - price) / original * 100) : undefined,
    platform: offer.platform.code as Product['platform'],
    affiliateUrl: `${API_BASE_URL}/api/catalog/offers/${offer.id}/go`,
    affiliateOfferId: offer.id,
    images: [image], category: categories[row.category] || row.category || 'Outros',
    rating: 0, reviewCount: 0, reviews: [], isAchadinho: true,
    stockUnits: stock != null && Number.isInteger(stock) && stock >= 0 ? stock : null,
    isVerified: false, isFastShipping: offer.isFastShipping === true,
    isFreeShipping: offer.isFreeShipping === true, isBestPrice: false,
  };
}

export async function resolveAffiliateRedirect(product: Product): Promise<string> {
  if (product.affiliateOfferId) {
    const token = getAuthToken();
    if (!token) throw new Error('Entre na sua conta para continuar para a loja parceira.');

    const response = await fetch(
      `${API_BASE_URL}/api/catalog/offers/${encodeURIComponent(product.affiliateOfferId)}/go`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: 'no-store' }
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || 'Sua sessão pode ter expirado. Entre novamente para acessar esta oferta.');
    }
    if (typeof data?.redirectUrl !== 'string') throw new Error('Não foi possível abrir esta oferta.');
    const destination = new URL(data.redirectUrl);
    if (destination.protocol !== 'https:') throw new Error('O endereço da oferta não é seguro.');
    return destination.href;
  }

  if (!product.affiliateUrl) throw new Error('Esta oferta está indisponível.');
  const destination = new URL(product.affiliateUrl);
  if (destination.protocol !== 'https:') throw new Error('O endereço da oferta não é seguro.');
  const allowedHosts: Record<string, string[]> = {
    shopee: ['shopee.com.br', 'shope.ee'],
    shein: ['shein.com', 'shein.top'],
    mercadolivre: ['mercadolivre.com.br', 'meli.la'],
    amazon: ['amazon.com.br', 'amzn.to'],
    aliexpress: ['aliexpress.com', 'aliexpress.us'],
    netshoes: ['netshoes.com.br'],
    magalu: ['magalu.com', 'magazinevoce.com.br', 'parceiromagalu.com.br'],
  };
  const isAllowedHost = (allowedHosts[product.platform] || []).some((host) =>
    destination.hostname === host || destination.hostname.endsWith(`.${host}`)
  );
  if (!isAllowedHost) throw new Error('O destino desta oferta não é reconhecido como uma loja parceira.');
  return destination.href;
}

export async function fetchAffiliateCatalog(offset = 0, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/api/catalog/products?limit=100&offset=${offset}`, {
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Não foi possível carregar a vitrine. Tente novamente.');
  const data = await response.json();
  if (!Array.isArray(data.products)) throw new Error('O catálogo retornou uma resposta inválida.');
  return {
    products: data.products.map(mapCatalogProduct).filter((p: Product | null): p is Product => p !== null),
    hasMore: data.products.length === 100,
  };
}
