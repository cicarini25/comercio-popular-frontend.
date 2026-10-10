import { useState } from 'react';
import { prepareFeed, resolveShopeeImageUrls, enqueueShopeeBulk, getShopeeJob, repairShopeeCatalogState, reclassifyShopeeImportCategories, searchShopeeOffers, SHOPEE_SEARCH_SUGGESTIONS, type FeedItem, type ShopeeJobStatus } from '../services/shopeeImport';
import { CATEGORIES } from '../data/mockProducts';
import { resolveProductCategory } from '../utils/productCategories';

type Preview = { id: string; title: string; price: number; image: string; category: string };
type JobView = ShopeeJobStatus & { displayStatus?: string };

const API_NOTE = 'Busque pelo tipo de produto. O filtro de categoria retira da prévia os títulos que não combinam com a seção escolhida.';

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
  const [excluded, setExcluded] = useState(0);
  const [examined, setExamined] = useState(0);
  const [filterCategory, setFilterCategory] = useState(true);
  const [completeCategory, setCompleteCategory] = useState(true);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobView[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoryFixPrefix, setCategoryFixPrefix] = useState('83e72945');
  const reset = () => { setItems([]); setPreview([]); setTotal(0); setSkipped(0); setExcluded(0); setExamined(0); setSearchTerms([]); setJobs([]); setError(''); setSuccess(''); };

  async function check() {
    reset();
    try {
      let prepared: FeedItem[];
      if (mode === 'api') {
        setBusy('Consultando ofertas na API da Shopee e preparando a prévia…');
        const result = await searchShopeeOffers(keyword, targetCategory, token, 60, filterCategory, completeCategory);
        prepared = result.items;
        setSkipped(result.skipped);
        setExcluded(result.excluded);
        setExamined(result.examined);
        setSearchTerms(result.searchTerms);
      } else {
        setBusy('Lendo o Feed Shopee e cruzando os Item Ids com os Offer Links…');
        if (!token.trim()) throw new Error('Informe o token administrativo.');
        if (!feed && !links) throw new Error('Selecione o CSV de links em massa ou um feed com os IDs e links manuais.');
        const rows = await prepareFeed(feed, links, manual, targetCategory);
        setBusy('Recuperando imagens dos produtos Shopee…');
        prepared = await resolveShopeeImageUrls(rows, token, (done, count) => {
          setBusy('Recuperando imagens dos produtos Shopee: ' + done + ' de ' + count + '…');
        });
      }
      setItems(prepared);
      setTotal(prepared.length);
      setPreview(prepared.map((row) => ({
        id: row.itemid,
        title: row.title,
        price: Number(row.sale_price || row.price),
        image: row.image_link,
        category: row.categoryOverride || resolveProductCategory(row.global_category1, row.title, row.description)
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
      const initial: JobView[] = created.map((job) => ({
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
      const failed = finished.filter((job) => job.status === 'falhou');
      if (failed.length) {
        const reason = failed.find((job) => job.metadata?.lastError)?.metadata?.lastError;
        throw new Error(
          imported + updated + ' produtos processados. ' + failed.length +
          ' lote(s) falharam.' + (reason ? ' ' + reason : ' Confira os detalhes abaixo.')
        );
      }
      setSuccess(imported + updated + ' produtos processados. ' + errors + ' com erro.');
      setBusy('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na importação em massa.');
      setBusy('');
    }
  }

  async function repairCatalog() {
    setError('');
    setSuccess('');
    setBusy('Restaurando o catálogo Shopee…');
    try {
      const result = await repairShopeeCatalogState(token);
      setSuccess('Catálogo restaurado: ' + result.repaired_products + ' produtos e ' + result.repaired_offers + ' ofertas.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível restaurar o catálogo.');
    } finally { setBusy(''); }
  }

  async function fixImportedCategories() {
    setError('');
    setSuccess('');
    setBusy('Corrigindo somente as categorias dos produtos deste lote Shopee…');
    try {
      const result = await reclassifyShopeeImportCategories(categoryFixPrefix, token);
      setSuccess(
        'Lote ' + result.jobPrefix + ': ' + result.updatedCount +
        ' produto(s) ajustado(s), sendo ' + result.utilidades + ' em Utilidades e ' +
        result.brinquedos + ' em Brinquedos. Preços, imagens e links foram preservados.'
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível corrigir as categorias do lote.');
    } finally {
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
      {mode === 'api' && <p className="mt-2 text-sm text-slate-500">{API_NOTE} A busca procura até 60 produtos compatíveis e pode consultar mais ofertas para completar o lote. A quantidade depende das ofertas disponíveis. Confira as imagens e retire da prévia qualquer item inadequado.</p>}

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
            {(SHOPEE_SEARCH_SUGGESTIONS[targetCategory] || []).length > 0 && <div>
              <p className="text-sm text-slate-600 mb-2">Sugestões para {targetCategory}:</p>
              <div className="flex flex-wrap gap-2">
                {SHOPEE_SEARCH_SUGGESTIONS[targetCategory].map((term) => <button key={term} type="button" onClick={() => { reset(); setKeyword(term); }} className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">{term}</button>)}
              </div>
            </div>}
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={filterCategory} onChange={(e) => { reset(); setFilterCategory(e.target.checked); }} className="mt-1" />
              <span><strong>Filtrar produtos pela categoria escolhida</strong><br />Usa o título para reduzir itens fora da categoria. Produtos com títulos pouco claros podem ficar de fora; revise a prévia antes de importar.</span>
            </label>
            {filterCategory && (SHOPEE_SEARCH_SUGGESTIONS[targetCategory] || []).length > 0 && <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={completeCategory} onChange={(e) => { reset(); setCompleteCategory(e.target.checked); }} className="mt-1" />
              <span><strong>Completar lote com buscas da mesma categoria</strong><br />Quando faltarem produtos, usa também os termos sugeridos acima. Desmarque para pesquisar somente o termo informado.</span>
            </label>}
          </> : <>
          <label className="block font-semibold">Categoria de destino no site <span className="text-sm font-normal text-slate-500">(opcional)</span>
            <select className={input} value={targetCategory} onChange={(e) => { reset(); setTargetCategory(e.target.value); }}>
              <option value="">Usar as categorias do arquivo</option>
              {CATEGORIES.filter((category) => category !== 'Todas as Categorias').map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <span className="text-sm font-normal text-slate-500">Escolha uma categoria quando todos os produtos do lote pertencem à mesma aba.</span>
          </label>
          <label className="block font-semibold">1. Feed de produto da Shopee (CSV) — opcional com o CSV de links completo
            <input className={input} type="file" accept=".csv,text/csv" required={!links} onChange={(e) => { reset(); setFeed(e.target.files?.[0] || null); }} />
            <span className="text-sm font-normal text-slate-500">Fornece as imagens e os dados completos. Sem ele, o sistema usa o CSV de links e tenta recuperar as imagens na Shopee.</span>
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

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-xl font-bold">Corrigir categorias do lote já importado</h2>
        <p className="mt-2 text-sm text-slate-600">
          Corrige somente produtos ligados ao lote indicado. Luminárias e abajures vão para Utilidades; caminhão de controle remoto vai para Brinquedos. Os outros produtos e os dados comerciais ficam intactos.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); void fixImportedCategories(); }} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block font-semibold text-sm">
            Prefixo do lote (8 primeiros caracteres)
            <input
              className={input}
              value={categoryFixPrefix}
              onChange={(e) => setCategoryFixPrefix(e.target.value)}
              pattern="[a-fA-F0-9]{8}"
              maxLength={8}
              required
              spellCheck={false}
            />
          </label>
          <button
            className="rounded-xl bg-teal-700 text-white px-5 py-3 font-semibold disabled:opacity-50"
            type="submit"
            disabled={!!busy || !token.trim()}
            title={!token.trim() ? 'Informe o token administrativo no campo abaixo do formulário principal.' : 'Corrigir categorias deste lote'}
          >
            Corrigir categorias deste lote
          </button>
        </form>
        {!token.trim() && <p className="mt-2 text-xs text-slate-500">Informe o token administrativo no campo “3. Token administrativo” do formulário acima; não compartilhe o token no chat.</p>}
      </section>

      {busy && <p role="status" className="p-4 mt-4 bg-blue-50 rounded-xl">{busy}</p>}
      {error && <p role="alert" className="p-4 mt-4 bg-red-50 text-red-800 rounded-xl break-words">{error}</p>}
      {success && <p role="status" className="p-4 mt-4 bg-emerald-50 text-emerald-800 rounded-xl">{success} <a className="underline" href="/">Abrir vitrine</a></p>}

      {!!items.length && !jobs.length && <section className="mt-6 bg-white border rounded-2xl p-5">
        <h2 className="text-xl font-bold">Prévia: {total} produtos</h2>
        <p className="text-sm text-slate-600 mt-2">
          {mode === 'api' ? <>Categoria de destino: <strong>{targetCategory}</strong>. Busca: <strong>{keyword}</strong>. Revise a lista antes de enviar.{examined > 0 && <> Consultadas {examined} ofertas; {excluded} fora da categoria ficaram de fora.</>}{searchTerms.length > 1 && <> Termos consultados: {searchTerms.join(', ')}.</>}{total < 60 && <> Foram encontrados {total} produtos válidos nesta busca; 60 é o limite máximo.</>}{skipped > 0 ? ' ' + skipped + ' oferta(s) incompleta(s) foram ignoradas.' : ''}</> : <>
          {targetCategory && <>Categoria de destino: <strong>{targetCategory}</strong>. </>}O sistema usa o feed quando encontra o Item Id. Para os demais produtos, usa os dados do CSV de links e recupera as imagens. Confira a categoria de cada produto abaixo. Nada foi publicado ainda.
          </>}
        </p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead><tr><th className="p-2">Produto</th><th className="p-2">ID</th><th className="p-2">Categoria</th><th className="p-2">Preço</th><th className="p-2">Revisão</th></tr></thead>
            <tbody>
              {preview.map((p) => <tr key={p.id} className="border-t">
                <td className="p-2"><div className="flex items-center gap-3"><img className="w-14 h-14 object-contain" src={p.image} alt="" referrerPolicy="no-referrer" /><span>{p.title}</span></div></td>
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.category}</td>
                <td className="p-2 whitespace-nowrap">{Number.isFinite(p.price) ? p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</td>
                <td className="p-2"><button type="button" disabled={!!busy} onClick={() => { setItems((current) => current.filter((row) => row.itemid !== p.id)); setPreview((current) => current.filter((row) => row.id !== p.id)); setTotal((current) => Math.max(0, current - 1)); }} className="rounded-lg border border-red-200 text-red-700 px-3 py-2 whitespace-nowrap" aria-label={'Retirar da prévia: ' + p.title}>Retirar da prévia</button></td>
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

