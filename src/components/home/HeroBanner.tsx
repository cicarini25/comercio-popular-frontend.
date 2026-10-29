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
  <section className="bg-slate-100 px-4 pb-3 pt-2 sm:px-6 sm:pb-4 sm:pt-3" aria-labelledby="home-hero-title">
    

    <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-neutral-200 overflow-hidden rounded-b-2xl bg-white shadow-sm sm:grid-cols-4 sm:divide-y-0">
      {BENEFITS.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-center gap-2.5 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700"><Icon size={17} /></span>
          <span className="min-w-0"><strong className="block truncate text-[10px] font-black text-neutral-900 sm:text-sm">{title}</strong><small className="block truncate text-[9px] text-neutral-500 sm:text-xs">{text}</small></span>
        </div>
      ))}
    </div>
  </section>
);

