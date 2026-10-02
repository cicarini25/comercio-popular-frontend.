export type FeedItem = Record<string, string>;

export const MAX_BULK_ITEMS = 30000;
export const DEFAULT_QUEUE_CHUNK_SIZE = 500;

export type ShopeeJob = {
  id: string;
  status: string;
  requested: number;
  worker?: string;
};

export type ShopeeJobStatus = {
  id: string;
  status: string;
  requested_count: number;
  discovered_count: number;
  imported_count: number;
  updated_count: number;
  error_count: number;
  started_at?: string | null;
  finished_at?: string | null;
};

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

export async function readAffiliateLinks(linksFile: File | null, manual = '') {
  const links = new Map<string, string>();
  const add = (id: string, url: string) => {
    id = id.trim(); url = url.trim();
    if (!/^\d+$/.test(id) || !validAffiliate(url)) {
      throw new Error('O arquivo de links precisa conter Item Id numérico e Offer Link https://s.shopee.com.br/ válido.');
    }
    if (links.has(id) && links.get(id) !== url) {
      throw new Error('Dois links diferentes para o produto ' + id + '.');
    }
    links.set(id, url);
  };

  if (linksFile) {
    let headers: string[] | null = null;
    let itemIdIndex = -1;
    let offerLinkIndex = -1;
    for await (const row of csvRows(linksFile)) {
      if (!headers) {
        headers = row.map((s) => s.trim());
        itemIdIndex = headers.indexOf('Item Id');
        offerLinkIndex = headers.indexOf('Offer Link');
        if (itemIdIndex < 0 || offerLinkIndex < 0) {
          throw new Error('A planilha de links precisa das colunas Item Id e Offer Link.');
        }
        continue;
      }
      add(row[itemIdIndex] || '', row[offerLinkIndex] || '');
    }
  }

  for (const line of manual.split(/\r?\n/).filter((s) => s.trim())) {
    const parts = line.trim().split(/[\s;,]+/);
    if (parts.length !== 2) throw new Error('Use uma linha por produto: ID e link separados por espaço.');
    add(parts[0], parts[1]);
  }

  if (!links.size) throw new Error('Envie o CSV de links em massa da Shopee ou informe os links manualmente.');
  if (links.size > MAX_BULK_ITEMS) {
    throw new Error('A importação aceita até ' + MAX_BULK_ITEMS + ' produtos por carga.');
  }
  return links;
}

export async function prepareFeed(feed: File, linksFile: File | null, manual = '') {
  const links = await readAffiliateLinks(linksFile, manual);
  const items: FeedItem[] = [];
  let headers: string[] | null = null;
  const found = new Set<string>();

  for await (const row of csvRows(feed)) {
    if (!headers) {
      headers = row.map((s) => s.trim());
      for (const key of ['itemid', 'title', 'price', 'product_link', 'image_link']) {
        if (!headers.includes(key)) {
          throw new Error('O feed precisa da coluna ' + key + '. Use o CSV do Feed de produto da Shopee.');
        }
      }
      continue;
    }

    const id = row[headers.indexOf('itemid')]?.trim();
    if (!id || !links.has(id)) continue;
    if (found.has(id)) throw new Error('Produto ' + id + ' duplicado no feed.');

    found.add(id);
    const item = Object.fromEntries(headers.map((h, i) => [h, row[i] || '']));
    items.push({ ...item, affiliateUrl: links.get(id)! });
  }

  const missing = [...links.keys()].filter((id) => !found.has(id));
  if (missing.length) {
    const shown = missing.slice(0, 25).join(', ');
    const extra = missing.length > 25 ? ' e mais ' + (missing.length - 25) : '';
    throw new Error('Produtos ausentes neste feed: ' + shown + extra + '. Nada foi importado. Use um feed que contenha os mesmos Item Ids da planilha de links em massa.');
  }
  return items;
}

export function toBulkPayload(items: FeedItem[]): FeedItem[] {
  return items.map((item) => ({
    itemid: item.itemid,
    title: item.title,
    price: item.price,
    sale_price: item.sale_price || '',
    description: (item.description || '').slice(0, 5000),
    global_category1: item.global_category1 || '',
    shop_name: item.shop_name || '',
    image_link: item.image_link,
    product_link: item.product_link,
    affiliateUrl: item.affiliateUrl
  }));
}

function apiBaseUrl() {
  return (import.meta.env.VITE_API_URL || 'https://comercio-popular-backend-production.up.railway.app/api').replace(/\/+$/, '').replace(/\/api$/, '');
}

export async function enqueueShopeeBulk(items: FeedItem[], token: string, chunkSize = DEFAULT_QUEUE_CHUNK_SIZE): Promise<ShopeeJob[]> {
  if (!items.length) throw new Error('Nenhum produto pronto para enfileirar.');
  if (!token.trim()) throw new Error('Informe o token administrativo.');

  const safeChunk = Math.max(1, Math.min(Number(chunkSize) || DEFAULT_QUEUE_CHUNK_SIZE, DEFAULT_QUEUE_CHUNK_SIZE));
  const payloadItems = toBulkPayload(items);
  const jobs: ShopeeJob[] = [];

  for (let start = 0; start < payloadItems.length; start += safeChunk) {
    const chunk = payloadItems.slice(start, start + safeChunk);
    const response = await fetch(apiBaseUrl() + '/api/integrations/shopee/import-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token.trim()
      },
      body: JSON.stringify({ items: chunk })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'Falha HTTP ' + response.status + ' ao criar o lote.');
    }
    jobs.push(result.job as ShopeeJob);
  }

  return jobs;
}

export async function getShopeeJob(token: string, jobId: string): Promise<ShopeeJobStatus> {
  const response = await fetch(apiBaseUrl() + '/api/integrations/jobs/' + encodeURIComponent(jobId), {
    headers: { Authorization: 'Bearer ' + token.trim() }
  });
  const result = await response.json();
  if (!response.ok || !result.job) {
    throw new Error(result.error || 'Falha HTTP ' + response.status + ' ao consultar o job.');
  }
  return result.job as ShopeeJobStatus;
}
