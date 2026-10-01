import { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import { prepareFeed, type FeedItem } from '../services/shopeeImport';

type Preview = { id: string; title: string; price: number; image: string };
export default function ShopeeImportAdmin() {
  const [feed, setFeed] = useState<File | null>(null);
  const [links, setLinks] = useState<File | null>(null);
  const [manual, setManual] = useState('');
  const [token, setToken] = useState('');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [preview, setPreview] = useState<Preview[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const reset = () => { setItems([]); setPreview([]); setError(''); setSuccess(''); };
  async function request(rows: FeedItem[], dryRun: boolean) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 90000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/integrations/shopee/import-feed`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.trim()}` },
        body: JSON.stringify({ items: rows, dryRun }), signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || `Falha HTTP ${response.status}.`);
      return result;
    } finally { window.clearTimeout(timer); }
  }
  async function check() {
    reset(); setBusy('Lendo os arquivos e validando os produtos…');
    try {
      if (!feed || !token.trim()) throw new Error('Selecione o feed e informe o token administrativo.');
      const rows = await prepareFeed(feed, links, manual);
      const result = await request(rows, true);
      if (!Array.isArray(result.products) || result.products.length !== rows.length) throw new Error('Prévia incompleta. Nenhum produto foi publicado.');
      setItems(rows); setPreview(result.products);
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível validar o lote.'); }
    finally { setBusy(''); }
  }
  async function publish() {
    setError(''); setSuccess(''); setBusy('Publicando o lote…');
    try {
      const result = await request(items, false);
      setSuccess(`${result.count} produtos processados com sucesso. A vitrine já pode ser atualizada.`);
      setItems([]); setPreview([]); setToken('');
    } catch (e) {
      setError(`${e instanceof Error ? e.message : 'Falha na comunicação.'} Se a conexão caiu, confira a vitrine antes de tentar novamente.`);
    } finally { setBusy(''); }
  }
  const input = 'block w-full rounded-xl border border-slate-300 bg-white p-3 mt-2 text-sm';
  return <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8">
    <div className="max-w-5xl mx-auto">
      <a href="/" className="text-emerald-700 underline">Voltar à vitrine</a>
      <h1 className="text-3xl font-bold mt-6">Importar produtos Shopee</h1>
      <p className="mt-2 text-slate-600">Associe os dados do feed aos seus links de afiliado. Confira a prévia e publique até 100 produtos por lote.</p>
      <form onSubmit={e => { e.preventDefault(); void check(); }} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 mt-6">
        <fieldset disabled={!!busy} className="space-y-5 disabled:opacity-60">
          <label className="block font-semibold">1. Feed de produto da Shopee (CSV)
            <input className={input} type="file" accept=".csv,text/csv" required onChange={e => { reset(); setFeed(e.target.files?.[0] || null); }} />
          </label>
          <label className="block font-semibold">2. Planilha de links de afiliado (CSV)
            <input className={input} type="file" accept=".csv,text/csv" onChange={e => { reset(); setLinks(e.target.files?.[0] || null); }} />
            <span className="text-sm font-normal text-slate-500">Arquivo exportado com as colunas Item Id e Offer Link.</span>
          </label>
          <label className="block font-semibold">Ou informe os IDs e links
            <textarea className={input} rows={4} value={manual} onChange={e => { reset(); setManual(e.target.value); }} placeholder="58217601055 https://s.shopee.com.br/seulink" spellCheck={false} />
            <span className="text-sm font-normal text-slate-500">Um ID numérico e seu link por linha, separados por espaço. Links sozinhos não identificam o produto.</span>
          </label>
          <label className="block font-semibold">3. Token administrativo
            <input className={input} type="password" autoComplete="off" required value={token} onChange={e => { reset(); setToken(e.target.value); }} />
            <span className="text-sm font-normal text-slate-500">Use o INTEGRATION_ADMIN_TOKEN do backend. Não é a senha da Shopee. Não será salvo no navegador.</span>
          </label>
          <button className="rounded-xl bg-emerald-700 text-white px-5 py-3 font-semibold" type="submit">Preparar e validar prévia</button>
        </fieldset>
      </form>
      {busy && <p role="status" className="p-4 mt-4 bg-blue-50 rounded-xl">{busy}</p>}
      {error && <p role="alert" className="p-4 mt-4 bg-red-50 text-red-800 rounded-xl break-words">{error}</p>}
      {success && <p role="status" className="p-4 mt-4 bg-emerald-50 text-emerald-800 rounded-xl">{success} <a className="underline" href="/">Abrir vitrine</a></p>}
      {!!preview.length && <section className="mt-6 bg-white border rounded-2xl p-5">
        <h2 className="text-xl font-bold">Prévia: {preview.length} produtos</h2>
        <p className="text-sm text-slate-600 mt-2">Os preços são os do arquivo enviado. Produtos já cadastrados com o mesmo ID serão atualizados. Nenhuma atualização periódica é ativada por esta importação.</p>
        <div className="overflow-x-auto mt-4"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Produto</th><th className="p-2">ID</th><th className="p-2">Preço</th></tr></thead><tbody>
          {preview.map(p => <tr key={p.id} className="border-t"><td className="p-2"><div className="flex items-center gap-3"><img className="w-14 h-14 object-contain" src={p.image} alt="" referrerPolicy="no-referrer" /><span>{p.title}</span></div></td><td className="p-2">{p.id}</td><td className="p-2 whitespace-nowrap">{p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>)}
        </tbody></table></div>
        <button disabled={!!busy} onClick={() => void publish()} className="mt-5 rounded-xl bg-orange-600 text-white px-5 py-3 font-semibold disabled:opacity-50">Publicar {preview.length} produtos</button>
      </section>}
    </div>
  </main>;
}
