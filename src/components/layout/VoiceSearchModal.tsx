import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Search, X, Volume2, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

export interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onConfirmSearch: (term: string) => void;
  onClearError: () => void;
}

const VOICE_SUGGESTIONS = [
  'Airfryer Mondial',
  'Fone Bluetooth',
  'Garrafa Térmica',
  'Camiseta Dry Fit',
  'Cafeteira Elétrica',
  'Mochila Impermeável',
  'Smartwatch'
];

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  isListening,
  isSupported,
  transcript,
  error,
  onStartListening,
  onStopListening,
  onConfirmSearch,
  onClearError
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onStopListening();
        onClose();
      } else if (e.key === 'Enter' && transcript.trim()) {
        onStopListening();
        onConfirmSearch(transcript.trim());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, transcript, onClose, onConfirmSearch, onStopListening]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-search-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        {/* Header Ribbon */}
        <div className="bg-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center">
              <Mic size={18} />
            </div>
            <div>
              <h2 id="voice-search-modal-title" className="text-sm font-bold tracking-wide">
                Busca por Comando de Voz
              </h2>
              <p className="text-[11px] text-teal-200">
                Acessibilidade nativa Web Speech API (pt-BR)
              </p>
            </div>
          </div>

          <button
            id="btn-close-voice-modal"
            type="button"
            onClick={() => {
              onStopListening();
              onClose();
            }}
            aria-label="Fechar busca por voz"
            className="p-1.5 rounded-full hover:bg-teal-800 text-teal-200 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center space-y-6">
          {/* Unsupported Browser Notice */}
          {!isSupported ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertCircle size={18} className="text-amber-600 shrink-0" />
                <span>Navegador sem suporte à Web Speech API</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Este navegador não possui a API de reconhecimento de voz integrada. Recomendamos utilizar o <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong> ou <strong>Safari</strong> para pesquisar por voz.
              </p>
              <p className="text-xs text-neutral-600">
                Você pode utilizar o campo de digitação tradicional na barra superior a qualquer momento.
              </p>
            </div>
          ) : (
            <>
              {/* Central Listening State & Wave Visualizer */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative">
                  {/* Outer Pulsing Rings */}
                  {isListening && (
                    <>
                      <span className="absolute -inset-4 rounded-full bg-coral-500/20 animate-ping" />
                      <span className="absolute -inset-8 rounded-full bg-coral-500/10 animate-pulse" />
                    </>
                  )}

                  {/* Main Microphone Action Button */}
                  <button
                    id="btn-toggle-mic-modal"
                    type="button"
                    onClick={isListening ? onStopListening : onStartListening}
                    aria-label={isListening ? 'Parar gravação de voz' : 'Iniciar gravação de voz'}
                    aria-pressed={isListening}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                      isListening
                        ? 'bg-coral-600 text-white hover:bg-coral-700 ring-4 ring-coral-200 scale-105'
                        : 'bg-teal-700 text-white hover:bg-teal-800 ring-4 ring-teal-100 hover:scale-105'
                    }`}
                  >
                    {isListening ? (
                      <MicOff size={32} className="animate-pulse" />
                    ) : (
                      <Mic size={32} />
                    )}
                  </button>
                </div>

                {/* Status Indicator */}
                <div
                  role="status"
                  aria-live="assertive"
                  className="mt-4"
                >
                  {isListening ? (
                    <div className="flex items-center gap-2 text-coral-600 font-bold text-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-3 bg-coral-500 rounded-full animate-pulse" />
                        <span className="w-1.5 h-5 bg-coral-600 rounded-full animate-pulse delay-75" />
                        <span className="w-1.5 h-4 bg-coral-500 rounded-full animate-pulse delay-150" />
                      </div>
                      <span>Ouvindo... Fale agora o nome do produto</span>
                    </div>
                  ) : transcript ? (
                    <div className="flex items-center gap-1.5 text-teal-700 font-bold text-sm">
                      <Sparkles size={16} />
                      <span>Comando reconhecido! Clique em buscar</span>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      Clique no microfone e diga o que você procura
                    </p>
                  )}
                </div>
              </div>

              {/* Transcript Display Box */}
              <div
                className={`p-4 rounded-2xl border text-left min-h-[72px] flex items-center justify-between gap-3 transition-colors ${
                  transcript
                    ? 'bg-teal-50/50 border-teal-200'
                    : 'bg-neutral-50 border-neutral-200/80 text-neutral-400'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                    {transcript ? 'Termo Reconhecido:' : 'Aguardando sua fala:'}
                  </span>
                  <p className="text-sm font-semibold text-neutral-900 break-words">
                    {transcript || 'Ex: "Panela de pressão", "Mochila escolar", "Fone sem fio"...'}
                  </p>
                </div>

                {transcript && (
                  <button
                    type="button"
                    onClick={onStartListening}
                    title="Falar novamente"
                    aria-label="Falar novamente"
                    className="p-2 rounded-xl text-neutral-500 hover:text-teal-700 hover:bg-teal-100/50 transition-colors cursor-pointer shrink-0"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClearError}
                    className="p-1 hover:bg-rose-100 rounded-lg text-rose-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Voice Suggestions Pills */}
              <div className="text-left pt-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Volume2 size={12} /> Ou clique em sugestões populares:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {VOICE_SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        onStopListening();
                        onConfirmSearch(item);
                      }}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium bg-neutral-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 border border-neutral-200 text-neutral-700 transition-all cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons Footer */}
          <div className="flex items-center gap-3 pt-2">
            <button
              id="btn-cancel-voice-search"
              type="button"
              onClick={() => {
                onStopListening();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              id="btn-confirm-voice-search"
              type="button"
              disabled={!transcript.trim()}
              onClick={() => {
                if (transcript.trim()) {
                  onStopListening();
                  onConfirmSearch(transcript.trim());
                }
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                transcript.trim()
                  ? 'bg-teal-700 hover:bg-teal-800 text-white'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Search size={14} />
              <span>Buscar Produtos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
