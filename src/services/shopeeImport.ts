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
  'ARMARINHOS & TRICÔ': /\b(armarinhos?|la|las|novelos?|barbantes?|fios? de malha|fios? de algodao|linhas? (?:de |para )?(?:costura|bordado|croche|trico)|agulhas? (?:de |para )?(?:costura|bordado|croche|trico)|bastidores? de bordado|fitas? de cetim|rendas? (?:de |para )?costura|ziperes?|ziper|(?:botao|botoes) (?:de |para )?costura|elasticos? (?:de |para )?costura)\b/,
  'RELÓGIOS': /\b(relogios?|smartwatches?|smartwatch|watch|despertadores?|cronometros?)\b/,
  'Casa & Cozinha': /\b(panela|frigideira|prato|talher|copo|taca|pote|garrafa|chaleira|jarra|faqueiro|utensilio|confeitaria|cozinha|biscoito|paliteiro)\b/,
  'Ferramentas': /\b(ferramenta|furadeira|parafusadeira|serra|motosserra|solda|nivel|trena|parafuso|broca|torneira|tinta|pedreiro|construcao|desempenadeira|espatula|alicate|martelo|chave|jardinagem)\b/,
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
  'ARMARINHOS & TRICÔ': ["lã para tricô","fio de algodão para crochê","linha de costura","agulha de tricô","agulha de crochê","agulha de costura","linha de bordado","barbante para crochê","fita de cetim","renda para costura","zíper para costura","botão para costura"],
  "RELÓGIOS": [
    "relógio masculino",
    "relógio feminino",
    "relógio digital",
    "smartwatch",
    "relógio de parede",
    "relógio esportivo",
    "relógio analógico",
    "relógio infantil",
    "relógio de mesa",
    "despertador",
    "cronômetro",
    "relógio de bolso"
  ],
  "ELETRO & ACESSÓRIOS": [
    "fogão",
    "geladeira",
    "air fryer",
    "cafeteira elétrica",
    "peças para fogão",
    "acessórios para air fryer",
    "peças para lavadora",
    "micro-ondas",
    "liquidificador",
    "filtro para aspirador",
    "chaleira elétrica",
    "controle para ar condicionado"
  ],
  "Alimentos & Bebidas": [
    "café",
    "chocolate",
    "azeite",
    "chá",
    "suplemento alimentar",
    "arroz",
    "feijão",
    "mel",
    "biscoito",
    "doce",
    "vinho",
    "bebida"
  ],
  "Cuidado & Beleza": [
    "maquiagem",
    "perfume",
    "shampoo",
    "hidratante corporal",
    "esmalte",
    "protetor solar",
    "skincare",
    "creme para cabelo",
    "secador de cabelo",
    "escova de cabelo",
    "kit manicure",
    "cosmético"
  ],
  "Bike Elétrica e Acessórios": [
    "bicicleta elétrica",
    "acessório bicicleta elétrica",
    "patinete elétrico",
    "bike elétrica dobrável",
    "scooter elétrica",
    "bateria bicicleta elétrica",
    "carregador bicicleta elétrica",
    "pneu bicicleta elétrica",
    "freio bicicleta elétrica",
    "capacete bicicleta",
    "retrovisor bicicleta",
    "suporte bicicleta"
  ],
  "Esportes & Lazer": [
    "halter academia",
    "barraca camping",
    "bola futebol",
    "raquete tênis",
    "equipamento pesca",
    "esteira fitness",
    "bicicleta",
    "bola basquete",
    "óculos natação",
    "kit treino academia",
    "barraca praia",
    "bola vôlei"
  ],
  "TVs": [
    "smart tv",
    "televisão",
    "televisor",
    "smart tv 32 polegadas",
    "smart tv 43 polegadas",
    "smart tv 50 polegadas",
    "smart tv 55 polegadas",
    "smart tv 65 polegadas",
    "smart tv 4k",
    "smart tv led",
    "smart tv oled",
    "smart tv qled"
  ],
  "MOTOS & ACESSÓRIOS": [
    "capacete moto",
    "luva motociclista",
    "acessório moto",
    "retrovisor moto",
    "capa moto",
    "baú moto",
    "suporte celular moto",
    "pneu moto",
    "freio moto",
    "corrente moto",
    "jaqueta motociclista",
    "protetor moto"
  ],
  "Instrumentos Musicais": [
    "violão",
    "guitarra",
    "teclado musical",
    "ukulele",
    "violino",
    "piano",
    "cavaquinho",
    "flauta",
    "saxofone",
    "bateria musical",
    "pedal guitarra",
    "cordas violão"
  ],
  "Aparelhos de Som": [
    "caixa de som bluetooth",
    "soundbar",
    "amplificador de áudio",
    "rádio portátil",
    "home theater",
    "receiver áudio",
    "microfone",
    "caixa de som portátil",
    "alto falante",
    "aparelho de som",
    "caixa de som profissional",
    "rádio digital"
  ],
  "Acessórios para celulares": [
    "capinha celular",
    "carregador celular",
    "película celular",
    "suporte celular",
    "power bank",
    "cabo usb celular",
    "adaptador celular",
    "lente celular",
    "bateria celular",
    "fone celular",
    "carregador sem fio",
    "suporte veicular celular"
  ],
  "Smartphones": [
    "smartphone",
    "celular samsung",
    "celular motorola",
    "iphone",
    "celular xiaomi",
    "celular redmi",
    "celular poco",
    "smartphone 5g",
    "celular 128gb",
    "celular 256gb",
    "celular android",
    "celular 64gb"
  ],
  "Notebook": [
    "notebook",
    "laptop",
    "chromebook",
    "notebook gamer",
    "notebook estudos",
    "notebook trabalho",
    "notebook i5",
    "notebook i7",
    "notebook ryzen",
    "notebook 8gb",
    "notebook 16gb",
    "notebook ssd"
  ],
  "Computadores": [
    "computador desktop",
    "monitor computador",
    "teclado computador",
    "mouse computador",
    "memória ram",
    "placa de vídeo",
    "placa mãe",
    "processador computador",
    "ssd",
    "hd externo",
    "webcam",
    "computador gamer"
  ],
  "ELETRÔNICOS": [
    "câmera de segurança",
    "sensor inteligente",
    "drone",
    "adaptador usb",
    "carregador usb",
    "câmera wifi",
    "teclado bluetooth",
    "mouse bluetooth",
    "sensor de movimento",
    "câmera digital",
    "sensor de porta",
    "dispositivo eletrônico"
  ],
  "Casa & Cozinha": [
    "jogo de panelas",
    "utensílios de cozinha",
    "pote hermético",
    "jogo de pratos",
    "garrafa térmica",
    "frigideira",
    "faqueiro",
    "jogo de copos",
    "taça",
    "chaleira",
    "jarra",
    "cafeteira italiana"
  ],
  "Utilidades": [
    "organizador multiuso",
    "carrinho organizador",
    "luminária",
    "varal de roupas",
    "caixa organizadora",
    "abajur",
    "lixeira",
    "cesto organizador",
    "porta objetos",
    "organizador de gaveta",
    "cabide",
    "escova de limpeza"
  ],
  "Eletrodomésticos": [
    "air fryer",
    "liquidificador",
    "cafeteira elétrica",
    "sanduicheira elétrica",
    "aspirador de pó",
    "geladeira",
    "máquina de lavar",
    "fogão",
    "micro-ondas",
    "chaleira elétrica",
    "batedeira",
    "ventilador"
  ],
  "Moda Feminina": [
    "roupa feminina",
    "vestido feminino",
    "blusa feminina",
    "conjunto feminino",
    "calça feminina",
    "saia feminina",
    "short feminino",
    "jaqueta feminina",
    "moletom feminino",
    "pijama feminino",
    "lingerie feminina",
    "biquíni feminino"
  ],
  "Moda Masculina": [
    "camiseta masculina",
    "bermuda masculina",
    "calça masculina",
    "camisa masculina",
    "moletom masculino",
    "jaqueta masculina",
    "regata masculina",
    "short masculino",
    "pijama masculino",
    "cueca masculina",
    "casaco masculino",
    "conjunto masculino"
  ],
  "Móveis": [
    "mesa de jantar",
    "escrivaninha",
    "guarda-roupa",
    "sofá",
    "cômoda",
    "cadeira de escritório",
    "estante",
    "rack",
    "cama",
    "colchão",
    "sapateira",
    "aparador"
  ],
  "Calçados": [
    "sapato masculino",
    "tênis feminino",
    "sandália feminina",
    "chinelo masculino",
    "bota feminina",
    "sapatilha feminina",
    "tênis masculino",
    "sapato feminino",
    "mocassim masculino",
    "coturno",
    "sandália masculina",
    "tamanco feminino"
  ],
  "Moda Infantil": [
    "tênis infantil",
    "sandália infantil",
    "roupa infantil",
    "pijama infantil",
    "vestido infantil",
    "camiseta infantil",
    "conjunto infantil",
    "calça infantil",
    "moletom infantil",
    "body bebê",
    "macacão bebê",
    "manta bebê"
  ],
  "Brinquedos": [
    "carrinho de brinquedo",
    "boneca infantil",
    "blocos de montar",
    "jogo educativo",
    "pelúcia",
    "quebra-cabeça infantil",
    "massinha infantil",
    "brinquedo de controle remoto",
    "boneco",
    "lego",
    "brinquedo pedagógico",
    "miniatura"
  ],
  "Pets": [
    "arranhador para gatos",
    "brinquedo para cachorro",
    "comedouro pet",
    "coleira para cachorro",
    "ração cachorro",
    "ração gato",
    "cama pet",
    "peitoral cachorro",
    "bebedouro pet",
    "aquário",
    "brinquedo gato",
    "coleira gato"
  ],
  "Games": [
    "console playstation",
    "controle xbox",
    "jogo nintendo switch",
    "console xbox",
    "console nintendo switch",
    "jogo playstation",
    "jogo xbox",
    "controle playstation",
    "joystick gamer",
    "videogame portátil",
    "controle nintendo switch",
    "console videogame"
  ],
  "Ferramentas": [
    "furadeira",
    "parafusadeira",
    "kit ferramentas",
    "torneira",
    "alicate",
    "martelo",
    "trena",
    "serra elétrica",
    "chave de ferramenta",
    "broca",
    "máquina de solda",
    "nível"
  ],
  "AUTO & ACESSÓRIOS": [
    "acessório automotivo",
    "radiador carro",
    "motor de partida",
    "capa carro",
    "suporte celular carro",
    "retrovisor carro",
    "bomba automotiva",
    "câmera automotiva",
    "tapete automotivo",
    "ventoinha carro",
    "sensor automotivo",
    "kit limpeza automotiva"
  ],
  "Fones & Headphones": [
    "fone bluetooth",
    "headset gamer",
    "fone de ouvido",
    "headphone",
    "fone tws",
    "fone sem fio",
    "fone com fio",
    "headset usb",
    "fone esportivo",
    "fone intra auricular",
    "fone infantil",
    "headphone bluetooth"
  ]
};

const GENERIC_SEARCH_TERMS = new Set(['produto', 'produtos', 'roupa', 'roupas', 'calcado', 'calcados', 'moveis', 'eletrodomestico', 'eletrodomesticos', 'acessorio', 'acessorios', 'utilidade', 'utilidades']);
export function isGeneralShopeeSearch(keyword: string, category: string): boolean {
  const term = searchText(keyword);
  return GENERIC_SEARCH_TERMS.has(term) || term === searchText(category) ||
    (category === 'ARMARINHOS & TRICÔ' && ['armarinho', 'armarinhos', 'trico', 'croche', 'costura'].includes(term));
}


// As variações mantêm o produto e os qualificadores que o usuário informou.
const PRODUCT_SEARCH_VARIATIONS: Record<string, string[]> = {
  "fogão": [
    "fogão 4 bocas",
    "fogão 5 bocas",
    "fogão elétrico",
    "fogão de mesa",
    "fogão portátil",
    "fogão a gás"
  ],
  "air fryer": [
    "air fryer 4 litros",
    "air fryer 5 litros",
    "air fryer 6 litros",
    "air fryer digital",
    "air fryer oven",
    "air fryer sem óleo"
  ],
  "geladeira": [
    "geladeira frost free",
    "geladeira duplex",
    "geladeira inverter",
    "geladeira compacta",
    "geladeira 2 portas"
  ],
  "cafeteira": [
    "cafeteira elétrica",
    "cafeteira expresso",
    "cafeteira cápsula",
    "cafeteira italiana",
    "cafeteira inox"
  ],
  "chaleira": [
    "chaleira elétrica",
    "chaleira inox",
    "chaleira vidro",
    "chaleira 1 litro",
    "chaleira 2 litros"
  ],
  "liquidificador": [
    "liquidificador portátil",
    "liquidificador industrial",
    "liquidificador inox",
    "liquidificador 2 litros",
    "liquidificador 3 litros"
  ],
  "aspirador": [
    "aspirador de pó",
    "aspirador vertical",
    "aspirador portátil",
    "aspirador robô",
    "aspirador pó e água"
  ],
  "máquina de lavar": [
    "máquina de lavar 10kg",
    "máquina de lavar 12kg",
    "máquina de lavar 15kg",
    "máquina de lavar automática",
    "máquina de lavar portátil"
  ],
  "cômoda": [
    "cômoda 4 gavetas",
    "cômoda 5 gavetas",
    "cômoda 6 gavetas",
    "cômoda madeira",
    "cômoda com sapateira"
  ],
  "sofá": [
    "sofá 2 lugares",
    "sofá 3 lugares",
    "sofá retrátil",
    "sofá reclinável",
    "sofá cama",
    "sofá de canto"
  ],
  "mesa": [
    "mesa de jantar",
    "mesa de escritório",
    "mesa de centro",
    "mesa dobrável",
    "mesa lateral",
    "mesa madeira"
  ],
  "cadeira": [
    "cadeira de escritório",
    "cadeira gamer",
    "cadeira jantar",
    "cadeira dobrável",
    "cadeira ergonômica"
  ],
  "guarda roupa": [
    "guarda-roupa 2 portas",
    "guarda-roupa 3 portas",
    "guarda-roupa 6 portas",
    "guarda-roupa solteiro",
    "guarda-roupa casal"
  ],
  "notebook": [
    "notebook gamer",
    "notebook i5",
    "notebook i7",
    "notebook ryzen",
    "notebook 8gb",
    "notebook 16gb"
  ],
  "celular": [
    "celular samsung",
    "celular motorola",
    "celular xiaomi",
    "celular 5g",
    "celular 128gb",
    "celular 256gb"
  ],
  "smartphone": [
    "smartphone android",
    "smartphone 5g",
    "smartphone samsung",
    "smartphone motorola",
    "smartphone xiaomi"
  ],
  "tv": [
    "smart tv 32 polegadas",
    "smart tv 43 polegadas",
    "smart tv 50 polegadas",
    "smart tv 55 polegadas",
    "smart tv 4k"
  ],
  "fone": [
    "fone bluetooth",
    "fone sem fio",
    "fone com fio",
    "fone tws",
    "fone esportivo",
    "fone intra auricular"
  ],
  "relógio": [
    "relógio masculino",
    "relógio feminino",
    "relógio digital",
    "relógio esportivo",
    "relógio de parede",
    "relógio analógico"
  ],
  "smartwatch": [
    "smartwatch masculino",
    "smartwatch feminino",
    "smartwatch esportivo",
    "smartwatch amoled",
    "smartwatch bluetooth"
  ],
  "barraca": [
    "barraca camping",
    "barraca 2 pessoas",
    "barraca 4 pessoas",
    "barraca automática",
    "barraca praia"
  ],
  "halter": [
    "halter 1kg",
    "halter 2kg",
    "halter 5kg",
    "halter 10kg",
    "halter emborrachado",
    "halter ajustável"
  ],
  "bola": [
    "bola futebol",
    "bola basquete",
    "bola vôlei",
    "bola futsal",
    "bola treinamento"
  ],
  "raquete": [
    "raquete tênis",
    "raquete badminton",
    "raquete beach tennis",
    "raquete tênis de mesa"
  ],
  "vestido": [
    "vestido curto",
    "vestido longo",
    "vestido midi",
    "vestido festa",
    "vestido casual"
  ],
  "camiseta": [
    "camiseta algodão",
    "camiseta oversized",
    "camiseta esportiva",
    "camiseta básica",
    "camiseta estampada"
  ],
  "tênis": [
    "tênis corrida",
    "tênis caminhada",
    "tênis casual",
    "tênis esportivo",
    "tênis academia"
  ],
  "panela": [
    "panela inox",
    "panela antiaderente",
    "panela pressão",
    "panela alumínio",
    "panela cerâmica"
  ],
  "furadeira": [
    "furadeira elétrica",
    "furadeira impacto",
    "furadeira bateria",
    "furadeira profissional"
  ],
  "parafusadeira": [
    "parafusadeira bateria",
    "parafusadeira elétrica",
    "parafusadeira impacto",
    "parafusadeira profissional"
  ]
};

export function getShopeeSearchSuggestions(keyword: string, category: string): string[] {
  const categoryTerms = SHOPEE_SEARCH_SUGGESTIONS[category] || [];
  if (!keyword.trim() || isGeneralShopeeSearch(keyword, category)) return categoryTerms;
  const term = searchText(keyword);
  const aliases: Record<string, string> = { airfryer: 'air fryer', laptop: 'notebook', chromebook: 'notebook', televisao: 'tv', televisor: 'tv', refrigerador: 'geladeira' };
  const family = Object.keys(PRODUCT_SEARCH_VARIATIONS).find((name) => {
    const normalized = searchText(name);
    return term === normalized || term.startsWith(normalized + ' ') || aliases[term] === normalized;
  });
  const candidates = [...(family ? PRODUCT_SEARCH_VARIATIONS[family] : []), ...categoryTerms];
  return [...new Set(candidates)].filter((candidate) =>
    searchText(candidate) !== term && matchesShopeeSearchIntent(candidate, keyword)
  ).slice(0, 12);
}

const searchProductTypes = [
  /\b(fogao|fogoes)\b/, /\bcooktop\b/, /\b(geladeiras?|refrigeradores?)\b/,
  /\bfreezers?\b/, /\bfrigobar\b/, /\b(microondas|micro ondas)\b/,
  /\b(air fryer|airfryer|fritadeira eletrica)\b/, /\bcafeteiras?\b/,
  /\bchaleiras?\b/, /\bliquidificadores?\b/, /\bbatedeiras?\b/,
  /\b(mixer|mixers)\b/, /\b(aspiradores?|robo aspirador)\b/,
  /\b(lavadoras?|maquina de lavar|lava roupas?|tanquinho)\b/,
  /\b(sanduicheiras?|grill eletrico)\b/, /\btorradeiras?\b/,
  /\bventiladores?\b/, /\bar condicionado\b/, /\bforno eletrico\b/,
  /\bpanela eletrica\b/, /\bpurificadores? de agua\b/, /\bbebedouros?\b/,
  /\b(ferro de passar|ferro a vapor)\b/,
  /\b(notebook|laptop|chromebook)\b/, /\b(tv|televisor|televisao|smart tv)\b/,
  /\b(smartphone|celular|iphone)\b/, /\b(caixa de som|alto falante|soundbar)\b/,
  /\b(headset)\b/, /\b(fones?|headphones?|earbuds?|earphones?|tws)\b/,
  /\b(computador|desktop|pc)\b/, /\bmonitores?\b/,
  /\b(violao|violoes)\b/, /\bguitarras?\b/, /\bviolinos?\b/,
  /\bmesas?\b/, /\b(sofa|sofas)\b/, /\bcadeiras?\b/, /\bpoltronas?\b/,
  /\b(guarda roupa|roupeiro|armario)\b/, /\bestantes?\b/, /\bescrivaninhas?\b/,
  /\bcomodas?\b/, /\b(colchao|colchoes)\b/, /\bcamas?\b/,
  /\bfuradeiras?\b/, /\bparafusadeiras?\b/,
  /\b(camiseta|camisetas|t shirt|t shirts|tshirt|tshirts)\b/,
  /\bcamisas?\b/, /\b(blusa|blusas|blusinha|blusinhas)\b/,
  /\bvestidos?\b/, /\bcalcas?\b/, /\b(shorts?|bermudas?)\b/,
  /\bsapatos?\b/, /\b(tenis|sapatenis)\b/, /\bsandalias?\b/, /\bchinelos?\b/,
  /\bpanelas?\b/, /\bfrigideiras?\b/, /\bgarrafas?\b/, /\bpotes?\b/,
];
const accessoryTitleWords = /\b(pecas?|acessorios?|reposicao|conserto|reparo|compativel|capas?|capinhas?|peliculas?|suportes?|bases?|filtros?|refis?|borrachas?|vedacoes?|mangueiras?|cabos?|adaptadores?|carregadores?|resistencias?|termostatos?|placas?|helices?|correias?|botoes|botao|puxadores?|tampas?|laminas?|cestos?|cestas?|bandejas?|formas?|forros?|papel|silicone|tapetes?|protetores?|rodizios?|sacos?|escovas?|bocais?|prateleiras?|gavetas?|dobradicas?|controles?|agulhas?|desentupidoras?|desentupidores?|pasta|polir|limpa|limpeza|desengordurante|spray|registro|ramal|grade|grades|trempe|trempes|queimadores?|bicos?|injetores?|valvulas?|chapas?|pegadores?|tigelas?|miniatura|brinquedo)\b/;

// Busca específica exige o produto pedido; peças não passam só por mencionar sua compatibilidade.
export function matchesShopeeSearchIntent(title: string, keyword: string): boolean {
  const text = searchText(title);
  const term = searchText(keyword);
  const type = searchProductTypes.find((pattern) => pattern.test(term));
  let qualifiers = term;
  if (type) {
    const mainProduct = type.exec(text);
    if (!mainProduct) return false;
    const asksForAccessory = accessoryTitleWords.test(term.replace(type, ' '));
    if (!asksForAccessory) {
      if (accessoryTitleWords.test(text.slice(0, mainProduct.index))) return false;
      const suffix = text.slice(mainProduct.index + mainProduct[0].length).trim();
      const furnitureWithStorage = /\b(comodas?|armarios?|guarda roupa|roupeiros?|mesas?|escrivaninhas?)\b/.test(mainProduct[0]);
      // Gavetas fazem parte de cômodas e armários anunciados como móveis completos.
      if (new RegExp('^' + accessoryTitleWords.source).test(suffix) &&
          !(furnitureWithStorage && /^gavetas?\b/.test(suffix))) return false;
      if (/\b(para|compativel com|compativel para|reposicao|conserto|reparo|brinquedo|miniatura)\b/.test(text.slice(0, mainProduct.index))) return false;
    }
    qualifiers = term.replace(type, ' ');
  }
  const singular = (word: string) => word.length > 4 ? word.replace(/s$/, '') : word;
  const titleWords = text.split(' ').map(singular);
  const queryWords = qualifiers.split(' ').filter((word) => word && !['de','do','da','dos','das','para','com','e','a','o','em','um','uma','p'].includes(word)).map(singular);
  return queryWords.every((word) => titleWords.includes(word));
}

// A triagem usa o tipo de produto no título, não a categoria de destino atribuída pelo importador.
export function matchesShopeeImportCategory(title: string, category: string): boolean {
  const text = searchText(title);
  const child = childTerms.test(text);
  const pet = petTerms.test(text);
  if (category === 'Móveis') {
    const startsWithFurniture = /^(?:(?:kit|conjunto|combo|par|pares|pecas|de|com|[0-9]+)\s+){0,8}(mesa|mesas|sofa|sofas|cadeira|cadeiras|poltrona|armario|guarda roupa|roupeiro|estante|escrivaninha|comoda|rack|aparador|criado mudo|balcao|gabinete|sapateira|beliche|berco|cama|colchao|livreiro|nicho)\b/.test(text);
    return startsWithFurniture && !furnitureAccessories.test(text) && !pet;
  }
  if (category === 'ELETRO & ACESSÓRIOS') return !child && !pet && !/\b(brinquedo|miniatura|mini cozinha)\b/.test(text) && (applianceTerms.test(text) || /\beletrodomesticos?\b/.test(text));
  if (category === 'Eletrodomésticos') {
    const appliance = applianceTerms.exec(text);
    if (!appliance || child || pet) return false;
    if (/\b(limpa air fryer|limpa forno|desengordurante|spray de limpeza|mini cozinha|cozinha de brinquedo|chama direta)\b/.test(text)) return false;
    const suffix = text.slice(appliance.index + appliance[0].length).trim();
    if (/^(papel|silicone|cesta|cesto|forma|forro|capa|filtro|refil|suporte|peca|resistencia|placa)\b/.test(suffix)) return false;
    const prefix = text.slice(0, appliance.index);
    if (appliance.index > 100 || appliancePartTerms.test(prefix) || accessoryTitleWords.test(prefix)) return false;
    if (/\b(para|compativel com|compativel para)\b/.test(prefix)) return false;
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
  if (category === 'ELETRÔNICOS') return /\b(eletronico|smart|camera|relogio|smartwatch|teclado|mouse|adaptador|usb|sensor|led|wifi|bluetooth|carregador|drone)\b/.test(text) && !clothingTerms.test(text);
  const rule = importCategoryRules[category];
  // Reconhece também títulos no plural, como panelas, ferramentas e cosméticos.
  const singularWords = text.replace(/\b([a-z]{4,})s\b/g, '$1');
  return rule ? (rule.test(text) || rule.test(singularWords)) && !clothingTerms.test(text) && !pet : false;
}

export const BICYCLE_ONLY_SUGGESTIONS = [
  'bicicleta elétrica', 'bike elétrica dobrável', 'bicicleta elétrica urbana',
  'bicicleta elétrica aro 20', 'bicicleta elétrica aro 26', 'bicicleta elétrica aro 29',
  'bicicleta elétrica 350w', 'bicicleta elétrica 400w', 'bicicleta elétrica 500w',
  'bicicleta elétrica 750w', 'bicicleta elétrica 1000w', 'bicicleta elétrica pedal assistido'
];

// Exige uma bicicleta completa; mencionar a bicicleta compatível não basta.
export function matchesCompleteBicycle(title: string): boolean {
  const text = searchText(title);
  const bicycle = /\b(bicicletas?|bikes?|e bike|ebike)\b/.exec(text);
  if (!bicycle || /\b(patinetes?|scooters?|motocicletas?|brinquedos?|miniaturas?|bonecas?)\b/.test(text)) return false;
  const parts = /\b(pecas?|acessorios?|carregadores?|baterias?|pneus?|camaras?|freios?|pastilhas?|discos?|cabos?|fios?|motores?|controladores?|aceleradores?|correntes?|engrenagens?|pedais?|selins?|bancos?|assentos?|almofadas?|guid[ao]+|guidao|manoplas?|quadros?|garfos?|suspensao|rodas?|aros?|raios?|capas?|bolsas?|cestas?|capacetes?|retrovisores?|suportes?|protetores?|adesivos?|ferramentas?|kits? de conversao)\b/;
  const prefix = text.slice(0, bicycle.index);
  if (parts.test(prefix) || /\b(para|compativel|reposicao|reparo)\b/.test(prefix)) return false;
  const suffix = text.slice(bicycle.index + bicycle[0].length).trim()
    .replace(/^(?:(?:eletrica|eletrico|dobravel|mountain|urbana|de|para)\s+)+/, '');
  if (/^(?:aros?|baterias?|motores?) (?:[0-9]|removivel\b)/.test(suffix)) return true;
  return !new RegExp('^' + parts.source).test(suffix);
}

export async function searchShopeeOffers(
  keyword: string,
  category: string,
  token: string,
  requested = 60,
  filterCategory = true,
  completeCategory = true,
  onlyBicycles = false
): Promise<ShopeeApiSearchResult> {
  const bicycleOnly = onlyBicycles && category.trim() === 'Bike Elétrica e Acessórios';
  const searchTerm = keyword.trim() || (bicycleOnly ? 'bicicleta elétrica' : '');
  const destinationCategory = category.trim();
  if (!searchTerm) throw new Error('Informe um termo para buscar produtos na Shopee.');
  if (!destinationCategory || destinationCategory === 'Todas as Categorias') {
    throw new Error('Escolha a categoria de destino no site.');
  }
  if (!token.trim()) throw new Error('Informe o token administrativo do backend.');

  const target = Math.max(1, Math.min(Number(requested) || 60, 60));
  const results: any[] = [];
  const remainingMatches: any[] = [];
  const seen = new Set<string>();
  let excluded = 0;
  let examined = 0;
  const suggestions = bicycleOnly
    ? BICYCLE_ONLY_SUGGESTIONS.filter((term) => matchesShopeeSearchIntent(term, searchTerm))
    : getShopeeSearchSuggestions(searchTerm, destinationCategory);
  const genericSearch = isGeneralShopeeSearch(searchTerm, destinationCategory);
  const useVariations = completeCategory && suggestions.length > 0 && (!genericSearch || filterCategory);
  const terms = useVariations
    ? [...new Set(genericSearch ? [...suggestions, searchTerm] : [searchTerm, ...suggestions])]
    : [searchTerm];
  const searchTerms: string[] = [];
  let requests = 0;
  const exhausted = new Set<string>();
  const maxRequests = 24;

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
      const perTermTarget = useVariations && page <= 2
        ? Math.max(1, Math.ceil(target / Math.min(terms.length, maxRequests)))
        : target;
      let acceptedForTerm = 0;
      for (const product of products) {
        const id = String(product?.externalId || '');
        if (!id || seen.has(id)) continue;
        seen.add(id);
        examined += 1;
        if ((bicycleOnly && !matchesCompleteBicycle(String(product?.title || ''))) ||
            (filterCategory && !matchesShopeeImportCategory(String(product?.title || ''), destinationCategory)) ||
            (!genericSearch && !matchesShopeeSearchIntent(String(product?.title || ''), searchTerm))) {
          excluded += 1;
          continue;
        }
        if (acceptedForTerm >= perTermTarget) {
          remainingMatches.push(product);
          continue;
        }
        results.push(product);
        acceptedForTerm += 1;
        if (results.length >= target) break;
      }
      if (!products.length || !result.pageInfo?.hasNextPage) exhausted.add(term);
    }
  }

  // Aproveita ofertas compatíveis já consultadas quando algumas variações têm poucas opções.
  if (results.length < target) results.push(...remainingMatches.slice(0, target - results.length));

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
      ? 'Nenhum produto compatível com a busca “' + searchTerm + '” em ' + destinationCategory + ' foi encontrado entre ' + examined + ' ofertas consultadas. Peças e produtos diferentes foram excluídos. Tente um termo mais preciso ou busque pela categoria para ver outros tipos de produto.'
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



export type ShopeeCategoryReclassificationResult = {
  ok: boolean;
  dryRun?: boolean;
  jobPrefix: string;
  category?: string;
  matchedCount?: number;
  updatedCount?: number;
  preview?: Array<{ id: string; title: string; category: string | null }>;
  utilidades?: number;
  brinquedos?: number;
  changed?: Array<{ id: string; title: string; category: string }>;
};

export async function reclassifyShopeeImportCategories(
  jobPrefix: string,
  token: string,
  targetCategory?: string,
  dryRun = false
): Promise<ShopeeCategoryReclassificationResult> {
  const prefix = jobPrefix.trim();
  if (!/^[a-f0-9]{8}$/i.test(prefix)) throw new Error('Informe os 8 primeiros caracteres do ID do lote.');
  if (!token.trim()) throw new Error('Informe o token administrativo do backend.');
  if (targetCategory !== undefined && !targetCategory.trim()) {
    throw new Error('Selecione a categoria de destino.');
  }

  const response = await fetch(apiBaseUrl() + '/api/integrations/shopee/reclassify-import-job-categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.trim()
    },
    body: JSON.stringify({
      jobPrefix: prefix,
      ...(targetCategory ? { targetCategory } : {}),
      ...(dryRun ? { dryRun: true } : {})
    })
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Falha ao corrigir as categorias do lote Shopee.');
  }
  return result as ShopeeCategoryReclassificationResult;
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


export type ShopeeAutoCategoryProduct = {
  productId: string;
  title: string;
  currentCategory: string;
  suggestedCategory: string;
  matchedBy: string;
  jobId: string;
  willChange: boolean;
};

export type ShopeeAutoCategoryReview = {
  ok: boolean;
  dryRun: boolean;
  jobPrefixes: string[];
  jobs: Array<{
    id: string;
    prefix: string;
    status: string;
    requestedCount: number;
    linkedProductCount: number;
  }>;
  totalProducts: number;
  categoryCounts: Record<string, number>;
  motoCount: number;
  plannedChanges: number;
  updatedCount: number;
  products: ShopeeAutoCategoryProduct[];
};

export async function analyzeShopeeImportJobs(
  jobPrefixes: string[],
  token: string,
  dryRun = true
): Promise<ShopeeAutoCategoryReview> {
  const prefixes = [...new Set(jobPrefixes.map((value) => value.trim().toLowerCase()).filter(Boolean))];
  if (!prefixes.length || prefixes.length > 10 || prefixes.some((value) => !/^[a-f0-9]{8}$/.test(value))) {
    throw new Error('Informe os prefixos dos lotes com 8 caracteres hexadecimais, separados por vírgula.');
  }
  if (!token.trim()) throw new Error('Informe o token administrativo no painel do site.');

  const response = await fetch(apiBaseUrl() + '/api/integrations/shopee/reclassify-import-jobs-auto-categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.trim()
    },
    body: JSON.stringify({ jobPrefixes: prefixes, dryRun })
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Não foi possível analisar os lotes Shopee.');
  }
  return result as ShopeeAutoCategoryReview;
}


export type ShopeeBatchCategoryTransferResult = {
  ok: boolean;
  dryRun: boolean;
  jobPrefixes: string[];
  targetCategory: 'MOTOS & ACESSÓRIOS';
  jobs: Array<{
    id: string;
    prefix: string;
    status: string;
    requestedCount: number;
    linkedProductCount: number;
  }>;
  totalProducts: number;
  totalLinkedRecords: number;
  plannedChanges: number;
  updatedCount: number;
  products: Array<{
    productId: string;
    title: string;
    currentCategory: string;
    targetCategory: 'MOTOS & ACESSÓRIOS';
    jobId: string;
    willChange: boolean;
  }>;
};

export async function transferShopeeImportJobsToMotos(
  jobPrefixes: string[],
  token: string,
  dryRun = true
): Promise<ShopeeBatchCategoryTransferResult> {
  const prefixes = [...new Set(jobPrefixes.map((value) => value.trim().toLowerCase()).filter(Boolean))];
  if (!prefixes.length || prefixes.length > 10 || prefixes.some((value) => !/^[a-f0-9]{8}$/.test(value))) {
    throw new Error('Informe os prefixos dos lotes com 8 caracteres hexadecimais, separados por vírgula.');
  }
  if (!token.trim()) throw new Error('Informe o token administrativo no painel do site.');

  const response = await fetch(apiBaseUrl() + '/api/integrations/shopee/reclassify-import-jobs-to-category', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token.trim()
    },
    body: JSON.stringify({
      jobPrefixes: prefixes,
      targetCategory: 'MOTOS & ACESSÓRIOS',
      dryRun
    })
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Não foi possível transferir os lotes para MOTOS & ACESSÓRIOS.');
  }
  return result as ShopeeBatchCategoryTransferResult;
}
