import React from 'react';
import { BadgePercent, ExternalLink, Grid2X2, Store } from 'lucide-react';
import bannerMarketplaces from '../../assets/images/banner_marketplaces_sem_texto.webp';

interface HeroBannerProps {
  onExploreAchadinhos: () => void;
  onExploreSellers: () => void;
  onSelectTag: (tag: string) => void;
}

const BENEFITS = [
  { icon: ExternalLink, title: 'Ofertas externas', text: 'Compra na loja parceira' },
  { icon: Store, title: 'Lojistas parceiros', text: 'Produtos do comércio' },
  { icon: Grid2X2, title: 'Categorias claras', text: 'Encontre mais rápido' },
  { icon: BadgePercent, title: 'Compare opções', text: 'Confira as condições' },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreAchadinhos,
  onExploreSellers,
  onSelectTag,
}) => (
  <section className="bg-slate-100 px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-6" aria-labelledby="home-hero-title">
    <div className="relative isolate mx-auto min-h-[270px] w-full max-w-7xl overflow-hidden rounded-[1.75rem] bg-orange-600 shadow-xl sm:min-h-[330px] lg:min-h-[390px]">
      <img
        src={bannerMarketplaces}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-60"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-orange-950/95 via-orange-800/85 to-teal-950/35" aria-hidden="true" />
      <div className="relative flex min-h-[270px] items-center px-5 py-7 sm:min-h-[330px] sm:px-9 lg:min-h-[390px] lg:px-14">
        <div className="max-w-2xl text-white">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-50 backdrop-blur">
            Comércio Popular
          </span>
          <h1 id="home-hero-title" className="mt-4 max-w-xl font-display text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Descubra ofertas e produtos de lojas parceiras
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
            Pesquise por categoria, compare opções e confira preço, prazo e condições com a loja responsável.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button type="button" onClick={onExploreAchadinhos} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-teal-950 shadow-md transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5 sm:text-sm">
              Explorar achadinhos
            </button>
            <button type="button" onClick={onExploreSellers} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-4 py-2.5 text-xs font-black text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5 sm:text-sm">
              Conhecer lojas parceiras
            </button>
            <button type="button" onClick={() => onSelectTag('notebook')} className="hidden min-h-11 items-center rounded-xl border border-white/25 px-4 py-2.5 text-xs font-bold text-white/90 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex">
              Buscar notebooks
            </button>
          </div>
          <p className="mt-3 text-[10px] font-medium text-white/75">Nas ofertas afiliadas, a compra é finalizada na plataforma de destino.</p>
        </div>
      </div>
    </div>

    <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-neutral-200 overflow-hidden rounded-b-2xl bg-white shadow-sm sm:grid-cols-4 sm:divide-y-0">
      {BENEFITS.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-center gap-2.5 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700"><Icon size={17} /></span>
          <span className="min-w-0"><strong className="block truncate text-[10px] font-black text-neutral-900 sm:text-sm">{title}</strong><small className="block truncate text-[9px] text-neutral-500 sm:text-xs">{text}</small></span>
        </div>
      ))}
    </div>
  </section>
);
