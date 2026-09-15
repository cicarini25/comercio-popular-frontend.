import React, { useState, useMemo } from 'react';
import {
  Heart,
  ShoppingCart,
  Trash2,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Flame,
  Store,
  Share2,
  Check
} from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { formatCurrency } from '../../utils/formatters';
import { getProductPriceComparison } from '../../utils/priceComparison';
import { ProfileNotificationCard } from '../profile/ProfileNotificationCard';

interface WishlistViewProps {
  favorites: Product[];
  onToggleFavorite: (product: Product) => void;
  onClearFavorites: () => void;
  onAddToCart: (product: Product) => void;
  onAddAllToCart: (products: Product[]) => void;
  onViewDetails: (product: Product) => void;
  onDirectAffiliateClick: (product: Product) => void;
  onExploreProducts: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  favorites,
  onToggleFavorite,
  onClearFavorites,
  onAddToCart,
  onAddAllToCart,
  onViewDetails,
  onDirectAffiliateClick,
  onExploreProducts
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'discount' | 'rating'>('recent');
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Total metrics
  const totalItems = favorites.length;
  const totalValue = useMemo(() => {
    return favorites.reduce((sum, p) => sum + p.price, 0);
  }, [favorites]);

  const totalPotentialSavings = useMemo(() => {
    return favorites.reduce((sum, p) => {
      const comp = getProductPriceComparison(p);
      return sum + (comp.savingsAmount > 0 ? comp.savingsAmount : 0);
    }, 0);
  }, [favorites]);

  // Filter & Sort
  const filteredFavorites = useMemo(() => {
    let result = [...favorites];

    if (selectedPlatform !== 'all') {
      result = result.filter((p) => p.platform === selectedPlatform);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }
    // 'recent' stays as current list order

    return result;
  }, [favorites, selectedPlatform, sortBy]);

  const handleShareWishlist = () => {
    const text = `Confira minha lista de favoritos no Comércio Popular com ${totalItems} produtos e economia total estimada de ${formatCurrency(
      totalPotentialSavings
    )}!`;
    if (navigator.share) {
      navigator
        .share({
          title: 'Meus Favoritos no Comércio Popular',
          text,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Heart size={22} className="fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display flex items-center gap-2">
                <span>Meus Favoritos</span>
                {totalItems > 0 && (
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {totalItems} {totalItems === 1 ? 'item salvo' : 'itens salvos'}
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                Sua lista de desejos persistente. Acompanhe os melhores preços e economize no Comércio Popular.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        {totalItems > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-share-wishlist"
              type="button"
              onClick={handleShareWishlist}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
              title="Compartilhar lista de desejos"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              id="btn-add-all-favorites-cart"
              type="button"
              onClick={() => onAddAllToCart(favorites)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <ShoppingCart size={15} />
              <span>Adicionar Todos à Sacola</span>
            </button>

            {confirmClear ? (
              <div className="inline-flex items-center gap-1 p-1 bg-rose-50 border border-rose-200 rounded-xl text-xs">
                <span className="text-[11px] font-semibold text-rose-800 px-1.5">Limpar tudo?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearFavorites();
                    setConfirmClear(false);
                  }}
                  className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 cursor-pointer"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 bg-white text-neutral-600 text-[10px] font-semibold rounded-lg hover:bg-neutral-100 cursor-pointer"
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                id="btn-clear-wishlist"
                type="button"
                onClick={() => setConfirmClear(true)}
                className="p-2 rounded-xl border border-neutral-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-neutral-400 transition-colors cursor-pointer"
                title="Limpar todos os favoritos"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary Highlight Card */}
      {totalItems > 0 && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 text-teal-200 flex items-center justify-center shrink-0">
              <Sparkles size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-teal-200 tracking-wider">
                  Resumo da sua Lista de Desejos
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Economia Ativa
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                Valor dos itens: {formatCurrency(totalValue)}{' '}
                {totalPotentialSavings > 0 && (
                  <span className="text-emerald-300 font-extrabold text-sm ml-1.5">
                    (Economia de {formatCurrency(totalPotentialSavings)} em relação a outros marketplaces)
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddAllToCart(favorites)}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart size={15} />
            <span>Comprar Itens Salvos</span>
          </button>
        </div>
      )}

      {/* Service Worker Price Drop Notification Controller */}
      <div className="mt-6">
        <ProfileNotificationCard
          wishlistCount={totalItems}
          sampleWishlistProduct={favorites[0]}
        />
      </div>

      {/* Filter and Sort Toolbar */}
      {totalItems > 0 && (
        <div className="mt-6 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Platform Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-neutral-500 font-bold mr-1 flex items-center gap-1">
              <Filter size={13} /> Origem:
            </span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'shopee', label: 'Shopee' },
              { id: 'mercadolivre', label: 'Mercado Livre' },
              { id: 'amazon', label: 'Amazon' },
              { id: 'aliexpress', label: 'AliExpress' },
              { id: 'parceiro', label: 'Lojas Parceiras' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlatform(p.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedPlatform === p.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-bold flex items-center gap-1">
              <SlidersHorizontal size={13} /> Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-semibold text-xs outline-none focus:border-teal-700 cursor-pointer"
            >
              <option value="recent">Mais Recentes</option>
              <option value="price-asc">Menor Preço</option>
              <option value="discount">Maior Desconto %</option>
              <option value="rating">Melhor Avaliação ★</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Content: Empty State vs Product Grid */}
      {totalItems === 0 ? (
        <div
          id="empty-wishlist-state"
          className="mt-8 py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-neutral-300 max-w-2xl mx-auto shadow-2xs"
        >
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart size={32} className="fill-rose-400 text-rose-500" />
          </div>

          <h3 className="text-xl font-extrabold text-neutral-900 font-display">
            Sua lista de favoritos está vazia
          </h3>

          <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto leading-relaxed">
            Você ainda não salvou nenhum produto. Clique no ícone de coração{' '}
            <span className="inline-flex items-center align-middle text-rose-500 mx-1">
              <Heart size={14} className="fill-rose-500" />
            </span>{' '}
            nos cards de produtos ou no modal de detalhes para salvar seus achadinhos favoritos aqui!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-explore-from-empty-wishlist"
              type="button"
              onClick={onExploreProducts}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Explorar Ofertas e Achadinhos</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="mt-8 py-12 text-center bg-white rounded-2xl border border-neutral-200">
          <p className="text-sm font-semibold text-neutral-700">
            Nenhum produto encontrado para o filtro selecionado.
          </p>
          <button
            type="button"
            onClick={() => setSelectedPlatform('all')}
            className="mt-3 text-xs font-bold text-teal-700 underline cursor-pointer"
          >
            Limpar filtros de plataforma
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredFavorites.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
              onDirectAffiliateClick={onDirectAffiliateClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
