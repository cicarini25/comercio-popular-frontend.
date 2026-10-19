import { useMemo, useState, type FormEvent } from 'react';
import { API_BASE_URL } from '../services/api';
import { CATEGORIES } from '../data/mockProducts';

type AliExpressProduct = {
  externalId: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  currency?: string;
  imageUrl: string;
  productUrl: string;
  affiliateUrl: string;
  category?: string;
  commissionRate?: string;
  shopId?: string;
  [key: string]: unknown;
};

export default function AliExpressImportAdmin() {
  const [token, setToken] = useState('');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState<AliExpressProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedProducts = useMemo(
    () => products.filter((product) => selected.has(product.externalId)),
    [products, selected]
  );

  async function searchProducts(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (!token.trim()) throw new Error('Informe o token administrativo do backend.');
      if (!keywords.trim()) throw new Error('Informe o que deseja buscar no AliExpress.');
      const query = new URLSearchParams({ keywords: keywords.trim(), pageSize: '50', targetCurrency: 'BRL', shipToCountry: 'BR', targetLanguage: 'PT' });
      const response = await fetch(`${API_BASE_URL}/api/integrations/aliexpress/search?${query}`, {
        headers: { Authorization: `Bearer ${token.trim()}`, Accept: 'application/json' }
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Não foi possível consultar o AliExpress.');
      const rows = Array.isArray(data?.products) ? data.products as AliExpressProduct[] : [];
      setProducts(rows);
      setSelected(new Set(rows.map((product) => product.externalId)));
      setNotice(rows.length ? `${rows.length} ofertas encontradas. Confira a seleção antes de gravar.` : 'Nenhuma oferta encontrada.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha na consulta.');
      setProducts([]);
      setSelected(new Set());
    } finally {
      setBusy(false);
    }
  }

  async function importSelected() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (!selectedProducts.length) throw new Error('Selecione pelo menos uma oferta.');
      const response = await fetch(`${API_BASE_URL}/api/integrations/aliexpress/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.trim()}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          category,
          items: selectedProducts.map(({ raw: _raw, ...product }) => product)
        })
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Não foi possível gravar as ofertas.');
      setNotice(`Concluído: ${data.imported || 0} novos, ${data.matched || 0} pareados e ${data.review || 0} para revisão.`);
      setProducts([]);
      setSelected(new Set());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha na importação.');
    } finally {
      setBusy(false);
    }
  }

  const input = 'mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm';

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-emerald-700 underline">Voltar à vitrine</a>
        <h1 className="mt-6 text-3xl font-bold">Pareamento AliExpress</h1>
        <p className="mt-2 text-slate-600">Busque ofertas afiliadas, revise a seleção e confirme a gravação. O sistema tenta parear cada oferta com um produto já existente e envia casos ambíguos para revisão.</p>

        <form onSubmit={(event) => void searchProducts(event)} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-7">
          <label className="font-semibold sm:col-span-2">Token administrativo do backend
            <input className={input} type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} />
            <span className="mt-1 block text-sm font-normal text-slate-500">É o INTEGRATION_ADMIN_TOKEN da Railway. A App Key e o App Secret ficam somente no backend.</span>
          </label>
          <label className="font-semibold">Buscar no AliExpress
            <input className={input} value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="ex.: luminária de mesa" />
          </label>
          <label className="font-semibold">Categoria do site (opcional)
            <select className={input} value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Usar categoria retornada pelo AliExpress</option>
              {CATEGORIES.filter((item) => item !== 'Todas as Categorias').map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button disabled={busy} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2" type="submit">{busy ? 'Consultando…' : 'Consultar ofertas'}</button>
        </form>

        {busy && <p role="status" className="mt-4 rounded-xl bg-blue-50 p-4">Processando…</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-900">{notice}</p>}

        {!!products.length && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Prévia das ofertas</h2>
              <button disabled={busy || !selectedProducts.length} onClick={() => void importSelected()} className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50" type="button">Parear e gravar {selectedProducts.length}</button>
            </div>
            <p className="mt-2 text-sm text-slate-600">A gravação só ocorre ao clicar no botão. Produtos diferentes não são unidos automaticamente.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <label key={product.externalId} className="flex gap-3 rounded-xl border border-slate-200 p-3">
                  <input className="mt-1 h-4 w-4" type="checkbox" checked={selected.has(product.externalId)} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(product.externalId)) next.delete(product.externalId); else next.add(product.externalId); return next; })} />
                  <span className="min-w-0">
                    <img className="h-32 w-full rounded object-contain" src={product.imageUrl} alt="" referrerPolicy="no-referrer" />
                    <span className="mt-2 block line-clamp-3 text-sm font-semibold">{product.title}</span>
                    <span className="mt-1 block text-sm text-slate-600">{Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

