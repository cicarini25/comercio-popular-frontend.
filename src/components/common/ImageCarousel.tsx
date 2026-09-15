import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import bannerComercioPopular from '../../assets/images/banner_comercio_popular_1789045747520.jpg';
import bannerMarketplaces from '../../assets/images/banner_marketplaces_sem_texto.png';
import bannerAppBrowsing from '../../assets/images/banner_app_browsing_1789045778259.jpg';
import bannerMapaAchados from '../../assets/images/banner_mapa_achados_sem_texto.png';
import bannerMulherSofa from '../../assets/images/banner_mulher_sofa_1789045812071.jpg';

export interface CarouselSlide {
  id: string | number;
  imageSrc: string;
  alt: string;
  title?: string;
  subtitle?: string;
  tag?: string;
  imageScale?: string;
  objectPosition?: string;
  linkText?: string;
  linkAction?: () => void;
}

export interface ImageCarouselProps {
  slides?: CarouselSlide[];
  autoPlayInterval?: number; // 5000ms
  transitionDuration?: number; // 500ms
  className?: string;
  imageScale?: string; // e.g. 'scale-105'
  imageClassName?: string;
  parallaxFactor?: number; // default 0.22 for subtle parallax translation during drag
  onSlideClick?: (slide: CarouselSlide, index: number) => void;
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    imageSrc: bannerComercioPopular,
    alt: 'Comércio Popular - Achou. Gostou. Comprou.',
    tag: 'Destaque Oficial',
    title: 'Achou. Gostou. Comprou.',
    subtitle: 'Preço bom pra todo mundo em produtos verificados',
    imageScale: 'scale-105',
    objectPosition: 'object-[60%_35%]'
  },
  {
    id: 2,
    imageSrc: bannerMarketplaces,
    alt: 'Os Maiores Marketplaces Integrados',
    tag: 'Marketplaces Reunidos',
    title: 'Os Maiores Marketplaces',
    subtitle: 'Mercado Livre, Shopee, Amazon e Magalu no mesmo lugar',
    imageScale: 'scale-105',
    objectPosition: 'object-center'
  },
  {
    id: 3,
    imageSrc: bannerAppBrowsing,
    alt: 'Ofertas e Achadinhos no Smartphone',
    tag: 'Achadinhos Mobile',
    title: 'Ofertas na Palma da Mão',
    subtitle: 'Descontos de até 65% OFF com biometria KYC e Pix',
    imageScale: 'scale-105',
    objectPosition: 'object-[50%_50%]'
  },
  {
    id: 4,
    imageSrc: bannerMapaAchados,
    alt: 'Tendências e Favoritos do Brasil',
    tag: 'Tendências Nacionais',
    title: 'Achadinhos de Todo o Brasil',
    subtitle: 'Os produtos mais buscados e bem avaliados de cada região',
    imageScale: 'scale-105',
    objectPosition: 'object-[50%_45%]'
  },
  {
    id: 5,
    imageSrc: bannerMulherSofa,
    alt: 'Compras Práticas no Conforto de Casa',
    tag: 'Compra Confortável',
    title: 'Compre no Conforto do Lar',
    subtitle: 'Pagamento facilitado em até 12x com proteção total',
    imageScale: 'scale-105',
    objectPosition: 'object-[50%_40%]'
  }
];

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 5000,
  transitionDuration = 500,
  className = '',
  imageScale = 'scale-105',
  imageClassName = '',
  parallaxFactor = 0.22,
  onSlideClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Subtle parallax offset calculation during drag (moves image slightly counter to container drag)
  const parallaxOffset = isDragging
    ? Math.max(-25, Math.min(25, dragOffset * -parallaxFactor))
    : 0;

  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = slides.length;

  const triggerSlideChange = useCallback((nextIndex: number) => {
    setIsTransitioning(true);
    setCurrentIndex((nextIndex + totalSlides) % totalSlides);

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
  }, [totalSlides, transitionDuration]);

  const goToSlide = useCallback((index: number) => {
    triggerSlideChange(index);
  }, [triggerSlideChange]);

  const nextSlide = useCallback(() => {
    triggerSlideChange(currentIndex + 1);
  }, [currentIndex, triggerSlideChange]);

  const prevSlide = useCallback(() => {
    triggerSlideChange(currentIndex - 1);
  }, [currentIndex, triggerSlideChange]);

  // Autoplay Effect (5s interval, pauses on hover or drag)
  useEffect(() => {
    if (isDragging || totalSlides <= 1) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      triggerSlideChange(currentIndex + 1);
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [isDragging, totalSlides, autoPlayInterval, currentIndex, triggerSlideChange]);

  // Drag Handlers (Mouse & Touch)
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
    currentXRef.current = clientX;
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    currentXRef.current = clientX;
    const diff = clientX - startXRef.current;
    // Damping drag offset
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    const diff = currentXRef.current - startXRef.current;
    const threshold = 50; // Drag threshold in px

    if (diff > threshold) {
      prevSlide();
    } else if (diff < -threshold) {
      nextSlide();
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  // Pointer capture guarantees that a drag always finishes, even outside the carousel.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    handleDragStart(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => handleDragMove(e.clientX);

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    handleDragEnd();
  };

  return (
    <div
      id="image-carousel"
      className={`relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto select-none group ${className}`}
    >
      {/* Outer Shell with Soft Glow and Rounded Borders */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{ touchAction: 'pan-y' }}
        className={`relative w-full aspect-[4/3] sm:aspect-[1/1] md:aspect-[4/3] lg:aspect-[5/4] min-h-[270px] sm:min-h-[310px] md:min-h-[340px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-teal-950/80 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Slides sobrepostos: nunca deixa duas imagens paradas lado a lado. */}
        <div className="relative h-full w-full" onTransitionEnd={() => setIsTransitioning(false)}>
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={slide.id || idx}
                onClick={() => onSlideClick && onSlideClick(slide, idx)}
                aria-hidden={!isActive}
                className={`absolute inset-0 h-full w-full overflow-hidden transition-opacity ease-in-out ${
                  isActive ? 'z-[1] opacity-100' : 'z-0 opacity-0 pointer-events-none'
                }`}
                style={{ transitionDuration: `${transitionDuration}ms` }}
              >
                {/* Slide Image with Zoom & Subtle Drag Parallax Effect */}
                <img
                  src={slide.imageSrc}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  style={{
                    transform: `scale(1.03) translateX(${parallaxOffset}px)`,
                    transition: isDragging ? 'none' : `transform ${transitionDuration}ms ease-in-out`
                  }}
                  className={`w-full h-full object-cover pointer-events-none will-change-transform ${
                    imageClassName || ''
                  } ${slide.objectPosition || 'object-center'}`}
                />

                {/* Subtle soft opacity overlay during slide change */}
                <div
                  className={`absolute inset-0 bg-teal-950/20 pointer-events-none transition-opacity duration-500 ease-in-out ${
                    isTransitioning ? 'opacity-100' : 'opacity-0'
                  }`}
                />

              </div>
            );
          })}
        </div>

        {/* Atmospheric Opacity Overlay Veil during slide change */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-10 pointer-events-none bg-black/15 transition-opacity duration-500 ease-in-out ${
            isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              id="carousel-btn-prev"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Slide anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 focus:opacity-100 cursor-pointer shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              id="carousel-btn-next"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Próximo slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 focus:opacity-100 cursor-pointer shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Slide Counter Badge (Top Right) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-mono font-medium border border-white/20 shadow-md">
            {currentIndex + 1} / {totalSlides}
          </span>
        </div>

        {/* Bottom Pagination Dots */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2 pointer-events-auto">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(idx);
                }}
                aria-label={`Ir para slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-7 bg-amber-400 shadow-md'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
