import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  Send,
  HelpCircle,
  Loader2
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  isPriceDropNotificationEnabled,
  setPriceDropNotificationPreference,
  requestPriceDropNotificationPermission,
  sendTestPriceDropNotification,
  NotificationStatus
} from '../../services/notificationService';
import { Product } from '../../types';

interface ProfileNotificationCardProps {
  wishlistCount?: number;
  sampleWishlistProduct?: Product;
  compact?: boolean;
}

export const ProfileNotificationCard: React.FC<ProfileNotificationCardProps> = ({
  wishlistCount = 0,
  sampleWishlistProduct,
  compact = false
}) => {
  const [permission, setPermission] = useState<NotificationStatus>('default');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Sync state on mount and when window regains focus
  useEffect(() => {
    const updateStatus = () => {
      setPermission(getNotificationPermission());
      setIsEnabled(isPriceDropNotificationEnabled());
    };

    updateStatus();
    window.addEventListener('focus', updateStatus);
    return () => window.removeEventListener('focus', updateStatus);
  }, []);

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);

    try {
      if (isEnabled) {
        // Turning off preference
        setPriceDropNotificationPreference(false);
        setIsEnabled(false);
        setFeedbackMessage({
          text: 'Alertas de preço desativados para esta sessão.',
          type: 'info'
        });
      } else {
        // Requesting permission and enabling
        const result = await requestPriceDropNotificationPermission();
        setPermission(result.permission);
        setIsEnabled(isPriceDropNotificationEnabled());

        setFeedbackMessage({
          text: result.message,
          type: result.success ? 'success' : 'error'
        });
      }
    } catch {
      setFeedbackMessage({
        text: 'Erro ao processar ativação de notificações.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!isEnabled) {
      setFeedbackMessage({
        text: 'Ative as notificações primeiro para realizar o teste.',
        type: 'info'
      });
      return;
    }

    setIsLoading(true);
    try {
      const sent = await sendTestPriceDropNotification(sampleWishlistProduct);
      if (sent) {
        setFeedbackMessage({
          text: 'Alerta de teste enviado pelo Service Worker! Verifique a barra de notificações do seu sistema.',
          type: 'success'
        });
      } else {
        setFeedbackMessage({
          text: 'Não foi possível disparar o alerta. Verifique se as notificações do navegador não estão bloqueadas no sistema operacional.',
          type: 'error'
        });
      }
    } catch {
      setFeedbackMessage({
        text: 'Erro ao emitir alerta de teste.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const supported = isNotificationSupported();

  if (!supported) {
    return (
      <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-600">
        <p className="font-semibold text-neutral-800 flex items-center gap-1.5">
          <AlertCircle size={15} className="text-amber-500" />
          Notificações não suportadas
        </p>
        <p className="mt-1 text-neutral-500">
          Seu navegador não possui suporte a notificações por Service Worker.
        </p>
      </div>
    );
  }

  // Compact layout (for dropdown menus)
  if (compact) {
    return (
      <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isEnabled ? 'bg-teal-600 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
              {isEnabled ? <BellRing size={16} /> : <Bell size={16} />}
            </div>
            <div>
              <p className="text-xs font-bold text-teal-950 leading-tight">
                Alertas de Queda de Preço
              </p>
              <p className="text-[11px] text-teal-800">
                {isEnabled
                  ? 'Monitorando sua lista de desejos'
                  : 'Receba alertas pelo Service Worker'}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              isEnabled
                ? 'bg-teal-200/80 text-teal-900'
                : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            {isEnabled ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <button
          id="btn-activate-price-drop-notifications-compact"
          type="button"
          disabled={isLoading}
          onClick={handleToggleNotifications}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
            isEnabled
              ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              : 'bg-teal-700 hover:bg-teal-800 text-white'
          }`}
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isEnabled ? (
            <>
              <CheckCircle2 size={14} className="text-teal-600" />
              <span>Notificações Ativadas (Desativar)</span>
            </>
          ) : (
            <>
              <Bell size={14} />
              <span>Ativar Notificações</span>
            </>
          )}
        </button>

        {isEnabled && (
          <button
            type="button"
            onClick={handleSendTestNotification}
            disabled={isLoading}
            className="w-full text-center text-[11px] text-teal-700 hover:text-teal-900 font-semibold py-0.5 cursor-pointer flex items-center justify-center gap-1"
          >
            <Send size={12} />
            <span>Enviar alerta de teste agora</span>
          </button>
        )}

        {feedbackMessage && (
          <p
            className={`text-[11px] font-medium leading-tight rounded-lg p-1.5 ${
              feedbackMessage.type === 'success'
                ? 'bg-teal-100/80 text-teal-900'
                : feedbackMessage.type === 'error'
                ? 'bg-rose-100 text-rose-900'
                : 'bg-neutral-100 text-neutral-800'
            }`}
          >
            {feedbackMessage.text}
          </p>
        )}
      </div>
    );
  }

  // Full layout (for Profile modal or Wishlist View)
  return (
    <div className="bg-gradient-to-br from-teal-50/80 to-neutral-50 rounded-3xl p-5 sm:p-6 border border-teal-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isEnabled
                ? 'bg-teal-700 text-white'
                : 'bg-white border border-teal-200 text-teal-700'
            }`}
          >
            {isEnabled ? <BellRing size={24} className="animate-pulse" /> : <Bell size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900">
                Notificações de Queda de Preço
              </h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isEnabled
                    ? 'bg-teal-100 text-teal-800 border border-teal-200'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {isEnabled ? 'Ativado ✅' : 'Desativado'}
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-1 max-w-xl leading-relaxed">
              Utiliza o <strong>Service Worker registrado</strong> do Comércio Popular para enviar notificações automáticas no seu computador ou celular sempre que um produto da sua <strong>lista de desejos</strong> entrar em oferta ou atingir seu preço ideal.
            </p>
          </div>
        </div>
      </div>

      {/* Wishlist tracking badge */}
      {wishlistCount > 0 && (
        <div className="bg-white/80 border border-teal-100 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-neutral-700">
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-teal-600" />
            <span>
              <strong>{wishlistCount} produto(s)</strong> monitorados na sua lista de desejos.
            </span>
          </span>
          <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">
            Checagem automática de preço
          </span>
        </div>
      )}

      {/* Permission Blocked notice if applicable */}
      {permission === 'denied' && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Notificações bloqueadas nas permissões do navegador</p>
            <p className="mt-0.5 text-rose-700">
              Para receber alertas de queda de preço, clique no ícone de cadeado/ajustes ao lado da barra de endereço do navegador e mude as <strong>Notificações</strong> para <em>Permitir</em>.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          id="btn-activate-price-drop-notifications"
          type="button"
          disabled={isLoading}
          onClick={handleToggleNotifications}
          className={`py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
            isEnabled
              ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
              : 'bg-teal-700 hover:bg-teal-800 text-white'
          }`}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isEnabled ? (
            <>
              <CheckCircle2 size={16} className="text-teal-600" />
              <span>Notificações Ativas (Clique para Desativar)</span>
            </>
          ) : (
            <>
              <Bell size={16} />
              <span>Ativar Notificações</span>
            </>
          )}
        </button>

        {isEnabled && (
          <button
            id="btn-test-price-drop-notification"
            type="button"
            disabled={isLoading}
            onClick={handleSendTestNotification}
            className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Send size={15} className="text-teal-600" />
            <span>Testar Alerta de Queda de Preço</span>
          </button>
        )}
      </div>

      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-teal-100/90 text-teal-950 border border-teal-200'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-100 text-rose-950 border border-rose-200'
              : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-teal-700 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-700 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}
    </div>
  );
};
