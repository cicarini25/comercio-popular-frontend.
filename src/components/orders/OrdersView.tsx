import React from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  QrCode
} from 'lucide-react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface OrdersViewProps {
  orders: Order[];
  onExploreProducts: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onExploreProducts }) => {
  return (
    <div id="orders-view" className="py-8 max-w-5xl mx-auto px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 font-display">
            Meus Pedidos & Rastreamento
          </h2>
          <p className="text-xs text-neutral-500">
            Acompanhe o status de pagamento, separação e entrega das suas compras no Comércio Popular.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 w-fit">
          <ShieldCheck size={16} className="text-teal-700" />
          <span>Garantia de Entrega ou Dinheiro de Volta</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Package size={30} />
          </div>
          <h3 className="text-lg font-bold text-neutral-800">
            Você ainda não tem nenhum pedido registrado
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Quando você compra produtos dos nossos comerciantes parceiros com o sistema de pagamento integrado, eles aparecem aqui com código de rastreio em tempo real.
          </p>
          <button
            onClick={onExploreProducts}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Ver Vitrine de Produtos</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 bg-neutral-50 border-b border-neutral-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-neutral-900 font-display text-sm">
                    #{order.id}
                  </span>
                  <span className="text-neutral-500">Realizado em {order.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-neutral-900 text-sm">
                    {formatCurrency(order.total)}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                    <CheckCircle2 size={12} /> Pagamento Confirmado
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                {/* Tracking Progress */}
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-teal-700" />
                    <div>
                      <span className="font-bold text-teal-950">
                        Código de Rastreamento: {order.trackingCode || 'BR982194812CP'}
                      </span>
                      <p className="text-[11px] text-teal-800">
                        Transportadora do Comerciante Parceiro • Envio em andamento
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://rastreamento.correios.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 text-[11px] underline"
                  >
                    <span>Rastrear no site dos Correios</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-100">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="py-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
                        />
                        <div>
                          <p className="font-semibold text-neutral-800 line-clamp-1">
                            {item.product.title}
                          </p>
                          <p className="text-neutral-400 text-[11px]">
                            Quantidade: {item.quantity} • Vendido por {item.product.seller?.name || 'Comércio Popular'}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-neutral-800">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
