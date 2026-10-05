export interface PriceAlert {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  targetPrice: number;
  currentPrice: number;
  initialPrice: number;
  createdAt: string;
  isTriggered: boolean;
}

export type Platform = 'mercadolivre' | 'shopee' | 'amazon' | 'aliexpress' | 'netshoes' | 'shein' | 'tiktokshop' | 'magalu' | 'parceiro';

export interface CompetitorPrice {
  marketplace: 'mercadolivre' | 'shopee' | 'amazon' | 'aliexpress' | 'outros';
  name: string;
  price: number;
}

export interface PriceComparison {
  competitors: CompetitorPrice[];
  averageMarketPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  lowestMarketplace?: string;
  isLowestPriceHere: boolean;
}

export interface Product {
  catalogSource?: "api";
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  platform: Platform;
  affiliateUrl?: string;
  affiliateOfferId?: string;
  affiliateCommissionRate?: number; // ex: 8.5%
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  isAchadinho: boolean;
  stockUnits: number | null;
  flashDealExpiresAt?: string;
  badge?: string;
  competitorPrices?: CompetitorPrice[];
  priceComparison?: PriceComparison;
  seller?: {
    id: string;
    name: string;
    city: string;
    state: string;
    verified: boolean;
    plan: string;
    rating: number;
    salesCount: number;
  };
  features?: string[];
  specs?: Record<string, string>;
  isFreeShipping?: boolean;
  isVerified?: boolean;
  isFastShipping?: boolean;
  isBestPrice?: boolean;
  ean?: string; // Código de barras EAN-13 / EAN-8
  upc?: string; // Código de barras UPC-A / UPC-E
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
  likes?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  freightOption?: {
    name: string;
    days: number;
    price: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  isVerifiedFace: boolean;
  isVerifiedSMS: boolean;
  isSeller: boolean;
  sellerPlan?: 'iniciante' | 'pro' | 'empresa';
  balance?: number;
  avatar?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shippingTotal: number;
  total: number;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  paymentStatus: 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered';
  pixCode?: string;
  pixQrCodeUrl?: string;
  installments?: number;
  sellerSplit?: {
    sellerAmount: number;
    platformFee: number;
  };
  trackingCode?: string;
}

export interface SellerPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  badge?: string;
  popular?: boolean;
  maxProducts: number | string;
  feePercentage: number;
}

export interface StockNotificationRequest {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  sellerId?: string;
  sellerName?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  createdAt: string;
  status: 'pending' | 'notified';
}
