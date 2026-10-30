import React from 'react';
import { ArrowUpRight, Flame, Store } from 'lucide-react';
import { CategoryIcon } from '../common/CategoryPicker';

interface FeaturedCategoriesProps {
  onSelectCategory: (category: string) => void;
  onExploreAchadinhos: () => void;
  onExploreSellers: () => void;
  categoryCounts?: Record<string, number>;
}

const QUICK_CATEGORIES = [
  { category: 'Casa & Cozinha', label: 'Casa & Cozinha' },
  { category: 'LUMINÁRIAS', label: 'Luminárias' },
  { category: 'Eletrodomésticos', label: 'Eletrodomésticos' },
  { category: 'ELETRÔNICOS', label: 'Eletrônicos' },
  { category: 'Informática', label: 'Informática' },
  { category: 'Smartphones', label: 'Celulares' },
  { category: 'Moda Feminina', label: 'Moda feminina' },
  { category: 'Esportes & Lazer', label: 'Esportes e lazer' },
];

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  onSelectCategory,
  onExploreAchadinhos,
  onExploreSellers,
  categoryCounts,
}) => (
  <section className="w-full bg-[#E5EFEA] py-6 font-sans sm:py-8" aria-labelledby="featured-categories-title">
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-900">Encontre mais rápido</p>
          <h2 id="featured-categories-title" className="mt-1 font-display text-xl font-black text-[#12392d] sm:text-2xl">Explore por categoria</h2>
          <p className="mt-1 text-xs text-neutral-700 sm:text-sm">Cada atalho abre a categoria correspondente no catálogo.</p>
        </div>
        <button
          type="button"
          onClick={() => onSelectCategory('Todas as Categorias')}
          className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-2 text-xs font-black text-teal-900 transition hover:bg-[#D9EEE4] focus-visible:outline-2 focus-visible:outline-teal-700 sm:px-3"
        >
          Ver todas <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
        {QUICK_CATEGORIES.map((item) => {
          const count = categoryCounts?.[item.category];
          return (
            <button
              key={item.category}
              type="button"
              onClick={() => onSelectCategory(item.category)}
              aria-label={'Ver produtos em ' + item.label}
              className="group flex min-h-[102px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#c4dbcf] bg-[#F3F7F5] px-1.5 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:bg-[#DCEBE4] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:min-h-[118px] sm:gap-2.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D9EEE4] text-teal-900 transition group-hover:bg-[#CBE4D7]">
                <CategoryIcon category={item.category} />
              </span>
              <span className="line-clamp-2 min-h-7 text-[10px] font-extrabold leading-tight text-[#12392d] sm:text-xs">{item.label}</span>
              {typeof count === 'number' && <span className="text-[9px] font-semibold text-neutral-600">{count.toLocaleString('pt-BR')} ofertas</span>}
            </button>
          );
        })}
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 scrollbar-none md:grid md:grid-cols-2 md:overflow-visible">
        <article className="relative min-w-[86%] snap-start overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-coral-600 to-rose-700 p-5 text-white shadow-md sm:min-w-[55%] md:min-w-0 md:p-6">
          <span className="absolute -right-5 -top-8 h-36 w-36 rounded-full border-[22px] border-white/10" aria-hidden="true" />
          <div className="relative flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15"><Flame size={20} /></span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100">Vitrine de ofertas</p>
              <h3 className="mt-1 text-lg font-black leading-tight sm:text-xl">Achadinhos para descobrir</h3>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/85">Explore produtos afiliados e confira preço, prazo e condições na loja responsável.</p>
            </div>
          </div>
          <button type="button" onClick={onExploreAchadinhos} className="relative mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-orange-800 transition hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Ver achadinhos <ArrowUpRight size={14} />
          </button>
        </article>

        <article className="relative min-w-[86%] snap-start overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-800 p-5 text-white shadow-md sm:min-w-[55%] md:min-w-0 md:p-6">
          <span className="absolute -right-5 -top-8 h-36 w-36 rounded-full border-[22px] border-white/10" aria-hidden="true" />
          <div className="relative flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15"><Store size={20} /></span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-100">Comércio parceiro</p>
              <h3 className="mt-1 text-lg font-black leading-tight sm:text-xl">Conheça as lojas parceiras</h3>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/85">Veja como anunciar e acompanhe os produtos publicados por comerciantes aprovados.</p>
            </div>
          </div>
          <button type="button" onClick={onExploreSellers} className="relative mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-teal-900 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Explorar lojas <ArrowUpRight size={14} />
          </button>
        </article>
      </div>
    </div>
  </section>
);

