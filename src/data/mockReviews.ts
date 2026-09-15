import { ProductReview } from '../types';

export const INITIAL_SAMPLE_REVIEWS: Record<string, ProductReview[]> = {
  'ach-01': [
    {
      id: 'rev-01-1',
      productId: 'ach-01',
      authorName: 'Camila Mendonça',
      rating: 5,
      comment: 'Simplesmente perfeito! Veda os saquinhos de salgadinho e arroz muito rápido. O imã na geladeira é super útil.',
      date: '02/09/2026',
      verifiedPurchase: true,
      likes: 24
    },
    {
      id: 'rev-01-2',
      productId: 'ach-01',
      authorName: 'Lucas Ferreira',
      rating: 5,
      comment: 'Chegou em 2 dias bem embalado. Funciona muito bem depois de esquentar por 3 segundos.',
      date: '28/08/2026',
      verifiedPurchase: true,
      likes: 12
    },
    {
      id: 'rev-01-3',
      productId: 'ach-01',
      authorName: 'Mariana Costa',
      rating: 4,
      comment: 'Muito bom pelo preço. Recomendo usar pilhas de boa qualidade ou carregar bem.',
      date: '15/08/2026',
      verifiedPurchase: true,
      likes: 5
    }
  ],
  'ach-02': [
    {
      id: 'rev-02-1',
      productId: 'ach-02',
      authorName: 'Rodrigo Alves',
      rating: 5,
      comment: 'Garrafa sensacional! O display touch marca a temperatura certinho e manteve a água com gelo por mais de 20 horas.',
      date: '04/09/2026',
      verifiedPurchase: true,
      likes: 31
    },
    {
      id: 'rev-02-2',
      productId: 'ach-02',
      authorName: 'Fernanda Lima',
      rating: 5,
      comment: 'Excelente acabamento fosco, não vaza nada na bolsa. Melhor custo benefício.',
      date: '30/08/2026',
      verifiedPurchase: true,
      likes: 18
    }
  ],
  'ach-03': [
    {
      id: 'rev-03-1',
      productId: 'ach-03',
      authorName: 'Bruno Carvalho',
      rating: 5,
      comment: 'Iluminação forte e o sensor de presença funciona a mais de 3 metros. Comprei 3 pro corredor e escada.',
      date: '01/09/2026',
      verifiedPurchase: true,
      likes: 15
    }
  ]
};

// Generic fallback generator for products without explicit custom reviews
export const getOrGenerateReviews = (
  productId: string,
  productTitle: string,
  rating: number
): ProductReview[] => {
  if (INITIAL_SAMPLE_REVIEWS[productId]) {
    return INITIAL_SAMPLE_REVIEWS[productId];
  }

  const roundedRating = Math.max(1, Math.min(5, Math.round(rating)));

  return [
    {
      id: `rev-${productId}-1`,
      productId,
      authorName: 'Cliente Verificado',
      rating: roundedRating,
      comment: `Excelente produto! Chegou antes do prazo e atendeu perfeitamente as expectativas. Ótima qualidade.`,
      date: '03/09/2026',
      verifiedPurchase: true,
      likes: 8
    },
    {
      id: `rev-${productId}-2`,
      productId,
      authorName: 'Juliana P.',
      rating: Math.max(1, roundedRating - (roundedRating > 4 ? 0 : 1)),
      comment: `Gostei muito do custo-benefício. Recomendo a compra para quem busca economia e qualidade no Comércio Popular.`,
      date: '25/08/2026',
      verifiedPurchase: true,
      likes: 4
    }
  ];
};
