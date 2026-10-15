import React, { useState } from 'react';
import { Lock, ShoppingBag, X } from 'lucide-react';
import { CartItem, Order, User } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { api } from '../../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  onPaymentComplete: (order: Order) => void;
  onRequireAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onPaymentComplete,
  onRequireAuth
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = 14.90;
  const total = subtotal + shippingFee;

  // Mercado Pago Checkout Pro hosts the card, debit, Pix and boleto screens.
  const handleFinalizePayment = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    const sellerIds = [...new Set(items.map((item) => item.product.seller?.id).filter(Boolean))];
    if (sellerIds.length !== 1 || items.some((item) => !item.product.seller?.id)) {
      setOrderError('Cada pedido deve conter produtos de um único vendedor.');
      return;
    }

    setIsProcessing(true);
    setOrderError(null);
    try {
      const response = await api.createOrder({
        items: items.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          unitPrice: Number(item.product.price),
          quantity: item.quantity,
          sellerId: item.product.seller!.id
        })),
        shippingFee
      });

      if (!response.checkoutUrl) {
        throw new Error('O Mercado Pago não retornou o endereço do checkout.');
      }

      const pendingOrder: Order = {
        id: response.orderId,
        date: new Date().toISOString(),
        items,
        subtotal,
        shippingTotal: shippingFee,
        total,
        paymentMethod: 'pix',
        paymentStatus: 'pending'
      };
      onPaymentComplete(pendingOrder);
      onClose();
      window.location.assign(response.checkoutUrl);
    } catch (error: any) {
      setOrderError(error?.message || 'Não foi possível iniciar o pagamento. Tente novamente.');
      setIsProcessing(false);
    }
  };

  if (!isOpen || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <section role="dialog" aria-modal="true" aria-label="Checkout Mercado Pago" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-700">Pagamento seguro</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Finalizar pedido</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="my-5 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-teal-700" size={22} />
            <div>
              <p className="font-semibold text-slate-900">{items.length} item(ns) no pedido</p>
              <p className="text-sm text-slate-600">Vendido por um único parceiro</p>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600">
          Você será levado ao Mercado Pago para escolher cartão de crédito, débito, Pix ou boleto. Os dados do cartão não passam pelo nosso site.
        </p>

        {orderError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{orderError}</p>}

        <button type="button" disabled={isProcessing} onClick={handleFinalizePayment} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">
          <Lock size={17} />
          {isProcessing ? 'Abrindo Mercado Pago...' : 'Continuar para pagamento'}
        </button>
      </section>
    </div>
  );
};

