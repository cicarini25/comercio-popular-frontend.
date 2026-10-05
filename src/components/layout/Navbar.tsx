import { useLocation, useNavigate } from 'react-router-dom';
import { CategoryPicker, CategoryIcon } from '../common/CategoryPicker';
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  ShieldCheck,
  Store,
  Flame,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Mic,
  MicOff,
  AlertCircle,
  Bell,
  BellRing,
  Trash2,
  ScanBarcode
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { PlatformLogo, PLATFORM_LINKS, PlatformId } from '../common/PlatformLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { User, CartItem, PriceAlert } from '../../types';
import { CATEGORIES } from '../../data/mockProducts';
import { formatCurrency } from '../../utils/formatters';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { VoiceSearchModal } from './VoiceSearchModal';
import { ProfileNotificationCard } from '../profile/ProfileNotificationCard';
import { UserProfileModal } from '../profile/UserProfileModal';
import { Product } from '../../types';

interface NavbarProps {
  user: User | null;
  cartItems: CartItem[];
  favoritesCount: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenSellerDashboard: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onLogout: () => void;
  priceAlerts?: PriceAlert[];
  onOpenProductDetail?: (productId: string) => void;
  onRemovePriceAlert?: (productId: string) => void;
  onSimulatePriceDrop?: (productId: string) => void;
  onOpenBarcodeScanner?: () => void;
  favorites?: Product[];
  ordersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  cartItems,
  favoritesCount,
  activeTab,
  onSelectTab,
  onOpenAuth,
  onOpenCart,
  onOpenSellerDashboard,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onLogout,
  priceAlerts = [],
  onOpenProductDetail,
  onRemovePriceAlert,
  onSimulatePriceDrop,
  onOpenBarcodeScanner,
  favorites = [],
  ordersCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileModalOpen = location.pathname === '/conta';
  const setProfileModalOpen = (open: boolean) => navigate(open ? '/conta' : '/');
  const [alertsMenuOpen, setAlertsMenuOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const alertsMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsMenuRef.current && !alertsMenuRef.current.contains(event.target as Node)) {
        setAlertsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggeredAlertsCount = priceAlerts.filter((a) => a.isTriggered).length;

  // Speech Recognition for Voice Search with Web Speech API & Accessibility
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript: speechTranscript,
    error: speechError,
    startListening,
    stopListening,
    toggleListening,
    clearError: clearSpeechError
  } = useSpeechRecognition({
    lang: 'pt-BR',
    enableAudioCues: true,
    onResult: (transcript) => {
      onSearchChange(transcript);
    }
  });

  const handleOpenVoiceSearch = () => {
    setVoiceModalOpen(true);
    startListening();
  };

  const handleConfirmVoiceSearch = (term: string) => {
    onSearchChange(term);
    setVoiceModalOpen(false);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 shadow-xs">
      {/* Top micro-announcement banner */}
      <div className="bg-teal-950 text-teal-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1 bg-coral-600 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
              <Flame size={12} /> Achadinhos
            </span>
            <span>Ofertas de afiliados: confira as condições e o preço final na loja.</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-neutral-300 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-teal-400" />
              Crie sua conta no Comércio Popular
            </span>
            <button
              id="btn-seller-link-header"
              onClick={() => {
                onOpenSellerDashboard();
              }}
              className="text-teal-300 hover:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Store size={13} />
              {user?.isSeller ? 'Meu Painel de Vendedor' : 'Venda Conosco'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 lg:gap-3 2xl:gap-6">
          {/* Logo */}
          <Logo
            onClick={() => {
              onSelectTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Desktop Search Bar with Category Dropdown & Voice Search */}
          <div className="hidden lg:flex min-w-0 flex-1 max-w-2xl items-center">
            <div className="relative w-full">
              <div
                className={`relative w-full min-w-0 flex items-center bg-neutral-100 border rounded-xl transition-all ${
                  isListening
                    ? 'border-coral-500 ring-2 ring-coral-200 bg-coral-50/20'
                    : 'border-neutral-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100'
                }`}
              >
                <CategoryPicker value={selectedCategory} onChange={onSelectCategory}/>

                <input
                  id="search-input-header"
                  type="text"
                  placeholder={
                    isListening
                      ? '🎙️ Ouvindo... Fale o produto agora...'
                      : 'Buscar achadinhos, produtos locais, eletrônicos, casa...'
                  }
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 outline-none"
                />

                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="p-1 text-neutral-400 hover:text-neutral-600 mr-1 cursor-pointer"
                    title="Limpar busca"
                  >
                    <X size={15} />
                  </button>
                )}

                {/* Voice Search Microphone Button (Desktop) */}
                <button
                  type="button"
                  id="btn-voice-search-desktop"
                  onClick={handleOpenVoiceSearch}
                  title={
                    isListening
                      ? 'Reconhecimento de voz ativo — clique para gerenciar'
                      : isSpeechSupported
                      ? 'Buscar por comando de voz (Web Speech API)'
                      : 'Reconhecimento de voz não suportado neste navegador'
                  }
                  aria-label="Buscar produtos por comando de voz"
                  aria-haspopup="dialog"
                  aria-expanded={voiceModalOpen}
                  className={`shrink-0 p-2 mr-1 rounded-lg transition-all cursor-pointer flex items-center justify-center relative ${
                    isListening
                      ? 'bg-coral-600 text-white shadow-md ring-2 ring-coral-300 animate-pulse'
                      : 'text-neutral-500 hover:text-teal-700 hover:bg-neutral-200/70'
                  }`}
                >
                  {isListening ? (
                    <MicOff size={16} className="text-white" />
                  ) : (
                    <Mic size={16} />
                  )}
                  {isListening && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coral-500"></span>
                    </span>
                  )}
                </button>

                {/* Barcode Scanner Camera Button (Desktop Search) */}
                {onOpenBarcodeScanner && (
                  <button
                    type="button"
                    id="btn-barcode-scanner-desktop"
                    onClick={onOpenBarcodeScanner}
                    title="Escanear código de barras EAN/UPC pela câmera"
                    aria-label="Escanear código de barras pela câmera"
                    className="shrink-0 p-2 mr-1 rounded-lg text-neutral-500 hover:text-teal-700 hover:bg-neutral-200/70 transition-all cursor-pointer flex items-center justify-center relative"
                  >
                    <ScanBarcode size={18} />
                  </button>
                )}

                <button
                  id="btn-search-submit"
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('search-input-header') as HTMLInputElement | null;
                    if (input) input.blur();
                  }}
                  aria-label="Pesquisar produtos"
                  className="shrink-0 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 mr-1 rounded-lg text-sm font-medium transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* Real-time Voice Recognition Active Banner */}
              {isListening && (
                <div
                  id="voice-listening-popover"
                  className="absolute top-full left-0 right-0 mt-2 p-3 bg-neutral-900 text-white rounded-2xl shadow-2xl flex items-center justify-between text-xs z-50 border border-neutral-700 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="flex items-center gap-0.5 shrink-0 px-2 py-1 bg-coral-500/20 text-coral-400 rounded-lg border border-coral-500/30">
                      <span className="w-1.5 h-3 bg-coral-500 rounded-full animate-pulse"></span>
                      <span className="w-1.5 h-4 bg-coral-400 rounded-full animate-pulse delay-75"></span>
                      <span className="w-1.5 h-2.5 bg-coral-500 rounded-full animate-pulse delay-150"></span>
                    </div>
                    <div>
                      <span className="font-bold text-coral-300 block text-[11px]">
                        Ouvindo por comando de voz (pt-BR)...
                      </span>
                      <p className="text-neutral-300 truncate text-xs max-w-sm">
                        {searchQuery
                          ? `Pesquisando: "${searchQuery}"`
                          : 'Diga algo como "panela", "café", "fone" ou "mochila"'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className="px-3 py-1.5 bg-coral-600 hover:bg-coral-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    Concluir
                  </button>
                </div>
              )}

              {/* Speech Error Banner */}
              {speechError && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl shadow-lg text-xs flex items-center justify-between z-50 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    <span>{speechError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearSpeechError}
                    className="p-1 hover:bg-rose-100 rounded-lg text-rose-600 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-1 sm:gap-2 2xl:gap-3">
            {/* Seller Quick Action Button */}
            <button
              id="btn-nav-seller"
              onClick={() => {
                onOpenSellerDashboard();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 cursor-pointer"
            >
              <Store size={15} className="text-teal-600" />
              <span>{user?.isSeller ? 'Painel Lojista' : 'Área do Vendedor'}</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton variant="nav" />

            {/* User Account Button */}
            {user ? (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-neutral-800 leading-tight flex items-center gap-1">
                      {user.name.split(' ')[0]}

                    </span>
                    <span className="text-[10px] text-neutral-500">Conectado</span>
                  </div>
                  <ChevronDown size={14} className="text-neutral-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-neutral-200 py-3 z-50 text-sm space-y-2">
                    <div className="px-4 pb-2 border-b border-neutral-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-neutral-900">{user.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <button
                          id="btn-open-full-profile"
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            setProfileModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Perfil
                        </button>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full mt-1.5">
                        Conectado
                      </span>
                    </div>

                    {/* Service Worker Price Drop Notification Card in Profile */}
                    <div className="px-3">
                      <ProfileNotificationCard
                        compact
                        wishlistCount={favoritesCount}
                        sampleWishlistProduct={favorites?.[0]}
                      />
                    </div>

                    <div className="pt-1 border-t border-neutral-100 space-y-0.5">
                      {user.isSeller && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenSellerDashboard();
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-teal-50 text-teal-800 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Store size={15} /> Painel do Vendedor Parceiro
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSelectTab('favoritos');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-neutral-700 hover:text-rose-700 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Heart size={15} className={favoritesCount > 0 ? "text-rose-600 fill-rose-500" : "text-rose-500"} />
                          <span>Meus Favoritos</span>
                        </div>
                        {favoritesCount > 0 && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            {favoritesCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSelectTab('pedidos');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-neutral-700 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        Meus Pedidos & Rastreamento
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-medium border-t border-neutral-100 cursor-pointer transition-colors"
                      >
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-login-header"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200 cursor-pointer"
              >
                <UserIcon size={16} className="text-teal-700" />
                <span className="hidden sm:inline">Entrar / Cadastrar</span>
                <span className="sm:hidden">Entrar</span>
              </button>
            )}

            {/* Price Alerts Radar button & Dropdown */}
            <div className="relative hidden sm:block" ref={alertsMenuRef}>
              <button
                id="btn-nav-price-alerts"
                type="button"
                onClick={() => setAlertsMenuOpen(!alertsMenuOpen)}
                aria-label="Alertas e Radar de Preços"
                title={
                  triggeredAlertsCount > 0
                    ? `Atenção: ${triggeredAlertsCount} produto(s) atingiram sua meta de preço!`
                    : `Radar de Preços (${priceAlerts.length} monitorados)`
                }
                className={`relative hidden sm:flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  triggeredAlertsCount > 0
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm animate-pulse ring-2 ring-rose-200'
                    : priceAlerts.length > 0
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-2xs'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {triggeredAlertsCount > 0 ? (
                  <BellRing size={16} className="text-rose-600 fill-rose-500" />
                ) : (
                  <Bell
                    size={16}
                    className={priceAlerts.length > 0 ? 'text-amber-600 fill-amber-100' : 'text-neutral-500'}
                  />
                )}
                <span className="hidden md:inline">
                  {triggeredAlertsCount > 0 ? 'Alerta!' : 'Radar'}
                </span>
                {priceAlerts.length > 0 && (
                  <span
                    id="badge-nav-price-alerts-count"
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      triggeredAlertsCount > 0
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {triggeredAlertsCount > 0 ? `${triggeredAlertsCount} caiu!` : priceAlerts.length}
                  </span>
                )}
              </button>

              {/* Price Alerts Dropdown Popover */}
              {alertsMenuOpen && (
                <div
                  id="dropdown-price-alerts"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-3 px-4 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <BellRing size={15} />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">
                          Radar de Preços & Alertas
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          {priceAlerts.length === 0
                            ? 'Nenhum produto monitorado'
                            : `${priceAlerts.length} produto(s) no radar`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAlertsMenuOpen(false)}
                      className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Triggered banner alert */}
                  {triggeredAlertsCount > 0 && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
                      <span className="text-base">🔥</span>
                      <span>
                        {triggeredAlertsCount} produto(s) caíram para o valor desejado ou menos!
                      </span>
                    </div>
                  )}

                  {/* Alerts List */}
                  <div className="mt-2.5 max-h-72 overflow-y-auto divide-y divide-neutral-100 space-y-2 pr-0.5">
                    {priceAlerts.length === 0 ? (
                      <div className="text-center py-6 px-4">
                        <Bell size={28} className="mx-auto text-neutral-300 mb-2" />
                        <p className="text-xs font-bold text-neutral-700">
                          Você ainda não tem alertas configurados
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                          Abra qualquer produto do catálogo e clique no botão{' '}
                          <strong className="text-teal-800">'Monitorar Preço'</strong> para ser
                          avisado aqui no Navbar assim que o valor cair!
                        </p>
                      </div>
                    ) : (
                      priceAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`pt-2 pb-1.5 flex items-start gap-2.5 rounded-xl p-2 transition-colors ${
                            alert.isTriggered
                              ? 'bg-emerald-50/70 border border-emerald-200'
                              : 'hover:bg-neutral-50'
                          }`}
                        >
                          <img
                            src={alert.productImage}
                            alt={alert.productTitle}
                            className="w-12 h-12 object-cover rounded-lg shrink-0 border border-neutral-200 cursor-pointer"
                            onClick={() => {
                              setAlertsMenuOpen(false);
                              if (onOpenProductDetail) onOpenProductDetail(alert.productId);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              onClick={() => {
                                setAlertsMenuOpen(false);
                                if (onOpenProductDetail) onOpenProductDetail(alert.productId);
                              }}
                              className="text-xs font-bold text-neutral-900 line-clamp-1 hover:text-teal-700 cursor-pointer"
                              title={alert.productTitle}
                            >
                              {alert.productTitle}
                            </p>

                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="text-xs font-extrabold text-neutral-900">
                                Atual: {formatCurrency(alert.currentPrice)}
                              </span>
                              <span className="text-[11px] text-neutral-500">
                                Meta: <strong>{formatCurrency(alert.targetPrice)}</strong>
                              </span>
                            </div>

                            {alert.isTriggered ? (
                              <div className="mt-1 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  🎯 Meta Atingida!
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAlertsMenuOpen(false);
                                    if (onOpenProductDetail) onOpenProductDetail(alert.productId);
                                  }}
                                  className="text-[10px] font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                                >
                                  Ver Oferta
                                </button>
                              </div>
                            ) : (
                              <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-500">
                                <span>Aguardando queda...</span>
                                {onSimulatePriceDrop && (
                                  <button
                                    type="button"
                                    onClick={() => onSimulatePriceDrop(alert.productId)}
                                    title="Simular queda para testar alerta agora"
                                    className="text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-1.5 py-0.5 rounded border border-teal-200 cursor-pointer"
                                  >
                                    ⚡ Simular Queda
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Remove alert button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onRemovePriceAlert) onRemovePriceAlert(alert.productId);
                            }}
                            className="text-neutral-300 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                            title="Remover alerta"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {priceAlerts.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                      <span>Alerta visual em tempo real</span>
                      <span className="text-teal-700 font-medium">Radar Comércio Popular</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist / Favoritos Header Quick Button */}
            <button
              id="btn-nav-wishlist"
              type="button"
              onClick={() => onSelectTab('favoritos')}
              aria-label={`Ver Favoritos (${favoritesCount} itens)`}
              title={`Lista de Favoritos (${favoritesCount} itens salvos)`}
              className={`relative hidden sm:flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'favoritos'
                  ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs ring-2 ring-rose-200'
                  : favoritesCount > 0
                  ? 'bg-rose-50/70 border-rose-200 text-rose-700 hover:bg-rose-100 shadow-2xs'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Heart
                size={16}
                className={
                  activeTab === 'favoritos' || favoritesCount > 0
                    ? 'text-rose-600 fill-rose-500'
                    : 'text-neutral-500'
                }
              />
              <span className="hidden md:inline">Favoritos</span>
              {favoritesCount > 0 && (
                <span
                  id="badge-nav-favorites-count"
                  className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs"
                >
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Barcode Scanner Camera Button (Header Quick Action) */}
            {onOpenBarcodeScanner && (
              <button
                id="btn-nav-barcode-scanner"
                type="button"
                onClick={onOpenBarcodeScanner}
                aria-label="Escanear código de barras EAN/UPC"
                title="Escanear código de barras pela câmera do dispositivo"
                className="relative hidden sm:flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border border-neutral-200 bg-white hover:bg-teal-50 hover:border-teal-300 text-neutral-700 hover:text-teal-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <ScanBarcode size={16} className="text-teal-700" />
                <span className="hidden xl:inline">Ler Código</span>
              </button>
            )}

            {/* Cart Drawer Trigger */}
            <button
              id="btn-cart-header"
              onClick={onOpenCart}
              aria-label="Abrir sacola de compras"
              className="relative flex shrink-0 items-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
            >
              <ShoppingCart size={18} />
              <span className="hidden md:inline">Sacola</span>
              {cartCount > 0 && (
                <span className="bg-coral-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              {cartSubtotal > 0 && (
                <span className="hidden lg:inline text-teal-100 text-xs border-l border-teal-600 pl-2">
                  {formatCurrency(cartSubtotal)}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              aria-label="Abrir menu de navegação"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-xl"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar with Voice Search */}
        <div className="mt-2.5 lg:hidden relative">
          <div
            className={`relative flex items-center bg-neutral-100 border rounded-xl transition-all ${
              isListening
                ? 'border-coral-500 ring-2 ring-coral-200 bg-coral-50/20'
                : 'border-neutral-200'
            }`}
          >
            <Search size={16} className="text-neutral-400 ml-3 shrink-0" />
            <input
              id="mobile-search-input"
              type="text"
              placeholder={
                isListening
                  ? '🎙️ Ouvindo... Fale agora...'
                  : 'Buscar achadinhos, produtos...'
              }
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 mr-1 text-neutral-400 cursor-pointer"
                title="Limpar busca"
              >
                <X size={15} />
              </button>
            )}

            {/* Mobile Voice Search Mic Button */}
            <button
              type="button"
              id="btn-voice-search-mobile"
              onClick={handleOpenVoiceSearch}
              title={
                isListening
                  ? 'Reconhecimento de voz ativo — clique para gerenciar'
                  : isSpeechSupported
                  ? 'Buscar por comando de voz (Web Speech API)'
                  : 'Reconhecimento de voz não suportado'
              }
              aria-label="Buscar produtos por comando de voz"
              aria-haspopup="dialog"
              aria-expanded={voiceModalOpen}
              className={`p-2 mr-1 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-coral-600 text-white shadow-sm ring-2 ring-coral-300 animate-pulse'
                  : 'text-neutral-500 hover:text-teal-700'
              }`}
            >
              {isListening ? (
                <MicOff size={16} className="text-white" />
              ) : (
                <Mic size={16} />
              )}
            </button>

            {/* Mobile Barcode Scanner Camera Button */}
            {onOpenBarcodeScanner && (
              <button
                type="button"
                id="btn-barcode-scanner-mobile"
                onClick={onOpenBarcodeScanner}
                title="Escanear código de barras EAN/UPC pela câmera"
                aria-label="Escanear código de barras pela câmera"
                className="p-2 mr-1 rounded-lg text-neutral-500 hover:text-teal-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <ScanBarcode size={16} />
              </button>
            )}
          </div>

          {/* Mobile Listening Notice */}
          {isListening && (
            <div className="mt-1.5 p-2 bg-neutral-900 text-white rounded-xl shadow-lg flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500"></span>
                </span>
                <span className="text-coral-300 font-bold text-[11px]">Ouvindo:</span>
                <span className="text-neutral-200 truncate text-[11px] max-w-[180px]">
                  {searchQuery || 'Fale o produto...'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="px-2 py-0.5 bg-coral-600 text-white rounded-lg text-[10px] font-bold"
              >
                Pronto
              </button>
            </div>
          )}

          {/* Mobile Speech Error Notice */}
          {speechError && (
            <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
              <span className="text-[11px] leading-tight">{speechError}</span>
              <button
                type="button"
                onClick={clearSpeechError}
                className="p-0.5 text-rose-600"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Navigation Ribbon */}
      <nav className="border-t border-neutral-200/70 bg-neutral-50/70 px-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2 py-2 text-xs sm:text-sm whitespace-nowrap font-medium text-neutral-600">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white text-teal-800 font-bold shadow-xs border border-neutral-200'
                  : 'hover:text-teal-700 hover:bg-neutral-100'
              }`}
            >
              Início
            </button>

            <button
              id="tab-achadinhos"
              onClick={() => onSelectTab('achadinhos')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'achadinhos'
                  ? 'bg-coral-600 text-white font-bold shadow-xs'
                  : 'text-coral-800 hover:bg-coral-50'
              }`}
            >
              <Flame size={14} className={activeTab === 'achadinhos' ? 'text-white' : 'text-coral-600'} />
              <span>Achadinhos do Dia</span>
              <span className="bg-coral-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                Hot
              </span>
            </button>

            <button
              id="tab-vendedores"
              onClick={() => onSelectTab('vendedores')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'vendedores'
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'hover:text-teal-800 hover:bg-neutral-100'
              }`}
            >
              <Store size={14} />
              <span>Comerciantes Parceiros</span>
            </button>

            <button
              id="tab-favoritos"
              onClick={() => onSelectTab('favoritos')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'favoritos'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <Heart
                size={14}
                className={
                  activeTab === 'favoritos'
                    ? 'text-white fill-white'
                    : favoritesCount > 0
                    ? 'text-rose-600 fill-rose-500'
                    : 'text-rose-600'
                }
              />
              <span>Favoritos</span>
              {favoritesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === 'favoritos' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('pedidos')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'bg-white text-teal-800 font-bold shadow-xs border border-neutral-200'
                  : 'hover:text-teal-700 hover:bg-neutral-100'
              }`}
            >
              Meus Pedidos
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5 bg-teal-50 px-2 py-1 rounded-xl" aria-label="Acessar plataformas parceiras">
              {(['shopee', 'mercadolivre', 'amazon', 'aliexpress', 'shein', 'magalu'] as PlatformId[]).map((platform) => (
                <a
                  key={platform}
                  href={PLATFORM_LINKS[platform]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  aria-label={`Abrir ${platform} em nova aba`}
                >
                  <PlatformLogo platform={platform} className="hover:border-teal-400 hover:shadow-md" />
                </a>
              ))}
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3">
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectTab('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-neutral-100 font-medium text-sm text-neutral-800"
            >
              Início
            </button>
            <button
              onClick={() => {
                onSelectTab('achadinhos');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg bg-coral-50 text-coral-800 font-semibold text-sm flex items-center gap-2"
            >
              <Flame size={16} className="text-coral-600" /> Achadinhos do Dia (Ofertas Relâmpago)
            </button>
            <button
              onClick={() => {
                onSelectTab('vendedores');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-neutral-100 font-medium text-sm text-neutral-800 flex items-center gap-2"
            >
              <Store size={16} /> Comerciantes Parceiros & Assinatura de Lojista
            </button>
            <button
              onClick={() => {
                onSelectTab('favoritos');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-between cursor-pointer ${
                activeTab === 'favoritos'
                  ? 'bg-rose-50 text-rose-800 font-bold'
                  : 'hover:bg-neutral-100 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart
                  size={16}
                  className={favoritesCount > 0 ? 'text-rose-600 fill-rose-500' : 'text-neutral-500'}
                />
                <span>Favoritos & Lista de Desejos</span>
              </div>
              {favoritesCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {favoritesCount}
                </span>
              )}
            </button>

            {onOpenBarcodeScanner && (
              <button
                id="btn-drawer-barcode-scanner"
                onClick={() => {
                  onOpenBarcodeScanner();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-teal-50 text-neutral-800 hover:text-teal-900 cursor-pointer"
              >
                <ScanBarcode size={16} className="text-teal-700" />
                <span>Escanear Código de Barras (Câmera)</span>
              </button>
            )}

            <button
              onClick={() => {
                onSelectTab('pedidos');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-neutral-100 font-medium text-sm text-neutral-800"
            >
              Meus Pedidos
            </button>

            {/* Mobile User Profile & Service Worker Notifications */}
            {user ? (
              <div className="pt-2 pb-1 space-y-2 border-t border-neutral-100">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-neutral-800">{user.name}</span>
                  </div>
                  <button
                    id="btn-mobile-open-profile"
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg"
                  >
                    Ver Perfil
                  </button>
                </div>
                <ProfileNotificationCard
                  compact
                  wishlistCount={favoritesCount}
                  sampleWishlistProduct={favorites?.[0]}
                />
              </div>
            ) : (
              <div className="pt-2 border-t border-neutral-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <UserIcon size={14} />
                  <span>Entrar ou Criar Conta</span>
                </button>
              </div>
            )}

            {/* Mobile PWA Install */}
            <div className="pt-2">
              <PWAInstallButton variant="nav" />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Categorias
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-xs py-1.5 px-2 rounded-md ${
                    selectedCategory === cat
                      ? 'bg-teal-100 text-teal-800 font-bold'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span className="flex items-center gap-2"><CategoryIcon category={cat}/>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Accessible Web Speech API Voice Search Modal */}
      <VoiceSearchModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        isListening={isListening}
        isSupported={isSpeechSupported}
        transcript={speechTranscript || searchQuery}
        error={speechError}
        onStartListening={startListening}
        onStopListening={stopListening}
        onConfirmSearch={handleConfirmVoiceSearch}
        onClearError={clearSpeechError}
      />

      {/* User Profile & Service Worker Price Drop Notification Modal */}
      {user && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
          favorites={favorites}
          ordersCount={ordersCount}
          onSelectTab={onSelectTab}
          onOpenSellerDashboard={onOpenSellerDashboard}
          onLogout={onLogout}
        />
      )}
    </header>
  );
};
