import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

// Global declaration for vendor prefixes
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  lang?: string;
  enableAudioCues?: boolean;
}

// Accessible audio chime helper via Web Audio API
function playSoundCue(type: 'start' | 'success' | 'error') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      // Pleasant rising tone (listening started)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'success') {
      // Cheerful confirmation chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'error') {
      // Gentle warning tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // AudioContext may not be permitted without user gesture, safe to ignore
  }
}

export function useSpeechRecognition({
  onResult,
  onError,
  lang = 'pt-BR',
  enableAudioCues = true
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Check support on mount
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped
      }
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    const SpeechRecognitionAPI =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognitionAPI) {
      const unsupportedMsg =
        'O reconhecimento de voz da Web Speech API não é suportado pelo seu navegador atual. Recomendamos o Google Chrome, Microsoft Edge ou Safari.';
      setError(unsupportedMsg);
      if (enableAudioCues) playSoundCue('error');
      onError?.(unsupportedMsg);
      return;
    }

    try {
      // Abort previous instance if active
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setError(null);
        if (enableAudioCues) playSoundCue('start');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          currentTranscript += res[0].transcript;
          if (res.isFinal) {
            isFinal = true;
          }
        }

        setTranscript(currentTranscript);
        onResult?.(currentTranscript, isFinal);

        if (isFinal && enableAudioCues) {
          playSoundCue('success');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        isListeningRef.current = false;
        let errorMsg = 'Erro ao capturar áudio.';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMsg =
            'Permissão para usar o microfone foi negada. Permita o acesso ao microfone no navegador para usar a busca por voz.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'Nenhuma fala foi detectada. Tente falar novamente mais próximo ao microfone.';
        } else if (event.error === 'audio-capture') {
          errorMsg = 'Nenhum microfone foi detectado no seu dispositivo.';
        } else if (event.error === 'network') {
          errorMsg = 'Falha de conexão com o serviço de voz. Verifique sua conexão com a internet.';
        }

        setError(errorMsg);
        setIsListening(false);
        if (enableAudioCues && event.error !== 'no-speech') {
          playSoundCue('error');
        }
        onError?.(errorMsg);
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition start failed:', err);
      const msg = 'Não foi possível iniciar o microfone.';
      setError(msg);
      setIsListening(false);
      if (enableAudioCues) playSoundCue('error');
      onError?.(msg);
    }
  }, [enableAudioCues, lang, onError, onResult]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current || isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearError,
    clearTranscript
  };
}
