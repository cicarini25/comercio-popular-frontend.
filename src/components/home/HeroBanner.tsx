import React from 'react';
import {
  Flame,
  Store,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  QrCode,
  Tag
} from 'lucide-react';
import { ImageCarousel } from '../common/ImageCarousel';

interface HeroBannerProps {
  onExploreAchadinhos: () => void;
  onExploreSellers: () => void;
  onSelectTag: (tag: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreAchadinhos,
  onExploreSellers,
  onSelectTag
}) => {
  return (
    <div id="hero-banner" className="relative pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Hero Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
          {/* Subtle background rings */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-coral-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Col: Messaging */}
            <div className="md:col-span-7 lg:col-span-7 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white leading-tight">
                Preço bom pra todo mundo, com achadinhos e lojistas locais.
              </h1>

              <p className="text-sm sm:text-base text-teal-100/90 max-w-xl leading-relaxed">
                Reunimos os maiores achadinhos de afiliados (Mercado Livre, Shopee, Amazon e AliExpress) e produtos próprios de comerciantes parceiros com pagamento integrado e seguro.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  id="hero-btn-achadinhos"
                  onClick={onExploreAchadinhos}
                  className="px-5 py-3 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Flame size={16} />
                  <span>Ver Achadinhos do Dia (Até 65% OFF)</span>
                </button>

                <button
                  id="hero-btn-sellers"
                  onClick={onExploreSellers}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-teal-300/30 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Store size={16} className="text-teal-300" />
                  <span>Comprar de Lojistas Parceiros</span>
                </button>
              </div>

              {/* Quick Trust Strip */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-teal-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} className="text-teal-300" />
                  Biometria Facial KYC
                </span>
                <span className="text-teal-500">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <QrCode size={14} className="text-teal-300" />
                  Pix e Cartão até 12x
                </span>
                <span className="text-teal-500">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <ExternalLink size={14} className="text-teal-300" />
                  Links Verificados
                </span>
              </div>
            </div>

            {/* Right Col: Carrossel de Destaques Visuais com leve zoom e efeito parallax ao arrastar */}
            <div className="md:col-span-5 lg:col-span-5 w-full flex items-center justify-center pt-2 md:pt-0 overflow-hidden">
              <ImageCarousel
                className="w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto"
                imageScale="scale-105"
                parallaxFactor={0.22}
              />
            </div>
          </div>
        </div>

        {/* Quick Tags Strip */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-neutral-400 flex items-center gap-1 uppercase tracking-wider text-[11px]">
            <Tag size={13} /> Mais buscados:
          </span>
          {[
            '🔥 Achadinhos < R$ 50',
            'Garrafa Térmica Display LED',
            'Organizador Acrílico',
            'Café Especial de Minas',
            'Panelas Antiaderentes',
            'Fone Bluetooth TWS',
            'Mochila Antifurto'
          ].map((tag, idx) => (
            <button
              key={idx}
              onClick={() => onSelectTag(tag.replace('🔥 ', ''))}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-neutral-100 text-neutral-600 hover:text-teal-800 border border-neutral-200 transition-colors cursor-pointer shadow-2xs font-medium"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
