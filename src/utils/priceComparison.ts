import { Product, PriceComparison, CompetitorPrice } from '../types';

export interface MarketplaceBrand {
  id: 'mercadolivre' | 'shopee' | 'amazon';
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const MARKETPLACE_BRANDS: Record<string, MarketplaceBrand> = {
  mercadolivre: {
    id: 'mercadolivre',
    name: 'Mercado Livre',
    shortName: 'Mercado Livre',
    color: '#2D3277',
    bgColor: '#FFF8D6',
    borderColor: '#FFE600'
  },
  shopee: {
    id: 'shopee',
    name: 'Shopee',
    shortName: 'Shopee',
    color: '#EE4D2D',
    bgColor: '#FFF0ED',
    borderColor: '#FFD5CC'
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon Brasil',
    shortName: 'Amazon',
    color: '#131921',
    bgColor: '#F3F4F6',
    borderColor: '#E5E7EB'
  }
};

/**
 * Calculates or retrieves the price comparison of a product against other major marketplaces
 * (Mercado Livre, Shopee, Amazon).
 */
export function getProductPriceComparison(product: Product): PriceComparison {
  if (product.catalogSource === 'api') return {
    competitors: [], averageMarketPrice: product.price, savingsAmount: 0,
    savingsPercentage: 0, isLowestPriceHere: false
  };
  if (product.priceComparison) {
    return product.priceComparison;
  }

  const basePrice = product.price;
  const originalPrice = product.originalPrice || basePrice * 1.35;

  // Derive realistic marketplace prices based on product properties
  let mlPrice: number;
  let shopeePrice: number;
  let amazonPrice: number;

  if (product.competitorPrices && product.competitorPrices.length > 0) {
    const ml = product.competitorPrices.find((c) => c.marketplace === 'mercadolivre');
    const sh = product.competitorPrices.find((c) => c.marketplace === 'shopee');
    const am = product.competitorPrices.find((c) => c.marketplace === 'amazon');

    mlPrice = ml?.price ?? roundPrice(originalPrice * 0.98);
    shopeePrice = sh?.price ?? roundPrice(basePrice * 1.22);
    amazonPrice = am?.price ?? roundPrice(originalPrice * 1.05);
  } else {
    // Generate deterministic variations
    const seed = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mod1 = (seed % 10) / 100; // 0.00 to 0.09
    const mod2 = ((seed * 3) % 15) / 100; // 0.00 to 0.14

    if (product.platform === 'shopee') {
      shopeePrice = basePrice;
      mlPrice = roundPrice(originalPrice * (0.92 + mod1));
      amazonPrice = roundPrice(originalPrice * (1.02 + mod2));
    } else if (product.platform === 'mercadolivre') {
      mlPrice = basePrice;
      shopeePrice = roundPrice(basePrice * (1.18 + mod1));
      amazonPrice = roundPrice(originalPrice * (0.98 + mod2));
    } else if (product.platform === 'amazon') {
      amazonPrice = basePrice;
      mlPrice = roundPrice(originalPrice * (0.94 + mod1));
      shopeePrice = roundPrice(basePrice * (1.20 + mod2));
    } else {
      // Marketplace próprio (parceiro local)
      mlPrice = roundPrice(originalPrice * (0.96 + mod1));
      shopeePrice = roundPrice(basePrice * (1.24 + mod2));
      amazonPrice = roundPrice(originalPrice * (1.04 + mod1));
    }
  }

  const competitors: CompetitorPrice[] = [
    { marketplace: 'mercadolivre', name: 'Mercado Livre', price: mlPrice },
    { marketplace: 'shopee', name: 'Shopee', price: shopeePrice },
    { marketplace: 'amazon', name: 'Amazon', price: amazonPrice }
  ];

  // For computing comparison, average the prices of the OTHER marketplaces (or all three if local)
  // If the product is on Shopee, compare against ML and Amazon.
  const externalPrices = competitors
    .filter((c) => c.marketplace !== product.platform || c.price !== basePrice)
    .map((c) => c.price);

  const pricesToAverage = externalPrices.length > 0 ? externalPrices : competitors.map((c) => c.price);
  const avgMarketPrice = pricesToAverage.reduce((a, b) => a + b, 0) / pricesToAverage.length;

  const savingsAmount = Math.max(0, avgMarketPrice - basePrice);
  const savingsPercentage = Math.round((savingsAmount / avgMarketPrice) * 100);

  const isLowest = competitors.every((c) => (c.marketplace === product.platform ? true : c.price >= basePrice));

  return {
    competitors,
    averageMarketPrice: roundPrice(avgMarketPrice),
    savingsAmount: roundPrice(savingsAmount),
    savingsPercentage: Math.max(5, savingsPercentage),
    isLowestPriceHere: isLowest
  };
}

function roundPrice(val: number): number {
  return Math.round(val * 10) / 10;
}
