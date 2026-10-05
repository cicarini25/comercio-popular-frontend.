export type SheinItem = {
  id: string;
  titulo: string;
  preco: string;
  preco_original?: string;
  imagem_url: string;
  link_afiliado: string;
  link_produto?: string;
  categoria?: string;
  descricao?: string;
};

export type SheinProductPreview = {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  image: string;
  affiliateUrl: string;
  productUrl: string | null;
  category: string;
};

export type SheinImportResult = {
  ok: boolean;
  marketplace: string;
  dryRun?: boolean;
  count: number;
  products?: SheinProductPreview[];
  offers?: Array<{ itemId: string; action: string }>;
};

const MAX_ITEMS = 200;

function delimiterFor(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  return (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
}

function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, '');
  const delimiter = delimiterFor(input);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error('CSV inválido: há uma aspa sem fechamento.');
  row.push(field);
  if (row.some((value) => value.trim() !== '')) rows.push(row);
  if (!rows.length) throw new Error('A planilha está vazia.');
  return rows;
}

function normalizeHeader(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function readSheinCsv(file: File): Promise<SheinItem[]> {
  if (file.size > 2 * 1024 * 1024) throw new Error('A planilha excede 2 MB.');
  const rows = parseCsv(await file.text());
  const headers = rows[0].map(normalizeHeader);
  const rowsById = new Set<string>();

  const aliases: Record<string, string[]> = {
    id: ['id', 'itemid', 'goodsid', 'idexterno'],
    title: ['titulo', 'title', 'productname'],
    price: ['preco', 'price', 'saleprice'],
    image: ['imagemurl', 'imagelink', 'imageurl'],
    affiliate: ['linkafiliado', 'affiliateurl'],
    original: ['precooriginal', 'originalprice'],
    product: ['linkproduto', 'productlink', 'producturl'],
    category: ['categoria', 'category'],
    description: ['descricao', 'description']
  };

  const column = (name: keyof typeof aliases) => headers.findIndex((header) => aliases[name].includes(header));
  const required = [
    ['id', 'ID'],
    ['title', 'título'],
    ['price', 'preço'],
    ['image', 'URL da imagem'],
    ['affiliate', 'link de afiliado']
  ] as const;

  for (const [name, label] of required) {
    if (column(name) < 0) throw new Error('Falta a coluna obrigatória: ' + label + '.');
  }

  const dataRows = rows.slice(1);
  if (!dataRows.length) throw new Error('Adicione pelo menos um produto à planilha.');
  if (dataRows.length > MAX_ITEMS) throw new Error('O limite é de 200 produtos por envio.');

  const get = (row: string[], name: keyof typeof aliases) => {
    const index = column(name);
    return index < 0 ? '' : (row[index] || '').trim();
  };

  return dataRows.map((row, index) => {
    const line = index + 2;
    const id = get(row, 'id');
    const title = get(row, 'title');
    const price = get(row, 'price');
    const image = get(row, 'image');
    const affiliate = get(row, 'affiliate');

    if (!/^\d+$/.test(id)) throw new Error('Linha ' + line + ': ID numérico inválido.');
    if (rowsById.has(id)) throw new Error('Linha ' + line + ': ID duplicado (' + id + ').');
    rowsById.add(id);
    if (!title || !price || !image || !affiliate) {
      throw new Error('Linha ' + line + ': preencha ID, título, preço, imagem e link afiliado.');
    }

    const item: SheinItem = {
      id,
      titulo: title,
      preco: price,
      imagem_url: image,
      link_afiliado: affiliate
    };
    const original = get(row, 'original');
    const product = get(row, 'product');
    const category = get(row, 'category');
    const description = get(row, 'description');
    if (original) item.preco_original = original;
    if (product) item.link_produto = product;
    if (category) item.categoria = category;
    if (description) item.descricao = description;
    return item;
  });
}

function apiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL || 'https://comercio-popular-backend-production.up.railway.app/api';
  return configured.replace(/\/+$/, '').replace(/\/api$/, '');
}

export async function sendSheinFeed(items: SheinItem[], token: string, dryRun: boolean): Promise<SheinImportResult> {
  if (!items.length) throw new Error('Não há produtos preparados.');
  if (!token.trim()) throw new Error('Informe o token administrativo da integração.');

  const response = await fetch(apiBaseUrl() + '/api/integrations/shein/import-feed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.trim()
    },
    body: JSON.stringify({ items, dryRun }),
    signal: AbortSignal.timeout(30000)
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || 'A API recusou a importação (HTTP ' + response.status + ').');
  }
  return result as SheinImportResult;
}
