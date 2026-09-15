import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  X,
  Camera,
  ScanBarcode,
  Barcode,
  Upload,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Product } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductFound: (product: Product) => void;
  onManualSearch: (query: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductFound,
  onManualSearch
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  // Manual & upload states
  const [manualCode, setManualCode] = useState('');
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = 'barcode-scanner-viewport';

  // Pleasant audio feedback beep on scan
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Audio context might be restricted before interaction
    }

    if (navigator.vibrate) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch {
        // ignore
      }
    }
  };

  // Find product by barcode
  const lookupProduct = (code: string): Product | undefined => {
    const clean = code.trim();
    if (!clean) return undefined;

    return products.find((p) => {
      if (p.ean && p.ean.toLowerCase() === clean.toLowerCase()) return true;
      if (p.upc && p.upc.toLowerCase() === clean.toLowerCase()) return true;
      if (p.id.toLowerCase() === clean.toLowerCase()) return true;
      if (p.specs && Object.values(p.specs).some((v) => String(v).toLowerCase() === clean.toLowerCase())) return true;
      return false;
    });
  };

  const handleBarcodeDetected = (decodedText: string) => {
    playBeep();
    setScannedCode(decodedText);
    const found = lookupProduct(decodedText);

    if (found) {
      setMatchedProduct(found);
      setNotFoundCode(null);
      // Auto redirect to product after brief visual confirmation
      setTimeout(() => {
        onProductFound(found);
        handleClose();
      }, 900);
    } else {
      setMatchedProduct(null);
      setNotFoundCode(decodedText);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Erro ao finalizar scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
    setTorchOn(false);
  };

  const startScanner = async (cameraId?: string) => {
    setCameraError(null);
    setScannedCode(null);
    setMatchedProduct(null);
    setNotFoundCode(null);

    try {
      await stopScanner();

      // Ensure DOM element is present
      const container = document.getElementById(scannerContainerId);
      if (!container) return;

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE
        ],
        verbose: false
      });

      html5QrCodeRef.current = html5QrCode;

      // Check available cameras
      try {
        const availableCameras = await Html5Qrcode.getCameras();
        if (availableCameras && availableCameras.length > 0) {
          setCameras(availableCameras);
          if (!cameraId && !selectedCameraId) {
            // Prefer back camera ("environment")
            const backCam = availableCameras.find(
              (c) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('traseira')
            );
            const chosenId = backCam ? backCam.id : availableCameras[0].id;
            setSelectedCameraId(chosenId);
          }
        }
      } catch (camListErr) {
        console.warn('Não foi possível listar câmeras:', camListErr);
      }

      const cameraConfig = cameraId || selectedCameraId || { facingMode: 'environment' };

      const qrConfig = {
        fps: 15,
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        cameraConfig,
        qrConfig,
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // Frame scanned without code match (silent)
        }
      );

      setIsScanning(true);

      // Check if torch/flashlight is supported
      try {
        const track = (html5QrCode as unknown as { getRunningTrackCameraCapabilities?: () => { torchFeature?: () => { isSupported: () => boolean } } })
          .getRunningTrackCameraCapabilities?.()
          ?.torchFeature?.();
        if (track && track.isSupported()) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: unknown) {
      console.error('Falha ao iniciar leitor de código de barras:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setCameraError('Permissão da câmera negada. Por favor, autorize o acesso à câmera no seu navegador.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError('Nenhuma câmera encontrada no dispositivo. Você pode testar pelo upload de imagem ou código manual.');
      } else {
        setCameraError('Não foi possível iniciar a câmera neste momento. Tente usar o upload de foto ou digitação manual.');
      }
      setIsScanning(false);
    }
  };

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !hasTorch) return;
    try {
      const newStatus = !torchOn;
      await (html5QrCodeRef.current as unknown as { applyVideoConstraints: (constraints: MediaTrackConstraints) => Promise<void> }).applyVideoConstraints({
        advanced: [{ torch: newStatus } as unknown as MediaTrackConstraintSet]
      });
      setTorchOn(newStatus);
    } catch (err) {
      console.warn('Erro ao alternar lanterna:', err);
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCam = cameras[nextIndex];
    setSelectedCameraId(nextCam.id);
    await startScanner(nextCam.id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setCameraError(null);
    setScannedCode(null);
    setMatchedProduct(null);
    setNotFoundCode(null);

    try {
      // Create temporary scanner instance for file
      const tempScanner = new Html5Qrcode('barcode-file-scan-temp', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE
        ],
        verbose: false
      });

      const decodedText = await tempScanner.scanFile(file, true);
      await tempScanner.clear();
      handleBarcodeDetected(decodedText);
    } catch (err) {
      console.error('Falha ao escanear arquivo de imagem:', err);
      setCameraError('Não foi possível identificar um código de barras legível nesta imagem. Tente uma foto mais nítida ou com maior contraste.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeDetected(manualCode.trim());
  };

  const handleClose = () => {
    stopScanner();
    onClose();
    setScannedCode(null);
    setMatchedProduct(null);
    setNotFoundCode(null);
    setManualCode('');
  };

  // Start or stop camera based on modal open state and active tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startScanner();
      }, 200);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-barcode-scanner"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
              <ScanBarcode size={20} />
            </div>
            <div>
              <h2 id="scanner-modal-title" className="text-base font-bold text-neutral-900 leading-tight">
                Leitor de Código de Barras
              </h2>
              <p className="text-xs text-neutral-500">
                Aponte a câmera para o código EAN / UPC do produto
              </p>
            </div>
          </div>
          <button
            id="btn-close-scanner-modal"
            type="button"
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Fechar leitor de código de barras"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-neutral-200 px-4 bg-white">
          <button
            id="tab-scanner-camera"
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Camera size={15} />
            <span>Câmera ao Vivo</span>
          </button>

          <button
            id="tab-scanner-upload"
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Upload size={15} />
            <span>Foto / Arquivo</span>
          </button>

          <button
            id="tab-scanner-manual"
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Barcode size={15} />
            <span>Digitar EAN</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* TAB 1: CAMERA SCANNER */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {/* Camera Stream Viewport */}
              <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-neutral-900 rounded-xl overflow-hidden shadow-inner border border-neutral-800 flex items-center justify-center">
                {/* HTML5Qrcode Video Container */}
                <div
                  id={scannerContainerId}
                  className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
                />

                {/* Reticle / Aiming Box Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="relative w-64 h-36 border-2 border-teal-400/70 rounded-lg shadow-2xl bg-teal-500/5">
                      {/* Corner Accents */}
                      <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-4 border-l-4 border-teal-400 rounded-tl-sm" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-4 border-r-4 border-teal-400 rounded-tr-sm" />
                      <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-4 border-l-4 border-teal-400 rounded-bl-sm" />
                      <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-4 border-r-4 border-teal-400 rounded-br-sm" />

                      {/* Animated Laser Scanning Line */}
                      <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_12px_#2dd4bf] animate-[bounce_2s_infinite]" />

                      <div className="absolute -bottom-7 inset-x-0 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-900/80 text-teal-300 backdrop-blur-xs shadow-xs">
                          Alinhe o código de barras nesta área
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Camera Controls (Torch & Switch) */}
                {isScanning && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    {hasTorch && (
                      <button
                        id="btn-toggle-torch"
                        type="button"
                        onClick={toggleTorch}
                        className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md ${
                          torchOn
                            ? 'bg-amber-400 text-neutral-900'
                            : 'bg-neutral-900/70 text-white hover:bg-neutral-900/90'
                        }`}
                        title={torchOn ? 'Desligar lanterna' : 'Ligar lanterna'}
                      >
                        {torchOn ? <FlashlightOff size={18} /> : <Flashlight size={18} />}
                      </button>
                    )}

                    {cameras.length > 1 && (
                      <button
                        id="btn-switch-camera"
                        type="button"
                        onClick={switchCamera}
                        className="p-2 rounded-full bg-neutral-900/70 text-white hover:bg-neutral-900/90 backdrop-blur-md transition-all cursor-pointer shadow-md"
                        title="Alternar câmera frontal / traseira"
                      >
                        <SwitchCamera size={18} />
                      </button>
                    )}
                  </div>
                )}

                {/* Fallback state when camera fails or is loading */}
                {!isScanning && !cameraError && (
                  <div className="text-center p-6 space-y-2 text-neutral-400">
                    <div className="w-10 h-10 mx-auto rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-medium">Iniciando câmera do dispositivo...</p>
                  </div>
                )}

                {/* Camera Permission or Hardware Error */}
                {cameraError && (
                  <div className="absolute inset-0 bg-neutral-900/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <AlertCircle className="text-rose-400" size={36} />
                    <p className="text-xs sm:text-sm text-neutral-200 font-medium max-w-xs">
                      {cameraError}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => startScanner()}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Tentar Novamente
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Digitar Código Manual
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-teal-500 animate-pulse' : 'bg-amber-400'}`} />
                  {isScanning ? 'Scanner ativo em tempo real' : 'Aguardando câmera...'}
                </span>
                <span>Suporta EAN-13, EAN-8, UPC</span>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 hover:border-teal-500 rounded-2xl p-8 text-center bg-neutral-50/60 hover:bg-teal-50/30 transition-all cursor-pointer flex flex-col items-center justify-center group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                  {isProcessingFile ? (
                    <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload size={26} />
                  )}
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">
                  Selecione uma foto da embalagem ou código de barras
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm">
                  Formatos suportados: PNG, JPG, WEBP. Você pode tirar uma foto agora ou escolher da sua galeria.
                </p>
                <span className="mt-4 px-4 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 shadow-2xs group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-colors">
                  {isProcessingFile ? 'Lendo código...' : 'Escolher Arquivo'}
                </span>
              </div>

              {/* Hidden container for temp file barcode scanner */}
              <div id="barcode-file-scan-temp" className="hidden" />

              {cameraError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANUAL INPUT */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="input-manual-ean" className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Número do Código de Barras (EAN-13 ou UPC)
                </label>
                <div className="relative">
                  <input
                    id="input-manual-ean"
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ex: 7898501230014"
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-mono border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                    autoFocus
                  />
                  <Barcode className="absolute left-3 top-3 text-neutral-400" size={18} />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Digite os 8, 12 ou 13 dígitos impressos abaixo das barras da embalagem.
                </p>
              </div>

              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs"
              >
                <Search size={16} />
                <span>Buscar Produto no Catálogo</span>
              </button>
            </form>
          )}

          {/* SCANNED RESULT FEEDBACK: FOUND */}
          {matchedProduct && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl animate-in zoom-in-95 duration-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>Código {scannedCode} Identificado!</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-200/70 text-teal-900">
                  Encontrado
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
                <img
                  src={matchedProduct.images[0]}
                  alt={matchedProduct.title}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover rounded-lg border border-neutral-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                    {matchedProduct.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-extrabold text-teal-700">
                      R$ {matchedProduct.price.toFixed(2).replace('.', ',')}
                    </span>
                    {matchedProduct.originalPrice && (
                      <span className="text-[11px] text-neutral-400 line-through">
                        R$ {matchedProduct.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onProductFound(matchedProduct);
                    handleClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Ver Produto
                </button>
              </div>
            </div>
          )}

          {/* SCANNED RESULT FEEDBACK: NOT FOUND */}
          {notFoundCode && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-in fade-in duration-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900">
                    Código {notFoundCode} lido com sucesso!
                  </h4>
                  <p className="text-xs text-amber-800">
                    Nenhum produto com este código EAN exato foi cadastrado no catálogo ainda.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onManualSearch(notFoundCode);
                    handleClose();
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Search size={13} />
                  <span>Pesquisar Código no Catálogo</span>
                </button>
              </div>
            </div>
          )}

          {/* QUICK DEMO PRESETS (Allows 1-click testing of real catalog barcodes) */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} className="text-teal-600" />
                <span>Testar Códigos EAN do Catálogo</span>
              </span>
              <span className="text-[10px] text-neutral-400">Clique para simular</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {products
                .filter((p) => p.ean)
                .slice(0, 4)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setManualCode(p.ean || '');
                      handleBarcodeDetected(p.ean || '');
                    }}
                    className="text-left p-2 rounded-xl border border-neutral-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all cursor-pointer flex items-center gap-2 group"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-md object-cover border border-neutral-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-neutral-800 truncate group-hover:text-teal-700">
                        {p.title}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-400">
                        EAN: {p.ean}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/80 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Barcode size={14} className="text-neutral-400" />
            <span>Padrão GS1 Brasil (EAN-13 / UPC-A)</span>
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
