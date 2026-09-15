import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ExternalLink,
  ShoppingCart,
  Share2,
  ShieldCheck,
  Truck,
  Check,
  Flame,
  Store,
  CreditCard,
  QrCode,
  Sparkles,
  Info,
  TrendingDown,
  CheckCircle2,
  Zap,
  Bell,
  BellRing,
  Trash2,
  SlidersHorizontal,
  Heart,
  Barcode,
  PackageX
} from 'lucide-react';
import { Product, PriceAlert } from '../../types';
import { PLATFORM_INFO } from '../../data/mockProducts';
import { formatCurrency, maskCEP, simulateFreight } from '../../utils/formatters';
import { getProductPriceComparison } from '../../utils/priceComparison';
import { StarRating } from '../common/StarRating';
import { ProductReviewsSection } from './ProductReviewsSection';
import { ExpertGuideSection } from './ExpertGuideSection';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product) => void;
  onAffiliateRedirect: (product: Product) => void;
  priceAlerts?: PriceAlert[];
  onSavePriceAlert?: (productId: string, targetPrice: number) => void;
  onRemovePriceAlert?: (productId: string) => void;
  onAddReview?: (
    productId: string,
    review: { rating: number; comment: string; authorName: string }
  ) => void;
  currentUserName?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
  onOpenStockNotify?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onAffiliateRedirect,
  priceAlerts = [],
  onSavePriceAlert,
  onRemovePriceAlert,
  onAddReview,
  currentUserName,
  isFavorite = false,
  onToggleFavorite,
  onOpenStockNotify
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState('');
  const [freightOptions, setFreightOptions] = useState<any[]>([]);
  const [calculatingCep, setCalculatingCep] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMonitorForm, setShowMonitorForm] = useState(false);
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const activeAlert = product ? priceAlerts.find((a) => a.productId === product.id) : undefined;

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      if (activeAlert) {
        setTargetPriceInput(activeAlert.targetPrice.toFixed(2));
      } else {
        setTargetPriceInput((product.price * 0.9).toFixed(2));
      }
    }
  }, [product?.id, activeAlert]);

  if (!product) return null;

  const currentImage = selectedImage || product.images[0];
  const platform = PLATFORM_INFO[product.platform] || PLATFORM_INFO.parceiro;
  const isAffiliate = product.platform !== 'parceiro';
  const comparison = getProductPriceComparison(product);

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

  const handleCepCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (cep.replace(/\D/g, '').length === 8) {
      setCalculatingCep(true);
      setTimeout(() => {
        setFreightOptions(simulateFreight(cep));
        setCalculatingCep(false);
      }, 500);
    }
  };

  // Computes personalized economy message and direct product link
  const getSavingsShareContent = () => {
    const savings = comparison.savingsAmount;
    const savingsPercent = comparison.savingsPercentage;
    const original = product.originalPrice;
    const directUrl = `${window.location.origin}${window.location.pathname}?produto=${product.id}`;

    let savingsText = '';
    if (savings > 0 && product.discountPercentage) {
      savingsText = `Economia de ${formatCurrency(savings)} (${product.discountPercentage}% OFF vs outros marketplaces)`;
    } else if (savings > 0) {
      savingsText = `Economia de ${formatCurrency(savings)} (${savingsPercent}% mais barato que a concorrência)`;
    } else if (product.discountPercentage) {
      savingsText = `Desconto especial de ${product.discountPercentage}% OFF`;
    } else {
      savingsText = `Melhor preço verificado no Comércio Popular`;
    }

    const title = `${product.title} - Comércio Popular`;
    const message = `🔥 Olha essa economia no Comércio Popular!\n\n🛍️ *${product.title}*\n💰 Por apenas *${formatCurrency(product.price)}*!\n📉 *${savingsText}*${original ? `\n🏷️ De: ${formatCurrency(original)}` : ''}\n⭐ Avaliação: ${product.rating}/5.0\n\n👉 Confira a oferta no link direto: ${directUrl}`;

    return {
      title,
      message,
      savingsText,
      directUrl
    };
  };

  // Web Share API implementation with Clipboard fallback
  const handleWebShare = async () => {
    const { title, message, directUrl } = getSavingsShareContent();

    const shareData = {
      title,
      text: message,
      url: directUrl
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareFeedback('Oferta compartilhada com sucesso!');
        setTimeout(() => setShareFeedback(null), 3500);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User dismissed the native dialog
          return;
        }
      }
    }

    // Fallback: Copy link and message to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(`${message}`);
        setCopied(true);
        setShareFeedback('Link direto e mensagem de economia copiados!');
        setTimeout(() => {
          setCopied(false);
          setShareFeedback(null);
        }, 3500);
      } else {
        throw new Error('Clipboard indisponível');
      }
    } catch {
      setShareFeedback(`Link direto: ${directUrl}`);
      setTimeout(() => setShareFeedback(null), 4000);
    }
  };

  const handleWhatsAppShare = () => {
    const { message } = getSavingsShareContent();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    setCopied(true);
    setShareFeedback('Abrindo WhatsApp...');
    setTimeout(() => {
      setCopied(false);
      setShareFeedback(null);
    }, 2500);
  };

  const handleSaveAlert = (target: number) => {
    if (onSavePriceAlert && target > 0) {
      onSavePriceAlert(product.id, target);
      setAlertSuccessMsg(`Alerta salvo! Você verá um aviso no Navbar assim que o valor atingir ${formatCurrency(target)}.`);
      setTimeout(() => setAlertSuccessMsg(null), 4000);
      setShowMonitorForm(false);
    }
  };

  const handleCustomAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(targetPriceInput.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      handleSaveAlert(parsed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="product-detail-modal"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header Close Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-md"
              style={{
                backgroundColor: platform.bg,
                color: platform.color,
                border: `1px solid ${platform.border}`
              }}
            >
              {isAffiliate ? `Afiliado ${platform.name}` : `Loja Parceira`}
            </span>
            {product.isAchadinho && (
              <span className="bg-coral-600 text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                <Flame size={12} /> Achadinho do Dia
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {/* Wishlist Heart Button */}
            <button
              id="btn-modal-header-favorite"
              type="button"
              onClick={() => onToggleFavorite && onToggleFavorite(product)}
              title={isFavorite ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
              aria-label={isFavorite ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isFavorite
                  ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 ring-1 ring-rose-200'
                  : 'text-neutral-500 hover:text-rose-600 hover:bg-neutral-100'
              }`}
            >
              <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
            </button>

            <button
              id="btn-modal-header-share"
              type="button"
              onClick={handleWebShare}
              title="Compartilhar oferta com economia"
              className="p-2 text-neutral-500 hover:text-teal-800 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[85vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square w-full rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200">
              <img
                src={currentImage}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      currentImage === img ? 'border-teal-700 shadow-xs' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Platform Guarantee Box */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-800">
                <ShieldCheck size={16} className="text-teal-700" />
                <span>Garantia de Compra Comércio Popular</span>
              </div>
              <p>
                {isAffiliate
                  ? `Você será redirecionado com segurança para a loja oficial do ${platform.name}. O Comércio Popular verifica a autenticidade e reputação das ofertas diariamente.`
                  : `Seu pagamento fica retido com segurança pelo Comércio Popular e só é liberado para o comerciante parceiro após a confirmação da entrega.`}
              </p>
            </div>
          </div>

          {/* Details & Purchase */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Category and Rating */}
              <div className="flex items-center justify-between text-xs text-neutral-500 gap-2">
                <span className="font-semibold text-teal-800">{product.category}</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('section-reviews');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer group"
                  title="Ver avaliações de clientes e dar sua nota"
                >
                  <StarRating
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    size="sm"
                    showScore={true}
                    showCount={true}
                  />
                  <span className="text-[11px] text-teal-700 font-bold underline group-hover:text-teal-900 ml-1">
                    Avaliar
                  </span>
                </button>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-2 font-display">
                {product.title}
              </h2>

              {/* Dynamic Badges: Verificado, Envio Rápido, Melhor Preço */}
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                {isVerified && (
                  <span
                    id={`modal-badge-verificado-${product.id}`}
                    title="Procedência e reputação verificada"
                    className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs"
                  >
                    <ShieldCheck size={13} className="text-sky-600" />
                    <span>Verificado</span>
                  </span>
                )}

                {isFastShipping && (
                  <span
                    id={`modal-badge-envio-rapido-${product.id}`}
                    title="Postagem expressa e pronta entrega"
                    className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs"
                  >
                    <Zap size={13} className="text-amber-600 fill-amber-500" />
                    <span>Envio Rápido</span>
                  </span>
                )}

                {isBestPrice && (
                  <span
                    id={`modal-badge-melhor-preco-${product.id}`}
                    title="Melhor preço verificado entre marketplaces"
                    className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs"
                  >
                    <TrendingDown size={13} className="text-emerald-600" />
                    <span>Melhor Preço</span>
                  </span>
                )}

                <button
                  type="button"
                  id={`btn-jump-to-expert-guide-${product.id}`}
                  onClick={() => {
                    const el = document.getElementById(`section-expert-guide-${product.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs hover:bg-teal-100 transition-colors cursor-pointer"
                  title="Ver dicas de especialista e guia contextual gerado por IA"
                >
                  <Sparkles size={13} className="text-teal-600" />
                  <span>Dicas de Especialista</span>
                </button>
              </div>

              {/* Seller details if partner */}
              {product.seller && (
                <div className="mt-2.5 p-3 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Store size={16} className="text-teal-700" />
                    <div>
                      <p className="font-bold text-teal-900">{product.seller.name}</p>
                      <p className="text-neutral-500">
                        {product.seller.city}, {product.seller.state} • {product.seller.salesCount} vendas
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded shadow-2xs">
                    Lojista Verificado ✓
                  </span>
                </div>
              )}

              {/* Price section */}
              <div className="mt-4 p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-extrabold text-neutral-900 font-display">
                        {formatCurrency(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-neutral-400 line-through">
                          {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                      {product.discountPercentage && (
                        <span className="bg-coral-600 text-white font-extrabold text-xs px-2 py-0.5 rounded-md">
                          {product.discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-500 mt-1">
                      {isAffiliate
                        ? `Preço verificado no ${platform.name} hoje. Sujeito a alteração de estoque.`
                        : 'Em até 12x no cartão de crédito ou com desconto especial no Pix.'}
                    </p>
                  </div>

                  {/* Monitor Price Button */}
                  <button
                    id="btn-monitor-price"
                    type="button"
                    onClick={() => setShowMonitorForm(!showMonitorForm)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                      activeAlert
                        ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-teal-600 hover:text-teal-800'
                    }`}
                    title="Receba um alerta visual no Navbar quando o preço baixar"
                  >
                    {activeAlert ? (
                      <>
                        <BellRing size={15} className="text-amber-600 fill-amber-500" />
                        <span>Monitorando</span>
                      </>
                    ) : (
                      <>
                        <Bell size={15} className="text-neutral-500" />
                        <span>Monitorar Preço</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Active alert indicator chip if monitoring */}
                {activeAlert && !showMonitorForm && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <BellRing size={15} className="text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-950">
                          Monitorando este produto:
                        </span>{' '}
                        <span className="text-amber-900">
                          Alerta configurado para{' '}
                          <strong>{formatCurrency(activeAlert.targetPrice)}</strong>
                          {product.price <= activeAlert.targetPrice && (
                            <span className="ml-1.5 inline-block text-[10px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                              Preço Atingido!
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowMonitorForm(true)}
                        className="text-[11px] font-semibold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                      >
                        Ajustar
                      </button>
                      <button
                        onClick={() => {
                          if (onRemovePriceAlert) onRemovePriceAlert(product.id);
                        }}
                        className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Cancelar monitoramento"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Message Banner */}
                {alertSuccessMsg && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>{alertSuccessMsg}</span>
                  </div>
                )}

                {/* Price Monitoring Configuration Accordion */}
                {showMonitorForm && (
                  <div
                    id="monitor-price-panel"
                    className="mt-3 p-3.5 rounded-xl bg-white border border-teal-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                          <Bell size={13} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">
                            Configurar Alerta de Preço
                          </h4>
                          <p className="text-[11px] text-neutral-500">
                            Receba um aviso no sininho do Navbar quando o preço cair.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMonitorForm(false)}
                        className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <span className="text-[11px] font-semibold text-neutral-600 block mb-1.5">
                        Sugestões rápidas de meta com desconto:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: '-5%', factor: 0.95 },
                          { label: '-10%', factor: 0.9 },
                          { label: '-15%', factor: 0.85 },
                          { label: '-20%', factor: 0.8 }
                        ].map((preset) => {
                          const val = Math.round(product.price * preset.factor * 100) / 100;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setTargetPriceInput(val.toFixed(2));
                                handleSaveAlert(val);
                              }}
                              className="px-2 py-1.5 rounded-lg border border-neutral-200 hover:border-teal-500 hover:bg-teal-50/50 text-center transition-colors cursor-pointer group"
                            >
                              <div className="text-[10px] font-bold text-teal-700 group-hover:text-teal-900">
                                {preset.label}
                              </div>
                              <div className="text-[11px] font-extrabold text-neutral-800">
                                {formatCurrency(val)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Target Price Form */}
                    <form onSubmit={handleCustomAlertSubmit} className="space-y-2.5">
                      <div>
                        <label
                          htmlFor="target-price-input"
                          className="block text-[11px] font-semibold text-neutral-700 mb-1"
                        >
                          Ou defina seu valor alvo desejado (R$):
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                              R$
                            </span>
                            <input
                              id="target-price-input"
                              type="number"
                              step="0.10"
                              min="1"
                              max={product.price}
                              placeholder={(product.price * 0.9).toFixed(2)}
                              value={targetPriceInput}
                              onChange={(e) => setTargetPriceInput(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-900 focus:bg-white focus:border-teal-500 outline-none"
                            />
                          </div>
                          <button
                            type="submit"
                            id="btn-save-price-alert"
                            className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs shrink-0"
                          >
                            {activeAlert ? 'Atualizar' : 'Ativar Alerta'}
                          </button>
                        </div>
                      </div>

                      {activeAlert && (
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-neutral-500">
                            Monitorando meta de <strong>{formatCurrency(activeAlert.targetPrice)}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (onRemovePriceAlert) onRemovePriceAlert(product.id);
                              setShowMonitorForm(false);
                            }}
                            className="text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} /> Excluir Alerta
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Accepted Payment badges */}
                {!isAffiliate && (
                  <div className="mt-3 pt-3 border-t border-neutral-200/70 flex items-center gap-3 text-xs text-neutral-600">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <QrCode size={15} /> Pix Instantâneo
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-teal-700">
                      <CreditCard size={15} /> Cartão até 12x
                    </span>
                    <span className="text-neutral-400 text-[11px]">Boleto Bancário</span>
                  </div>
                )}
              </div>

              {/* Price Comparison Card (Mercado Livre, Shopee, Amazon) */}
              <div
                id={`modal-price-comparison-${product.id}`}
                className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <TrendingDown size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Comparador de Preços em Tempo Real
                      </h4>
                      <p className="text-xs text-emerald-800 font-medium">
                        Economia média de{' '}
                        <strong className="font-extrabold text-emerald-950">
                          {formatCurrency(comparison.savingsAmount)}
                        </strong>{' '}
                        ({comparison.savingsPercentage}% mais barato que a média)
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-2xs">
                    -{comparison.savingsPercentage}% OFF
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {comparison.competitors.map((comp) => {
                    const diff = comp.price - product.price;
                    const isCurrent = comp.marketplace === product.platform;
                    return (
                      <div
                        key={comp.marketplace}
                        className={`p-2.5 rounded-xl border text-center ${
                          isCurrent
                            ? 'bg-emerald-100/70 border-emerald-300 ring-1 ring-emerald-400'
                            : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                comp.marketplace === 'mercadolivre'
                                  ? '#FFE600'
                                  : comp.marketplace === 'shopee'
                                  ? '#EE4D2D'
                                  : '#131921'
                            }}
                          />
                          <span className="text-[11px] font-bold text-neutral-700 truncate">
                            {comp.name}
                          </span>
                        </div>
                        <p className="font-extrabold text-xs text-neutral-900 font-display">
                          {formatCurrency(comp.price)}
                        </p>
                        {diff > 0 ? (
                          <span className="text-[10px] text-coral-600 font-semibold block mt-0.5">
                            +{formatCurrency(diff)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                            Melhor Oferta
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-emerald-900 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Média de mercado: {formatCurrency(comparison.averageMarketPrice)}</span>
                  </div>
                  <span className="font-bold text-teal-800">
                    Você economiza {formatCurrency(comparison.savingsAmount)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Descrição
                </h4>
                <p className="text-sm text-neutral-700 mt-1 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              {(product.specs || product.ean) && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Ficha Técnica
                  </h4>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs space-y-1.5">
                    {product.ean && (
                      <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-neutral-500 font-medium flex items-center gap-1">
                          <Barcode size={13} className="text-teal-700" />
                          <span>Código EAN-13 (Barras)</span>
                        </span>
                        <span className="text-neutral-900 font-mono font-bold bg-neutral-200/60 px-1.5 py-0.5 rounded text-[11px]">
                          {product.ean}
                        </span>
                      </div>
                    )}
                    {product.specs && Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-neutral-100 last:border-none pb-1">
                        <span className="text-neutral-500 font-medium">{key}</span>
                        <span className="text-neutral-800 font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Freight Calculator for Partner items */}
              {!isAffiliate && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                    <Truck size={14} className="text-teal-700" /> Simular Frete por CEP
                  </h4>
                  <form onSubmit={handleCepCalculate} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => setCep(maskCEP(e.target.value))}
                      className="w-36 text-xs px-3 py-2 border border-neutral-300 rounded-xl outline-none focus:border-teal-700"
                    />
                    <button
                      type="submit"
                      disabled={calculatingCep}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      {calculatingCep ? 'Calculando...' : 'Calcular'}
                    </button>
                  </form>

                  {freightOptions.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {freightOptions.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-teal-50/50 border border-teal-100 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-neutral-800">{opt.name}</span>
                            <p className="text-[11px] text-neutral-500">Entrega em até {opt.days} dias úteis</p>
                          </div>
                          <span className="font-bold text-teal-900">{formatCurrency(opt.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-neutral-200 space-y-2.5">
              {product.stockUnits === 0 ? (
                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                      <PackageX size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-neutral-900 font-display">
                        Produto Temporariamente Esgotado
                      </h4>
                      <p className="text-xs text-neutral-600">
                        O estoque deste item zerou no momento. Cadastre-se para receber um aviso assim que for reposto pelo vendedor!
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-modal-stock-notify"
                    type="button"
                    onClick={() => {
                      if (onOpenStockNotify) {
                        onOpenStockNotify(product);
                      }
                    }}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-amber-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                  >
                    <BellRing size={16} className="text-amber-950 group-hover:animate-bounce" />
                    <span>Avisar-me quando chegar</span>
                  </button>
                </div>
              ) : isAffiliate ? (
                <div className="space-y-2">
                  <button
                    id="btn-modal-affiliate-action"
                    onClick={() => onAffiliateRedirect(product)}
                    className="w-full py-3.5 px-4 rounded-xl bg-coral-600 hover:bg-coral-700 active:bg-coral-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
                  >
                    <span>Ir para o {platform.name} e Comprar</span>
                    <ExternalLink size={16} />
                  </button>
                  <p className="text-[11px] text-neutral-400 text-center flex items-center justify-center gap-1">
                    <Info size={12} /> Link comissionado oficial de afiliado Comércio Popular
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center border border-neutral-300 rounded-xl px-2 py-1 justify-between sm:w-28">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-neutral-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockUnits, quantity + 1))}
                      className="w-7 h-7 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    id="btn-modal-add-cart"
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-teal-700 text-teal-800 hover:bg-teal-50 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <ShoppingCart size={16} />
                    <span>Adicionar à Sacola</span>
                  </button>

                  <button
                    id="btn-modal-buy-now"
                    onClick={() => {
                      onBuyNow(product);
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <span>Comprar Agora</span>
                  </button>
                </div>
              )}

              {/* Web Share API & Personalized Savings Share Card */}
              <div
                id="container-modal-share-savings"
                className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <Share2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-teal-950">
                      Compartilhar Oferta
                    </p>
                    <p className="text-[11px] text-teal-700 truncate">
                      {comparison.savingsAmount > 0
                        ? `Economia de ${formatCurrency(comparison.savingsAmount)} (${comparison.savingsPercentage}% OFF)`
                        : `Link direto com melhor preço garantido`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    id="btn-modal-share"
                    type="button"
                    onClick={handleWebShare}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                    title="Compartilhar via Web Share API com economia e link direto"
                  >
                    {copied ? <Check size={14} className="text-emerald-300" /> : <Share2 size={14} />}
                    <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
                  </button>

                  <button
                    id="btn-modal-share-whatsapp"
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                    title="Compartilhar no WhatsApp com mensagem de economia"
                  >
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Share Feedback Toast */}
              {shareFeedback && (
                <div
                  id="share-feedback-toast"
                  className="p-2.5 rounded-xl bg-teal-900 text-white text-xs font-medium flex items-center justify-between shadow-md animate-in fade-in"
                >
                  <div className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-400 shrink-0" />
                    <span>{shareFeedback}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShareFeedback(null)}
                    className="text-teal-300 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Expert Buying Guide & Contextual Recommendations */}
        <ExpertGuideSection product={product} />

        {/* Customer Reviews & 1-5 Star Evaluation Section */}
        <ProductReviewsSection
          product={product}
          onAddReview={onAddReview || (() => {})}
          currentUserName={currentUserName}
        />
      </div>
    </div>
  </div>
  );
};
