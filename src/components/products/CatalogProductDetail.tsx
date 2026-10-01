import React, { useEffect, useRef } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export function CatalogProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);
  return <dialog ref={dialog} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    className="m-auto w-[min(95vw,900px)] max-h-[90vh] overflow-y-auto rounded-3xl p-6 backdrop:bg-black/60">
    <button autoFocus aria-label="Fechar detalhes" onClick={onClose} className="float-right p-2"><X /></button>
    <div className="grid md:grid-cols-2 gap-6 clear-both">
      <img src={product.images[0]} alt={product.title} className="w-full max-h-96 object-contain rounded-xl" />
      <div className="space-y-4">
        <p className="text-sm text-neutral-500">Shopee · {product.category}</p>
        <h2 className="text-xl font-bold">{product.title}</h2>
        {product.originalPrice && <p className="line-through text-neutral-500">{formatCurrency(product.originalPrice)}</p>}
        <p className="text-3xl font-bold text-teal-800">{formatCurrency(product.price)}</p>
        <p className="text-sm text-neutral-600">Preço informado no catálogo. Confirme preço final, disponibilidade, variações, frete e cupons na Shopee.</p>
        {product.stockUnits === 0 ? <p>Oferta indisponível.</p> : <a href={product.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-coral-600 text-white font-bold p-3 rounded-xl">Comprar na Shopee <ExternalLink size={18} /></a>}
        <p className="text-xs text-neutral-500">A compra e o pagamento são realizados na Shopee. O Comércio Popular pode receber comissão, sem custo adicional para você.</p>
        <p className="text-sm text-neutral-600">Consulte as avaliações do produto na Shopee.</p>
      </div>
    </div>
    <h3 className="font-bold mt-6 mb-2">Descrição do produto</h3>
    <p className="whitespace-pre-wrap text-sm leading-relaxed">{product.description}</p>
  </dialog>;
}
