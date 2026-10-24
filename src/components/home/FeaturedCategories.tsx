import React from 'react';
import { ArrowUpRight, ChevronRight, Flame, ShieldCheck, Store } from 'lucide-react';
import { CATEGORY_MENU } from '../../data/categoryMenu';
import { CategoryIcon } from '../common/CategoryPicker';
import { PlatformId, PlatformLogo } from '../common/PlatformLogo';

interface FeaturedCategoriesProps {
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

const FEATURED = [
  { label: 'Eletrônicos & Tecnologia', category: 'ELETRÔNICOS', accent: 'bg-sky-50 text-sky-700', note: 'Celulares, notebooks e acessórios' },
  { label: 'Casa & Cozinha', category: 'Casa & Cozinha', accent: 'bg-amber-50 text-amber-700', note: 'Achados para deixar tudo prático' },
  { label: 'Ferramentas & Máquinas', category: 'Ferramentas', accent: 'bg-violet-50 text-violet-700', note: 'Para oficina, obra e manutenção' },
  { label: 'Moda & Acessórios', category: 'Moda Feminina', accent: 'bg-rose-50 text-rose-700', note: 'Estilo para todos os momentos' },
  { label: 'Auto, Motos & Esportes', category: 'Esportes & Lazer', accent: 'bg-emerald-50 text-emerald-700', note: 'Movimento, lazer e aventura' },
  { label: 'Beleza, Bebês & Pets', category: 'Cuidado & Beleza', accent: 'bg-fuchsia-50 text-fuchsia-700', note: 'Cuidados para toda a família' },
];

const PLATFORMS: PlatformId[] = ['shopee', 'mercadolivre', 'amazon', 'aliexpress', 'shein', 'magalu'];

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ onSelectCategory, categoryCounts }) => {
  return (
    <section className="w-full bg-slate-100 py-8" aria-labelledby="featured-categories-title">
      <div className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Flame size={20} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Vitrine inteligente</p>
            <h2 className="mt-1 font-display text-xl font-black text-neutral-950 sm:text-2xl">Encontre por categoria e compare melhor</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-neutral-500 sm:text-sm">Ofertas afiliadas, comerciantes parceiros e produtos próprios em uma navegação só.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelectCategory('Todas as Categorias')}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-teal-900 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Ver todo o catálogo
          <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">Descubra sua próxima compra</p>
          <h2 id="featured-categories-title" className="mt-1 font-display text-xl font-black text-neutral-950 sm:text-2xl">Categorias em destaque</h2>
        </div>
        <span className="hidden items-center gap-1 text-xs font-bold text-neutral-400 sm:flex"><ShieldCheck size={14} className="text-teal-600" /> seleção do Comércio Popular</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FEATURED.map((item, index) => {
          const group = CATEGORY_MENU[index];
          const Icon = group.icon;
          const count = categoryCounts?.[item.category];
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectCategory(item.category)}
              className="group min-h-[154px] rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.accent}`}><Icon size={19} /></span>
              <span className="mt-4 block text-sm font-black leading-tight text-neutral-900">{item.label}</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-neutral-500">{item.note}</span>
              <span className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold text-teal-700">
                {typeof count === 'number' ? `${count.toLocaleString('pt-BR')} ofertas` : 'Explorar agora'}
                <ChevronRight size={13} className="transition group-hover:translate-x-1" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Store size={17} /></span>
          <div>
            <p className="text-xs font-black text-neutral-900">Ofertas encontradas nas melhores plataformas</p>
            <p className="text-[11px] text-neutral-500">Confira as condições finais na loja parceira antes de comprar.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PLATFORMS.map((platform) => (
            <span key={platform} className="rounded-xl border border-neutral-100 bg-neutral-50 px-2 py-1.5">
              <PlatformLogo platform={platform} />
            </span>
          ))}
        </div>
      </div>

      <div className="sr-only"><CategoryIcon category="Todas as Categorias" /></div>
      </div>
    </section>
  );
};
