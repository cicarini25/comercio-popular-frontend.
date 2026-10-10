import { CATEGORIES } from '../data/mockProducts';

export type FeedItem = Record<string, string>;

export type ShopeeApiSearchResult = {
  items: FeedItem[];
  skipped: number;
  excluded: number;
  examined: number;
  searchTerms: string[];
};

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
  metadata?: { lastError?: string; attempts?: number } | null;
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


const searchText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const childTerms = /\b(infantil|infantis|bebe|bebes|crianca|criancas|kids|meninos?|meninas?|juvenil|[1-9] anos|1[0-6] anos)\b/;
const clothingTerms = /\b(camisetas?|camisas?|blusas?|moletom|moletons|calcas?|shorts?|bermudas?|saias?|vestidos?|roupas?|jaquetas?|croppeds?|lingeries?|meias?|pijamas?|macacoes?|macaquinho|macaquinhos|bodies|body|bodi|bata|batas|casacos?|cardigans?|sueter|sueteres|regatas?|sutias?|calcinhas?|cuecas?|biquinis?|maios?|legging|leggings)\b/;
const footwearTerms = /\b(tenis|sandalias?|sapatos?|chinelos?|chuteiras?|botas?|botinas?|calcados?|mocassim|mocassins|sapatilhas?|sapatenis|coturnos?|tamancos?)\b/;
const petTerms = /\b(pets?|gatos?|cachorros?|caes|racao|racoes|coleira|arranhador|aquario|peitoral para cachorro)\b/;
const furnitureTerms = /\b(sofa|sofas|cadeiras?|poltrona|armario|guarda roupa|roupeiro|estante|escrivaninha|comoda|rack|aparador|criado mudo|balcao|gabinete|sapateira|beliche|berco|cama|colchao|mesas?)\b/;
const furnitureAccessories = /\b(centro de mesa|mesa posta|mesa de som|mesa digitalizadora|mesa de luz|mesa de corte|cama elastica|cama para pet|toalha|toalhas|capa|capas|forro|lencol|lencois|colcha|edredom|cobre leito|protetor|puxador|dobradica|corredica|rodizio|pezinho|adesivo|caneta|canetas|cachepot|lembrancinha|lembrancinhas|decoracao de festa|enfeite|enfeites|organizador de cabos|organizador para cabos|suporte para monitor|suporte para tv|prateleira.{0,20}(monitor|tv)|porta paliteiro|paliteiro|porta guardanapo|jogo americano|mouse pad|mousepad|ventilador|luminaria|abajur|relogio|tapete|brinquedo|miniatura|boneca|bonecas|casa de boneca|cortador|carimbo|pasta americana|tabua|bandeja|peneira|escorredor|churrasqueira|fogareiro|materiais? para|pecas? para|acessorios? para|kit de montagem)\b/;

// Identifica o aparelho principal e descarta anúncios de componentes vendidos à parte.
const applianceTerms = /\b(geladeiras?|refrigeradores?|freezers?|frigobar|fogao|fogoes|cooktop|microondas|micro ondas|lavadoras?|maquina de lavar|lava roupas?|lava loucas|secadora|tanquinho|air fryer|airfryer|fritadeira eletrica|cafeteiras?|liquidificadores?|batedeiras?|mixers?|aspiradores?|robo aspirador|sanduicheiras?|torradeiras?|ar condicionado|ventiladores?|climatizadores?|purificadores? de agua|bebedouros?|espremedor eletrico|panela eletrica|chaleira eletrica|grill eletrico|forno eletrico|ferro de passar|ferro a vapor)\b/;
const appliancePartTerms = /\b(forro|forros|papel|silicone|panela|panelas|chapa|chapas|tapete|tapetes|pegador|pegadores|pinca|pincas|tigela|tigelas|botao|desengordurante|spray|limpa|limpeza|pecas?|acessorios?|capas?|capinhas?|suportes?|bases?|pedestais?|filtros?|refil|refis|borrachas?|vedacoes?|anel|aneis|mangueiras?|cabos?|adaptadores?|plugues?|tomadas?|resistencias?|termostatos?|sensores?|placas?|motores?|helices?|turbinas?|correias?|rolamentos?|engrenagens?|botoes?|puxadores?|tampas?|copos?|jarras?|laminas?|cestos?|cestas?|bandejas?|formas?|protetores?|adesivos?|rodizios?|pes|peneiras?|sacos?|escovas?|bocais?|dutos?|prateleiras?|gavetas?|dobradicas?|travas?|fusivel|fusiveis|capacitores?|controles?)\b/;

const importCategoryRules: Record<string, RegExp> = {
  'Casa & Cozinha': /\b(panela|frigideira|prato|talher|copo|taca|pote|garrafa|chaleira|jarra|faqueiro|utensilio|confeitaria|cozinha|biscoito|paliteiro)\b/,
  'Casa & Construção': /\b(ferramenta|furadeira|parafusadeira|serra|motosserra|solda|nivel|trena|parafuso|broca|torneira|tinta|pedreiro|construcao|desempenadeira|espatula|alicate|martelo|chave|jardinagem)\b/,
  'Eletrodomésticos': /\b(geladeira|refrigerador|fogao|microondas|micro ondas|lavadora|lava roupa|air fryer|airfryer|cafeteira|liquidificador|batedeira|aspirador|sanduicheira|ar condicionado|ventilador|espremedor eletrico)\b/,
  'Computadores': /\b(computador|desktop|pc|placa mae|placa de video|memoria ram|processador|monitor|mouse|teclado|ssd|hd externo|webcam)\b/,
  'Notebook': /\b(notebook|laptop|chromebook)\b/,
  'Smartphones': /\b(smartphone|celular|iphone|samsung galaxy|xiaomi|motorola|poco|redmi)\b/,
  'Acessórios para celulares': /\b(capa|capinha|pelicula|carregador|cabo|power bank|suporte|adaptador|bateria|lente|fone)\b/,
  'Aparelhos de Som': /\b(caixa de som|alto falante|soundbar|amplificador|receiver|home theater|aparelho de som|radio|microfone)\b/,
  'Fones & Headphones': /\b(fone|fones|headphone|headphones|headset|earbud|earbuds|earphone|tws)\b/,
  'Instrumentos Musicais': /\b(violao|guitarra|violino|ukulele|cavaquinho|teclado musical|piano|bateria musical|saxofone|flauta|instrumento musical|pedal|cordas)\b/,
  'AUTO & ACESSÓRIOS': /\b(carro|automotivo|automotiva|veiculo|motor|radiador|ventoinha|chicote|pistao|biela|virabrequim|valvula|chevrolet|renault|ford|fiat|toyota|volkswagen|hyundai|honda|nissan)\b/,
  'MOTOS & ACESSÓRIOS': /\b(moto|motocicleta|capacete|motoboy|motoqueiro|motociclista|cb|cg|biz|titan|bros|factor|fazer)\b/,
  'TVs': /\b(tv|televisor|televisao|smart tv)\b/,
  'Esportes & Lazer': /\b(esporte|fitness|academia|halter|esteira|bicicleta|camping|barraca|bola|futebol|raquete|pesca|natacao|treino)\b/,
  'Bike Elétrica e Acessórios': /\b(bike|bicicleta|scooter|patinete|e bike|ebike)\b/,
  'Cuidado & Beleza': /\b(beleza|cosmetico|maquiagem|perfume|skincare|creme|hidratante|shampoo|cabelo|manicure|unha|unhas|esmalte|escova|secador|protetor solar)\b/,
  'Alimentos & Bebidas': /\b(cafe|cha|alimento|bebida|suplemento|chocolate|arroz|feijao|biscoito|doce|mel|azeite|vinho)\b/,
};

export const SHOPEE_SEARCH_SUGGESTIONS: Record<string, string[]> = {
  "Alimentos & Bebidas": ["café","chocolate","azeite","chá","suplemento alimentar"],
  "Cuidado & Beleza": ["maquiagem","perfume","shampoo","hidratante corporal","esmalte"],
  "Bike Elétrica e Acessórios": ["bicicleta elétrica","acessório bicicleta elétrica","patinete elétrico"],
  "Esportes & Lazer": ["halter academia","barraca camping","bola futebol","raquete tênis","equipamento pesca"],
  "TVs": ["smart tv","televisão","televisor"],
  "MOTOS & ACESSÓRIOS": ["capacete moto","luva motociclista","acessório moto","retrovisor moto"],
  "Instrumentos Musicais": ["violão","guitarra","teclado musical","ukulele","violino"],
  "Aparelhos de Som": ["caixa de som bluetooth","soundbar","amplificador de áudio","rádio portátil"],
  "Acessórios para celulares": ["capinha celular","carregador celular","película celular","suporte celular","power bank"],
  "Smartphones": ["smartphone","celular samsung","celular motorola","iphone"],
  "Notebook": ["notebook","laptop","chromebook"],
  "Computadores": ["computador desktop","monitor computador","teclado computador","mouse computador","memória ram"],
  "Tecnologia": ["câmera de segurança","smartwatch","sensor inteligente","drone"],
  "Casa & Cozinha": ["jogo de panelas","utensílios de cozinha","pote hermético","jogo de pratos","garrafa térmica"],
  "Utilidades": ["organizador multiuso","carrinho organizador","luminária","varal de roupas","caixa organizadora"],
  "Eletrodomésticos": ["air fryer","liquidificador","cafeteira elétrica","sanduicheira elétrica","aspirador de pó","geladeira","máquina de lavar"],
  'Moda Feminina': ['roupa feminina', 'vestido feminino', 'blusa feminina', 'conjunto feminino', 'calça feminina'],
  'Moda Masculina': ['camiseta masculina', 'bermuda masculina', 'calça masculina', 'camisa masculina'],
  'Móveis': ['mesa de jantar', 'escrivaninha', 'guarda-roupa', 'sofá', 'cômoda', 'cadeira de escritório'],
  'Calçados': ['sapato masculino', 'tênis feminino', 'sandália feminina', 'chinelo masculino'],
  'Moda Infantil': ['tênis infantil', 'sandália infantil', 'roupa infantil', 'pijama infantil'],
  'Brinquedos': ['carrinho de brinquedo', 'boneca infantil', 'blocos de montar', 'jogo educativo'],
  'Pets': ['arranhador para gatos', 'brinquedo para cachorro', 'comedouro pet', 'coleira para cachorro'],
  'Games': ['console playstation', 'controle xbox', 'jogo nintendo switch'],
  'Casa & Construção': ['furadeira', 'parafusadeira', 'kit ferramentas', 'torneira'],
  'AUTO & ACESSÓRIOS': ['acessório automotivo', 'radiador carro', 'motor de partida'],
  'Fones & Headphones': ['fone bluetooth', 'headset gamer', 'fone de ouvido'],
};

// A triagem usa o tipo de produto no título, não a categoria de destino atribuída pelo importador.
export function matchesShopeeImportCategory(title: string, category: string): boolean {
  const text = searchText(title);
  const child = childTerms.test(text);
  const pet = petTerms.test(text);
  if (category === 'Móveis') {
    const startsWithFurniture = /^(?:(?:kit|conjunto|combo|par|pares|pecas|de|com|[0-9]+)\s+){0,8}(mesa|mesas|sofa|sofas|cadeira|cadeiras|poltrona|armario|guarda roupa|roupeiro|estante|escrivaninha|comoda|rack|aparador|criado mudo|balcao|gabinete|sapateira|beliche|berco|cama|colchao|livreiro|nicho)\b/.test(text);
    return startsWithFurniture && !furnitureAccessories.test(text) && !pet;
  }
  if (category === 'Eletrodomésticos') {
    const appliance = applianceTerms.exec(text);
    if (!appliance || child || pet) return false;
    if (/\b(limpa air fryer|limpa forno|desengordurante|spray de limpeza|mini cozinha|cozinha de brinquedo|chama direta)\b/.test(text)) return false;
    const suffix = text.slice(appliance.index + appliance[0].length).trim();
    if (/^(papel|silicone|cesta|cesto|forma|forro|capa|filtro|refil|suporte|peca|resistencia|placa)\b/.test(suffix)) return false;
    const prefix = text.slice(0, appliance.index);
    if (appliance.index > 100 || appliancePartTerms.test(prefix)) return false;
    if (/\b(reposicao|substituicao|sobressalente|conserto|reparo|compativel com|compativel para|miniatura|brinquedo)\b/.test(text)) return false;
    // "Aspirador com filtro" é um aparelho; "filtro para aspirador" é uma peça.
    if (/\b(pecas?|acessorios?|filtros?|capas?|suportes?|copos?|jarras?|cestos?|cestas?|bandejas?|formas?|controles?|helices?|motores?|placas?|resistencias?)\s+(?:de|do|da|para|p)\b/.test(text)) return false;
    return true;
  }
  if (category === 'Pets') return pet;
  if (category === 'Moda Infantil') return child && (clothingTerms.test(text) || footwearTerms.test(text) || /\b(manta|cobertor|babador)\b/.test(text)) && !pet;
  if (category === 'Calçados') return footwearTerms.test(text) && !child && !/\b(sacos?|sacola|porta sapatos|organizador|palmilha|cadarco|cadarcos)\b/.test(text);
  if (category === 'Moda Masculina' || category === 'Moda Feminina') {
    if (!(clothingTerms.test(text) || (/\bconjuntos?\b/.test(text) && /\b(masculin[oa]s?|feminin[oa]s?|homem|homens|mulher|mulheres|unissex)\b/.test(text))) || child || pet || /\b(bonecas?|bonecos?|cabide|cabides|organizador|saco para|sacos para|lavar roupa|lavar roupas|roupa de cama|capa para|capas para)\b/.test(text)) return false;
    if (category === 'Moda Feminina' && /\b(masculin[oa]s?|homem|homens|cuecas?)\b/.test(text) && !/\b(feminin[oa]s?|mulher|mulheres)\b/.test(text)) return false;
    if (category === 'Moda Masculina' && /\b(feminin[oa]s?|mulher|mulheres)\b/.test(text) && !/\b(masculin[oa]s?|homem|homens)\b/.test(text)) return false;
    if (category === 'Moda Masculina') return /\b(masculin[oa]s?|homem|homens|unissex|cuecas?)\b/.test(text);
    return /\b(feminin[oa]s?|mulher|mulheres|unissex|vestidos?|saias?|croppeds?|lingeries?|sutias?|calcinhas?|biquinis?|maios?)\b/.test(text);
  }
  if (category === 'Brinquedos') return !pet && !clothingTerms.test(text) && !footwearTerms.test(text) &&
    !/\b(cortador|cortadores|carimbo|confeitaria|organizador|manta|cobertor|lembrancinha|decoracao de festa)\b/.test(text) &&
    /\b(brinquedo|brinquedos|boneca|boneco|pelucia|lego|blocos|quebra cabeca|jogo educativo|carrinho|hot wheels|infantil|pedagogico|massinha|miniatura|miniaturas|brick game)\b/.test(text);
  if (category === 'Games') return !clothingTerms.test(text) && !pet &&
    !/\b(headset|headphone|fone|carrinho|miniatura|festa|papel de parede|caneca)\b/.test(text) &&
    /\b(playstation|xbox|nintendo|videogame|video game|console|joystick|controle gamer|jogo|gamer)\b/.test(text);
  if (category === 'Utilidades') return !pet && !clothingTerms.test(text) && !footwearTerms.test(text) &&
    (!furnitureTerms.test(text) || furnitureAccessories.test(text) || /\b(organizador|carrinho organizador)\b/.test(text));
  const completeDeviceCategories = ['Notebook', 'Smartphones', 'TVs', 'Aparelhos de Som', 'Fones & Headphones', 'Instrumentos Musicais'];
  if (completeDeviceCategories.includes(category)) {
    // Peças mencionam o aparelho compatível, mas não são o produto principal.
    if (/\b(pecas?|reposicao|substituicao|reparo|conserto|somente caixa|caixa vazia|miniatura|brinquedo)\b/.test(text)) return false;
    const deviceParts = /\b(capas?|capinhas?|peliculas?|suportes?|bolsas?|cases?|capas protetoras|carrinhos?|controles? remotos?|cabos?|carregadores?|adaptadores?|baterias?|telas?|displays?|placas?|carcacas?|teclas?|almofadas?|espumas?)\b/;
    const device = importCategoryRules[category]?.exec(text);
    if (device && deviceParts.test(text.slice(0, device.index))) return false;
    if (/\b(capa|capinha|pelicula|suporte|case|bolsa|controle remoto|carregador|adaptador|bateria|tela|display|placa|almofada|espuma)\s+(?:para|de|do|da|p)\b/.test(text)) return false;
  }
  if (category === 'Smartphones' && /\b(capa|capinha|pelicula|carregador|cabo|suporte|adaptador|peca|tela de reposicao)\b/.test(text)) return false;
  if (category === 'Tecnologia') return /\b(eletronico|smart|camera|relogio|smartwatch|teclado|mouse|adaptador|usb|sensor|led|wifi|bluetooth|carregador|drone)\b/.test(text) && !clothingTerms.test(text);
  const rule = importCategoryRules[category];
  // Reconhece também títulos no plural, como panelas, ferramentas e cosméticos.
  const singularWords = text.replace(/\b([a-z]{4,})s\b/g, '$1');
  return rule ? (rule.test(text) || rule.test(singularWords)) && !clothingTerms.test(text) && !pet : false;
}

export async function searchShopeeOffers(
  keyword: string,
  category: string,
  token: string,
  requested = 60,
  filterCategory = true,
  completeCategory = true
): Promise<ShopeeApiSearchResult> {
  const searchTerm = keyword.trim();
  const destinationCategory = category.trim();
  if (!searchTerm) throw new Error('Informe um termo para buscar produtos na Shopee.');
  if (!destinationCategory || destinationCategory === 'Todas as Categorias') {
    throw new Error('Escolha a categoria de destino no site.');
  }
  if (!token.trim()) throw new Error('Informe o token administrativo do backend.');

  const target = Math.max(1, Math.min(Number(requested) || 60, 60));
  const results: any[] = [];
  const seen = new Set<string>();
  let excluded = 0;
  let examined = 0;
  const suggestions = SHOPEE_SEARCH_SUGGESTIONS[destinationCategory] || [];
  const genericTerms = ['produto', 'produtos', 'roupa', 'roupas', 'calcado', 'calcados', 'sapato', 'sapatos', 'moveis', 'eletrodomestico', 'eletrodomesticos', 'acessorio', 'acessorios', 'utilidade', 'utilidades'];
  const genericSearch = genericTerms.includes(searchText(searchTerm)) || searchText(searchTerm) === searchText(destinationCategory);
  const terms = filterCategory && completeCategory
    ? [...new Set(genericSearch ? [...suggestions, searchTerm] : [searchTerm, ...suggestions])]
    : [searchTerm];
  const searchTerms: string[] = [];
  let requests = 0;
  const exhausted = new Set<string>();
  const maxRequests = 12;

  // Alterna os tipos de produto para uma busca geral não ficar presa a um único tipo.
  for (let page = 1; page <= maxRequests && results.length < target; page += 1) {
    if (exhausted.size === terms.length || requests >= maxRequests) break;
    for (const term of terms) {
      if (results.length >= target || requests >= maxRequests) break;
      if (exhausted.has(term)) continue;
      if (!searchTerms.includes(term)) searchTerms.push(term);
      const query = new URLSearchParams({ keyword: term, page: String(page), limit: '50' });
      requests += 1;
      const response = await fetch(apiBaseUrl() + '/api/integrations/shopee/search?' + query.toString(), {
        headers: { Authorization: 'Bearer ' + token.trim() }
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Falha HTTP ' + response.status + ' ao consultar a API Shopee.');
      }
      const products = Array.isArray(result.products) ? result.products : [];
      const perTermTarget = genericSearch && filterCategory && completeCategory && page === 1
        ? Math.max(1, Math.ceil(target / Math.max(suggestions.length, 1)))
        : target;
      let acceptedForTerm = 0;
      for (const product of products) {
        const id = String(product?.externalId || '');
        if (!id || seen.has(id)) continue;
        seen.add(id);
        examined += 1;
        if (filterCategory && !matchesShopeeImportCategory(String(product?.title || ''), destinationCategory)) {
          excluded += 1;
          continue;
        }
        results.push(product);
        acceptedForTerm += 1;
        if (results.length >= target || acceptedForTerm >= perTermTarget) break;
      }
      if (!products.length || !result.pageInfo?.hasNextPage) exhausted.add(term);
    }
  }

  const items: FeedItem[] = [];
  let skipped = 0;
  for (const product of results) {
    const id = String(product.externalId || '');
    const title = String(product.title || '').trim();
    const price = Number(product.price);
    const image = String(product.imageUrl || '').trim();
    const productUrl = String(product.productUrl || '').trim();
    const affiliateUrl = String(product.affiliateUrl || '').trim();
    let validProductUrl = false;
    let validImage = false;
    try {
      const url = new URL(productUrl);
      const match = url.pathname.match(/^\/product\/(\d+)\/(\d+)$/);
      validProductUrl = url.protocol === 'https:' && url.hostname === 'shopee.com.br' &&
        !url.username && !url.password && !url.port && match?.[2] === id;
    } catch { /* A linha será descartada na validação abaixo. */ }
    try {
      const url = new URL(image);
      validImage = url.protocol === 'https:' && !url.username && !url.password;
    } catch { /* A linha será descartada na validação abaixo. */ }

    if (!/^\d+$/.test(id) || !title || title.length > 255 || !Number.isFinite(price) || price <= 0 ||
        !validImage || !validProductUrl || !validAffiliate(affiliateUrl)) {
      skipped += 1;
      continue;
    }

    const originalPrice = Number(product.originalPrice);
    items.push({
      itemid: id,
      title,
      price: String(Number.isFinite(originalPrice) && originalPrice > price ? originalPrice : price),
      sale_price: String(price),
      description: '',
      global_category1: destinationCategory,
      categoryOverride: destinationCategory,
      shop_name: String(product.shopName || ''),
      image_link: image,
      product_link: productUrl,
      affiliateUrl
    });
  }

  if (!items.length) {
    throw new Error(filterCategory
      ? 'Nenhum produto compatível com ' + destinationCategory + ' foi encontrado entre ' + examined + ' ofertas consultadas. Tente um dos termos sugeridos ou uma busca mais específica.'
      : 'A API não retornou ofertas completas para esse termo. Tente uma busca mais específica.');
  }
  return { items, skipped, excluded, examined, searchTerms };
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



type AffiliateCatalogRow = {
  itemId: string;
  title: string;
  price: number;
  seller: string;
  productUrl: string;
  offerLink: string;
  category: string;
};

function parseShopeePrice(value: string): number {
  const raw = String(value ?? '').trim();
  if (!raw) return NaN;
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.replace(/,/g, '');
  return Number(normalized);
}

async function readAffiliateCatalogRows(linksFile: File): Promise<Map<string, AffiliateCatalogRow>> {
  const rows = new Map<string, AffiliateCatalogRow>();
  let headers: string[] | null = null;

  for await (const row of csvRows(linksFile)) {
    if (!headers) {
      headers = row.map((s) => s.trim());
      for (const key of ['Item Id', 'Item Name', 'Price', 'Product Link', 'Offer Link']) {
        if (!headers.includes(key)) {
          throw new Error(
            'Para importar quando o Item Id não estiver no Feed, o CSV de links precisa das colunas Item Id, Item Name, Price e Product Link.'
          );
        }
      }
      continue;
    }

    const get = (name: string) => row[headers!.indexOf(name)]?.trim() || '';
    const id = get('Item Id');
    const title = get('Item Name');
    const price = parseShopeePrice(get('Price'));
    const productUrl = get('Product Link');
    const offerLink = get('Offer Link');
    const seller = get('Shop Name') || get('Nome da loja');
    const category = get('Categoria') || get('Category');
    if (category && (!CATEGORIES.includes(category) || category === 'Todas as Categorias')) {
      throw new Error('Item ' + id + ': categoria de destino inválida no CSV.');
    }

    if (!/^\d+$/.test(id)) throw new Error('Item Id inválido no CSV de links: ' + id);
    if (!title || title.length > 255) throw new Error('Item ' + id + ': nome do produto inválido.');
    if (!Number.isFinite(price) || price <= 0) throw new Error('Item ' + id + ': preço inválido no CSV de links.');
    if (!validAffiliate(offerLink)) throw new Error('Item ' + id + ': Offer Link inválido.');
    if (rows.has(id)) throw new Error('ID duplicado no CSV de links: ' + id + '.');

    let product;
    try {
      product = new URL(productUrl);
    } catch {
      throw new Error('Item ' + id + ': Product Link inválido.');
    }
    const match = product.pathname.match(/^\/product\/(\d+)\/(\d+)$/);
    if (
      product.protocol !== 'https:' ||
      product.hostname !== 'shopee.com.br' ||
      product.username || product.password || product.port ||
      !match || match[2] !== id
    ) {
      throw new Error('Item ' + id + ': Product Link incompatível com o Item Id.');
    }

    rows.set(id, {
      itemId: id,
      title,
      price,
      seller,
      productUrl: product.href,
      offerLink,
      category
    });
  }

  return rows;
}

export async function prepareFeed(feed: File | null, linksFile: File | null, manual = '', destinationCategory = '') {
  if (destinationCategory && (!CATEGORIES.includes(destinationCategory) || destinationCategory === 'Todas as Categorias')) {
    throw new Error('Escolha uma categoria de destino válida.');
  }
  const links = await readAffiliateLinks(linksFile, manual);
  const catalogRows = linksFile ? await readAffiliateCatalogRows(linksFile) : new Map<string, AffiliateCatalogRow>();
  const items: FeedItem[] = [];
  let headers: string[] | null = null;
  const found = new Set<string>();

  if (feed) for await (const row of csvRows(feed)) {
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
    if (!linksFile) {
      const shown = missing.slice(0, 25).join(', ');
      const extra = missing.length > 25 ? ' e mais ' + (missing.length - 25) : '';
      throw new Error(
        'Produtos ausentes neste feed: ' + shown + extra +
        '. Envie o CSV de links em massa com Item Name, Price e Product Link para importar por essa modalidade.'
      );
    }

    for (const id of missing) {
      const source = catalogRows.get(id);
      if (!source) {
        throw new Error(
          'O Item Id ' + id +
          ' não está no Feed e o CSV de links não contém os dados necessários para o modo alternativo.'
        );
      }

      items.push({
        itemid: source.itemId,
        title: source.title,
        price: String(source.price),
        sale_price: String(source.price),
        description: '',
        global_category1: source.category || 'Outros',
        shop_name: source.seller,
        image_link: '',
        product_link: source.productUrl,
        affiliateUrl: source.offerLink,
        allowMissingImage: 'true'
      });
    }
  }

  return items.map((item) => {
    const chosenCategory = destinationCategory || catalogRows.get(item.itemid)?.category || '';
    return chosenCategory
      ? { ...item, global_category1: chosenCategory, categoryOverride: chosenCategory }
      : item;
  });
}

export function toBulkPayload(items: FeedItem[]): FeedItem[] {
  return items.map((item) => ({
    itemid: item.itemid,
    title: item.title,
    price: item.price,
    sale_price: item.sale_price || '',
    description: (item.description || '').slice(0, 5000),
    global_category1: item.global_category1 || '',
    categoryOverride: item.categoryOverride || '',
    shop_name: item.shop_name || '',
    image_link: item.image_link,
    product_link: item.product_link,
    affiliateUrl: item.affiliateUrl,
    allowMissingImage: item.allowMissingImage || ''
  }));
}

function apiBaseUrl() {
  return (import.meta.env.VITE_API_URL || 'https://comercio-popular-backend-production.up.railway.app/api').replace(/\/+$/, '').replace(/\/api$/, '');
}

export async function resolveShopeeImageUrls(
  items: FeedItem[],
  token: string,
  onProgress?: (done: number, total: number) => void
): Promise<FeedItem[]> {
  const missing = items.filter((item) => !String(item.image_link || '').trim());
  if (!missing.length) return items;
  if (!token.trim()) throw new Error('Informe o token administrativo para recuperar as imagens Shopee.');

  const resolved = new Map<string, string>();
  onProgress?.(0, missing.length);
  for (let start = 0; start < missing.length; start += 100) {
    const chunk = missing.slice(start, start + 100);
    const response = await fetch(apiBaseUrl() + '/api/integrations/shopee/resolve-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token.trim()
      },
      body: JSON.stringify({ items: chunk.map((item) => ({
        itemid: item.itemid,
        product_link: item.product_link,
        title: item.title
      })) })
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'Falha HTTP ' + response.status + ' ao recuperar imagens Shopee.');
    }
    const expected = new Set(chunk.map((item) => item.itemid));
    for (const row of Array.isArray(result.resolved) ? result.resolved : []) {
      const id = String(row?.itemId || '');
      const image = String(row?.imageUrl || '');
      if (!expected.has(id)) continue;
      try {
        const url = new URL(image);
        if (url.protocol === 'https:' && !url.username && !url.password) resolved.set(id, url.href);
      } catch { /* Imagens inválidas permanecem pendentes. */ }
    }

    const unresolved = chunk.filter((item) => !resolved.has(item.itemid));
    if (unresolved.length) {
      const shown = unresolved.slice(0, 15).map((item) => item.itemid).join(', ');
      throw new Error(
        'A Shopee não retornou imagem para ' + unresolved.length +
        ' produto(s) desta etapa: ' + shown +
        (unresolved.length > 15 ? ' e mais ' + (unresolved.length - 15) : '') +
        '. Nada foi publicado. Envie um feed que contenha esses produtos para completar as imagens.'
      );
    }
    onProgress?.(Math.min(start + chunk.length, missing.length), missing.length);
  }
  return items.map((item) => resolved.has(item.itemid)
    ? { ...item, image_link: resolved.get(item.itemid)! }
    : item);
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



export async function reclassifyShopeeImportCategories(jobPrefix: string, token: string) {
  const prefix = jobPrefix.trim();
  if (!/^[a-f0-9]{8}$/i.test(prefix)) throw new Error('Informe os 8 primeiros caracteres do ID do lote.');
  if (!token.trim()) throw new Error('Informe o token administrativo do backend.');

  const response = await fetch(apiBaseUrl() + '/api/integrations/shopee/reclassify-import-job-categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.trim()
    },
    body: JSON.stringify({ jobPrefix: prefix })
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Falha ao corrigir as categorias do lote Shopee.');
  }
  return result as {
    ok: boolean;
    jobPrefix: string;
    updatedCount: number;
    utilidades: number;
    brinquedos: number;
    changed: Array<{ id: string; title: string; category: string }>;
  };
}

export async function repairShopeeCatalogState(token: string) {
  if (!token.trim()) throw new Error('Informe o token administrativo.');
  const response = await fetch(apiBaseUrl() + '/api/integrations/shopee/repair-catalog-state', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token.trim() }
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || 'Falha ao restaurar o catálogo Shopee.');
  return result;
}
