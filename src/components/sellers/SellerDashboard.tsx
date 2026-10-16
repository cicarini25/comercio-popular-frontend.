import React, { useEffect, useState } from 'react';
import { AlertTriangle, Award, CheckCircle2, DollarSign, Lock, Package, PlusCircle, Printer, ShieldCheck, Store, Trash2, TrendingUp, X } from 'lucide-react';
import { Product, User } from '../../types';
import { CATEGORIES } from '../../data/mockProducts';
import { formatCurrency } from '../../utils/formatters';
import { api } from '../../services/api';

interface SellerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  products?: Product[];
  onAddNewProduct?: (newProduct: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

type SellerProduct = { id: string; title: string; description: string; price: number; stockUnits: number; category: string; imageUrl: string; status: string };
type SellerOrder = { id: string; status: string; total: number; created_at: string; tracking_code?: string | null; customer_name: string; customer_email: string; items: Array<{ title: string; quantity: number; unitPrice: number }> };
const emptyForm = { title: '', description: '', price: '', stockUnits: '1', category: CATEGORIES[1] || 'Outros', imageUrl: '' };

function catalogProduct(product: SellerProduct, user: User): Product {
  return { id: product.id, title: product.title, description: product.description, price: product.price, originalPrice: product.price, discountPercentage: 0, platform: 'parceiro', rating: 0, reviewCount: 0, images: product.imageUrl ? [product.imageUrl] : [], category: product.category, isAchadinho: false, stockUnits: product.stockUnits, seller: { id: user.id, name: user.name, city: user.address?.city || '', state: user.address?.state || '', verified: true, plan: 'Comerciante Parceiro', rating: 0, salesCount: 0 } };
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ isOpen, onClose, user, onAddNewProduct, onDeleteProduct }) => {
  const [activeTab, setActiveTab] = useState<'resumo' | 'produtos' | 'novo' | 'pedidos' | 'reputacao'>('resumo');
  const [seller, setSeller] = useState<any>(null);
  const [stats, setStats] = useState({ salesCount: 0, revenue: 0, openOrders: 0, activeProducts: 0 });
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [accessError, setAccessError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setAccessError('');
    try {
      const data = await api.getSellerDashboard();
      setSeller(data.seller); setStats(data.stats); setSellerProducts(data.products || []); setSellerOrders(data.orders || []);
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : 'Acesso ao painel não liberado.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) loadDashboard(); }, [isOpen, user.id]);
  if (!isOpen) return null;

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    const payload = { title: form.title.trim(), description: form.description.trim(), price: Number(form.price.replace(',', '.')), stockUnits: Number(form.stockUnits), category: form.category, imageUrl: form.imageUrl.trim() };
    setSaving(true);
    try {
      const response = await api.createSellerProduct(payload); const product = response.product as SellerProduct;
      setSellerProducts((current) => [product, ...current]); setStats((current) => ({ ...current, activeProducts: current.activeProducts + 1 }));
      onAddNewProduct?.(catalogProduct(product, user)); setForm(emptyForm); setMessage('Produto salvo no servidor e publicado na vitrine.'); setActiveTab('produtos');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar o produto.'); } finally { setSaving(false); }
  };

  const handleDeleteProduct = async (productId: string) => {
    try { await api.deleteSellerProduct(productId); setSellerProducts((current) => current.filter((product) => product.id !== productId)); setStats((current) => ({ ...current, activeProducts: Math.max(0, current.activeProducts - 1) })); onDeleteProduct?.(productId); setMessage('Produto pausado com segurança.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível remover o produto.'); }
  };

  const handleUpdateOrder = async (orderId: string, status: string) => {
    try {
      const response = await api.updateSellerOrder(orderId, status);
      setSellerOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: response.order.status, tracking_code: response.order.tracking_code } : order));
      setMessage('Status do pedido atualizado.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível atualizar o pedido.'); }
  };

  const tabs = [['resumo', 'Resumo'], ['produtos', 'Produtos'], ['novo', 'Cadastrar produto'], ['pedidos', `Pedidos (${sellerOrders.length})`], ['reputacao', 'Reputação']] as const;

  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-900/60 p-3 sm:p-4">
    <div className="relative my-auto flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <header className="flex items-center justify-between gap-4 bg-teal-950 px-5 py-4 text-white sm:px-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700"><Store size={20} className="text-teal-100" /></div><div><h2 className="font-display text-base font-bold">Painel do Comerciante Parceiro{seller?.store_name ? ` • ${seller.store_name}` : ''}</h2><p className="mt-0.5 flex items-center gap-1.5 text-xs text-teal-200"><ShieldCheck size={13} />{seller?.verification_badge || 'Área protegida da sua loja'}</p></div></div><button type="button" onClick={onClose} aria-label="Fechar painel" className="rounded-full p-2 text-teal-100 hover:bg-white/10"><X size={20} /></button></header>
      {loading ? <div className="p-12 text-center text-sm text-neutral-600">Carregando os dados privados da sua loja…</div> : accessError ? <div className="space-y-4 p-8 text-center"><Lock className="mx-auto text-amber-600" size={32} /><h3 className="text-lg font-bold text-neutral-900">Acesso de vendedor ainda não liberado</h3><p className="mx-auto max-w-lg text-sm text-neutral-600">{accessError} O painel só abre depois da aprovação do cadastro e da confirmação do pagamento do plano.</p><button type="button" onClick={onClose} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">Voltar</button></div> : <>
        <nav className="flex gap-4 overflow-x-auto border-b border-neutral-200 bg-neutral-50 px-5 pt-2 text-xs font-bold sm:px-6">{tabs.map(([value, label]) => <button key={value} type="button" onClick={() => setActiveTab(value)} className={`whitespace-nowrap border-b-2 pb-3 ${activeTab === value ? 'border-teal-700 text-teal-900' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>{label}</button>)}</nav>
        <main className="space-y-5 overflow-y-auto p-5 sm:p-6">{message && <div role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">{message}</div>}
          {activeTab === 'resumo' && <><div className="rounded-2xl border border-teal-200 bg-teal-50 p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="font-bold text-neutral-900">Dados reais da sua loja</p><p className="mt-1 text-xs text-neutral-600">Estas informações são carregadas do servidor e vinculadas somente à sua conta.</p></div><span className="rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white">Plano {seller.plan}</span></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-4">{([['Vendas', stats.salesCount, TrendingUp], ['Faturamento', formatCurrency(stats.revenue), DollarSign], ['Pedidos abertos', stats.openOrders, Package], ['Produtos ativos', stats.activeProducts, Store]] as const).map(([label, value, Icon]) => <div key={String(label)} className="rounded-2xl border border-neutral-200 bg-white p-4"><div className="flex items-center justify-between text-xs font-bold text-neutral-600"><span>{label}</span><Icon size={16} className="text-teal-700" /></div><p className="mt-2 text-2xl font-extrabold text-neutral-900">{value}</p></div>)}</div><div className="rounded-2xl border border-neutral-200 bg-white p-5"><h3 className="font-bold text-neutral-900">Segurança da conta</h3><p className="mt-2 text-sm text-neutral-600">Seu acesso é validado no servidor pelo token da sua conta. Produtos e pedidos são filtrados pelo vendedor autenticado.</p><div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15} /> Conta de vendedor ativa e verificada</div></div></>}
          {activeTab === 'produtos' && <section className="space-y-4"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold text-neutral-900">Produtos da sua loja</h3><p className="text-sm text-neutral-600">Somente produtos vinculados à sua conta aparecem aqui.</p></div><button type="button" onClick={() => setActiveTab('novo')} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white"><PlusCircle size={15} /> Novo produto</button></div>{sellerProducts.length === 0 ? <p className="rounded-xl bg-neutral-50 p-5 text-sm text-neutral-600">Você ainda não cadastrou produtos.</p> : sellerProducts.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 p-3"><div className="flex min-w-0 items-center gap-3"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">{product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-neutral-900">{product.title}</p><p className="text-xs text-neutral-500">{formatCurrency(product.price)} · Estoque: {product.stockUnits} · {product.status}</p></div></div><button type="button" onClick={() => handleDeleteProduct(product.id)} aria-label={`Pausar ${product.title}`} className="rounded-lg p-2 text-neutral-400 hover:text-rose-600"><Trash2 size={17} /></button></div>)}</section>}
          {activeTab === 'novo' && <form onSubmit={handleCreateProduct} className="mx-auto max-w-2xl space-y-4"><h3 className="text-lg font-bold text-neutral-900">Cadastrar produto real</h3><p className="text-sm text-neutral-600">O produto será salvo no banco e ficará vinculado à sua loja.</p><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do produto" className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm" /><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição completa" rows={4} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm" /><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><input required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Preço" inputMode="decimal" className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm" /><input required type="number" min="0" value={form.stockUnits} onChange={(e) => setForm({ ...form, stockUnits: e.target.value })} placeholder="Estoque" className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm" /><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm">{CATEGORIES.slice(1).map((category) => <option key={category}>{category}</option>)}</select></div><input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL da imagem (opcional)" className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm" /><button disabled={saving} type="submit" className="w-full rounded-xl bg-teal-700 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Salvando…' : 'Salvar produto'}</button></form>}
          {activeTab === 'pedidos' && <section className="space-y-4"><h3 className="text-lg font-bold text-neutral-900">Pedidos da sua loja</h3>{sellerOrders.length === 0 ? <p className="rounded-xl bg-neutral-50 p-5 text-sm text-neutral-600">Nenhum pedido recebido ainda.</p> : sellerOrders.map((order) => <article key={order.id} className="rounded-2xl border border-neutral-200 p-4"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><p className="text-sm font-bold text-neutral-900">Pedido {order.id}</p><p className="text-xs text-neutral-500">{order.customer_name} · {new Date(order.created_at).toLocaleString('pt-BR')}</p></div><div className="text-left sm:text-right"><p className="font-extrabold text-teal-900">{formatCurrency(order.total)}</p><select value={order.status} onChange={(event) => handleUpdateOrder(order.id, event.target.value)} className="mt-1 rounded-lg border border-neutral-200 px-2 py-1 text-xs font-bold text-neutral-600"><option value="pago">Pago</option><option value="em_preparacao">Em preparação</option><option value="enviado">Enviado</option><option value="entregue">Entregue</option><option value="cancelado">Cancelado</option></select></div></div><div className="mt-3 text-xs text-neutral-600">{order.items.map((item) => <p key={`${order.id}-${item.title}`}>{item.title} · {item.quantity} unidade(s)</p>)}</div>{order.tracking_code && <p className="mt-2 text-xs text-neutral-600">Rastreio: {order.tracking_code}</p>}<button type="button" onClick={() => window.print()} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-700"><Printer size={14} /> Imprimir etiqueta</button></article>)}</section>}
          {activeTab === 'reputacao' && <section className="space-y-4"><h3 className="text-lg font-bold text-neutral-900">Reputação e desempenho</h3><div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center"><Award className="mx-auto text-teal-700" size={32} /><p className="mt-2 text-3xl font-extrabold text-neutral-900">{stats.salesCount ? 'Em avaliação' : 'Sem dados'}</p><p className="mt-2 text-sm text-neutral-600">A pontuação será calculada com base em pedidos, cancelamentos, entregas e atendimentos reais.</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="mr-2 inline" size={16} /> A reputação não pode ser alterada manualmente pelo vendedor.</div></section>}
        </main></>}
    </div>
  </div>;
};

