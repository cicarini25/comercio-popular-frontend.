import { useState, type FormEvent } from 'react';
import {
  readSheinCsv,
  sendSheinFeed,
  type SheinItem,
  type SheinProductPreview
} from '../services/sheinImport';

export default function SheinImportAdmin() {
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState('');
  const [items, setItems] = useState<SheinItem[]>([]);
  const [preview, setPreview] = useState<SheinProductPreview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [finished, setFinished] = useState(false);

  function reset() {
    setItems([]);
    setPreview([]);
    setError('');
    setNotice('');
    setFinished(false);
  }

  async function prepare(event: FormEvent) {
    event.preventDefault();
    reset();
    setBusy(true);
    try {
      if (!file) throw new Error('Selecione a planilha CSV.');
      const rows = await readSheinCsv(file);
      const result = await sendSheinFeed(rows, token, true);
      setItems(rows);
      setPreview(result.products || []);
      setNotice('Prévia pronta: ' + result.count + ' produtos validados. Nada foi gravado.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível validar a planilha.');
    } finally {
      setBusy(false);
    }
  }

  async function importProducts() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await sendSheinFeed(items, token, false);
      const imported = (result.offers || []).filter((offer) => offer.action === 'imported').length;
      const updated = (result.offers || []).filter((offer) => offer.action === 'updated').length;
      setNotice('Concluído: ' + imported + ' novos produtos e ' + updated + ' atualizados.');
      setFinished(true);
      setToken('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível gravar os produtos.');
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const content = '\uFEFFid;titulo;preco;preco_original;imagem_url;link_afiliado;link_produto;categoria;descricao\r\n';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modelo-importacao-shein.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const inputClass = 'block w-full rounded-xl border border-slate-300 bg-white p-3 mt-2 text-sm';
  const previewItems = preview.slice(0, 50);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-emerald-700 underline">Voltar à vitrine</a>
        <h1 className="mt-6 text-3xl font-bold">Importação SHEIN</h1>
        <p className="mt-2 text-slate-600">
          Envie uma planilha CSV, confira os produtos e só então confirme a gravação no catálogo.
          São aceitos até 200 produtos por lote.
        </p>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Um OneLink de campanha ou cupom abre uma página promocional; ele não fornece os dados de cada produto.
          Para cada linha, use o link afiliado individual do produto, mais ID, título, preço e imagem.
        </div>

        <form onSubmit={(event) => void prepare(event)} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <fieldset disabled={busy || finished} className="space-y-5 disabled:opacity-60">
            <div>
              <label className="font-semibold" htmlFor="shein-csv">Planilha SHEIN (CSV)</label>
              <input
                id="shein-csv"
                className={inputClass}
                type="file"
                accept=".csv,text/csv"
                required
                onChange={(event) => { reset(); setFile(event.target.files?.[0] || null); }}
              />
              <p className="mt-1 text-sm font-normal text-slate-500">
                Colunas obrigatórias: id, titulo, preco, imagem_url e link_afiliado.
                Preço original, URL do produto, categoria e descrição são opcionais.
              </p>
              <button type="button" onClick={downloadTemplate} className="mt-2 text-sm font-semibold text-emerald-700 underline">
                Baixar modelo CSV
              </button>
            </div>

            <label className="block font-semibold" htmlFor="shein-admin-token">
              Token administrativo da Railway
              <input
                id="shein-admin-token"
                className={inputClass}
                type="password"
                autoComplete="off"
                required
                value={token}
                onChange={(event) => { reset(); setToken(event.target.value); }}
              />
              <span className="mt-1 block text-sm font-normal text-slate-500">
                É o INTEGRATION_ADMIN_TOKEN do backend, não a senha nem o ID de afiliado SHEIN.
                O token fica apenas nesta página enquanto ela estiver aberta.
              </span>
            </label>

            <button type="submit" className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">
              Validar e mostrar prévia
            </button>
          </fieldset>
        </form>

        {busy && <p role="status" className="mt-4 rounded-xl bg-blue-50 p-4">Processando planilha…</p>}
        {error && <p role="alert" className="mt-4 break-words rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-900">{notice}</p>}

        {!!preview.length && (
          <section className="mt-6 rounded-2xl border bg-white p-5">
            <h2 className="text-xl font-bold">Prévia: {items.length} produtos</h2>
            <p className="mt-2 text-sm text-slate-600">
              Revise os dados abaixo. A gravação cria ou atualiza os produtos no catálogo e suas ofertas afiliadas.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr><th className="p-2">Produto</th><th className="p-2">ID</th><th className="p-2">Preço</th></tr></thead>
                <tbody>
                  {previewItems.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <img className="h-14 w-14 rounded object-contain" src={product.image} alt="" referrerPolicy="no-referrer" />
                          <span>{product.title}</span>
                        </div>
                      </td>
                      <td className="p-2">{product.id}</td>
                      <td className="whitespace-nowrap p-2">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length > previewItems.length && (
                <p className="mt-2 text-sm text-slate-500">Mostrando os primeiros {previewItems.length}; o lote contém {items.length} produtos.</p>
              )}
            </div>
            {!finished && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void importProducts()}
                className="mt-5 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
              >
                Gravar {items.length} produtos no catálogo
              </button>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
