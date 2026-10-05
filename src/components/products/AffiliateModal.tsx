import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Product } from '../../types';
import { PLATFORM_INFO } from '../../data/mockProducts';
import { formatCurrency } from '../../utils/formatters';

interface AffiliateModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenStore: (product: Product) => Promise<string>;
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({ product, onClose, onOpenStore }) => {
  const [counter, setCounter] = useState(3);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!product) return;
    setCounter(3);
    const timer = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [product]);

  if (!product) return null;

  const platform = PLATFORM_INFO[product.platform] || PLATFORM_INFO.parceiro;

  const handleOpenStore = () => {
    if (!product.affiliateUrl || opening) return;
    const popup = window.open('about:blank', '_blank');
    if (popup) popup.opener = null;
    setOpening(true);
    setError('');
    onOpenStore(product).then((url) => {
      if (popup) popup.location.replace(url);
      else window.location.assign(url);
      onClose();
    }).catch((err: unknown) => {
      popup?.close();
      setError(err instanceof Error ? err.message : 'Não foi possível abrir a oferta.');
    }).finally(() => setOpening(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="affiliate-redirect-modal"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 my-auto animate-in zoom-in-95"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-sm" style={{ backgroundColor: platform.bg }}>
          <ExternalLink size={24} style={{ color: platform.color }} />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <ShieldCheck size={13} className="text-teal-700" />
            <span>Link de afiliado</span>
          </div>

          <h3 className="text-xl font-bold text-neutral-900 font-display">
            Comprar na plataforma {platform.name}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            Confira preço final, frete, cupons e disponibilidade na plataforma.
          </p>
        </div>

        {/* Product Teaser Card */}
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center gap-3 text-left">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-14 h-14 rounded-xl object-cover border border-neutral-200"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-neutral-800 line-clamp-1">
              {product.title}
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-bold text-neutral-900 text-sm">
                {formatCurrency(product.price)}
              </span>
              {product.discountPercentage && (
                <span className="text-[10px] font-extrabold text-coral-600">
                  (-{product.discountPercentage}%)
                </span>
              )}
            </div>
            <p className="text-[10px] text-teal-700 font-medium">
              Compra finalizada na plataforma {platform.name}
            </p>
          </div>
        </div>

        {/* Commission & Transparency info */}
        <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-[11px] text-teal-900 text-left space-y-1">
          <div className="flex items-center gap-1 font-bold">
            <Sparkles size={13} className="text-teal-700" />
            <span>Transparência Comércio Popular</span>
          </div>
          <p className="text-neutral-600">
            Ao comprar por este link, o Comércio Popular pode receber uma comissão da plataforma, sem nenhum custo adicional para você. Isso mantém nossa curadoria de achadinhos gratuita!
          </p>
        </div>

        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-left text-xs text-rose-700">{error}</p>}

        {/* Action Button */}
        <button
          id="btn-confirm-affiliate-redirect"
          onClick={handleOpenStore}
          className="w-full py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          style={{ backgroundColor: platform.color }}
        >
          <span>{opening ? 'Validando acesso...' : `Acessar ${platform.name} Agora`}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
