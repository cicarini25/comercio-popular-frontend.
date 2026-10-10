import { useState } from 'react';
import { prepareFeed, resolveShopeeImageUrls, enqueueShopeeBulk, getShopeeJob, repairShopeeCatalogState, reclassifyShopeeImportCategories, analyzeShopeeImportJobs, searchShopeeOffers, getShopeeSearchSuggestions, isGeneralShopeeSearch, type FeedItem, type ShopeeJobStatus, type ShopeeCategoryReclassificationResult, type ShopeeAutoCategoryReview } from '../services/shopeeImport';
import { CATEGORIES } from '../data/mockProducts';
import { resolveProductCategory } from '../utils/productCategories';

type Preview = { id: string; title: string; price: number; image: string; category: string };
type JobView = ShopeeJobStatus & { displayStatus?: string };

const API_NOTE = 'Uma busca específica procura o produto digitado e suas variações, mantendo os detalhes informados e filtrando peças e acessórios. Uma busca geral pela categoria combina diferentes tipos de produtos.';

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
  const [categoryFixPrefix, setCategoryFixPrefix] = useState('6d225389');
  const [categoryFixTargetCategory, setCategoryFixTargetCategory] = useState('MOTOS & ACESSÓRIOS');
  const [categoryBatchPreview, setCategoryBatchPreview] = useState<ShopeeCategoryReclassificationResult | null>(null);
  const [autoCategoryPrefixes, setAutoCategoryPrefixes] = useState('3ca15e9a, 61971574');
  const [autoCategoryReview, setAutoCategoryReview] = useState<ShopeeAutoCategoryReview | null>(null);
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

  async function reviewShopeeBatchCategories() {
    setError('');
    setSuccess('');
    setAutoCategoryReview(null);
    setBusy('Analisando os produtos dos lotes e sugerindo as categorias corretas…');
    try {
      const prefixes = autoCategoryPrefixes.split(/[;,\s]+/).map((value) => value.trim()).filter(Boolean);
      const result = await analyzeShopeeImportJobs(prefixes, token, true);
      setAutoCategoryReview(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível analisar os lotes Shopee.');
    } finally {
      setBusy('');
    }
  }

  async function applyShopeeBatchCategories() {
    if (!autoCategoryReview || !autoCategoryReview.jobPrefixes.length) {
      setError('Faça a análise dos lotes antes de aplicar as categorias.');
      return;
    }
    setError('');
    setSuccess('');
    setBusy('Aplicando as categorias sugeridas aos produtos destes lotes…');
    try {
      const result = await analyzeShopeeImportJobs(autoCategoryReview.jobPrefixes, token, false);
      const summary = Object.entries(result.categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => category + ': ' + count)
        .join('; ');
      setAutoCategoryReview(result);
      setSuccess(
        'Análise aplicada a ' + result.totalProducts + ' produto(s). ' +
        (result.updatedCount ?? 0) + ' produto(s) tiveram a categoria/aba atualizada. ' + summary +
        '. Preços, títulos, imagens e links foram preservados.'
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível aplicar a classificação dos lotes.');
    } finally {
      setBusy('');
    }
  }

  async function previewImportedCategories() {
    setError('');
    setSuccess('');
    setCategoryBatchPreview(null);
    setBusy('Conferindo o lote Shopee sem alterar produtos…');
    try {
      const result = await reclassifyShopeeImportCategories(
        categoryFixPrefix, token, categoryFixTargetCategory, true
      );
      setCategoryBatchPreview(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível conferir o lote Shopee.');
    } finally {
      setBusy('');
    }
  }

  async function fixImportedCategories() {
    setError('');
    setSuccess('');
    const previewMatches = categoryBatchPreview
      && categoryBatchPreview.jobPrefix.toLowerCase() === categoryFixPrefix.trim().toLowerCase()
      && categoryBatchPreview.category === categoryFixTargetCategory;
    if (!previewMatches) {
      setError('Confira novamente o lote e a categoria antes de confirmar a transferência.');
      return;
    }
    setBusy('Atualizando somente a categoria dos produtos vinculados a este lote…');
    try {
      const result = await reclassifyShopeeImportCategories(
        categoryFixPrefix, token, categoryFixTargetCategory, false
      );
      setSuccess(
        'Lote ' + result.jobPrefix + ': ' + (result.matchedCount ?? 0) +
        ' produto(s) conferidos; ' + (result.updatedCount ?? 0) +
        ' atualizado(s) para ' + categoryFixTargetCategory +
        '. Preços, imagens, títulos e links foram preservados.'
      );
      setCategoryBatchPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível transferir o lote.');
    } finally {
      setBusy('');
    }
  }

  const suggestions = getShopeeSearchSuggestions(keyword, targetCategory);
  const generalSearch = isGeneralShopeeSearch(keyword, targetCategory);
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
            {suggestions.length > 0 && <div>
              <p className="text-sm text-slate-600 mb-2">{keyword.trim() && !generalSearch ? 'Variações do produto pesquisado' : 'Sugestões para ' + targetCategory}:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((term) => <button key={term} type="button" onClick={() => { reset(); setKeyword(term); }} className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">{term}</button>)}
              </div>
            </div>}
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={filterCategory} onChange={(e) => { reset(); setFilterCategory(e.target.checked); }} className="mt-1" />
              <span><strong>Filtrar produtos pela categoria escolhida</strong><br />Usa o título para reduzir itens fora da categoria. Produtos com títulos pouco claros podem ficar de fora; revise a prévia antes de importar.</span>
            </label>
            {suggestions.length > 0 && <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={completeCategory} onChange={(e) => { reset(); setCompleteCategory(e.target.checked); }} className="mt-1" />
              <span><strong>{generalSearch ? 'Variar os tipos de produtos da categoria' : 'Buscar também variações do mesmo produto'}</strong><br />{generalSearch ? 'Combina as sugestões da categoria para oferecer mais variedade no lote.' : 'Consulta modelos e variações compatíveis com o termo digitado. Desmarque para consultar somente esse termo.'}</span>
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
        <h2 className="text-xl font-bold">Classificar automaticamente produtos já importados</h2>
        <p className="mt-2 text-sm text-slate-600">
          Informe os prefixos dos lotes já processados. A análise usa o título e a categoria de origem para sugerir a aba correta, inclusive MOTOS &amp; ACESSÓRIOS. Primeiro mostra uma prévia sem alterar os produtos; só muda a categoria depois de clicar em aplicar. Preços, títulos, imagens e links são preservados.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); void reviewShopeeBatchCategories(); }} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block font-semibold text-sm flex-1 min-w-64">
            Prefixos dos lotes (separe por vírgula)
            <input
              className={input + ' w-full'}
              value={autoCategoryPrefixes}
              onChange={(e) => { setAutoCategoryPrefixes(e.target.value); setAutoCategoryReview(null); setError(''); setSuccess(''); }}
              placeholder="3ca15e9a, 61971574"
              required
              spellCheck={false}
            />
          </label>
          <button
            className="rounded-xl bg-teal-700 text-white px-5 py-3 font-semibold disabled:opacity-50"
            type="submit"
            disabled={!!busy || !token.trim()}
          >
            Analisar lotes sem alterar
          </button>
        </form>
        {!token.trim() && <p className="mt-2 text-xs text-slate-500">Informe o token administrativo no campo “3. Token administrativo” do formulário principal. Não compartilhe o token no chat.</p>}
        {autoCategoryReview && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold">Resultado da análise: {autoCategoryReview.totalProducts} produto(s) distintos</h3>
            <p className="mt-1 text-sm text-slate-700">
              Categoria sugerida para {autoCategoryReview.motoCount} produto(s): <strong>MOTOS &amp; ACESSÓRIOS</strong>.
              {autoCategoryReview.dryRun
                ? ' Esta prévia não alterou nenhum produto.'
                : ' A classificação foi aplicada aos lotes indicados.'}
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(autoCategoryReview.categoryCounts).sort((a, b) => b[1] - a[1]).map(([category, count]) => (
                <div key={category} className="rounded-lg border bg-white px-3 py-2 text-sm flex justify-between gap-3">
                  <span>{category}</span><strong>{count}</strong>
                </div>
              ))}
            </div>
            {!!autoCategoryReview.jobs.length && (
              <div className="mt-3 text-xs text-slate-600">
                Lotes conferidos: {autoCategoryReview.jobs.map((job) => job.prefix + ' (' + job.linkedProductCount + ' produtos vinculados)').join(' · ')}
              </div>
            )}
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold text-sm">Conferir produtos e categorias sugeridas ({autoCategoryReview.products.length})</summary>
              <div className="mt-3 max-h-96 overflow-auto space-y-2">
                {autoCategoryReview.products.map((product) => (
                  <div key={product.productId} className="rounded-lg border bg-white px-3 py-2 text-sm">
                    <div className="font-medium">{product.title}</div>
                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-slate-600">
                      <span>Atual: {product.currentCategory}</span>
                      <span>→</span>
                      <strong>Sugerida: {product.suggestedCategory}</strong>
                      <span>({product.matchedBy})</span>
                    </div>
                  </div>
                ))}
              </div>
            </details>
            {autoCategoryReview.dryRun && (
              <button
                className="mt-4 rounded-xl bg-emerald-700 text-white px-5 py-3 font-semibold disabled:opacity-50"
                type="button"
                disabled={!!busy || !token.trim() || autoCategoryReview.plannedChanges === 0}
                onClick={() => void applyShopeeBatchCategories()}
              >
                Aplicar classificação dos {autoCategoryReview.totalProducts} produtos
              </button>
            )}
          </div>
        )}
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-xl font-bold">Transferir lote Shopee para outra categoria</h2>
        <p className="mt-2 text-sm text-slate-600">
          Primeiro, confira quantos produtos estão vinculados ao lote e veja uma amostra dos títulos. A conferência não altera nada. Depois da confirmação, somente a categoria dos produtos desse lote será atualizada; preços, imagens, títulos e links de afiliado serão preservados.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); void previewImportedCategories(); }} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block font-semibold text-sm">
            Prefixo do lote (8 primeiros caracteres)
            <input
              className={input}
              value={categoryFixPrefix}
              onChange={(e) => { setCategoryFixPrefix(e.target.value); setCategoryBatchPreview(null); setError(''); setSuccess(''); }}
              pattern="[a-fA-F0-9]{8}"
              maxLength={8}
              required
              spellCheck={false}
            />
          </label>
          <label className="block font-semibold text-sm">
            Categoria de destino
            <select
              className={input}
              value={categoryFixTargetCategory}
              onChange={(e) => { setCategoryFixTargetCategory(e.target.value); setCategoryBatchPreview(null); setError(''); setSuccess(''); }}
              required
            >
              <option value="">Selecione a categoria de destino</option>
              {CATEGORIES.filter((category) => category !== 'Todas as Categorias').map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <button
            className="rounded-xl bg-teal-700 text-white px-5 py-3 font-semibold disabled:opacity-50"
            type="submit"
            disabled={!!busy || !token.trim()}
            title={!token.trim() ? 'Informe o token administrativo no campo acima.' : 'Conferir lote sem alterar os produtos'}
          >
            Conferir lote antes de transferir
          </button>
        </form>
        {!token.trim() && <p className="mt-2 text-xs text-slate-500">Informe o token administrativo no campo “3. Token administrativo” do formulário principal. Não compartilhe o token no chat.</p>}
        {categoryBatchPreview && categoryBatchPreview.jobPrefix.toLowerCase() === categoryFixPrefix.trim().toLowerCase() && categoryBatchPreview.category === categoryFixTargetCategory && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold">Lote {categoryBatchPreview.jobPrefix}</h3>
            <p className="mt-1 text-sm text-slate-700">
              Foram localizados {categoryBatchPreview.matchedCount ?? 0} produto(s) vinculados a este lote para a categoria <strong>{categoryFixTargetCategory}</strong>. Nenhum produto foi alterado nesta etapa.
            </p>
            {!!categoryBatchPreview.preview?.length && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold">Amostra dos produtos e categorias atuais:</p>
                {categoryBatchPreview.preview.map((item) => (
                  <div key={item.id} className="rounded-lg border bg-white px-3 py-2 text-sm">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-slate-500">Categoria atual: {item.category || 'Sem categoria'}</div>
                  </div>
                ))}
                {(categoryBatchPreview.matchedCount ?? 0) > categoryBatchPreview.preview.length && (
                  <p className="text-xs text-slate-500">A amostra mostra os primeiros {categoryBatchPreview.preview.length} produtos; o total do lote aparece acima.</p>
                )}
              </div>
            )}
            <button
              className="mt-4 rounded-xl bg-emerald-700 text-white px-5 py-3 font-semibold disabled:opacity-50"
              type="button"
              disabled={!!busy || !token.trim() || !(categoryBatchPreview.matchedCount ?? 0)}
              onClick={() => void fixImportedCategories()}
            >
              Confirmar transferência de {categoryBatchPreview.matchedCount ?? 0} produto(s)
            </button>
          </div>
        )}
      </section>

      {busy && <p role="status" className="p-4 mt-4 bg-blue-50 rounded-xl">{busy}</p>}
      {error && <p role="alert" className="p-4 mt-4 bg-red-50 text-red-800 rounded-xl break-words">{error}</p>}
      {success && <p role="status" className="p-4 mt-4 bg-emerald-50 text-emerald-800 rounded-xl">{success} <a className="underline" href="/">Abrir vitrine</a></p>}

      {!!items.length && !jobs.length && <section className="mt-6 bg-white border rounded-2xl p-5">
        <h2 className="text-xl font-bold">Prévia: {total} produtos</h2>
        <p className="text-sm text-slate-600 mt-2">
          {mode === 'api' ? <>Categoria de destino: <strong>{targetCategory}</strong>. Busca: <strong>{keyword}</strong>. Revise a lista antes de enviar.{examined > 0 && <> Consultadas {examined} ofertas; {excluded} incompatíveis com a categoria ou com o produto buscado ficaram de fora.</>}{searchTerms.length > 1 && <> Termos consultados: {searchTerms.join(', ')}.</>}{total < 60 && <> Foram encontrados {total} produtos válidos nesta busca; 60 é o limite máximo.</>}{skipped > 0 ? ' ' + skipped + ' oferta(s) incompleta(s) foram ignoradas.' : ''}</> : <>
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

