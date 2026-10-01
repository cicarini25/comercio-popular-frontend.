import React, { useState } from 'react';
import {
  Star,
  ExternalLink,
  ShoppingCart,
  Share2,
  Check,
  Flame,
  Store,
  Clock,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Scale,
  CheckCircle2,
  Zap,
  Heart,
  Barcode,
  BellRing,
  PackageX
} from 'lucide-react';
import { Product } from '../../types';
import { PLATFORM_INFO } from '../../data/mockProducts';
import { formatCurrency } from '../../utils/formatters';
import { getProductPriceComparison, MARKETPLACE_BRANDS } from '../../utils/priceComparison';
import { StarRating } from '../common/StarRating';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onDirectAffiliateClick: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
  onOpenStockNotify?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  onDirectAffiliateClick,
  isFavorite = false,
  onToggleFavorite,
  onOpenStockNotify
}) => {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const platform = PLATFORM_INFO[product.platform] || PLATFORM_INFO.parceiro;
  const isAffiliate = product.platform !== 'parceiro';
  const isOutOfStock = product.stockUnits === 0;
  const comparison = getProductPriceComparison(product);

  // Dynamic Badges based on product properties
  const isVerified =
    product.isVerified !== undefined
      ? product.isVerified
      : Boolean(
          product.seller?.verified ||
          (product.rating >= 4.7 && product.reviewCount >= 50) ||
          product.platform === 'parceiro'
        );

  const isFastShipping =
    product.isFastShipping !== undefined
      ? product.isFastShipping
      : Boolean(
          product.isFreeShipping ||
          product.platform === 'mercadolivre' ||
          product.platform === 'amazon' ||
          product.platform === 'netshoes' ||
          product.platform === 'magalu' ||
          product.stockUnits > 10
        );

  const isBestPrice =
    product.isBestPrice !== undefined
      ? product.isBestPrice
      : Boolean(
          comparison.isLowestPriceHere ||
          (product.discountPercentage && product.discountPercentage >= 35) ||
          comparison.savingsPercentage >= 20 ||
          product.isAchadinho
        );

  // Native Web Share API Handler with fallback to Clipboard / WhatsApp
  const handleWebShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const directUrl = `${window.location.origin}${window.location.pathname}?produto=${product.id}`;
    const savings = comparison.savingsAmount;
    const savingsPercent = comparison.savingsPercentage;

    let savingsText = '';
    if (savings > 0 && product.discountPercentage) {
      savingsText = `Economia de ${formatCurrency(savings)} (${product.discountPercentage}% OFF)`;
    } else if (savings > 0) {
      savingsText = `Economia de ${formatCurrency(savings)} (${savingsPercent}% mais barato)`;
    } else if (product.discountPercentage) {
      savingsText = `Desconto especial de ${product.discountPercentage}% OFF`;
    }

    const title = `${product.title} — Comércio Popular`;
    const message = `🔥 Olha esse achadinho no Comércio Popular!\n\n🛍️ *${product.title}*\n💰 Por apenas *${formatCurrency(product.price)}*!${savingsText ? `\n📉 ${savingsText}` : ''}${product.catalogSource === "api" ? "" : `\n⭐ Avaliação: ${product.rating.toFixed(1)}/5.0`}\n\n👉 Confira a oferta no link direto: ${directUrl}`;

    const shareData = {
      title,
      text: message,
      url: directUrl
    };

    // Try native Web Share API first
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareFeedback('Compartilhado!');
        setCopied(true);
        setTimeout(() => {
          setShareFeedback(null);
          setCopied(false);
        }, 2500);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User dismissed native share sheet
          return;
        }
        console.warn('Web Share API não disponível no ambiente, acionando fallback', err);
      }
    }

    // Fallback: Copy to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
        setShareFeedback('Link copiado!');
        setCopied(true);
        setTimeout(() => {
          setShareFeedback(null);
          setCopied(false);
        }, 2500);
      } else {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        setShareFeedback('WhatsApp!');
        setCopied(true);
        setTimeout(() => {
          setShareFeedback(null);
          setCopied(false);
        }, 2500);
      }
    } catch {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      setShareFeedback('WhatsApp!');
      setCopied(true);
      setTimeout(() => {
        setShareFeedback(null);
        setCopied(false);
      }, 2500);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="group relative bg-white rounded-2xl border border-neutral-200/90 hover:border-teal-400/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Platform & Badge Header Bar */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Platform Origin Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.8 rounded-md shadow-xs"
            style={{
              backgroundColor: platform.bg,
              color: platform.color,
              border: `1px solid ${platform.border}`
            }}
          >
            {isAffiliate ? <ExternalLink size={10} /> : <Store size={10} />}
            {platform.name}
          </span>

          {product.isAchadinho && (
            <span className="inline-flex items-center gap-1 bg-coral-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
              <Flame size={11} /> Achadinho
            </span>
          )}
        </div>

        {/* Top-Right Quick Actions: Wishlist Heart & WhatsApp Share */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            id={`btn-favorite-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) {
                onToggleFavorite(product);
              }
            }}
            title={isFavorite ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
            aria-label={isFavorite ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
            className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-300 scale-105'
                : 'bg-white/95 hover:bg-rose-50 text-neutral-500 hover:text-rose-600'
            }`}
          >
            <Heart
              size={15}
              className={isFavorite ? 'fill-white text-white' : 'hover:fill-rose-100'}
            />
          </button>

          <button
            id={`btn-share-${product.id}`}
            type="button"
            onClick={handleWebShare}
            title="Compartilhar produto nas redes sociais ou contatos"
            aria-label="Compartilhar produto"
            className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all cursor-pointer ${
              shareFeedback
                ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                : 'bg-white/95 hover:bg-teal-50 text-neutral-600 hover:text-teal-700'
            }`}
          >
            {shareFeedback ? <Check size={14} className="text-white" /> : <Share2 size={14} />}
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none z-10">
            <div className="bg-neutral-950/90 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-xl shadow-lg border border-white/20 flex items-center gap-1.5">
              <PackageX size={13} className="text-amber-400" />
              <span>Esgotado</span>
            </div>
          </div>
        )}

        {/* Discount Pill */}
        {product.discountPercentage && product.discountPercentage > 0 && !isOutOfStock && (
          <div className="absolute bottom-2.5 left-2.5 bg-coral-600 text-white font-extrabold text-xs px-2 py-0.5 rounded-md shadow-xs">
            -{product.discountPercentage}% OFF
          </div>
        )}

        {/* Urgency Trigger: Low Stock */}
        {!isOutOfStock && product.stockUnits != null && product.stockUnits <= 5 && (
          <div className="absolute bottom-2.5 right-2.5 bg-amber-500/95 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Clock size={10} /> Restam {product.stockUnits} unid.
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5 gap-2">
            <span className="font-medium text-neutral-600 truncate">{product.category}</span>
            {product.catalogSource !== "api" && <div
              className="shrink-0 flex items-center hover:opacity-85 transition-opacity"
              title={`Avaliação média: ${product.rating.toFixed(1)} de 5 estrelas (${product.reviewCount} avaliações)`}
            >
              <StarRating
                rating={product.rating}
                reviewCount={product.reviewCount}
                size="xs"
                showScore={true}
                showCount={true}
              />
            </div>}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-neutral-900 text-sm line-clamp-2 leading-snug group-hover:text-teal-800 transition-colors">
            {product.title}
          </h3>

          {/* Dynamic Badges: Verificado, Envio Rápido, Melhor Preço */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {isVerified && (
              <span
                id={`badge-verificado-${product.id}`}
                title="Produto ou loja com procedência e reputação verificada"
                className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-200/90 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs"
              >
                <ShieldCheck size={11} className="text-sky-600 shrink-0" />
                <span>Verificado</span>
              </span>
            )}

            {isFastShipping && (
              <span
                id={`badge-envio-rapido-${product.id}`}
                title="Postagem expressa e envio prioritário"
                className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/90 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs"
              >
                <Zap size={11} className="text-amber-600 fill-amber-500 shrink-0" />
                <span>Envio Rápido</span>
              </span>
            )}

            {isBestPrice && (
              <span
                id={`badge-melhor-preco-${product.id}`}
                title="Melhor preço verificado em comparação com Mercado Livre, Shopee e Amazon"
                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs"
              >
                <TrendingDown size={11} className="text-emerald-600 shrink-0" />
                <span>Melhor Preço</span>
              </span>
            )}

            {product.ean && (
              <span
                id={`badge-ean-${product.id}`}
                title={`Código de barras EAN-13: ${product.ean}`}
                className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 border border-neutral-200/90 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md shadow-2xs"
              >
                <Barcode size={11} className="text-neutral-500 shrink-0" />
                <span>EAN</span>
              </span>
            )}
          </div>

          {/* Partner Seller info if local */}
          {product.seller && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-teal-800 font-medium bg-teal-50/80 px-2 py-0.5 rounded w-fit">
              <ShieldCheck size={12} className="text-teal-600 shrink-0" />
              <span className="truncate">Vendido por {product.seller.name} ({product.seller.state})</span>
            </div>
          )}

          {/* Affiliate transparency badge */}
          {isAffiliate && product.affiliateCommissionRate && (
            <div className="mt-1 text-[10px] text-neutral-500 flex items-center gap-1">
              <Sparkles size={11} className="text-teal-600" />
              <span>Link comissionado verificado • Compra 100% segura</span>
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-neutral-900 font-display">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="text-[11px] text-teal-700 font-medium mt-0.5">
            {isAffiliate ? (
              <span>Preço e disponibilidade confirmados na loja</span>
            ) : (
              <span>Até 12x no cartão ou à vista no Pix</span>
            )}
          </div>

          {/* Comparador de Preços (Mercado Livre, Shopee, Amazon) */}
          {product.catalogSource !== "api" && <div
            id={`price-comparator-${product.id}`}
            className="mt-2.5 bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-2.5 transition-all"
          >
            {/* Main Savings Indicator */}
            <div className="flex items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold min-w-0">
                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <TrendingDown size={13} />
                </div>
                <span className="leading-tight text-[11px] truncate">
                  Economia média de{' '}
                  <strong className="text-emerald-950 font-extrabold">
                    {formatCurrency(comparison.savingsAmount)}
                  </strong>
                </span>
              </div>
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                -{comparison.savingsPercentage}%
              </span>
            </div>

            {/* Average comparison line with expand toggle */}
            <div className="mt-1.5 pt-1.5 border-t border-emerald-200/70 flex items-center justify-between text-[11px]">
              <span className="text-[10px] text-neutral-500 truncate">
                Média outros canais:{' '}
                <span className="font-semibold text-neutral-700 line-through">
                  {formatCurrency(comparison.averageMarketPrice)}
                </span>
              </span>
              <button
                type="button"
                id={`btn-toggle-comparison-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComparison(!showComparison);
                }}
                className="text-[10px] font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5 shrink-0 cursor-pointer ml-1"
                title="Ver comparativo por marketplace"
              >
                <span>{showComparison ? 'Ocultar' : 'Comparar'}</span>
                {showComparison ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {/* Quick Chips row on card */}
            {!showComparison && (
              <div className="mt-1.5 grid grid-cols-3 gap-1 text-[10px]">
                {comparison.competitors.map((comp) => (
                  <div
                    key={comp.marketplace}
                    className="bg-white/90 border border-neutral-200/90 rounded-lg px-1 py-0.8 text-center truncate"
                    title={`${comp.name}: ${formatCurrency(comp.price)}`}
                  >
                    <span className="text-neutral-400 font-medium block truncate text-[9px] leading-tight">
                      {comp.marketplace === 'mercadolivre' ? 'M. Livre' : comp.name}
                    </span>
                    <span className="font-bold text-neutral-800 text-[10px] block leading-tight">
                      {formatCurrency(comp.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Expanded Detailed Comparison Breakdown */}
            {showComparison && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-2 pt-2 border-t border-emerald-200/80 space-y-1.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  <span>Cotação nos Marketplaces</span>
                  <span className="text-emerald-700 font-semibold normal-case">
                    Comparativo atual
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  {comparison.competitors.map((comp) => {
                    const diff = comp.price - product.price;
                    const isCurrent = comp.marketplace === product.platform;
                    return (
                      <div
                        key={comp.marketplace}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[11px] ${
                          isCurrent
                            ? 'bg-emerald-50/90 border-emerald-300'
                            : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                comp.marketplace === 'mercadolivre'
                                  ? '#FFE600'
                                  : comp.marketplace === 'shopee'
                                  ? '#EE4D2D'
                                  : '#131921'
                            }}
                          />
                          <span className="text-neutral-700 font-medium truncate text-[10px]">
                            {comp.name}
                            {isCurrent && (
                              <span className="ml-1 text-[9px] text-teal-800 font-bold bg-teal-100 px-1 py-0.2 rounded">
                                Atual
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-neutral-900 text-[10px]">
                            {formatCurrency(comp.price)}
                          </span>
                          {diff > 0 && (
                            <span className="text-[9px] text-coral-600 block leading-none font-semibold">
                              +{formatCurrency(diff)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-1.5 bg-white/90 rounded-lg border border-emerald-300 text-[10px] text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <span className="leading-tight">
                    Economia garantida comprando através do Comércio Popular!
                  </span>
                </div>
              </div>
            )}
          </div>}

          {/* Action Buttons Row */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              {isOutOfStock ? (
                <button
                  id={`btn-stock-notify-${product.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenStockNotify) {
                      onOpenStockNotify(product);
                    } else {
                      onViewDetails(product);
                    }
                  }}
                  className="w-full py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-amber-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer group"
                  title="Produto esgotado. Cadastre-se para receber aviso quando chegar."
                >
                  <BellRing size={13} className="text-amber-950 group-hover:animate-bounce shrink-0" />
                  <span className="truncate">Avisar-me</span>
                </button>
              ) : isAffiliate ? (
                <button
                  id={`btn-affiliate-card-${product.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDirectAffiliateClick(product);
                  }}
                  className="w-full py-2 px-2.5 rounded-xl bg-coral-600 hover:bg-coral-700 active:bg-coral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <span className="truncate">{product.platform === "shopee" ? "Comprar na Shopee" : `Comprar no ${platform.name}`}</span>
                  <ExternalLink size={13} className="shrink-0" />
                </button>
              ) : (
                <button
                  id={`btn-add-cart-${product.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="w-full py-2 px-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <ShoppingCart size={14} className="shrink-0" />
                  <span className="truncate">Adicionar</span>
                </button>
              )}
            </div>

            {/* Native Web Share Button */}
            <button
              id={`btn-card-share-${product.id}`}
              type="button"
              onClick={handleWebShare}
              title="Compartilhar produto nas redes sociais ou com contatos"
              aria-label="Compartilhar produto"
              className={`h-9 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 ${
                shareFeedback
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-neutral-50 hover:bg-teal-50/80 active:bg-teal-100 border-neutral-200 hover:border-teal-400 text-neutral-700 hover:text-teal-900'
              }`}
            >
              {shareFeedback ? (
                <>
                  <Check size={13} className="text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-700 whitespace-nowrap">
                    {shareFeedback}
                  </span>
                </>
              ) : (
                <>
                  <Share2 size={13} className="text-neutral-600 shrink-0" />
                  <span className="text-[11px] font-medium whitespace-nowrap">
                    Compartilhar
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
