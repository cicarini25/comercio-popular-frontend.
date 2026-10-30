import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, LoaderCircle, ShieldCheck, X } from 'lucide-react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

type ScanStatus = 'idle' | 'starting' | 'scanning' | 'verified' | 'error';

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm';
const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

interface FacePresenceCheckProps {
  context: 'seller-registration' | 'user-login';
}

export const FacePresenceCheck: React.FC<FacePresenceCheckProps> = ({ context }) => {
  const isSellerRegistration = context === 'seller-registration';
  const [scanOpen, setScanOpen] = useState(false);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState('A câmera só será usada depois que você clicar no botão.');
  const [faceCount, setFaceCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    detectorRef.current?.close();
    detectorRef.current = null;
  };

  useEffect(() => {
    if (!scanOpen) return;
    let cancelled = false;
    let stableFrames = 0;

    const run = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Este navegador não oferece acesso seguro à câmera.');
        }

        setStatus('starting');
        setMessage('Solicitando acesso temporário à câmera…');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (!videoRef.current) throw new Error('Não foi possível preparar a visualização da câmera.');
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setMessage('Posicione o rosto dentro do quadro. A análise acontece somente neste dispositivo.');
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.6,
        });
        if (cancelled) {
          detector.close();
          return;
        }

        detectorRef.current = detector;
        setStatus('scanning');

        const scanFrame = () => {
          if (cancelled || !videoRef.current || !detectorRef.current) return;
          const detections = detectorRef.current.detectForVideo(videoRef.current, performance.now()).detections;
          const count = detections.length;
          setFaceCount(count);
          if (count > 0) {
            stableFrames += 1;
          } else {
            stableFrames = 0;
          }

          if (stableFrames >= 3) {
            setStatus('verified');
            setMessage('Presença facial confirmada nesta sessão. Nenhuma imagem foi enviada ou salva.');
            stopCamera();
            return;
          }
          timerRef.current = window.setTimeout(scanFrame, 180);
        };

        scanFrame();
      } catch (error) {
        if (cancelled) return;
        stopCamera();
        setStatus('error');
        setMessage(error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'A permissão da câmera foi recusada. Você pode tentar novamente quando quiser.'
          : error instanceof Error ? error.message : 'Não foi possível iniciar o Face Scan neste navegador.');
      }
    };

    void run();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [scanOpen]);

  useEffect(() => () => stopCamera(), []);

  const closeScan = () => {
    stopCamera();
    setScanOpen(false);
    if (status !== 'verified') setStatus('idle');
  };

  return (
    <>
      <section className="rounded-3xl border border-teal-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="face-presence-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">{isSellerRegistration ? 'Cadastro do vendedor' : 'Login do usuário'}</p>
              <h3 id="face-presence-title" className="mt-1 text-lg font-extrabold text-neutral-900">Face Scan de presença</h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-neutral-600">{isSellerRegistration ? 'Confirme sua presença antes de enviar o cadastro da loja.' : 'Confirme sua presença durante o acesso à sua conta.'} Não pedimos documentos e não enviamos nem armazenamos fotos ou vídeos.</p>
            </div>
          </div>
          {status === 'verified' ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-800">
              <CheckCircle2 size={17} /> Presença confirmada nesta sessão
            </div>
          ) : (
            <button type="button" onClick={() => { setStatus('idle'); setScanOpen(true); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-teal-800">
              <Camera size={17} /> Verificar presença
            </button>
          )}
        </div>
      </section>

      {scanOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/70 p-4" role="dialog" aria-modal="true" aria-labelledby="face-scan-dialog-title">
          <section className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 bg-teal-950 px-5 py-4 text-white">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-teal-300">Processamento local</p>
                <h2 id="face-scan-dialog-title" className="mt-1 text-lg font-extrabold">Face Scan de presença</h2>
              </div>
              <button type="button" onClick={closeScan} aria-label="Fechar Face Scan" className="rounded-full p-2 text-teal-100 hover:bg-white/10"><X size={19} /></button>
            </header>
            <div className="space-y-4 p-5">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-neutral-950">
                <video ref={videoRef} muted playsInline className="h-full w-full object-cover" aria-label="Visualização temporária da câmera" />
                {(status === 'starting' || status === 'scanning') && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-44 w-36 rounded-[45%] border-2 border-teal-300 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" /></div>}
                {status === 'verified' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-teal-950/85 text-center text-white"><CheckCircle2 size={42} className="text-teal-300" /><strong>Presença confirmada</strong></div>}
                {status === 'error' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-950/85 px-6 text-center text-white"><AlertTriangle size={34} className="text-amber-300" /><strong>Câmera indisponível</strong></div>}
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                {status === 'starting' ? <LoaderCircle size={17} className="mt-0.5 shrink-0 animate-spin text-teal-700" /> : status === 'error' ? <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" /> : <ShieldCheck size={17} className="mt-0.5 shrink-0 text-teal-700" />}
                <p>{message}{status === 'scanning' && faceCount > 0 ? ` Rosto detectado (${faceCount}).` : ''}</p>
              </div>
              <p className="text-[11px] leading-5 text-neutral-500">A verificação confirma apenas presença diante da câmera. Ela não confirma nome, CPF, identidade civil ou titularidade de conta.</p>
              <div className="flex justify-end gap-2">
                {status === 'error' && <button type="button" onClick={() => { setScanOpen(false); window.setTimeout(() => setScanOpen(true), 0); }} className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800">Tentar novamente</button>}
                <button type="button" onClick={closeScan} className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50">Fechar</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};
