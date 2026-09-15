import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Store
} from 'lucide-react';
import { CartItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-2xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-teal-700" />
              <h3 className="font-bold text-neutral-900 text-base font-display">
                Minha Sacola de Compras
              </h3>
              <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body items */}
          <div className="p-5 overflow-y-auto flex-1 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center">
                  <ShoppingCart size={28} />
                </div>
                <h4 className="font-bold text-neutral-800">Sua sacola está vazia</h4>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Adicione produtos dos nossos comerciantes parceiros para comprar com pagamento integrado e entrega garantida!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition-colors cursor-pointer"
                >
                  Explorar Vitrine
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3 items-start">
                    {/* Image */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[11px] text-teal-800 font-medium">
                        <Store size={11} className="text-teal-600" />
                        <span className="truncate">
                          {item.product.seller?.name || 'Comerciante Parceiro'}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-900 line-clamp-2 leading-snug">
                        {item.product.title}
                      </h4>
                      <p className="text-xs font-bold text-neutral-900 mt-1">
                        {formatCurrency(item.product.price)}
                      </p>

                      {/* Quantity selector */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-neutral-300 rounded-lg">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                            }
                            className="p-1 hover:bg-neutral-100 text-neutral-600 rounded-l cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-xs font-bold text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-neutral-100 text-neutral-600 rounded-r cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/90 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Subtotal dos produtos:</span>
                <span className="font-extrabold text-neutral-900 text-lg font-display">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="p-2.5 bg-white border border-neutral-200 rounded-xl text-[11px] text-neutral-600 flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-700 shrink-0" />
                <span>Frete calculado no próximo passo com opção de Pix e Cartão em até 12x.</span>
              </div>

              <button
                id="btn-drawer-checkout"
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3.5 bg-coral-600 hover:bg-coral-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <span>Finalizar Pedido com Pagamento Seguro</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
