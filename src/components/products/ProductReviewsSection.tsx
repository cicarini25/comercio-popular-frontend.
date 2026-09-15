import React, { useState } from 'react';
import { StarRating } from '../common/StarRating';
import { Product, ProductReview } from '../../types';
import { getOrGenerateReviews } from '../../data/mockReviews';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquarePlus,
  Send,
  Sparkles,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductReviewsSectionProps {
  product: Product;
  onAddReview: (
    productId: string,
    review: { rating: number; comment: string; authorName: string }
  ) => void;
  currentUserName?: string;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Muito Ruim - Não atendeu às expectativas',
  2: 'Ruim - Produto com pontos a desejar',
  3: 'Regular - Atende ao básico pelo preço',
  4: 'Muito Bom! - Recomendo a compra',
  5: 'Excelente! - Superou as expectativas, perfeito!'
};

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
  onAddReview,
  currentUserName
}) => {
  // Get existing reviews or fallback generated ones
  const reviews: ProductReview[] =
    product.reviews && product.reviews.length > 0
      ? product.reviews
      : getOrGenerateReviews(product.id, product.title, product.rating);

  // Form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [authorName, setAuthorName] = useState(currentUserName || '');
  const [comment, setComment] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 5 | 4 | 'low'>('all');

  // Likes tracking
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Calculate star distributions
  const totalReviews = Math.max(product.reviewCount, reviews.length);
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    // Count in current reviews list
    const countInList = reviews.filter((r) => r.rating === stars).length;
    // Estimate weighted percentage according to average rating
    let percentage = 0;
    if (stars === 5) {
      percentage = Math.min(90, Math.max(40, Math.round(product.rating * 16)));
    } else if (stars === 4) {
      percentage = Math.min(40, Math.max(15, Math.round((5 - Math.abs(product.rating - 4)) * 7)));
    } else if (stars === 3) {
      percentage = 8;
    } else if (stars === 2) {
      percentage = 4;
    } else {
      percentage = 2;
    }
    return { stars, percentage, countInList };
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFormError('Por favor, escreva um breve comentário sobre o produto.');
      return;
    }

    const finalAuthor = authorName.trim() || currentUserName || 'Cliente Verificado';

    onAddReview(product.id, {
      rating: selectedRating,
      comment: comment.trim(),
      authorName: finalAuthor
    });

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });

    setFormSubmitted(true);
    setComment('');
    setFormError('');

    setTimeout(() => {
      setFormSubmitted(false);
      setShowReviewForm(false);
    }, 3000);
  };

  const toggleLike = (reviewId: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 5) return r.rating === 5;
    if (activeFilter === 4) return r.rating === 4;
    if (activeFilter === 'low') return r.rating <= 3;
    return true;
  });

  return (
    <section id="section-reviews" className="mt-8 pt-6 border-t border-neutral-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 font-display flex items-center gap-2">
            <span>Avaliações e Opiniões</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {totalReviews.toLocaleString('pt-BR')} reviews
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Opiniões verificadas de clientes que adquiriram este produto
          </p>
        </div>

        <button
          id="btn-open-review-form"
          type="button"
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer w-full sm:w-auto"
        >
          <MessageSquarePlus size={15} />
          <span>{showReviewForm ? 'Fechar Formulário' : 'Avaliar Produto'}</span>
        </button>
      </div>

      {/* Review Submission Form Drawer / Card */}
      {showReviewForm && (
        <div
          id="card-submit-review"
          className="mb-6 p-5 rounded-2xl bg-teal-50/70 border border-teal-200 shadow-sm animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-teal-200/60">
            <h4 className="font-bold text-teal-950 text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-teal-700" />
              <span>Deixe sua avaliação de 1 a 5 estrelas</span>
            </h4>
            <span className="text-[11px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-200">
              Compra Verificada ✓
            </span>
          </div>

          {formSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-700 shrink-0" />
              <div>
                <p>Obrigado pela sua avaliação!</p>
                <p className="text-xs font-normal text-emerald-800 mt-0.5">
                  Sua nota e comentário já foram computados na média do produto.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Sua Nota (Clique para avaliar de 1 a 5 estrelas):
                </label>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-teal-200">
                  <StarRating
                    rating={selectedRating}
                    size="lg"
                    showCount={false}
                    showScore={false}
                    interactive={true}
                    onRatingChange={(newVal) => setSelectedRating(newVal)}
                    idPrefix="form-rating"
                  />
                  <div className="text-xs font-extrabold text-teal-900">
                    {selectedRating} de 5 estrelas
                    <span className="block text-[11px] font-normal text-teal-700">
                      {RATING_DESCRIPTIONS[selectedRating]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Author name */}
              <div>
                <label htmlFor="review-author-name" className="block text-xs font-bold text-neutral-800 mb-1">
                  Seu Nome ou Apelido:
                </label>
                <input
                  id="review-author-name"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ex: Mariana S."
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all"
                />
              </div>

              {/* Comment text */}
              <div>
                <label htmlFor="review-comment" className="block text-xs font-bold text-neutral-800 mb-1">
                  Seu Comentário sobre o Produto:
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte o que achou da qualidade, entrega, custo-benefício e funcionamento..."
                  className="w-full text-xs p-3 bg-white border border-neutral-300 rounded-xl outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all resize-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-teal-100/50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-review"
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <Send size={13} />
                  <span>Enviar Avaliação</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Ratings Score Overview & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
        {/* Left Column: Big Average Score */}
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-2 border-b md:border-b-0 md:border-r border-neutral-200">
          <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 font-display">
            {product.rating.toFixed(1)}
          </span>
          <div className="mt-2">
            <StarRating
              rating={product.rating}
              size="md"
              showCount={false}
              showScore={false}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1 font-medium">
            Média baseada em{' '}
            <strong className="text-neutral-800">{totalReviews.toLocaleString('pt-BR')}</strong> avaliações
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={12} />
            <span>97% dos compradores recomendam</span>
          </div>
        </div>

        {/* Right Column: 5-Star Distribution Bars */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-2">
          {distribution.map(({ stars, percentage }) => (
            <div key={stars} className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 w-12 text-neutral-700 font-bold shrink-0">
                <span>{stars}</span>
                <Star size={12} className="fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-neutral-500 font-medium text-[11px] w-9 text-right shrink-0">
                {percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs for Reviews */}
      <div className="flex items-center gap-2 mt-6 pb-2 overflow-x-auto text-xs">
        <span className="text-neutral-400 font-bold flex items-center gap-1 shrink-0">
          <Filter size={12} /> Filtrar:
        </span>
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
            activeFilter === 'all'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Todas ({reviews.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter(5)}
          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
            activeFilter === 5
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          5 Estrelas
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter(4)}
          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
            activeFilter === 4
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          4 Estrelas
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('low')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
            activeFilter === 'low'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          3 Estrelas ou menos
        </button>
      </div>

      {/* Reviews List */}
      <div className="mt-3 divide-y divide-neutral-100 space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-500">
            Nenhuma avaliação encontrada com este filtro.
          </div>
        ) : (
          filteredReviews.map((review) => {
            const isLiked = !!likedReviews[review.id];
            const currentLikes = (review.likes || 0) + (isLiked ? 1 : 0);

            return (
              <div key={review.id} className="pt-3 pb-2 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-900 font-bold flex items-center justify-center text-xs">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-900">{review.authorName}</span>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            <CheckCircle2 size={10} className="text-emerald-600" />
                            <span>Compra Verificada</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-400">{review.date}</span>
                    </div>
                  </div>

                  {/* Individual Review Star Rating */}
                  <StarRating
                    rating={review.rating}
                    size="xs"
                    showCount={false}
                    showScore={false}
                  />
                </div>

                {/* Comment Text */}
                <p className="text-neutral-700 leading-relaxed pl-9">
                  {review.comment}
                </p>

                {/* Helpful Button */}
                <div className="pl-9 flex items-center gap-3 text-[11px] text-neutral-500">
                  <span>Esta avaliação foi útil?</span>
                  <button
                    type="button"
                    onClick={() => toggleLike(review.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium transition-colors cursor-pointer ${
                      isLiked
                        ? 'bg-teal-50 border-teal-300 text-teal-800'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <ThumbsUp size={11} className={isLiked ? 'fill-teal-700 text-teal-700' : ''} />
                    <span>Útil ({currentLikes})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
