import React from 'react';
import { ArrowUpRight, BookOpen, ShieldCheck } from 'lucide-react';
import { PlatformLogo, PlatformId } from '../common/PlatformLogo';

interface BrandStoriesProps {
  onSelectCategory: (category: string) => void;
}

const stories: Array<{ platform: PlatformId; eyebrow: string; title: string; description: string; category: string }> = [
  { platform: 'shopee', eyebrow: 'Guia Comércio Popular', title: 'Como avaliar um achadinho antes de comprar', description: 'Compare desconto, avaliações, frete e condição final da loja em poucos passos.', category: 'Utilidades' },
  { platform: 'mercadolivre', eyebrow: 'Seleção de ofertas', title: 'O que observar em compras para casa', description: 'Uma curadoria original para encontrar itens úteis, duráveis e com melhor custo-benefício.', category: 'Casa & Cozinha' },
  { platform: 'amazon', eyebrow: 'Radar de tecnologia', title: 'Tecnologia para o dia a dia', description: 'Veja categorias populares e compare alternativas antes de abrir a oferta parceira.', category: 'ELETRÔNICOS' },
];

export const BrandStories: React.FC<BrandStoriesProps> = ({ onSelectCategory }) => (
  <section className="mx-auto w-full max-w-7xl space-y-5 px-4 py-2 sm:px-6" aria-labelledby="brand-stories-title">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-teal-700"><BookOpen size={14} /> Conteúdo Comércio Popular</p>
        <h2 id="brand-stories-title" className="mt-1 font-display text-2xl font-black text-neutral-950">Guias para comprar melhor</h2>
      </div>
      <p className="max-w-md text-sm text-neutral-500">Conteúdo editorial próprio para ajudar você a comparar produtos e navegar pelas marcas parceiras.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {stories.map((story) => (
        <article key={story.platform} className="flex min-h-[220px] flex-col rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <PlatformLogo platform={story.platform} className="h-10 w-12" />
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800"><ShieldCheck size={12} /> Conteúdo próprio</span>
          </div>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-coral-700">{story.eyebrow}</p>
          <h3 className="mt-2 text-lg font-black leading-tight text-neutral-950">{story.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{story.description}</p>
          <button type="button" onClick={() => onSelectCategory(story.category)} className="mt-4 inline-flex w-fit items-center gap-2 text-xs font-black text-teal-800 hover:text-teal-950 focus-visible:outline-2 focus-visible:outline-teal-700">
            Explorar categoria <ArrowUpRight size={14} />
          </button>
        </article>
      ))}
    </div>
  </section>
);
