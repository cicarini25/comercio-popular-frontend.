import React, { useState } from 'react';
import {
  Store,
  Check,
  Zap,
  ShieldCheck,
  PlusCircle,
  Package,
  ArrowRight,
  TrendingUp,
  Truck,
  DollarSign,
  BarChart3,
  Star,
  MessageSquare,
  Megaphone,
  Target,
  Lock,
  Award,
  AlertTriangle,
  ClipboardList,
  Search,
  CalendarDays,
  ListFilter,
  RotateCcw,
  CheckCircle2,
  LayoutDashboard,
  X,
  ImagePlus,
  Eye,
  Send,
  HelpCircle,
  Edit3,
  PauseCircle,
  ExternalLink
} from 'lucide-react';
import { SellerPlan, Product, User } from '../../types';
import { SELLER_PLANS } from '../../data/mockProducts';
import { formatCurrency } from '../../utils/formatters';
import { ProductCard } from '../products/ProductCard';
import { AfterSales, QuickAnswers, Reputation } from './SellerTools';
import { SellerManagementModule } from './SellerManagementModules';

interface SellerSectionProps {
  products: Product[];
  user: User | null;
  onSubscribePlan: (plan: SellerPlan) => void;
  onOpenDashboard: () => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  wishlistIds?: string[];
  onToggleFavorite?: (product: Product) => void;
}

export const SellerSection: React.FC<SellerSectionProps> = ({
  products,
  user,
  onSubscribePlan,
  onOpenDashboard,
  onAddToCart,
  onViewDetails,
  wishlistIds = [],
  onToggleFavorite
}) => {
  // Only partner products (marketplace próprio)
  const partnerProducts = products.filter((p) => p.platform === 'parceiro');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('Resumo');
  const [postSaleTab, setPostSaleTab] = useState('Reclamações e mediações');
  const [postSaleSearch, setPostSaleSearch] = useState('');
  const [workspaceResponse, setWorkspaceResponse] = useState('');
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [adsView, setAdsView] = useState<'home' | 'register' | 'quality' | 'active'>('home');
  const [adQuery,setAdQuery]=useState('');
 const [editingAd,setEditingAd]=useState<number|null>(null);
 const [previewAd,setPreviewAd]=useState<number|null>(null);
 const [adPhotos, setAdPhotos] = useState<string[]>([]);
  const [adForm, setAdForm] = useState({ title: '', category: '', description: '', price: '', stock: '', sku: '' });
  const [activeAds, setActiveAds] = useState<Array<{id:number;title:string;price:string;stock:number;status:string;views:number;category?:string;description?:string;sku?:string;photos?:string[]}>>([
    { id: 1, title: 'Café Especial Mantiqueira 500g', price: 'R$ 38,90', stock: 18, status: 'Publicado', views: 247 },
    { id: 2, title: 'Mochila Executiva Impermeável 15,6”', price: 'R$ 119,90', stock: 7, status: 'Em revisão', views: 83 }
  ]);

  const importAdPhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    const selectedFiles = files.slice(0, 8 - adPhotos.length);
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setAdPhotos((current) => [...current, String(reader.result)].slice(0, 8));
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const publishAd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!adForm.title || !adForm.category || !adForm.price || !adForm.stock || (!editingAd && adPhotos.length === 0)) {
      setWorkspaceResponse('Preencha título, categoria, preço e estoque e importe pelo menos uma foto antes de publicar.');
      return;
    }
    const updated={...adForm,id:editingAd||Date.now(),price:formatCurrency(Number(adForm.price)),stock:Number(adForm.stock),status:'Publicado',views:0,photos:adPhotos};
    setActiveAds(current=>editingAd?current.map(ad=>ad.id===editingAd?updated:ad):[updated,...current]);
    setEditingAd(null);
    setWorkspaceResponse('Alterações guardadas nesta sessão demonstrativa. Publicação real não conectada.');
    setAdForm({ title: '', category: '', description: '', price: '', stock: '', sku: '' });
    setAdPhotos([]);
    setAdsView('active');
  };

  const workspaceInfo: Record<string, { title: string; description: string; cards: Array<{ title: string; text: string; action: string }> }> = {
    'Anúncios': {
      title: 'Gestão de anúncios',
      description: 'Cadastre produtos e mantenha preço, fotos e estoque sempre atualizados.',
      cards: [
        { title: 'Anúncios ativos', text: 'Visualize produtos publicados, pausados ou em revisão.', action: 'Consultar anúncios' },
        { title: 'Cadastrar produto', text: 'Inclua fotos, descrição, categoria, preço e quantidade disponível.', action: 'Começar cadastro' },
        { title: 'Qualidade do anúncio', text: 'Receba recomendações para melhorar títulos, imagens e conversão.', action: 'Ver recomendações' }
      ]
    },
    'Vendas': {
      title: 'Vendas e pedidos',
      description: 'Acompanhe cada pedido desde a aprovação do pagamento até a entrega.',
      cards: [
        { title: 'Pedidos novos', text: 'Confira vendas aprovadas que aguardam preparação e envio.', action: 'Ver pedidos' },
        { title: 'Faturamento', text: 'Consulte total vendido, taxas, repasses e saldo disponível.', action: 'Ver resumo financeiro' },
        { title: 'Envios', text: 'Acompanhe prazos, etiquetas, rastreios e confirmações de entrega.', action: 'Acompanhar envios' }
      ]
    },
    'Perguntas': {
      title: 'Perguntas dos compradores',
      description: 'Responda rapidamente às dúvidas e aumente suas chances de conversão.',
      cards: [
        { title: 'Perguntas pendentes', text: 'Novas perguntas ficam reunidas aqui para resposta.', action: 'Ver pendentes' },
        { title: 'Respondidas', text: 'Consulte seu histórico de conversas sobre produtos.', action: 'Abrir histórico' },
        { title: 'Boas práticas', text: 'Responda com clareza, sem compartilhar contatos ou dados sensíveis.', action: 'Ver orientações' }
      ]
    },
    'Marketing': {
      title: 'Marketing e promoções',
      description: 'Aumente a exposição da loja com campanhas e descontos planejados.',
      cards: [
        { title: 'Criar promoção', text: 'Defina desconto, duração, estoque e produtos participantes.', action: 'Nova promoção' },
        { title: 'Destaques da vitrine', text: 'Acompanhe oportunidades de exposição na página inicial.', action: 'Ver oportunidades' },
        { title: 'Desempenho', text: 'Compare visitas, cliques, conversões e vendas das campanhas.', action: 'Analisar resultados' }
      ]
    },
    'Reputação': {
      title: 'Reputação e score',
      description: 'A reputação é calculada com base no atendimento e na qualidade das vendas.',
      cards: [
        { title: 'Indicadores', text: 'Acompanhe reclamações, cancelamentos e envios atrasados.', action: 'Ver indicadores' },
        { title: 'Avaliações', text: 'Consulte notas e comentários recebidos dos compradores.', action: 'Ver avaliações' },
        { title: 'Como melhorar', text: 'Veja ações recomendadas para subir o score da sua loja.', action: 'Ver recomendações' }
      ]
    }
  };

  return (
    <section id="seller-section" className="py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Marketplace Próprio Hero Banner */}
        <div className="bg-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-teal-800 text-teal-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Store size={14} className="text-teal-400" />
              <span>Marketplace Próprio • Comerciantes do Brasil</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
              Apoie pequenos lojistas e compre com pagamento integrado e seguro
            </h2>
            <p className="text-sm text-teal-200 leading-relaxed">
              Aqui você compra diretamente de artesãos, pequenos armazéns e comerciantes verificados. Pagamento com Pix instantâneo, Cartão até 12x e frete direto.
            </p>

            {user?.isSeller ? (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={onOpenDashboard}
                  className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Store size={16} />
                  <span>Acessar Meu Painel de Vendedor</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#planos-vendedor"
                  className="px-5 py-3 bg-coral-600 hover:bg-coral-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Anunciar Minha Loja (A partir de R$ 39,90/mês)</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Acesso compacto ao Espaço do Vendedor */}
        <div id="espaco-do-vendedor" className="overflow-hidden rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-950 to-teal-800 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-teal-200"><LayoutDashboard size={24} /></div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-teal-300">Central exclusiva para lojistas</span>
                <h3 className="mt-1 text-2xl font-extrabold font-display">Espaço do Vendedor</h3>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-teal-100">Consulte anúncios, vendas, perguntas, pós-venda, marketing, reputação, score e resultados da sua loja.</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsWorkspaceOpen(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-coral-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-coral-700">
              Abrir Espaço do Vendedor <ArrowRight size={17} />
            </button>
          </div>
        </div>

        {/* Painel completo aberto somente pelo botão */}
        {isWorkspaceOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-100 p-3 sm:p-6">
          <div className="sticky top-0 z-30 mx-auto mb-3 flex max-w-7xl items-center justify-between rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur">
            <div className="flex items-center gap-3"><LayoutDashboard className="text-teal-700" size={20} /><div><p className="text-sm font-extrabold text-neutral-900">Espaço do Vendedor</p><p className="text-[10px] text-neutral-500">Central de gestão do Comércio Popular</p></div></div>
            <button type="button" onClick={() => setIsWorkspaceOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100" aria-label="Fechar Espaço do Vendedor"><X size={16} /> Fechar</button>
          </div>
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Conheça antes de assinar</span>
              <h3 className="mt-1 text-2xl font-extrabold text-neutral-900 font-display">Espaço do Vendedor</h3>
              <p className="mt-1 max-w-2xl text-xs text-neutral-600">Controle sua loja, acompanhe pedidos, reputação, score e resultados em um único painel.</p>
            </div>
            <a href="#planos-vendedor" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800">
              Ver planos disponíveis <ArrowRight size={15} />
            </a>
          </div>

          <div className="grid lg:grid-cols-[220px_1fr]">
            <aside className="border-b border-neutral-200 bg-white p-4 lg:border-b-0 lg:border-r">
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Central do lojista</p>
              <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1" aria-label="Recursos do espaço do vendedor">
                {[
                  { label: 'Resumo', icon: BarChart3 },
                  { label: 'Anúncios', icon: Package },
                  { label: 'Vendas', icon: DollarSign },
                  { label: 'Perguntas', icon: MessageSquare },
                  { label: 'Pós-venda', icon: ShieldCheck },
                  { label: 'Marketing', icon: Megaphone },
                  { label: 'Reputação', icon: Award }
                ].map(({ label, icon: Icon }) => (
                  <button type="button" key={label} onClick={() => setActiveWorkspaceTab(label)} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${activeWorkspaceTab === label ? 'bg-teal-100 text-teal-900' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </nav>
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-[11px] font-bold text-amber-800">Plano atual</p>
                <p className="mt-1 text-sm font-extrabold text-neutral-900">Ainda não contratado</p>
                <a href="#planos-vendedor" className="mt-2 inline-flex text-xs font-bold text-teal-700 hover:underline">Comparar planos</a>
              </div>
            </aside>

            <div className="space-y-5 p-4 sm:p-6">
              {activeWorkspaceTab === 'Resumo' ? (
                <>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="font-bold text-neutral-900">Sua jornada como vendedor</p>
                    <p className="text-xs text-neutral-600">Ative a conta, publique produtos e construa uma reputação de confiança.</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['Conta ativa', 'Perfil completo', '1º anúncio', '1ª venda', 'Reputação'].map((step, index) => (
                      <div key={step} className="min-w-0">
                        <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black ${index === 0 ? 'border-teal-600 bg-teal-600 text-white' : 'border-neutral-300 bg-white text-neutral-400'}`}>{index + 1}</div>
                        <p className="mt-1 hidden text-[10px] font-semibold text-neutral-600 sm:block">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  { label: 'Vendas no mês', value: '0', icon: Package, color: 'text-sky-700 bg-sky-50' },
                  { label: 'Faturamento', value: 'R$ 0,00', icon: DollarSign, color: 'text-emerald-700 bg-emerald-50' },
                  { label: 'Pedidos em aberto', value: '0', icon: ClipboardList, color: 'text-amber-700 bg-amber-50' },
                  { label: 'Score da loja', value: '—', icon: Target, color: 'text-violet-700 bg-violet-50' }
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}><Icon size={18} /></div>
                    <p className="text-xl font-extrabold text-neutral-900">{value}</p>
                    <p className="text-[11px] text-neutral-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-neutral-900">Reputação do vendedor</p>
                      <p className="text-xs text-neutral-500">A faixa será calculada após as primeiras 10 vendas.</p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold text-neutral-600">Em construção</span>
                  </div>
                  <div className="mt-5 grid grid-cols-5 gap-1.5">
                    {['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-600'].map((color, index) => <div key={color} className={`h-2.5 rounded-full ${color} ${index > 0 ? 'opacity-30' : 'opacity-60'}`} />)}
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Reclamações', value: '—%', hint: 'Até 2% permitido' },
                      { label: 'Cancelamentos', value: '—%', hint: 'Até 2,5% permitido' },
                      { label: 'Envios atrasados', value: '—%', hint: 'Até 13% permitido' }
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-[10px] font-bold text-neutral-500">{metric.label}</p>
                        <p className="mt-1 text-lg font-extrabold text-neutral-800">{metric.value}</p>
                        <p className="mt-1 text-[9px] text-neutral-400">{metric.hint}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <div className="flex gap-3"><Lock className="mt-0.5 text-neutral-400" size={18} /><div><p className="text-xs font-bold text-neutral-800">Métricas de negócio</p><p className="mt-1 text-[11px] text-neutral-500">Vendas, visitas, conversão e ticket médio aparecem automaticamente após a ativação.</p></div></div>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <div className="flex gap-3"><AlertTriangle className="mt-0.5 text-amber-500" size={18} /><div><p className="text-xs font-bold text-neutral-800">Pendências e qualidade</p><p className="mt-1 text-[11px] text-neutral-500">Receba alertas sobre estoque, anúncios, entregas e atendimento ao comprador.</p></div></div>
                  </div>
                  <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
                    <div className="flex gap-3"><Star className="mt-0.5 text-teal-700" size={18} /><div><p className="text-xs font-bold text-teal-900">Por que a reputação importa?</p><p className="mt-1 text-[11px] text-teal-700">Boas avaliações aumentam a confiança, melhoram o destaque dos anúncios e ajudam a vender mais.</p></div></div>
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-neutral-400">Visualização demonstrativa. Os dados reais serão calculados individualmente para cada vendedor.</p>
                </>
              ) : activeWorkspaceTab === 'Anúncios' ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div><span className="text-xs font-bold uppercase tracking-wider text-teal-700">Central do lojista</span><h4 className="mt-1 text-2xl font-extrabold text-neutral-900">Gestão de anúncios</h4><p className="mt-1 text-sm text-neutral-600">Cadastre, publique e acompanhe seus produtos em um só lugar.</p></div>
                    {adsView !== 'home' && <button type="button" onClick={() => { setAdsView('home'); setWorkspaceResponse(''); }} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">Voltar ao início</button>}
                  </div>

                  <p className="rounded-xl bg-amber-50 p-3 text-sm">Demonstração: alterações disponíveis nesta sessão. Não publica para compradores.</p>
                  {previewAd!==null&&activeAds.filter(a=>a.id===previewAd).map(ad=><article className="rounded-xl border bg-white p-5 space-y-3" key={ad.id}><button onClick={()=>setPreviewAd(null)}>Fechar visualização</button><h4 className="text-xl font-bold">{ad.title}</h4>{ad.photos?.map((photo,i)=><img key={i} src={photo} alt={ad.title} className="h-32 object-contain"/>)}<p>{ad.price} · {ad.stock} unidades · {ad.status}</p><p>{ad.description||'Descrição não cadastrada.'}</p><p>Categoria: {ad.category||'Não informada'} · SKU: {ad.sku||'Não informado'}</p></article>)}
                  {adsView === 'home' && <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { title: 'Anúncios ativos', text: 'Visualize produtos publicados, pausados ou em revisão.', action: 'Consultar anúncios', icon: Eye, view: 'active' as const },
                      { title: 'Cadastrar produto', text: 'Inclua fotos, descrição, categoria, preço e quantidade disponível.', action: 'Começar cadastro', icon: ImagePlus, view: 'register' as const },
                      { title: 'Qualidade do anúncio', text: 'Receba recomendações e tire dúvidas para melhorar a conversão.', action: 'Ver recomendações', icon: Star, view: 'quality' as const }
                    ].map(({ title, text, action, icon: Icon, view }) => <div key={title} className="flex min-h-48 flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5"><div><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Icon size={21} /></div><h5 className="text-base font-bold text-neutral-900">{title}</h5><p className="mt-2 text-sm leading-relaxed text-neutral-500">{text}</p></div><button type="button" onClick={() => { setAdsView(view); setWorkspaceResponse(''); if(view==='register'){setEditingAd(null);setAdForm({title:'',category:'',description:'',price:'',stock:'',sku:''});setAdPhotos([]);} }} className="mt-5 w-fit rounded-xl bg-teal-100 px-4 py-2.5 text-sm font-bold text-teal-900 hover:bg-teal-200">{action}</button></div>)}
                  </div>}

                  {adsView === 'register' && <form onSubmit={publishAd} className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                    <div><h5 className="text-lg font-extrabold text-neutral-900">Cadastrar novo produto</h5><p className="mt-1 text-sm text-neutral-500">Os campos com * são obrigatórios para publicar.</p></div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm font-bold text-neutral-700 md:col-span-2">Título do anúncio *<input value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} placeholder="Ex.: Café Especial Mantiqueira 500g" className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none focus:border-teal-600" /></label>
                      <label className="text-sm font-bold text-neutral-700">Categoria *<select value={adForm.category} onChange={(e) => setAdForm({ ...adForm, category: e.target.value })} className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-normal outline-none focus:border-teal-600"><option value="">Selecione</option><option>Alimentos e Bebidas</option><option>Casa e Cozinha</option><option>Tecnologia</option><option>Moda e Acessórios</option><option>Games</option><option>Smartphones</option></select></label>
                      <label className="text-sm font-bold text-neutral-700">Código/SKU<input value={adForm.sku} onChange={(e) => setAdForm({ ...adForm, sku: e.target.value })} placeholder="Ex.: CAF-500" className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none focus:border-teal-600" /></label>
                      <label className="text-sm font-bold text-neutral-700">Preço *<input type="number" min="0" step="0.01" value={adForm.price} onChange={(e) => setAdForm({ ...adForm, price: e.target.value })} placeholder="0,00" className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none focus:border-teal-600" /></label>
                      <label className="text-sm font-bold text-neutral-700">Quantidade em estoque *<input type="number" min="0" value={adForm.stock} onChange={(e) => setAdForm({ ...adForm, stock: e.target.value })} placeholder="0" className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none focus:border-teal-600" /></label>
                      <label className="text-sm font-bold text-neutral-700 md:col-span-2">Descrição completa<textarea rows={5} value={adForm.description} onChange={(e) => setAdForm({ ...adForm, description: e.target.value })} placeholder="Informe marca, modelo, medidas, material, garantia e o que acompanha o produto." className="mt-2 w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none focus:border-teal-600" /></label>
                    </div>
                    <div><p className="text-sm font-bold text-neutral-700">Fotos do produto * <span className="font-normal text-neutral-400">({adPhotos.length}/8)</span></p><label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50 p-7 text-center hover:bg-teal-100"><ImagePlus className="text-teal-700" size={28} /><span className="mt-2 text-sm font-bold text-teal-900">Importar fotos do computador ou celular</span><span className="mt-1 text-xs text-teal-700">JPG, PNG ou WEBP • até 8 imagens</span><input type="file" accept="image/*" multiple onChange={importAdPhotos} className="sr-only" /></label></div>
                    {adPhotos.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{adPhotos.map((photo, index) => <div key={index} className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200"><img src={photo} alt={`Foto ${index + 1} do produto`} className="h-full w-full object-cover" /><button type="button" onClick={() => setAdPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} aria-label={`Remover foto ${index + 1}`} className="absolute right-2 top-2 rounded-full bg-neutral-900/75 p-1.5 text-white"><X size={14} /></button>{index === 0 && <span className="absolute bottom-2 left-2 rounded-full bg-teal-700 px-2 py-1 text-xs font-bold text-white">Capa</span>}</div>)}</div>}
                    <div className="flex flex-wrap gap-3"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"><Send size={17} /> Salvar anúncio / alterações</button><button type="button" onClick={() => setWorkspaceResponse('Rascunho mantido nesta sessão. Você pode continuar preenchendo antes de publicar.')} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-bold text-neutral-700">Salvar rascunho</button></div>
                  </form>}

                  {adsView === 'quality' && <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">{[
                      ['Título claro e pesquisável', 'Use nome do produto, marca, modelo e característica principal. Evite emojis, telefone e palavras repetidas.'],
                      ['Fotos que geram confiança', 'Use imagem nítida, fundo limpo e boa iluminação. A primeira foto deve mostrar o produto inteiro.'],
                      ['Descrição que tira dúvidas', 'Informe medidas, material, compatibilidade, garantia, conteúdo da embalagem e prazo de envio.']
                    ].map(([title, text], index) => <div key={title} className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 font-black text-teal-800">{index + 1}</div><h5 className="font-bold text-neutral-900">{title}</h5><p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p></div>)}</div>
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><div className="flex items-start gap-3"><HelpCircle className="mt-0.5 shrink-0 text-sky-700" size={22} /><div><h5 className="font-bold text-sky-950">Dúvidas sobre a qualidade do anúncio</h5><p className="mt-2 text-sm leading-relaxed text-sky-900">Um anúncio de boa qualidade tem informações completas, fotos próprias e verdadeiras, preço correto e estoque atualizado. Não use dados de contato, links externos ou promessas que não possa cumprir.</p><div className="mt-4 flex flex-wrap gap-2">{['Como escolher a foto de capa?', 'O que colocar no título?', 'Por que meu anúncio está em revisão?'].map((question) => <button type="button" key={question} onClick={() => setWorkspaceResponse(question === 'Como escolher a foto de capa?' ? 'Escolha uma foto nítida, bem iluminada, sem textos ou bordas, mostrando o produto inteiro. Ela será a primeira imagem vista pelo comprador.' : question === 'O que colocar no título?' ? 'Informe produto, marca, modelo e característica principal. Exemplo: Mochila Executiva Impermeável para Notebook 15,6 polegadas.' : 'A revisão verifica fotos, categoria, dados do produto e cumprimento das regras. Corrija as pendências indicadas e envie novamente.')} className="rounded-full border border-sky-300 bg-white px-3 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100">{question}</button>)}</div></div></div></div>
                  </div>}

                  {adsView === 'active' && <div className="space-y-4"><div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><label className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2.5"><Search size={17} className="text-neutral-400" /><input value={adQuery} onChange={e=>setAdQuery(e.target.value)} placeholder="Buscar por título ou código" className="w-full text-sm outline-none" /></label><button type="button" onClick={() => {setEditingAd(null);setAdForm({title:'',category:'',description:'',price:'',stock:'',sku:''});setAdPhotos([]);setAdsView('register')}} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white"><PlusCircle size={17} /> Novo anúncio</button></div>
                    <div className="space-y-3">{activeAds.filter(ad=>(ad.title+' '+(ad.sku||'')).toLowerCase().includes(adQuery.toLowerCase())).map((ad) => <div key={ad.id} className="rounded-2xl border border-neutral-200 bg-white p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h5 className="font-bold text-neutral-900">{ad.title}</h5><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ad.status === 'Publicado' ? 'bg-emerald-100 text-emerald-800' : ad.status === 'Pausado' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}>{ad.status}</span></div><div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500"><span>{ad.price}</span><span>{ad.stock} em estoque</span><span>{ad.views} visualizações</span></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setPreviewAd(ad.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-bold text-neutral-700"><Eye size={15} /> Visualizar</button><button type="button" onClick={() => setPreviewAd(ad.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-bold text-neutral-700"><ExternalLink size={15} /> Consultar anúncio</button><button type="button" onClick={() => {setEditingAd(ad.id);setAdForm({title:ad.title,category:ad.category||'Tecnologia',description:ad.description||'',price:ad.price.replace(/[^0-9,]/g,'').replace(',','.'),stock:String(ad.stock),sku:ad.sku||''});setAdPhotos(ad.photos||[]);setAdsView('register')}} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-bold text-neutral-700"><Edit3 size={15} /> Editar</button><button type="button" onClick={() => setActiveAds((current) => current.map((item) => item.id === ad.id ? { ...item, status: item.status === 'Pausado' ? 'Publicado' : 'Pausado' } : item))} className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-700"><PauseCircle size={15} /> {ad.status === 'Pausado' ? 'Republicar' : 'Pausar'}</button></div></div></div>)}</div>
                  </div>}

                  {workspaceResponse && <div role="status" className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">{workspaceResponse}</div>}
                </div>
              ) : activeWorkspaceTab === 'Perguntas' ? (
                <QuickAnswers navigate={setActiveWorkspaceTab}/>
              ) : activeWorkspaceTab === 'Reputação' ? (
                <Reputation/>
              ) : ['Vendas', 'Marketing'].includes(activeWorkspaceTab) ? (
                <SellerManagementModule key={activeWorkspaceTab} module={activeWorkspaceTab as 'Vendas' | 'Perguntas' | 'Marketing' | 'Reputação'} message={workspaceResponse} onMessage={setWorkspaceResponse} />
              ) : activeWorkspaceTab === 'Pós-venda' ? (
                <AfterSales navigate={setActiveWorkspaceTab}/>
              ) : (
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Central do lojista</span>
                    <h4 className="mt-1 text-2xl font-extrabold text-neutral-900">{workspaceInfo[activeWorkspaceTab]?.title}</h4>
                    <p className="mt-1 text-xs text-neutral-600">{workspaceInfo[activeWorkspaceTab]?.description}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {workspaceInfo[activeWorkspaceTab]?.cards.map((card) => (
                      <div key={card.title} className="flex min-h-44 flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5">
                        <div><h5 className="font-bold text-neutral-900">{card.title}</h5><p className="mt-2 text-xs leading-relaxed text-neutral-500">{card.text}</p></div>
                        <button type="button" onClick={() => setWorkspaceResponse(`${card.title}: ${card.text} Entre como vendedor para acessar os dados e executar esta ação.`)} className="mt-4 w-fit rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-100">{card.action}</button>
                      </div>
                    ))}
                  </div>
                  {workspaceResponse && <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">{workspaceResponse}</div>}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">Entre como vendedor para consultar dados reais e executar essas operações na sua conta.</div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
        )}

        {/* Vitrine de Produtos dos Comerciantes Parceiros */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 font-display">
                Vitrine dos Comerciantes Parceiros
              </h3>
              <p className="text-xs text-neutral-500">
                Produtos vendidos e enviados diretamente pelos lojistas com split de pagamento e garantia Comércio Popular.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 w-fit">
              <Truck size={14} className="text-teal-700" />
              <span>Frete por conta do vendedor até sua casa</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
            {partnerProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={wishlistIds.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
                onDirectAffiliateClick={() => {}}
              />
            ))}
          </div>
        </div>

        {/* Planos de Assinatura para Vendedores */}
        <div id="planos-vendedor" className="pt-8 border-t border-neutral-200 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Zero Comissão por Venda
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display">
              Venda no Comércio Popular com Plano Fixo Acessível
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Ao invés de pagar 18% a 22% de comissão por venda nas grandes plataformas, aqui você paga apenas uma mensalidade barata e fica com 100% do lucro dos seus produtos!
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SELLER_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-white border-2 border-teal-600 shadow-xl'
                    : 'bg-white border border-neutral-200 shadow-xs hover:border-neutral-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-700 text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 font-display">{plan.name}</h4>
                  <p className="text-xs text-neutral-500 mt-1 min-h-8">{plan.description}</p>

                  <div className="mt-4 pb-4 border-b border-neutral-100 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-neutral-900 font-display">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">/{plan.period}</span>
                  </div>

                  {/* Highlights */}
                  <div className="my-4 space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                        <Check size={15} className="text-teal-700 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  id={`btn-plan-${plan.id}`}
                  onClick={() => onSubscribePlan(plan)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  <Zap size={14} />
                  <span>Assinar {plan.name}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Value Prop Banner */}
          <div className="p-6 bg-coral-50 border border-coral-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-coral-950">
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-coral-900">
                🚀 O Comércio Popular investe em tráfego pago constante
              </h5>
              <p className="text-coral-800">
                Seus produtos serão anunciados em campanhas no Google e Meta para atrair compradores reais da sua região.
              </p>
            </div>
            <span className="shrink-0 bg-coral-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
              Tráfego Garantido
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
