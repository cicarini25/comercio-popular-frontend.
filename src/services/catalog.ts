import { Product } from '../types';
import { API_BASE_URL, getAuthToken } from './api';
import { resolveProductCategory } from '../utils/productCategories';
import { getAuditedProductCategoryOverride } from '../utils/catalogProductCategoryOverrides';
import { CATEGORIES } from '../data/mockProducts';
import { normalizeCategoryMenuGroups } from '../data/categoryMenu';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUPPORTED_AFFILIATE_PLATFORMS = new Set(['shopee', 'shein', 'aliexpress']);
// O catálogo carrega até 60 itens por página e busca o próximo lote ao rolar.
// Assim, a primeira tela não precisa baixar o catálogo inteiro.
export const CATALOG_PAGE_SIZE = 60;
const categories: Record<string, string> = {
  'Home & Living': 'Casa & Cozinha',
  'Sports & Outdoors': 'Esportes & Lazer',
};

// O UUID da oferta é a origem segura do redirecionamento; o link de afiliado não é montado no navegador.
export function mapCatalogProduct(row: any): Product | null {
  if (!row || !UUID.test(row.id) || typeof row.title !== 'string' || !row.title.trim()) return null;
  const legacyCategoryNames: Record<string, string> = { 'Casa & Construção': 'Ferramentas', 'Tecnologia': 'ELETRÔNICOS', 'Moda Infantil': 'CALÇADOS INFANTIS M/F' };
  const categoryOverride = legacyCategoryNames[row.category_override] || row.category_override;
  const selectedCategory = typeof categoryOverride === 'string' && categoryOverride !== 'Todas as Categorias' && CATEGORIES.includes(categoryOverride) ? categoryOverride : '';
  const inferredCategory = resolveProductCategory(categories[row.category] || row.category, row.title, row.description || '');
  const auditedCategoryOverride = getAuditedProductCategoryOverride(row.id);
  const backendCategory = typeof row.category === 'string' && CATEGORIES.includes(row.category) ? row.category : '';
  const effectiveCategory = row.source === 'proprio'
    ? backendCategory || selectedCategory || inferredCategory
    : auditedCategoryOverride || backendCategory || (inferredCategory && inferredCategory !== 'Outros' ? inferredCategory : selectedCategory || inferredCategory);

  let image = '/favicon.png';
  try { const url = new URL(row.image_url); if (url.protocol === 'https:' && !url.username && !url.password) image = url.href; } catch { /* fallback */ }
  let videoUrl: string | undefined;
  try {
    const candidate = row.video_url ?? row.videoUrl;
    if (typeof candidate === 'string' && candidate.trim()) {
      const video = new URL(candidate.trim(), API_BASE_URL);
      if (video.protocol === 'https:' && !video.username && !video.password) videoUrl = video.href;
    }
  } catch { /* produto sem vídeo */ }

  if (row.source === 'proprio') {
    const price = Number(row.price);
    const stock = row.stock_units == null ? 0 : Number(row.stock_units);
    if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0 || row.seller_verification_status !== 'verified' || !UUID.test(row.seller_id || '')) return null;
    return {
      id: row.id, catalogSource: 'seller', title: row.title.trim(), description: row.description || '', price,
      platform: 'parceiro', images: [image], videoUrl, category: effectiveCategory,
      rating: 0, reviewCount: 0, reviews: [], isAchadinho: false, stockUnits: stock,
      seller: {
        id: row.seller_id,
        name: typeof row.seller_store_name === 'string' && row.seller_store_name.trim() ? row.seller_store_name.trim() : 'Loja parceira',
        city: '', state: '', verified: true, plan: typeof row.seller_plan === 'string' ? row.seller_plan : 'parceiro', rating: 0, salesCount: 0,
      },
      isVerified: true, isFreeShipping: false, isFastShipping: false, isBestPrice: false,
    };
  }

  const offer = Array.isArray(row.offers)
    ? row.offers.filter((item: any) => SUPPORTED_AFFILIATE_PLATFORMS.has(item?.platform?.code) && item.offerType === 'afiliada' && item.currency === 'BRL' && UUID.test(item.id) && Number.isFinite(Number(item.price)) && Number(item.price) > 0)
      .sort((a: any, b: any) => Number(a.price) - Number(b.price))[0]
    : null;
  if (!offer) return null;
  const price = Number(offer.price);
  const original = Number(offer.originalPrice);
  const stock = offer.stockUnits == null ? null : Number(offer.stockUnits);
  const rawExpiry = offer.flashDealExpiresAt ?? offer.expiresAt ?? offer.validUntil;
  const flashDealExpiresAt = typeof rawExpiry === 'string' && Number.isFinite(Date.parse(rawExpiry)) && Date.parse(rawExpiry) > Date.now() ? new Date(rawExpiry).toISOString() : undefined;
  return {
    id: row.id, catalogSource: 'api', title: row.title.trim(), description: row.description || '',
    price, originalPrice: original > price ? original : undefined,
    discountPercentage: original > price ? Math.round((original - price) / original * 100) : undefined,
    platform: offer.platform.code as Product['platform'],
    affiliateUrl: API_BASE_URL + '/api/catalog/offers/' + encodeURIComponent(offer.id) + '/go',
    affiliateOfferId: offer.id, images: [image], category: effectiveCategory, videoUrl,
    rating: 0, reviewCount: 0, reviews: [], isAchadinho: true,
    stockUnits: stock != null && Number.isInteger(stock) && stock >= 0 ? stock : null,
    flashDealExpiresAt, isVerified: false, isFastShipping: offer.isFastShipping === true,
    isFreeShipping: offer.isFreeShipping === true, isBestPrice: false,
  };
}
export async function fetchAffiliateProductById(productId: string, signal?: AbortSignal): Promise<Product | null> {
  const response = await fetch(API_BASE_URL + '/api/catalog/products/' + encodeURIComponent(productId), {
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    cache: 'default',
  });
  if (!response.ok) return null;
  const data = await response.json();
  return mapCatalogProduct(data.product);
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

export async function fetchAffiliateCatalog(
  offset = 0,
  signal?: AbortSignal,
  filters: { category?: string; query?: string } = {},
) {
  const params = new URLSearchParams({
    limit: String(CATALOG_PAGE_SIZE),
    offset: String(offset),
  });
  if (filters.category && filters.category !== 'Todas as Categorias') params.set('category', filters.category);
  if (filters.query?.trim()) params.set('q', filters.query.trim());

  const response = await fetch(API_BASE_URL + '/api/catalog/products?' + params.toString(), {
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    cache: 'default',
  });
  if (!response.ok) throw new Error('Não foi possível carregar a vitrine. Tente novamente.');
  const data = await response.json();
  if (!Array.isArray(data.products)) throw new Error('O catálogo retornou uma resposta inválida.');
  return {
    products: data.products.map(mapCatalogProduct).filter((p: Product | null): p is Product => p !== null),
    total: Number(data.pagination?.total || 0),
    hasMore: data.pagination?.hasMore ?? data.products.length === CATALOG_PAGE_SIZE,
  };
}

export async function fetchCatalogFacets(signal?: AbortSignal) {
  const response = await fetch(API_BASE_URL + '/api/catalog/facets', {
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    cache: 'default',
  });
  if (!response.ok) throw new Error('Não foi possível carregar as categorias e filtros.');
  const data = await response.json();
  const categories = Array.isArray(data.categories)
    ? data.categories.filter((value: unknown): value is string => typeof value === 'string')
    : CATEGORIES.slice(1);
  return {
    categories,
    groups: normalizeCategoryMenuGroups(data.groups, categories),
    categoryCounts: data.categoryCounts && typeof data.categoryCounts === 'object' ? data.categoryCounts as Record<string, number> : {},
    priceBounds: {
      min: Number(data.priceBounds?.min || 0),
      max: Number(data.priceBounds?.max || 0),
    },
  };
}

export async function fetchShopeeCatalog(offset = 0, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/api/catalog/products?platform=shopee&limit=${CATALOG_PAGE_SIZE}&offset=${offset}`, {
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    cache: 'default',
  });
  if (!response.ok) throw new Error('Não foi possível carregar o catálogo da Shopee. Tente novamente.');
  const data = await response.json();
  if (!Array.isArray(data.products)) throw new Error('O catálogo da Shopee retornou uma resposta inválida.');
  return {
    products: data.products.map(mapCatalogProduct).filter((p: Product | null): p is Product => p !== null),
    hasMore: data.products.length === CATALOG_PAGE_SIZE,
  };
}



export async function fetchCatalogCategories(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(API_BASE_URL + '/api/catalog/categories', {
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    cache: 'default',
  });
  if (!response.ok) throw new Error('Não foi possível carregar a lista de categorias.');
  const data = await response.json();
  return Array.isArray(data.categories)
    ? data.categories.filter((value: unknown): value is string => typeof value === 'string')
    : CATEGORIES.slice(1);
}

