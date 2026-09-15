import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Truck,
  Lock,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { CartItem, Order, User } from '../../types';
import { formatCurrency, maskCPF, maskCEP, generatePixPayload } from '../../utils/formatters';
import { api, CreateOrderPayload } from '../../services/api';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  onPaymentComplete: (order: Order) => void;
  onRequireAuth: () => void;
}

type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onPaymentComplete,
  onRequireAuth
}) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  // Shipping form
  const [name, setName] = useState(user?.name || '');
  const [cpf, setCpf] = useState(user?.cpf || '');
  const [cep, setCep] = useState(user?.address?.cep || '01310-100');
  const [street, setStreet] = useState(user?.address?.street || 'Avenida Paulista');
  const [number, setNumber] = useState(user?.address?.number || '1578');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState(user?.address?.neighborhood || 'Bela Vista');
  const [city, setCity] = useState(user?.address?.city || 'São Paulo');
  const [state, setState] = useState(user?.address?.state || 'SP');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<'econ' | 'express'>('econ');

  // Credit Card Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  // PIX state
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixTimeLeft, setPixTimeLeft] = useState(900); // 15 min

  // Created order state
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Subtotal & Shipping calculation
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = selectedShippingMethod === 'econ' ? 14.90 : 26.50;
  const total = subtotal + shippingFee;

  // Split calculation
  const sellerReceives = subtotal; // 0% fee on partner plan as per brief
  const platformGatewayCost = (subtotal * 0.01).toFixed(2); // low transparent fee

  const orderId = 'CP-' + Math.floor(100000 + Math.random() * 900000);
  const pixCode = generatePixPayload(total, orderId);

  // Handle shipping validation
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cpf || !street || !number || !city || !state) {
      alert('Por favor, preencha todos os campos obrigatórios do endereço.');
      return;
    }
    setStep('payment');
  };

  // Payments remain unavailable until server-side price and webhook validation are fixed.
  const handleFinalizePayment = async () => {
    setOrderError('Pagamentos temporariamente indisponíveis. Nenhuma cobrança foi realizada.');
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  if (!isOpen || items.length === 0) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><section role="dialog" aria-modal="true" aria-label="Pagamento indisponível" className="max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-xl font-bold">Pagamentos em preparação</h2><p className="my-4">Estamos concluindo a integração de pagamentos. Nenhuma cobrança foi realizada. Seus produtos continuam na sacola.</p><button onClick={onClose} className="rounded-xl bg-teal-700 px-4 py-3 text-white">Voltar à loja</button></section></div>;
};
