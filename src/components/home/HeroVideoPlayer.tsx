import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface HeroVideoPlayerProps {
  videoSrc?: string;
  posterSrc?: string;
}

export const HeroVideoPlayer: React.FC<HeroVideoPlayerProps> = ({
  videoSrc = '/videos/promo-comercio-popular.mp4',
  posterSrc = '/images/hero_video_poster.jpg'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayPulse, setShowPlayPulse] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [videoSrc]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      setShowPlayPulse(true);
      setTimeout(() => setShowPlayPulse(false), 600);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <>
      {/* Smartphone Mockup Frame */}
      <div className="flex flex-col items-center select-none">
        <div
          id="hero-video-player"
          onClick={togglePlay}
          className="relative w-[210px] sm:w-[240px] md:w-[260px] lg:w-[280px] aspect-[9/16] rounded-[32px] overflow-hidden shadow-2xl border-[5px] border-white/30 bg-black group flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.02] ring-1 ring-black/40"
          title={isPlaying ? 'Clique para pausar' : 'Clique para reproduzir'}
        >
          {/* Top Speaker Notch / Dynamic Island */}
          <div className="absolute top-2.5 inset-x-0 z-30 flex justify-center pointer-events-none">
            <div className="w-20 h-4 bg-black/90 rounded-full border border-white/10 flex items-center justify-end px-2.5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
            </div>
          </div>

          {/* Video Element or Fallback */}
          {!hasError ? (
            <video
              ref={videoRef}
              id="hero-promo-video"
              src={videoSrc}
              poster={posterSrc}
              autoPlay
              muted={isMuted}
              playsInline
              loop
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setHasError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={posterSrc}
              alt="Propaganda Comércio Popular"
              className="w-full h-full object-cover"
            />
          )}

          {/* Center Play/Pause Indicator on tap */}
          {showPlayPulse && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/20">
              <div className="p-3 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 animate-ping">
                {isPlaying ? <Play size={24} className="fill-white" /> : <Pause size={24} className="fill-white" />}
              </div>
            </div>
          )}

          {!isPlaying && !showPlayPulse && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/30">
              <div className="p-4 rounded-full bg-teal-600/90 backdrop-blur-md text-white border border-white/40 shadow-xl">
                <Play size={28} className="fill-white translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Top Controls Overlay */}
          <div className="absolute top-9 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={toggleSound}
              className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
              title={isMuted ? 'Ativar áudio' : 'Mutar áudio'}
              aria-label={isMuted ? 'Ativar áudio' : 'Mutar áudio'}
            >
              {isMuted ? (
                <VolumeX size={15} className="text-white/80" />
              ) : (
                <Volume2 size={15} className="text-teal-300" />
              )}
            </button>

            {/* Expand / Fullscreen Button */}
            <button
              type="button"
              onClick={openModal}
              className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
              title="Ver vídeo ampliado"
              aria-label="Ver vídeo ampliado"
            >
              <Maximize2 size={15} className="text-white/80" />
            </button>
          </div>

          {/* Bottom Caption Pill (Discreet, does not hide video content) */}
          <div className="absolute bottom-3 inset-x-3 z-20 flex flex-col items-center pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-center shadow-lg pointer-events-auto">
              <p className="text-white font-bold text-[11px] leading-tight flex items-center gap-1">
                <Sparkles size={11} className="text-coral-400" />
                Achou. Gostou. Comprou.
              </p>
              <p className="text-teal-300 font-medium text-[10px] leading-tight">
                Vem pro Comércio Popular
              </p>
            </div>
          </div>
        </div>

        {/* Small subtitle indicator below phone */}
        <div className="mt-2.5 flex items-center gap-2 text-teal-200/80 text-xs font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Propaganda Oficial (Toque para {isPlaying ? 'pausar' : 'assistir'})</span>
        </div>
      </div>

      {/* Fullscreen Modal Player */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div
            className="relative max-w-sm w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={modalVideoRef}
              src={videoSrc}
              poster={posterSrc}
              autoPlay
              controls
              playsInline
              loop
              className="w-full h-full object-contain"
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/30 transition-colors cursor-pointer"
              title="Fechar"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
