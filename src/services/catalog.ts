import { Product } from '../types';
import { API_BASE_URL } from './api';

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
    images: [image], category: categories[row.category] || row.category || 'Outros',
    rating: 0, reviewCount: 0, reviews: [], isAchadinho: true,
    stockUnits: stock != null && Number.isInteger(stock) && stock >= 0 ? stock : null,
    isVerified: false, isFastShipping: offer.isFastShipping === true,
    isFreeShipping: offer.isFreeShipping === true, isBestPrice: false,
  };
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
