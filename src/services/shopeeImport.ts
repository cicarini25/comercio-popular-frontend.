export type FeedItem = Record<string, string>;

// Incremental CSV parser: quoted commas, escaped quotes and multiline descriptions.
export async function* csvRows(file: Blob): AsyncGenerator<string[]> {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let row: string[] = [], field = '', quoted = false, quotePending = false;
  let skipLF = false, first = true;
  try {
    while (true) {
      const { value, done } = await reader.read();
      const chunk = decoder.decode(value, { stream: !done });
      for (const c of chunk) {
        if (first) { first = false; if (c === '\uFEFF') continue; }
        if (skipLF) { skipLF = false; if (c === '\n') continue; }
        if (quoted) {
          if (!quotePending) {
            if (c === '"') quotePending = true; else field += c;
            continue;
          }
          if (c === '"') { field += '"'; quotePending = false; continue; }
          quoted = false; quotePending = false;
          if (c !== ',' && c !== '\r' && c !== '\n') throw new Error('CSV inválido após aspas.');
        }
        if (c === '"' && field === '') quoted = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\r' || c === '\n') {
          row.push(field); if (row.some(Boolean)) yield row;
          row = []; field = ''; skipLF = c === '\r';
        } else field += c;
      }
      if (done) break;
    }
    if (quoted && !quotePending) throw new Error('CSV com aspas sem fechamento.');
    if (field || row.length) { row.push(field); yield row; }
  } finally { await reader.cancel(); reader.releaseLock(); }
}

export function validAffiliate(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname === 's.shopee.com.br' &&
      !u.username && !u.password && !u.port && !u.search && !u.hash && /^\/[A-Za-z0-9]+$/.test(u.pathname);
  } catch { return false; }
}

export async function prepareFeed(feed: File, linksFile: File | null, manual: string) {
  const links = new Map<string, string>();
  const add = (id: string, url: string) => {
    id = id.trim(); url = url.trim();
    if (!/^\d+$/.test(id) || !validAffiliate(url)) throw new Error('Informe o ID numérico e um link https://s.shopee.com.br/ válido.');
    if (links.has(id) && links.get(id) !== url) throw new Error(`Dois links diferentes para o produto ${id}.`);
    links.set(id, url);
  };
  if (linksFile) {
    let headers: string[] | null = null;
    for await (const row of csvRows(linksFile)) {
      if (!headers) {
        headers = row.map(s => s.trim());
        if (!headers.includes('Item Id') || !headers.includes('Offer Link')) throw new Error('A planilha de links precisa das colunas Item Id e Offer Link.');
      } else add(row[headers.indexOf('Item Id')] || '', row[headers.indexOf('Offer Link')] || '');
    }
  }
  for (const line of manual.split(/\r?\n/).filter(s => s.trim())) {
    const parts = line.trim().split(/[\s;,]+/);
    if (parts.length !== 2) throw new Error('Use uma linha por produto: ID e link separados por espaço.');
    add(parts[0], parts[1]);
  }
  if (!links.size || links.size > 100) throw new Error('Selecione de 1 a 100 produtos por lote.');
  const items: FeedItem[] = [];
  let headers: string[] | null = null;
  const found = new Set<string>();
  for await (const row of csvRows(feed)) {
    if (!headers) {
      headers = row.map(s => s.trim());
      for (const key of ['itemid', 'title', 'price', 'product_link', 'image_link']) {
        if (!headers.includes(key)) throw new Error(`O feed precisa da coluna ${key}. Use o CSV do Feed de produto.`);
      }
      continue;
    }
    const id = row[headers.indexOf('itemid')];
    if (!links.has(id)) continue;
    if (found.has(id)) throw new Error(`Produto ${id} duplicado no feed.`);
    found.add(id);
    const item = Object.fromEntries(headers.map((h, i) => [h, row[i] || '']));
    items.push({ ...item, affiliateUrl: links.get(id)! });
  }
  const missing = [...links.keys()].filter(id => !found.has(id));
  if (missing.length) throw new Error(`Produtos ausentes neste feed: ${missing.join(', ')}. Nada foi importado. Remova-os da lista ou use um feed que os contenha.`);
  return items;
}
