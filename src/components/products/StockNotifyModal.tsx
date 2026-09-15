import React, { useState, useEffect } from 'react';
import {
  X,
  BellRing,
  CheckCircle2,
  Mail,
  Phone,
  User as UserIcon,
  PackageX,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Product, User, StockNotificationRequest } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface StockNotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  user: User | null;
  onRegisterInterest: (lead: Omit<StockNotificationRequest, 'id' | 'createdAt' | 'status'>) => void;
  isAlreadyRegistered?: boolean;
}

export const StockNotifyModal: React.FC<StockNotifyModalProps> = ({
  isOpen,
  onClose,
  product,
  user,
  onRegisterInterest,
  isAlreadyRegistered = false
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wantPromoAlert, setWantPromoAlert] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
      } else {
        setName('');
        setEmail('');
      }
      setPhone('');
    }
  }, [isOpen, user]);

  if (!isOpen || !product) return null;

  const maskPhone = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 11);
    if (clean.length <= 2) return clean;
    if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      onRegisterInterest({
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[0],
        productPrice: product.price,
        sellerId: product.seller?.id || (product.platform === 'parceiro' ? 'seller-local' : 'plataforma'),
        sellerName: product.seller?.name || (product.platform === 'parceiro' ? 'Comerciante Parceiro' : 'Comércio Popular'),
        customerName: name.trim(),
        customerEmail: email.trim().toLowerCase(),
        customerPhone: phone.trim() || undefined
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#14b8a6', '#0f766e', '#f43f5e']
        });
      } catch {
        // safe fallback
      }
    }, 400);
  };

  return (
    <div
      id="stock-notify-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="stock-notify-modal-card"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-neutral-100"
      >
        {/* Top Header Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
              <BellRing size={20} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight font-display">
                Avisar-me quando chegar
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                Notificação instantânea assim que houver reposição
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-stock-notify"
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-neutral-900 font-display">
                  Interesse registrado com sucesso!
                </h4>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Assim que o vendedor repor o estoque de <strong>{product.title}</strong>, você receberá um aviso prioritário em <span className="font-semibold text-teal-800">{email}</span>
                  {phone && <span> e no WhatsApp <strong className="text-neutral-800">{phone}</strong></span>}.
                </p>
              </div>

              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-left flex items-start gap-3">
                <Sparkles size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  O comerciante já foi notificado no painel dele sobre a sua intenção de compra para acelerar a reposição deste lote.
                </p>
              </div>

              <button
                type="button"
                id="btn-stock-notify-confirm-done"
                onClick={onClose}
                className="w-full py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Entendido, continuar navegando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Preview Card */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-16 h-16 rounded-xl object-cover border border-amber-200/80 shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      <PackageX size={11} /> Estoque Esgotado
                    </span>
                    {product.seller && (
                      <span className="text-[10px] text-neutral-500 truncate">
                        Vendido por {product.seller.name}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-neutral-900 text-xs truncate leading-snug">
                    {product.title}
                  </h4>
                  <p className="text-xs font-extrabold text-teal-900 font-display mt-0.5">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              {isAlreadyRegistered && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <p>
                    Você já possui um alerta pendente para este item. Caso deseje atualizar seu e-mail ou WhatsApp, preencha o formulário abaixo.
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="stock-notify-name" className="block text-xs font-bold text-neutral-700 mb-1">
                    Seu Nome Completo *
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="stock-notify-name"
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-teal-700 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="stock-notify-email" className="block text-xs font-bold text-neutral-700 mb-1">
                    Seu E-mail para Aviso *
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="stock-notify-email"
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-teal-700 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Enviaremos um link direto para compra no instante em que o lote for reaberto.
                  </span>
                </div>

                <div>
                  <label htmlFor="stock-notify-phone" className="block text-xs font-bold text-neutral-700 mb-1">
                    WhatsApp / Celular <span className="text-neutral-400 font-normal">(opcional para aviso rápido)</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="stock-notify-phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(maskPhone(e.target.value))}
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-teal-700 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="stock-notify-promo-check"
                    type="checkbox"
                    checked={wantPromoAlert}
                    onChange={(e) => setWantPromoAlert(e.target.checked)}
                    className="rounded border-neutral-300 text-teal-700 focus:ring-teal-500 cursor-pointer w-4 h-4"
                  />
                  <label htmlFor="stock-notify-promo-check" className="text-[11px] text-neutral-600 cursor-pointer select-none">
                    Avisar-me também se o produto voltar com cupom ou desconto especial
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-submit-stock-notify"
                    disabled={isSubmitting || !name.trim() || !email.trim()}
                    className="w-full py-3 px-4 bg-teal-800 hover:bg-teal-900 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Registrando interesse...</span>
                    ) : (
                      <>
                        <span>Garantir Meu Aviso Prioritário</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 text-center">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>Seus dados não serão compartilhados com terceiros. 100% livre de spam.</span>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
