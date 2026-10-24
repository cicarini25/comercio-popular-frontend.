import React, { useEffect, useRef, useState } from 'react';
import { BadgePercent, CreditCard, Image as ImageIcon, Play, ShieldCheck, Truck } from 'lucide-react';

interface HeroBannerProps {
  onExploreAchadinhos: () => void;
  onExploreSellers: () => void;
  onSelectTag: (tag: string) => void;
}

const BENEFITS = [
  { icon: Truck, title: 'Entrega rápida', text: 'Ofertas para você' },
  { icon: ShieldCheck, title: 'Compra segura', text: 'Parceiros verificados' },
  { icon: CreditCard, title: 'Pix e cartão', text: 'Pagamento protegido' },
  { icon: BadgePercent, title: 'Melhores ofertas', text: 'Compare antes de comprar' },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreAchadinhos: _onExploreAchadinhos,
  onExploreSellers: _onExploreSellers,
  onSelectTag: _onSelectTag,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;
    const restartVideo = () => {
      video.currentTime = 0.45;
      void video.play().catch(() => undefined);
    };
    video.addEventListener('ended', restartVideo);
    return () => video.removeEventListener('ended', restartVideo);
  }, [showVideo]);

  return (
    <section id="hero-banner" className="relative bg-slate-100 px-4 pb-5 pt-4 sm:px-6 sm:pt-6">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[1.75rem] bg-teal-950 shadow-2xl ring-1 ring-black/5">
        {showVideo ? (
          <video
            ref={videoRef}
            src="/videos/promo-comercio-popular.mp4?v=e24678fe"
            poster="/images/hero_video_poster.jpg"
            onLoadedMetadata={() => {
              if (videoRef.current) videoRef.current.currentTime = 0.45;
            }}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls
            className="block aspect-[2.45/1] h-auto min-h-[220px] w-full object-cover object-center sm:min-h-[300px] lg:min-h-[390px]"
            aria-label="Vídeo promocional do Comércio Popular"
          />
        ) : (
          <img
            src="/images/hero_video_poster.jpg"
            alt="Comércio Popular: a alegria de comprar está aqui"
            className="block aspect-[2.45/1] h-auto min-h-[220px] w-full object-cover object-center sm:min-h-[300px] lg:min-h-[390px]"
          />
        )}
        <button
          type="button"
          onClick={() => setShowVideo((value) => !value)}
          className="absolute bottom-4 right-4 z-20 inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/30 bg-neutral-950/75 px-3.5 py-2.5 text-xs font-black text-white shadow-lg backdrop-blur transition hover:bg-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={showVideo ? 'Mostrar imagem do hero' : 'Assistir vídeo promocional'}
        >
          {showVideo ? <ImageIcon size={15} /> : <Play size={15} fill="currentColor" />}
          {showVideo ? 'Ver imagem' : 'Assistir vídeo'}
        </button>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-neutral-200 overflow-hidden rounded-b-2xl bg-white shadow-lg sm:grid-cols-4 sm:divide-y-0">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 px-3 py-3.5 sm:px-5 sm:py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600"><Icon size={18} /></span>
            <span className="min-w-0"><strong className="block truncate text-xs font-black text-neutral-900 sm:text-sm">{title}</strong><small className="block truncate text-[10px] text-neutral-500 sm:text-xs">{text}</small></span>
          </div>
        ))}
      </div>
    </section>
  );
};
