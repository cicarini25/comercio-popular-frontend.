import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, ExternalLink, Flame, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface FlashDealsWidgetProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAffiliateClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const getExpiry = (value?: string) => {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) && time > Date.now() ? time : null;
};

const formatRemaining = (milliseconds: number) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

export const FlashDealsWidget: React.FC<FlashDealsWidgetProps> = ({ products, onViewDetails, onAffiliateClick, onAddToCart }) => {
  const deals = useMemo(() => products
    .filter((product) => product.originalPrice && product.originalPrice > product.price && product.discountPercentage && product.discountPercentage >= 15 && product.stockUnits !== 0)
    .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
    .slice(0, 4), [products]);

  const expiry = useMemo(() => deals.map((deal) => getExpiry(deal.flashDealExpiresAt)).filter((value): value is number => value !== null).sort((a, b) => a - b)[0] || null, [deals]);
  const [remaining, setRemaining] = useState(() => expiry ? Math.max(0, expiry - Date.now()) : 0);

  useEffect(() => {
    if (!expiry) return undefined;
    const timer = window.setInterval(() => setRemaining(Math.max(0, expiry - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [expiry]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6" aria-labelledby="flash-deals-title">
      <div className="overflow-hidden rounded-3xl border border-coral-200 bg-gradient-to-br from-coral-50 via-white to-amber-50 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-coral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coral-600 text-white shadow-sm"><Flame size={19} /></span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-coral-700">Ofertas em destaque</p>
              <h2 id="flash-deals-title" className="mt-1 font-display text-xl font-black text-neutral-950">Ofertas relâmpago</h2>
            </div>
          </div>
          {expiry && remaining > 0 ? (
            <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-neutral-950 px-3 py-2 text-xs font-black text-white" aria-label={`Oferta válida por mais ${formatRemaining(remaining)}`}>
              <Clock3 size={14} className="text-coral-300" /> Termina em {formatRemaining(remaining)}
            </div>
          ) : (
            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-coral-200 bg-white/70 px-3 py-2 text-xs font-bold text-coral-800">
              <Clock3 size={14} /> Prazo conforme a loja parceira
            </span>
          )}
        </div>

        {deals.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-6 text-sm text-neutral-600 sm:px-6">
            <Clock3 size={18} className="shrink-0 text-coral-600" />
            <p><strong className="text-neutral-900">Nenhuma oferta relâmpago válida agora.</strong> O widget só exibe produtos com desconto e validade confirmados pelo catálogo.</p>
          </div>
        ) : (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-4 scrollbar-none sm:grid sm:grid-cols-2 sm:overflow-visible sm:p-5 lg:grid-cols-4">
            {deals.map((product) => {
            const isAffiliate = product.platform !== 'parceiro';
            return (
              <article key={product.id} className="group flex w-[76vw] max-w-[280px] shrink-0 snap-start flex-col rounded-2xl sm:w-auto sm:max-w-none sm:min-w-0 border border-neutral-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <button type="button" onClick={() => onViewDetails(product)} className="text-left">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
                    <img src={product.images[0] || '/favicon.png'} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                    <span className="absolute left-2 top-2 rounded-lg bg-coral-600 px-2 py-1 text-[10px] font-black text-white">-{product.discountPercentage}%</span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-extrabold leading-tight text-neutral-900">{product.title}</h3>
                </button>
                <div className="mt-auto pt-3">
                  <div className="flex items-end gap-2">
                    <strong className="text-lg font-black text-teal-900">{formatCurrency(product.price)}</strong>
                    {product.originalPrice && <del className="text-[11px] text-neutral-400">{formatCurrency(product.originalPrice)}</del>}
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-neutral-500">{isAffiliate ? 'Oferta afiliada • confira a condição na loja' : 'Compra interna • vendedor parceiro'}</p>
                  <button
                    type="button"
                    onClick={() => isAffiliate ? onAffiliateClick(product) : onAddToCart(product)}
                    className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-xs font-black text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    {isAffiliate ? <><ExternalLink size={14} /> Ver oferta</> : <><ShoppingBag size={14} /> Comprar</>}
                  </button>
                </div>
              </article>
            );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

