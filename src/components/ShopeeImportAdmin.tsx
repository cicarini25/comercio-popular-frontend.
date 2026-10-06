import { useState } from 'react';
import { prepareFeed, resolveShopeeImageUrls, enqueueShopeeBulk, getShopeeJob, repairShopeeCatalogState, searchShopeeOffers, type FeedItem, type ShopeeJobStatus } from '../services/shopeeImport';
import { CATEGORIES } from '../data/mockProducts';

type Preview = { id: string; title: string; price: number; image: string };
type JobView = ShopeeJobStatus & { displayStatus?: string };

const API_NOTE = 'A busca pela API procura pelo nome do produto. A categoria selecionada abaixo define em qual seção do site ele será publicado.';

export default function ShopeeImportAdmin() {
  const [mode, setMode] = useState<'api' | 'csv'>('api');
  const [keyword, setKeyword] = useState('');
  const [targetCategory, setTargetCategory] = useState('');
  const [feed, setFeed] = useState<File | null>(null);
  const [links, setLinks] = useState<File | null>(null);
  const [manual, setManual] = useState('');
  const [token, setToken] = useState('');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [preview, setPreview] = useState<Preview[]>([]);
  const [total, setTotal] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [jobs, setJobs] = useState<JobView[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const reset = () => { setItems([]); setPreview([]); setTotal(0); setSkipped(0); setJobs([]); setError(''); setSuccess(''); };

  async function check() {
    reset();
    try {
      let prepared: FeedItem[];
      if (mode === 'api') {
        setBusy('Consultando ofertas na API da Shopee e preparando a prévia…');
        const result = await searchShopeeOffers(keyword, targetCategory, token, 60);
        prepared = result.items;
        setSkipped(result.skipped);
      } else {
        setBusy('Lendo o Feed Shopee e cruzando os Item Ids com os Offer Links…');
        if (!feed || !token.trim()) throw new Error('Selecione o feed e informe o token administrativo.');
        const rows = await prepareFeed(feed, links, manual);
        setBusy('Recuperando imagens dos produtos Shopee…');
        prepared = await resolveShopeeImageUrls(rows, token);
      }
      setItems(prepared);
      setTotal(prepared.length);
      setPreview(prepared.slice(0, 50).map((row) => ({
        id: row.itemid,
        title: row.title,
        price: Number(row.sale_price || row.price),
        image: row.image_link
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível preparar o lote.');
    } finally { setBusy(''); }
  }

  async function publish() {
    setError('');
    setSuccess('');
    setJobs([]);
    setBusy('Enviando os produtos para a fila de importação em massa…');

    try {
      const created = await enqueueShopeeBulk(items, token);
      const initial = created.map((job) => ({
        id: job.id,
        status: job.status,
        requested_count: job.requested,
        discovered_count: 0,
        imported_count: 0,
        updated_count: 0,
        error_count: 0
      }));
      setJobs(initial);
      setBusy('Acompanhando o processamento dos lotes…');

      const poll = async () => {
        let latest = initial;
        for (let round = 0; round < 120; round += 1) {
          latest = await Promise.all(initial.map(async (job) => {
            const current = await getShopeeJob(token, job.id);
            return {
              ...current,
              displayStatus:
                current.status === 'concluido' ? 'Concluído' :
                current.status === 'concluido_com_erros' ? 'Concluído com erros' :
                current.status === 'falhou' ? 'Falhou' :
                current.status === 'processando' ? 'Processando' :
                'Na fila'
            };
          }));
          setJobs(latest);

          const finished = latest.every((job) =>
            ['concluido', 'concluido_com_erros', 'falhou'].includes(job.status)
          );
          if (finished) return latest;
          await new Promise((resolve) => window.setTimeout(resolve, 3000));
        }
        throw new Error('O acompanhamento excedeu o tempo de espera. Os jobs continuam no Railway; consulte os logs e o worker.');
      };

      const finished = await poll();
      const imported = finished.reduce((sum, job) => sum + job.imported_count, 0);
      const updated = finished.reduce((sum, job) => sum + job.updated_count, 0);
      const errors = finished.reduce((sum, job) => sum + job.error_count, 0);
      setSuccess(imported + updated + ' produtos processados. ' + errors + ' com erro.');
      setBusy('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na importação em massa.');
      setBusy('');
    }
  }

  const input = 'block w-full rounded-xl border border-slate-300 bg-white p-3 mt-2 text-sm';
  const completedCount = jobs.reduce((sum, job) => sum + job.imported_count + job.updated_count, 0);
  const errorCount = jobs.reduce((sum, job) => sum + job.error_count, 0);
  return <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8">
    <div className="max-w-6xl mx-auto">
      <a href="/" className="text-emerald-700 underline">Voltar à vitrine</a>
      <h1 className="text-3xl font-bold mt-6">Importação Shopee em massa</h1>
      <p className="mt-2 text-slate-600">
        Separe os produtos por categoria, confira a prévia e só então envie o lote para o site.
      </p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Modo de busca">
        <button type="button" onClick={() => { reset(); setMode('api'); }} aria-pressed={mode === 'api'} className={'rounded-xl px-4 py-2 font-semibold ' + (mode === 'api' ? 'bg-orange-600 text-white' : 'border bg-white text-slate-700')}>
          Buscar pela API Shopee
        </button>
        <button type="button" onClick={() => { reset(); setMode('csv'); }} aria-pressed={mode === 'csv'} className={'rounded-xl px-4 py-2 font-semibold ' + (mode === 'csv' ? 'bg-orange-600 text-white' : 'border bg-white text-slate-700')}>
          Importar por CSV
        </button>
      </div>
      {mode === 'api' && <p className="mt-2 text-sm text-slate-500">{API_NOTE} Serão preparados até 60 produtos por busca. A API usa o termo informado; ela não seleciona automaticamente a aba de categoria visual da Shopee.</p>}

      <form onSubmit={(e) => { e.preventDefault(); void check(); }} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 mt-6">
        <fieldset disabled={!!busy} className="space-y-5 disabled:opacity-60">
          {mode === 'api' ? <>
            <label className="block font-semibold">1. Categoria de destino no site
              <select className={input} required value={targetCategory} onChange={(e) => { reset(); setTargetCategory(e.target.value); }}>
                <option value="">Selecione a categoria do site</option>
                {CATEGORIES.filter((category) => category !== 'Todas as Categorias').map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="block font-semibold">2. Termo para buscar na Shopee
              <input className={input} required value={keyword} onChange={(e) => { reset(); setKeyword(e.target.value); }} placeholder="Ex.: fone bluetooth" maxLength={100} />
            </label>
          </> : <>
          <label className="block font-semibold">1. Feed de produto da Shopee (CSV)
            <input className={input} type="file" accept=".csv,text/csv" required onChange={(e) => { reset(); setFeed(e.target.files?.[0] || null); }} />
            <span className="text-sm font-normal text-slate-500">Esse arquivo fornece imagem, descrição, categoria, preço e demais dados do produto.</span>
          </label>

          <label className="block font-semibold">2. CSV de links em massa da Shopee (CSV)
            <input className={input} type="file" accept=".csv,text/csv" required={!manual.trim()} onChange={(e) => { reset(); setLinks(e.target.files?.[0] || null); }} />
            <span className="text-sm font-normal text-slate-500">Use o arquivo baixado em “Oferta de Produto → Obter Link”. Ele deve ter “Item Id” e “Offer Link”.</span>
          </label>

          <label className="block font-semibold">Ou informe os IDs e links manualmente <span className="text-sm font-normal text-slate-500">(opcional)</span>
            <textarea className={input} rows={4} value={manual} onChange={(e) => { reset(); setManual(e.target.value); }} placeholder="58217601055 https://s.shopee.com.br/seulink" spellCheck={false} />
          </label>
          </>}

          <label className="block font-semibold">3. Token administrativo
            <input className={input} type="password" autoComplete="off" required value={token} onChange={(e) => { reset(); setToken(e.target.value); }} />
            <span className="text-sm font-normal text-slate-500">Use o INTEGRATION_ADMIN_TOKEN do backend. Não é a senha da Shopee.</span>
          </label>

          <button className="rounded-xl bg-emerald-700 text-white px-5 py-3 font-semibold" type="submit">
            {mode === 'api' ? 'Buscar e preparar prévia' : 'Preparar carga'}
          </button>
        </fieldset>
      </form>

      {busy && <p role="status" className="p-4 mt-4 bg-blue-50 rounded-xl">{busy}</p>}
      {error && <p role="alert" className="p-4 mt-4 bg-red-50 text-red-800 rounded-xl break-words">{error}</p>}
      {success && <p role="status" className="p-4 mt-4 bg-emerald-50 text-emerald-800 rounded-xl">{success} <a className="underline" href="/">Abrir vitrine</a></p>}

      {!!items.length && !jobs.length && <section className="mt-6 bg-white border rounded-2xl p-5">
        <h2 className="text-xl font-bold">Prévia: {total} produtos</h2>
        <p className="text-sm text-slate-600 mt-2">
          {mode === 'api' ? <>Categoria de destino: <strong>{targetCategory}</strong>. Busca: <strong>{keyword}</strong>. Revise a lista antes de enviar.{skipped > 0 ? ' ' + skipped + ' oferta(s) incompleta(s) foram ignoradas.' : ''}</> : <>
          O sistema usa o Feed quando encontra o Item Id. Quando o Item Id não está no Feed, usa automaticamente os dados de Item Name, Price, Product Link e Offer Link do CSV de links em massa. Nada foi enviado ao backend ainda.
          </>}
        </p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead><tr><th className="p-2">Produto</th><th className="p-2">ID</th><th className="p-2">Preço</th></tr></thead>
            <tbody>
              {preview.map((p) => <tr key={p.id} className="border-t">
                <td className="p-2"><div className="flex items-center gap-3"><img className="w-14 h-14 object-contain" src={p.image} alt="" referrerPolicy="no-referrer" /><span>{p.title}</span></div></td>
                <td className="p-2">{p.id}</td>
                <td className="p-2 whitespace-nowrap">{Number.isFinite(p.price) ? p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button disabled={!!busy} onClick={() => void publish()} className="rounded-xl bg-orange-600 text-white px-5 py-3 font-semibold disabled:opacity-50">
            Enviar {total} produtos para importação em massa
          </button>
          <button disabled={!!busy} onClick={() => void repairCatalog()} className="rounded-xl border border-teal-700 text-teal-800 px-5 py-3 font-semibold disabled:opacity-50">
            Restaurar catálogo Shopee
          </button>

        </div>
      </section>}

      {!!jobs.length && <section className="mt-6 bg-white border rounded-2xl p-5">
        <h2 className="text-xl font-bold">Processamento da importação</h2>
        <p className="text-sm text-slate-600 mt-2">
          Processados: {completedCount} de {total}. Erros: {errorCount}.
        </p>
        <div className="mt-4 space-y-3">
          {jobs.map((job) => <div key={job.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <strong>Lote {job.id.slice(0, 8)}</strong>
              <span>{job.displayStatus || job.status}</span>
            </div>
            <div className="text-sm text-slate-600 mt-2">
              {job.imported_count} importados · {job.updated_count} atualizados · {job.error_count} erros de {job.requested_count}
            </div>
            {job.metadata?.lastError && (
              <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-red-50 p-3 text-xs text-red-800">
                {job.metadata.lastError}
              </pre>
            )}
          </div>)}
        </div>
      </section>}
    </div>
  </main>;
}

