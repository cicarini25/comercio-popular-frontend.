import React, { useState } from 'react';
import { Download, Share, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'nav' | 'banner' | 'footer' }> = ({
  variant = 'nav'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // If already installed as PWA or inside standalone app, don't show
  if (isInstalled) {
    return null;
  }

  // Variant BANNER: Floating or top/bottom mobile banner
  if (variant === 'banner') {
    if (dismissedBanner) return null;
    if (!isInstallable && !isIOS) return null;

    return (
      <div className="bg-teal-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-teal-800 shadow-sm sm:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-800 flex items-center justify-center shrink-0">
            <Smartphone size={16} className="text-teal-300" />
          </div>
          <div>
            <p className="font-bold leading-tight">Instalar o Comércio Popular</p>
            <p className="text-[10px] text-teal-200">Acesse rápido direto da sua tela inicial</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInstallable && (
            <button
              onClick={install}
              className="px-3 py-1.5 bg-coral-600 hover:bg-coral-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
            >
              Baixar App
            </button>
          )}

          {isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
            >
              Instalar
            </button>
          )}

          <button
            onClick={() => setDismissedBanner(true)}
            className="p-1 text-teal-300 hover:text-white rounded-md cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4 text-neutral-900">
            <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone size={20} className="text-teal-700" />
                  <h4 className="font-bold text-sm">Instalar no iPhone / iPad</h4>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-600">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <p>
                    Toque no botão de <strong>Compartilhar</strong> <Share size={13} className="inline text-teal-700" /> na barra inferior do Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <p>
                    Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <p>
                    Pronto! O ícone do <strong>Comércio Popular</strong> aparecerá como app no seu celular.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant NAV: Desktop / header button
  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs font-bold transition-colors cursor-pointer shadow-xs"
        title="Instalar aplicativo no seu dispositivo"
      >
        <Download size={14} className="text-teal-300" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          title="Instalar no iPhone"
        >
          <Download size={14} className="text-teal-300" />
          <span>Instalar App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4 text-neutral-900">
            <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone size={20} className="text-teal-700" />
                  <h4 className="font-bold text-sm">Instalar no iPhone / iPad</h4>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-600">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <p>
                    Toque no botão de <strong>Compartilhar</strong> <Share size={13} className="inline text-teal-700" /> na barra inferior do Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <p>
                    Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <p>
                    Pronto! O ícone do <strong>Comércio Popular</strong> aparecerá como app no seu celular.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
