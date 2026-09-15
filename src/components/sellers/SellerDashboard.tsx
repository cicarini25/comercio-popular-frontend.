import React, { useState } from 'react';
import {
  X,
  Store,
  PlusCircle,
  DollarSign,
  Package,
  TrendingUp,
  Truck,
  CheckCircle2,
  Trash2,
  Edit,
  Printer,
  ShieldCheck,
  AlertCircle,
  Award,
  Star,
  MessageSquareWarning,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  ClipboardList,
  Wallet,
  Landmark,
  Newspaper,
  Info
} from 'lucide-react';
import { Product, User } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORIES } from '../../data/mockProducts';

interface SellerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  products: Product[];
  onAddNewProduct: (newProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  isOpen,
  onClose,
  user,
  products,
  onAddNewProduct,
  onDeleteProduct
}) => {
  const [activeTab, setActiveTab] = useState<'resumo' | 'overview' | 'new_product' | 'orders' | 'reputation'>('resumo');
  const [showSaibaMais, setShowSaibaMais] = useState(false);
  const [showComoFunciona, setShowComoFunciona] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [businessBio, setBusinessBio] = useState('');

  // Form for New Product
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[1]);
  const [newStock, setNewStock] = useState('10');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80');
  const [successMsg, setSuccessMsg] = useState('');

  // Seller products
  const myProducts = products.filter((p) => p.platform === 'parceiro');

  // Mock orders received by this seller
  const [sellerOrders, setSellerOrders] = useState([
    {
      id: 'PED-90812',
      date: 'Hoje, 14:32',
      customer: 'Carla Silveira',
      product: 'Kit Panos de Prato Algodão',
      value: 42.00,
      status: 'Pendente de Envio',
      destination: 'Campinas - SP'
    },
    {
      id: 'PED-89410',
      date: 'Ontem, 19:10',
      customer: 'Rodrigo Lima',
      product: 'Café Especial Mantiqueira 500g',
      value: 38.90,
      status: 'Enviado',
      destination: 'Belo Horizonte - MG'
    }
  ]);

  // Cálculo da faixa de pontuação do vendedor com base no total de vendas
  const totalSales = sellerOrders.length;
  const SELLER_TIERS = [
    { key: 'novo', label: 'Novo Parceiro', emoji: '🌱', minSales: 0, color: 'neutral' },
    { key: 'verificado', label: 'Parceiro Verificado', emoji: '🟢', minSales: 10, color: 'emerald' },
    { key: 'confiavel', label: 'Parceiro Confiável', emoji: '🔷', minSales: 50, color: 'blue' },
    { key: 'premium', label: 'Parceiro Premium', emoji: '🏆', minSales: 200, color: 'amber' }
  ] as const;
  const currentTierIndex = [...SELLER_TIERS].reverse().findIndex((t) => totalSales >= t.minSales);
  const currentTier = SELLER_TIERS[SELLER_TIERS.length - 1 - currentTierIndex];
  const nextTier = SELLER_TIERS[SELLER_TIERS.indexOf(currentTier) + 1];
  const progressToNext = nextTier
    ? Math.min(100, Math.round((totalSales / nextTier.minSales) * 100))
    : 100;

  // Missões de onboarding do vendedor (inspiradas no fluxo de ativação de contas de venda)
  const hasProducts = myProducts.length > 0;
  const hasEnoughProducts = myProducts.length >= 3;
  const hasFirstSale = sellerOrders.length > 0;
  const hasReputation = totalSales >= 10;
  const contaAtivaSteps = 1 + (profileComplete ? 1 : 0); // conta criada + perfil completo
  const missions = [
    { key: 'conta', label: 'Conta ativa', done: contaAtivaSteps === 2, progressLabel: `${contaAtivaSteps}/2` },
    { key: 'pronto', label: 'Pronto para vender', done: hasProducts },
    { key: 'decola', label: 'Decola', done: hasEnoughProducts },
    { key: 'venda', label: 'Primeira venda', done: hasFirstSale },
    { key: 'reputacao', label: 'Reputação', done: hasReputation }
  ];

  const handleCompleteProfile = () => {
    if (!businessBio.trim()) return;
    setProfileComplete(true);
    setShowProfileForm(false);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const priceNum = parseFloat(newPrice.replace(',', '.'));
    const origPriceNum = newOriginalPrice ? parseFloat(newOriginalPrice.replace(',', '.')) : priceNum * 1.2;

    const prod: Product = {
      id: 'par-' + Date.now(),
      title: newTitle,
      description: newDescription || 'Produto artesanal e de alta qualidade fornecido por comerciante parceiro verificado do Comércio Popular.',
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercentage: Math.round(((origPriceNum - priceNum) / origPriceNum) * 100),
      platform: 'parceiro',
      rating: 5.0,
      reviewCount: 1,
      images: [newImageUrl],
      category: newCategory,
      isAchadinho: false,
      stockUnits: parseInt(newStock, 10) || 5,
      seller: {
        id: user.id,
        name: user.name + ' Store',
        city: user.address?.city || 'São Paulo',
        state: user.address?.state || 'SP',
        verified: true,
        plan: 'Plano Pro Comércio',
        rating: 5.0,
        salesCount: 1
      },
      badge: 'Novidade na Vitrine'
    };

    onAddNewProduct(prod);
    setSuccessMsg('Produto cadastrado com sucesso e já visível na vitrine!');
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('overview');
      setNewTitle('');
      setNewPrice('');
      setNewOriginalPrice('');
      setNewDescription('');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="seller-dashboard-modal"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-teal-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center">
              <Store size={20} className="text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display">
                Painel do Comerciante Parceiro • {user.name}
              </h3>
              <p className="text-xs text-teal-300 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-teal-400" />
                <span>Assinatura Ativa: Plano Pro Comércio (0% comissão)</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white rounded-full hover:bg-teal-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 pt-2 text-xs font-bold gap-4 overflow-x-auto scrollbar-none">
          <button
            id="tab-btn-resumo"
            onClick={() => setActiveTab('resumo')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'resumo'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Visão Geral & Produtos
          </button>
          <button
            id="tab-btn-new-product"
            onClick={() => setActiveTab('new_product')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'new_product'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <PlusCircle size={14} />
            <span>Cadastrar Novo Produto</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Package size={14} />
            <span>Vendas & Pedidos Recebidos ({sellerOrders.length})</span>
          </button>
          <button
            id="tab-btn-reputation"
            onClick={() => setActiveTab('reputation')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'reputation'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Award size={14} />
            <span>Pontuação</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 0: RESUMO */}
          {activeTab === 'resumo' && (
            <div className="space-y-6">
              {/* Missions banner */}
              <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">
                      {missions.every((m) => m.done)
                        ? 'Você completou todas as missões! 🎉'
                        : 'É hora de avançar nas suas missões como vendedor!'}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1">
                      Complete cada etapa pra desbloquear mais recursos e vender mais no Comércio Popular.
                    </p>
                    <button
                      onClick={() => setShowComoFunciona((v) => !v)}
                      className="mt-2 text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Info size={13} />
                      <span>Como funciona essa missão</span>
                      {showComoFunciona ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none">
                    {missions.map((m) => (
                      <div key={m.key} className="flex flex-col items-center gap-1 shrink-0 w-16">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                            m.done
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'bg-white border-neutral-300 text-neutral-400'
                          }`}
                        >
                          {m.done ? <CheckCircle2 size={20} /> : <Lock size={16} />}
                        </div>
                        <span className="text-[10px] text-center font-semibold text-neutral-700 leading-tight">
                          {m.label}
                        </span>
                        {m.progressLabel && !m.done && (
                          <span className="text-[9px] font-bold text-teal-700">{m.progressLabel}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {showComoFunciona && (
                  <div className="mt-4 pt-4 border-t border-teal-200 space-y-2 text-xs text-neutral-700 leading-relaxed">
                    <p>
                      As <strong>missões</strong> são um passo a passo pra te ajudar a começar a vender bem no Comércio Popular. Cada missão concluída libera novos recursos no seu painel — como métricas de negócio, empréstimos e o card de faturamento.
                    </p>
                    <ul className="space-y-1">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                        <span><strong>Conta ativa</strong> — crie sua conta e complete seu perfil de vendedor</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                        <span><strong>Pronto para vender</strong> — cadastre seu primeiro produto na vitrine</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                        <span><strong>Decola</strong> — publique ao menos 3 produtos ativos</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                        <span><strong>Primeira venda</strong> — feche seu primeiro pedido</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                        <span><strong>Reputação</strong> — alcance 10 vendas para começar a pontuar (veja a aba Pontuação)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Complete seu perfil card */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-gradient-to-br from-amber-50 to-white">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Conta ativa • Missão
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-white border border-amber-200 flex items-center justify-center mt-3">
                    <ClipboardList size={20} className="text-amber-600" />
                  </div>
                  <h5 className="font-bold text-sm text-neutral-900 mt-3">
                    {profileComplete ? 'Perfil completo! ✅' : 'Complete seu perfil de vendedor'}
                  </h5>
                  <p className="text-xs text-neutral-600 mt-1">
                    {profileComplete
                      ? 'Seus compradores já podem ver mais sobre o seu negócio.'
                      : 'Conte mais sobre o seu negócio para personalizar a experiência dos seus compradores.'}
                  </p>

                  {!profileComplete && !showProfileForm && (
                    <button
                      onClick={() => setShowProfileForm(true)}
                      className="mt-3 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Completar perfil
                    </button>
                  )}

                  {showProfileForm && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        rows={3}
                        value={businessBio}
                        onChange={(e) => setBusinessBio(e.target.value)}
                        placeholder="Ex: Vendemos artigos de casa e cozinha feitos à mão em Colombo/PR desde 2024..."
                        className="w-full text-xs p-3 border border-neutral-300 rounded-xl outline-none focus:border-teal-700"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCompleteProfile}
                          disabled={!businessBio.trim()}
                          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          Salvar perfil
                        </button>
                        <button
                          onClick={() => setShowProfileForm(false)}
                          className="px-3 py-2 text-neutral-500 hover:text-neutral-700 text-xs font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Novidades card - always unlocked */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-white">
                  <div className="flex items-center gap-2 text-neutral-800 font-bold text-sm">
                    <Newspaper size={16} className="text-teal-700" />
                    <span>Novidades</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    A partir de agora, novidades sobre o Comércio Popular e dicas para vender mais aparecem aqui.
                  </p>
                </div>

                {/* Locked/unlocked status cards */}
                {[
                  {
                    icon: AlertCircle,
                    title: 'Pendências nos seus anúncios',
                    unlocked: profileComplete,
                    lockedText: 'Complete a ativação e configuração da sua conta para desbloquear este acesso.',
                    unlockedText: 'Nenhuma pendência! Seus anúncios estão em dia.'
                  },
                  {
                    icon: Package,
                    title: 'Pendências em suas vendas',
                    unlocked: hasFirstSale,
                    lockedText: 'Faça sua primeira venda para desbloquear este acesso.',
                    unlockedText: 'Nenhuma pendência nas suas vendas no momento.'
                  },
                  {
                    icon: Star,
                    title: 'Reputação',
                    unlocked: hasFirstSale,
                    lockedText: 'Crie seu primeiro anúncio para desbloquear este acesso.',
                    unlockedText: 'Veja sua pontuação completa na aba Pontuação.',
                    onClickUnlocked: () => setActiveTab('reputation')
                  },
                  {
                    icon: TrendingUp,
                    title: 'Métricas de negócio',
                    unlocked: hasFirstSale,
                    lockedText: 'Faça sua primeira venda para desbloquear este acesso.',
                    unlockedText: `${sellerOrders.length} vendas registradas até agora.`
                  },
                  {
                    icon: Landmark,
                    title: 'Empréstimos para seu negócio',
                    unlocked: totalSales >= 50,
                    lockedText: 'Conclua os primeiros passos para desbloquear este acesso.',
                    unlockedText: 'Você já pode simular crédito com base no seu histórico de vendas.'
                  },
                  {
                    icon: Wallet,
                    title: 'Faturamento',
                    unlocked: hasFirstSale,
                    lockedText: 'Faça sua primeira venda para desbloquear este acesso.',
                    unlockedText: 'Acompanhe na aba Visão Geral quanto você já faturou.'
                  },
                  {
                    icon: DollarSign,
                    title: 'Saldos e extratos',
                    unlocked: hasFirstSale,
                    lockedText: 'Faça sua primeira venda para desbloquear este acesso.',
                    unlockedText: `Saldo disponível: ${formatCurrency(1890.4)}`
                  }
                ].map((card) => (
                  <div
                    key={card.title}
                    onClick={card.unlocked ? card.onClickUnlocked : undefined}
                    className={`p-4 rounded-2xl border bg-white ${
                      card.unlocked
                        ? 'border-teal-200 ' + (card.onClickUnlocked ? 'cursor-pointer hover:border-teal-400' : '')
                        : 'border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                      {card.unlocked ? (
                        <card.icon size={15} className="text-teal-700" />
                      ) : (
                        <Lock size={13} className="text-neutral-400" />
                      )}
                      <span>{card.title}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2">
                      {card.unlocked ? card.unlockedText : card.lockedText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                  <div className="flex items-center justify-between text-teal-800 text-xs font-bold">
                    <span>Saldo Disponível (Split Pix)</span>
                    <DollarSign size={16} />
                  </div>
                  <p className="text-2xl font-extrabold text-teal-950 mt-2 font-display">
                    {formatCurrency(1890.40)}
                  </p>
                  <p className="text-[11px] text-teal-700 mt-1">Disponível para saque instantâneo</p>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                  <div className="flex items-center justify-between text-neutral-600 text-xs font-bold">
                    <span>Vendas no Mês</span>
                    <TrendingUp size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-neutral-900 mt-2 font-display">
                    42 pedidos
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">Economia de R$ 380 em taxas</p>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                  <div className="flex items-center justify-between text-neutral-600 text-xs font-bold">
                    <span>Produtos Ativos na Vitrine</span>
                    <Package size={16} className="text-teal-700" />
                  </div>
                  <p className="text-2xl font-extrabold text-neutral-900 mt-2 font-display">
                    {myProducts.length} itens
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">Limite: Ilimitado no seu plano</p>
                </div>
              </div>

              {/* Products Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-900">
                    Seus Produtos Cadastrados
                  </h4>
                  <button
                    onClick={() => setActiveTab('new_product')}
                    className="px-3 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    <span>Novo Produto</span>
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100">
                  {myProducts.map((p) => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
                        />
                        <div>
                          <p className="font-semibold text-xs text-neutral-900 line-clamp-1">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                            <span className="font-bold text-teal-800">{formatCurrency(p.price)}</span>
                            <span>•</span>
                            <span>Estoque: {p.stockUnits} unidades</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Ativo na vitrine</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Remover produto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEW PRODUCT FORM */}
          {activeTab === 'new_product' && (
            <form onSubmit={handleCreateProduct} className="space-y-4 max-w-xl mx-auto">
              <h4 className="font-bold text-base text-neutral-900 font-display text-center">
                Cadastrar Novo Produto na Vitrine
              </h4>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                  Título do Produto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Queijo Minas Artesanal Canastra Meia Cura 500g"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded-xl outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                    Preço de Venda (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="49,90"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded-xl outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                    Preço Original / De (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="79,90"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded-xl outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded-xl outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                    Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded-xl outline-none focus:border-teal-700 cursor-pointer"
                  >
                    {CATEGORIES.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-neutral-300 rounded-xl outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 mb-1 block">
                  Descrição detalhada
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descreva detalhes, materiais, prazos de envio..."
                  className="w-full text-xs p-3 border border-neutral-300 rounded-xl outline-none focus:border-teal-700"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl text-[11px] text-teal-900 flex items-start gap-2">
                <Truck size={16} className="text-teal-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Frete:</strong> O frete é calculado automaticamente pelo CEP do comprador e pago junto com a compra. Você só precisa embalar e postar nos Correios ou transportadora parceira.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition-colors shadow-md"
              >
                Publicar Produto na Vitrine
              </button>
            </form>
          )}

          {/* TAB 3: ORDERS RECEIVED */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-neutral-900">
                Pedidos Recebidos com Split Direto
              </h4>

              <div className="space-y-3">
                {sellerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-neutral-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-900">{ord.id}</span>
                        <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                          {ord.date}
                        </span>
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-neutral-800 mt-1">
                        {ord.product} • Destino: {ord.destination}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Comprador: {ord.customer}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-sm font-extrabold text-teal-900">
                        {formatCurrency(ord.value)}
                      </span>
                      <button
                        onClick={() => alert(`Etiqueta de Envio do pedido ${ord.id} gerada para impressão!`)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Printer size={13} />
                        <span>Imprimir Etiqueta</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REPUTATION / SCORE */}
          {activeTab === 'reputation' && (
            <div className="space-y-6">
              {/* Current tier card */}
              <div className="p-5 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-teal-200 flex items-center justify-center text-3xl shadow-xs">
                    {currentTier.emoji}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wide">
                      Sua faixa atual
                    </p>
                    <h4 className="text-lg font-extrabold text-neutral-900 font-display">
                      {currentTier.label}
                    </h4>
                    <p className="text-xs text-neutral-600">{totalSales} vendas realizadas</p>
                  </div>
                </div>

                {nextTier && (
                  <div className="w-full sm:w-56">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-600 mb-1">
                      <span>Rumo a {nextTier.label}</span>
                      <span>{totalSales}/{nextTier.minSales} vendas</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full transition-all"
                        style={{ width: `${progressToNext}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Metrics grid, styled like a Comércio Popular performance panel */}
              <div>
                <h4 className="font-bold text-sm text-neutral-900 mb-3">Suas métricas de desempenho</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-white">
                    <div className="flex items-center gap-2 text-neutral-700 text-xs font-bold mb-2">
                      <MessageSquareWarning size={15} className="text-neutral-500" />
                      <span>Reclamações</span>
                    </div>
                    <p className="text-xl font-extrabold text-neutral-900">—%</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Calculado com base nas suas vendas</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      2% permitido
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-white">
                    <div className="flex items-center gap-2 text-neutral-700 text-xs font-bold mb-2">
                      <XCircle size={15} className="text-neutral-500" />
                      <span>Canceladas por você</span>
                    </div>
                    <p className="text-xl font-extrabold text-neutral-900">—%</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Calculado com base nas suas vendas</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      1,5% permitido
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-white">
                    <div className="flex items-center gap-2 text-neutral-700 text-xs font-bold mb-2">
                      <Truck size={15} className="text-neutral-500" />
                      <span>Envios no prazo</span>
                    </div>
                    <p className="text-xl font-extrabold text-neutral-900">—%</p>
                    <p className="text-[11px] text-neutral-500 mt-1">São calculadas sobre suas vendas com envio</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      mín. 90% exigido
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                  Suas métricas aparecem assim que você completa suas primeiras vendas.
                </p>
              </div>

              {/* Tier benefits list */}
              <div>
                <h4 className="font-bold text-sm text-neutral-900 mb-3">Faixas e o que você ganha subindo de nível</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      tier: SELLER_TIERS[0],
                      benefits: ['Acesso ao painel de vendas', 'Suporte padrão por chat', 'Assinatura no valor cheio do plano']
                    },
                    {
                      tier: SELLER_TIERS[1],
                      benefits: ['Selo verde de confiança no anúncio', 'Aparece no filtro "Verificado" da busca', '5% de desconto na assinatura mensal']
                    },
                    {
                      tier: SELLER_TIERS[2],
                      benefits: ['Selo azul + destaque nos resultados de busca', '15% de desconto na assinatura mensal', 'Suporte prioritário (resposta em até 2h)']
                    },
                    {
                      tier: SELLER_TIERS[3],
                      benefits: ['Selo dourado + posição fixa nos Achadinhos', '30% de desconto na assinatura mensal', 'Gerente de conta dedicado + relatórios avançados']
                    }
                  ].map(({ tier, benefits }) => {
                    const isCurrent = tier.key === currentTier.key;
                    const isLocked = SELLER_TIERS.indexOf(tier) > SELLER_TIERS.indexOf(currentTier);
                    return (
                      <div
                        key={tier.key}
                        className={`p-4 rounded-2xl border ${
                          isCurrent ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' : 'border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{tier.emoji}</span>
                            <span className="font-bold text-xs text-neutral-900">{tier.label}</span>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                              Você está aqui
                            </span>
                          )}
                          {isLocked && <Lock size={13} className="text-neutral-400" />}
                        </div>
                        <ul className="space-y-1">
                          {benefits.map((b) => (
                            <li key={b} className="flex items-start gap-1.5 text-[11px] text-neutral-600">
                              <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Why it matters + Saiba mais */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-white">
                <div className="flex items-start gap-3">
                  <Star size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-neutral-900">Por que a Pontuação é importante</h5>
                    <p className="text-xs text-neutral-600 mt-1">
                      É a forma como avaliamos a qualidade do seu atendimento, pra que os compradores saibam que estão comprando com um parceiro de confiança.
                    </p>
                    <button
                      onClick={() => setShowSaibaMais((v) => !v)}
                      className="mt-2 text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Saiba mais</span>
                      {showSaibaMais ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showSaibaMais && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 space-y-3 text-xs text-neutral-700 leading-relaxed">
                        <p>
                          A <strong>Pontuação Comércio Popular</strong> é um score calculado automaticamente com base no seu histórico de vendas: reclamações, cancelamentos feitos por você e envios realizados dentro do prazo. Quanto melhor o seu atendimento, mais alta é a sua faixa.
                        </p>
                        <p>
                          Diferente de uma nota isolada, a pontuação considera seu <strong>volume de vendas junto com a qualidade</strong> — ou seja, vender bastante mantendo um bom atendimento é o que te leva às faixas mais altas.
                        </p>
                        <div>
                          <p className="font-bold text-neutral-900 mb-1">O que você ganha ao subir de faixa:</p>
                          <ul className="space-y-1">
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                              <span><strong>Menos taxa na assinatura</strong> — até 30% de desconto no plano mensal na faixa Premium</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                              <span><strong>Mais visibilidade</strong> — selo de confiança visível pro comprador e destaque nos resultados de busca</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                              <span><strong>Mais vendas</strong> — compradores confiam mais e convertem mais em anúncios com selo de reputação</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 size={12} className="text-teal-600 shrink-0 mt-0.5" />
                              <span><strong>Atendimento prioritário</strong> — suporte mais rápido e, nas faixas mais altas, um gerente de conta dedicado</span>
                            </li>
                          </ul>
                        </div>
                        <p className="text-neutral-500">
                          A pontuação é recalculada automaticamente a cada nova venda — não é preciso solicitar nada, é só continuar atendendo bem seus clientes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
