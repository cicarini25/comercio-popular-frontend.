import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  ExternalLink,
  Sparkles,
  Filter,
  Check,
  Share2,
  TrendingDown,
  Percent,
  Layers
} from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { PlatformLogo, PlatformId } from '../common/PlatformLogo';

interface AchadinhosSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onAffiliateClick: (product: Product) => void;
  isDedicatedPage?: boolean;
  wishlistIds?: string[];
  onToggleFavorite?: (product: Product) => void;
}

export const AchadinhosSection: React.FC<AchadinhosSectionProps> = ({
  products,
  onAddToCart,
  onViewDetails,
  onAffiliateClick,
  isDedicatedPage = false,
  wishlistIds = [],
  onToggleFavorite
}) => {
  // Deal of the Day Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 24, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filters for Achadinhos
  const [priceFilter, setPriceFilter] = useState<'all' | 'under30' | 'under50' | 'under100'>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [minDiscount, setMinDiscount] = useState<number>(0);

  // Filtered achadinhos
  const achadinhos = products.filter((p) => {
    if (!p.isAchadinho) return false;
    if (priceFilter === 'under30' && p.price > 30) return false;
    if (priceFilter === 'under50' && p.price > 50) return false;
    if (priceFilter === 'under100' && p.price > 100) return false;
    if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
    if (minDiscount > 0 && (p.discountPercentage || 0) < minDiscount) return false;
    return true;
  });

  return (
    <section id="achadinhos-section" className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header with Countdown Timer */}
        <div className="bg-gradient-to-r from-coral-900 via-coral-800 to-coral-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-coral-700/80 text-coral-100 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <Flame size={14} className="text-coral-300" />
                <span>Achadinhos do Dia • Curadoria de Redes Sociais</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                Ofertas Virais de Afiliados com até 65% OFF
              </h2>
              <p className="text-sm text-coral-200 mt-1 max-w-xl">
                Produtos de impulso (menos de R$ 50 e R$ 100) das maiores plataformas: Shopee, Mercado Livre, Amazon e AliExpress com links diretos verificados.
              </p>
            </div>

            {/* Countdown Clock Box */}
            <div className="bg-coral-950/80 backdrop-blur-xs border border-coral-700/60 rounded-2xl p-4 shrink-0 text-center sm:text-right">
              <span className="text-[11px] font-bold text-coral-300 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-end mb-2">
                <Clock size={13} className="text-coral-400 animate-pulse" />
                Tempo restante da rodada:
              </span>
              <div className="flex items-center justify-center sm:justify-end gap-2 font-display text-white font-black text-2xl">
                <div className="bg-coral-900/90 px-3 py-1.5 rounded-xl min-w-12 text-center border border-coral-700">
                  {String(timeLeft.hours).padStart(2, '0')}
                  <span className="block text-[9px] font-sans font-medium text-coral-300">HORAS</span>
                </div>
                <span>:</span>
                <div className="bg-coral-900/90 px-3 py-1.5 rounded-xl min-w-12 text-center border border-coral-700">
                  {String(timeLeft.minutes).padStart(2, '0')}
                  <span className="block text-[9px] font-sans font-medium text-coral-300">MIN</span>
                </div>
                <span>:</span>
                <div className="bg-coral-900/90 px-3 py-1.5 rounded-xl min-w-12 text-center border border-coral-700 text-coral-300">
                  {String(timeLeft.seconds).padStart(2, '0')}
                  <span className="block text-[9px] font-sans font-medium text-coral-300">SEG</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar for Achadinhos */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Price Range Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <TrendingDown size={14} className="text-coral-600" /> Preço:
            </span>
            {[
              { id: 'all', label: 'Todos os preços' },
              { id: 'under30', label: 'Até R$ 30' },
              { id: 'under50', label: 'Até R$ 50' },
              { id: 'under100', label: 'Até R$ 100' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPriceFilter(tab.id as any)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  priceFilter === tab.id
                    ? 'bg-coral-600 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Platform Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Layers size={14} /> Plataforma:
            </span>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'shopee', label: 'Shopee' },
              { id: 'mercadolivre', label: 'Mercado Livre' },
              { id: 'amazon', label: 'Amazon' },
              { id: 'aliexpress', label: 'AliExpress' },
              { id: 'shein', label: 'Shein' },
              { id: 'magalu', label: 'Magalu' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatformFilter(p.id as any)}
                aria-label={p.label}
                title={p.label}
                className={`text-xs font-medium min-h-10 min-w-11 px-2 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  platformFilter === p.id
                    ? 'bg-teal-700 text-white font-bold'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {p.id === 'all' ? 'Todas' : <PlatformLogo platform={p.id as PlatformId} className="shadow-none" />}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {achadinhos.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200">
            <Flame size={36} className="mx-auto text-neutral-400 mb-2" />
            <h3 className="font-bold text-neutral-800 text-base">Nenhum achadinho encontrado para estes filtros</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Tente selecionar &quot;Todos os preços&quot; para visualizar todas as promoções de afiliados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {achadinhos.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={wishlistIds.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
                onDirectAffiliateClick={onAffiliateClick}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
