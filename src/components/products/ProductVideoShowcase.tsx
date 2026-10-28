import React, { useId, useState } from 'react';
import { Play, Store, Video } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ProductVideoShowcaseProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
}

export const ProductVideoShowcase: React.FC<ProductVideoShowcaseProps> = ({ products, onViewDetails }) => {
  const titleId = useId();
  const videoProducts = products.filter((product) => Boolean(product.videoUrl)).slice(0, 12);
  const [playingProductId, setPlayingProductId] = useState<string | null>(null);
  if (videoProducts.length === 0) return null;

  return (
    <section className="col-span-full -mx-1 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-orange-50 p-4 sm:p-5" aria-labelledby={titleId}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral-600 text-white"><Video size={17} /></span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-coral-700">Veja antes de escolher</p>
            <h2 id={titleId} className="font-display text-base font-black text-neutral-950 sm:text-lg">Achadinhos em vídeo</h2>
          </div>
        </div>
        <span className="hidden text-[11px] font-semibold text-neutral-500 sm:block">Demonstrações de afiliados e lojas parceiras</span>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
        {videoProducts.map((product) => {
          const playing = playingProductId === product.id;
          return (
            <article key={product.id} className="w-[68vw] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm sm:w-auto sm:max-w-none">
              <div className="relative aspect-[9/12] overflow-hidden bg-neutral-950">
                {playing ? (
                  <video src={product.videoUrl} poster={product.images[0]} controls playsInline preload="none" autoPlay onClick={(event) => event.stopPropagation()} className="h-full w-full object-contain" aria-label={'Vídeo de apresentação de ' + product.title} />
                ) : (
                  <button type="button" onClick={() => setPlayingProductId(product.id)} className="group relative h-full w-full text-left" aria-label={'Assistir vídeo de ' + product.title}>
                    <img src={product.images[0] || '/favicon.png'} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/5 to-neutral-950/15" />
                    <span className="absolute left-2 top-2 rounded-full bg-coral-600 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white">{product.platform === 'parceiro' ? 'Produto de loja' : 'Achadinho'}</span>
                    <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-teal-800 shadow-lg transition group-hover:scale-105"><Play size={18} fill="currentColor" /></span>
                    <span className="absolute inset-x-3 bottom-3 line-clamp-2 text-xs font-bold leading-snug text-white">{product.title}</span>
                  </button>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-xs font-extrabold text-neutral-900">{product.title}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <strong className="text-sm font-black text-teal-900">{formatCurrency(product.price)}</strong>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-neutral-500"><Store size={11} />{product.platform === 'parceiro' ? 'Loja parceira' : 'Afiliado'}</span>
                </div>
                <button type="button" onClick={() => onViewDetails(product)} className="mt-2 min-h-9 w-full rounded-xl bg-teal-700 px-3 py-2 text-[11px] font-black text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">Ver produto</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
