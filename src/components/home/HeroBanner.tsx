import React from 'react';

interface HeroBannerProps {
  onExploreAchadinhos: () => void;
  onExploreSellers: () => void;
  onSelectTag: (tag: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreAchadinhos: _onExploreAchadinhos,
  onExploreSellers: _onExploreSellers,
  onSelectTag: _onSelectTag
}) => {
  return (
    <section id="hero-banner" className="relative px-4 pt-6 pb-4 sm:px-6">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-teal-950 shadow-xl">
        <video
          src="/videos/promo-comercio-popular.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="block aspect-[2.45/1] h-auto min-h-[220px] w-full object-cover object-center sm:min-h-[300px] lg:min-h-[390px]"
          aria-label="Vídeo promocional do Comércio Popular"
        />
      </div>
    </section>
  );
};


