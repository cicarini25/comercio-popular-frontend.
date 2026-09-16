import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

const STORAGE_KEY = 'cp_price_drop_notif_enabled';

export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  tag?: string;
  data?: any;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission(): NotificationStatus {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationStatus;
}

export function isPriceDropNotificationEnabled(): boolean {
  if (!isNotificationSupported()) return false;
  const permission = Notification.permission === 'granted';
  const savedPref = localStorage.getItem(STORAGE_KEY);
  return permission && (savedPref === null || savedPref === 'true');
}

export function setPriceDropNotificationPreference(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Requests browser notification permission and ensures Service Worker is ready
 */
export async function requestPriceDropNotificationPermission(): Promise<{
  success: boolean;
  permission: NotificationStatus;
  message: string;
}> {
  if (!isNotificationSupported()) {
    return {
      success: false,
      permission: 'unsupported',
      message: 'Seu navegador não suporta notificações de Service Worker.'
    };
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      setPriceDropNotificationPreference(true);

      // Trigger initial confirmation notification via Service Worker
      await sendNotificationViaServiceWorker({
        title: 'Notificações Ativadas! 🔔',
        options: {
          body: 'Você receberá alertas automáticos sempre que um produto da sua lista de desejos baixar de preço.',
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: [200, 100, 200],
          tag: 'welcome-price-drop-alert'
        }
      });

      return {
        success: true,
        permission: 'granted',
        message: 'Notificações de queda de preço ativadas com sucesso!'
      };
    } else if (permission === 'denied') {
      setPriceDropNotificationPreference(false);
      return {
        success: false,
        permission: 'denied',
        message: 'Permissão de notificação negada no navegador. Ative nas permissões do site para receber alertas.'
      };
    } else {
      return {
        success: false,
        permission: 'default',
        message: 'Permissão de notificação não foi concedida.'
      };
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificações:', error);
    return {
      success: false,
      permission: getNotificationPermission(),
      message: 'Não foi possível solicitar permissão para notificações.'
    };
  }
}

/**
 * Helper to dispatch notifications via the active Service Worker registration
 */
export async function sendNotificationViaServiceWorker({
  title,
  options
}: {
  title: string;
  options: ExtendedNotificationOptions;
}): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    if ('serviceWorker' in navigator) {
      // Wait for the registered Service Worker to be active
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options as any);
        return true;
      }
    }

    // Fallback if ServiceWorkerRegistration isn't available
    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn('Erro ao disparar notificação pelo Service Worker:', err);
    try {
      new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Sends a real price-drop alert for a wishlist product via the registered Service Worker
 */
export async function notifyWishlistPriceDrop(
  product: Product,
  oldPrice: number,
  newPrice: number
): Promise<boolean> {
  if (!isPriceDropNotificationEnabled()) return false;

  const savings = oldPrice - newPrice;
  const pct = Math.round((savings / oldPrice) * 100);

  const title = `🔥 Preço Baixou: ${product.title.slice(0, 35)}...`;
  const body = `Queda de ${pct}%! De ${formatCurrency(oldPrice)} por apenas ${formatCurrency(
    newPrice
  )}! Economize ${formatCurrency(savings)} no Comércio Popular.`;

  const image = (product.images && product.images[0]) ? product.images[0] : '/pwa-192x192.png';

  return sendNotificationViaServiceWorker({
    title,
    options: {
      body,
      icon: image,
      badge: '/pwa-192x192.png',
      tag: `price-drop-${product.id}`,
      vibrate: [300, 100, 300, 100, 300],
      data: {
        productId: product.id,
        url: window.location.href
      }
    }
  });
}

/**
 * Sends a test price-drop notification to verify device/browser behavior
 */
export async function sendTestPriceDropNotification(sampleProduct?: Product): Promise<boolean> {
  const title = sampleProduct
    ? sampleProduct.title
    : 'Fritadeira Airfryer Grand Family 5L Inox';
  const image = (sampleProduct?.images && sampleProduct.images[0])
    ? sampleProduct.images[0]
    : '/pwa-192x192.png';
  const oldPrice = sampleProduct?.originalPrice || (sampleProduct?.price ? sampleProduct.price * 1.35 : 389.9);
  const newPrice = sampleProduct?.price || 249.9;
  const savings = Math.max(10, oldPrice - newPrice);
  const pct = Math.round((savings / oldPrice) * 100);

  return sendNotificationViaServiceWorker({
    title: `🔥 Alerta de Desejos: ${title.slice(0, 32)}...`,
    options: {
      body: `O item da sua lista de desejos caiu ${pct}%! De ${formatCurrency(
        oldPrice
      )} por ${formatCurrency(newPrice)}. Economia de ${formatCurrency(savings)}!`,
      icon: image,
      badge: '/pwa-192x192.png',
      tag: 'test-wishlist-price-drop',
      vibrate: [200, 100, 200],
      data: {
        productId: sampleProduct?.id || 'sample',
        test: true
      }
    }
  });
}
