import { CATEGORIES } from '../data/mockProducts';

const normalizeKey = (value: unknown) =>
  typeof value === 'string'
    ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    : '';

// Só classifica como acessório de celular quando um item próprio de celular
// aparece ligado a um aparelho; palavras isoladas como “película” ou “capa”
// não bastam (ex.: película de unha, capa de máquina, “capacidade”).
const mobilePhoneAccessoryPattern = /\b(peliculas?|capas?|capinhas?|cases?|pouch|estojos?|suportes?|carregadores?|cabos?|power bank|protetores? de tela)\b.{0,120}\b(celular|smartphone|iphone|galaxy|android|samsung|xiaomi|motorola|redmi|phone)\b|\b(celular|smartphone|iphone|galaxy|android|samsung|xiaomi|motorola|redmi|phone)\b.{0,120}\b(peliculas?|capas?|capinhas?|cases?|pouch|estojos?|suportes?|carregadores?|cabos?|power bank|protetores? de tela)\b/;


// Categorias definidas para os produtos selecionados dos lotes do feed Shopee.
const curatedCategoryByTitle = new Map<string, string>([
  [normalizeKey("Caneta esferográfica 1.0 Trilux Colors SM/032ESC10\\343210 com 10 unidades Faber-Castell"), 'Utilidades'],
  [normalizeKey("Caderno Moleskine | C/Pauta | Floresça Onde Deus Te Plantou"), 'Utilidades'],
  [normalizeKey("Kit 5 Peças Dry Fit 3 Camisetas e 2 Bermudas Alpha Co"), 'Esportes & Lazer'],
  [normalizeKey("Mini Bike Ergometrica Cicloergometro Pedalinho Monitor Lcd"), 'Esportes & Lazer'],
  [normalizeKey("Kit Jogo Frescobol Tênis De Praia 2 Raquetes Madeira + Bola"), 'Esportes & Lazer'],
  [normalizeKey("Pote herméticos quadrado Ou 800ml Linha Click"), 'Casa & Cozinha'],
  [normalizeKey("Pote hermético organizador retangular Ou 2,3L Linha Keep"), 'Casa & Cozinha'],
  [normalizeKey("Porta Tempero Inox Giratório Vidro 12 Potes 360"), 'Casa & Cozinha'],
  [normalizeKey("espátula de silicone redonda com cabo de madeira resistente para cozinha - oikos"), 'Casa & Cozinha'],
  [normalizeKey("Tabua de Corte Dupla Face Antiderrapante Carnes Legumes 35cm"), 'Casa & Cozinha'],
  [normalizeKey("Bolsa Pequena Feminina de Mão e Tiracolo Bolsinha Transversal Clutch Mini Bag"), 'Moda Feminina'],
  [normalizeKey("Regata Streetwear Camisa Masculina Estilo Verão Praia Summer Blusa Cavada Unissex Larga Algodão"), 'Moda Masculina'],
  [normalizeKey("Edredom Cama Quarto Casal Queen Dupla Face Quentinho"), 'Utilidades'],
  [normalizeKey("Kit Cobre Leito Colcha Casal 3 Peças Boutis Estampada Dupla Face Porta Travesseiro Aba Americana"), 'Utilidades'],
  [normalizeKey("Escrivaninha De Estudos Home Office 1 Gaveta Bonatto Oficial"), 'Utilidades'],
  [normalizeKey("Kit Jogo Pano De Prato Cozinha Copa Cheff Algodão Sortidos"), 'Utilidades'],
  [normalizeKey("Tapete Sala 1,50x1,00 Peludo 4 Cm De Altura Shaggy Promoção"), 'Utilidades'],
  [normalizeKey("Cabo De Carregamento Rápido Baseus Pd Usb C Para Typec Qc 4.0 Para iPhone 15 / Xiaomi / Huawei / Macbook (100W)"), 'Acessórios para celulares'],
  [normalizeKey("Inova Carregador Portátil Power Bank Grande 20000mah/10000mAh Turbo 22.5W PD Rápido Com Display Portátil"), 'Acessórios para celulares'],
  [normalizeKey("Teclado Mecanico Gamer TGT Sherman Compacto, Rainbow, ABNT2, Switch Azul, Preto, TGT-SHTKL-RBW01"), 'Computadores'],
  [normalizeKey("Mouse Para Jogos Sem Fio Leve ATTACK SHARK X11 Com Base De Carregamento RGB Tri-Mode-2.4G/USB-C/BT"), 'Computadores'],
  [normalizeKey("UGREEN USB Bluetooth 5.4 5.3 Adaptador Receptor De Transmissor Sem Fio Dongle Para PC Windows 11 10 8.1 7 Fone De Ouvido"), 'Computadores'],
]);

const canonicalCategories = new Map(
  CATEGORIES.filter((category) => category !== 'Todas as Categorias')
    .map((category) => [normalizeKey(category), category])
);

const categoryAliases: Record<string, string> = {
  'moda infantil': 'CALÇADOS INFANTIS M/F',
  'cama mesa e banho': 'CAMA/MESA/BANHO',
  'cama mesa banho': 'CAMA/MESA/BANHO',
  'moda praia': 'MODA VERÃO PRAIA',
  'moda verao e praia': 'MODA VERÃO PRAIA',
  'armarinhos': 'ARMARINHOS & TRICÔ',
  'trico': 'ARMARINHOS & TRICÔ',
  'armarinhos e trico': 'ARMARINHOS & TRICÔ',
  'tecnologia': 'ELETRÔNICOS',
  'casa construcao': 'Ferramentas',
  'home living': 'Ferramentas',
  'home decor': 'Ferramentas',
  'home improvement': 'Ferramentas',
  'construction tools': 'Ferramentas',
  'sports outdoors': 'Esportes & Lazer',
  'sports recreation': 'Esportes & Lazer',
  'toys': 'Brinquedos',
  'toy': 'Brinquedos',
  'toys games': 'Brinquedos',
  'toys and games': 'Brinquedos',
  'kids toys': 'Brinquedos',
  'baby toys': 'Brinquedos',
  'games consoles': 'Games',
  'video games': 'Games',
  'video game consoles': 'Games',
  'home kitchen': 'Casa & Cozinha',
  'kitchen dining': 'Casa & Cozinha',
  'kitchenware': 'Casa & Cozinha',
  'home appliances': 'Eletrodomésticos',
  'appliances': 'Eletrodomésticos',
  'furniture': 'Móveis',
  'electronics': 'ELETRÔNICOS',
  'consumer electronics': 'ELETRÔNICOS',
  'computers accessories': 'Computadores',
  'computer accessories': 'Computadores',
  'laptops': 'Notebook',
  'laptop': 'Notebook',
  'mobile phones': 'Smartphones',
  'cell phones': 'Smartphones',
  'smartphones': 'Smartphones',
  'phone accessories': 'Acessórios para celulares',
  'mobile phone accessories': 'Acessórios para celulares',
  'audio': 'Aparelhos de Som',
  'audio equipment': 'Aparelhos de Som',
  'headphones': 'Fones & Headphones',
  'earphones': 'Fones & Headphones',
  'women clothes': 'Moda Feminina',
  'men clothes': 'Moda Masculina',
  'baby kids fashion': 'CALÇADOS INFANTIS M/F',
  'pets animals': 'Pets',
  'pet supplies': 'Pets',
  'pet accessories': 'Pets',
  'animal supplies': 'Pets',
  'musical instruments': 'Instrumentos Musicais',
  'music instruments': 'Instrumentos Musicais',
  'instruments': 'Instrumentos Musicais',
  'automotivo': 'MOTOS & ACESSÓRIOS',
  'automotive': 'MOTOS & ACESSÓRIOS',
  'car accessories': 'MOTOS & ACESSÓRIOS',
  'mens clothing': 'Moda Masculina',
  'men clothing': 'Moda Masculina',
  'mens fashion': 'Moda Masculina',
  'womens clothing': 'Moda Feminina',
  'women clothing': 'Moda Feminina',
  'womens fashion': 'Moda Feminina',
  'kids clothing': 'CALÇADOS INFANTIS M/F',
  'children clothing': 'CALÇADOS INFANTIS M/F',
  'baby clothing': 'CALÇADOS INFANTIS M/F',
  'kids fashion': 'CALÇADOS INFANTIS M/F',
  'calcados': 'Calçados Masculino',
  'calcados masculinos': 'Calçados Masculino',
  'calcados femininos': 'Calçados Femininos',
  'men shoes': 'Calçados Masculino',
  'mens shoes': 'Calçados Masculino',
  'women shoes': 'Calçados Femininos',
  'womens shoes': 'Calçados Femininos',
  'shoes': 'Calçados Masculino',
  'footwear': 'Calçados Masculino',
  'sports leisure': 'Esportes & Lazer',
  'beauty': 'Cuidado & Beleza',
  'beauty personal care': 'Cuidado & Beleza',
  'personal care': 'Cuidado & Beleza',
  'food beverage': 'Alimentos & Bebidas',
  'food beverages': 'Alimentos & Bebidas',
  'groceries': 'Alimentos & Bebidas',
  'household': 'Utilidades',
  'household supplies': 'Utilidades',
  'home organization': 'Utilidades',
};

const inferFromText = (title: string, description: string): string | undefined => {
const text = normalizeKey(title + ' ' + description);
const titleKey = normalizeKey(title);

  const tvLedAccessory = /\b(barras? de led|led bars?|led strips?|fitas? led)\b/.test(titleKey) &&
    /\b(tvs?|televisao|televisor|televisions?)\b/.test(titleKey);
  if (tvLedAccessory) return 'ELETRÔNICOS';

  const utilityOverride = /\b(porta chaves?|porta chaveiro|key holders?|key racks?)\b/.test(titleKey) ||
    /\bcortadores? de biscoitos?\b/.test(titleKey) ||
    (/\b(arejador(?:es)?|aerador(?:es)?|ejador(?:es)?)\b/.test(titleKey) && /\b(torneiras?|tornerias?|faucets?|taps?)\b/.test(titleKey));
  if (utilityOverride) return 'Utilidades';

  if (/(papel de parede|wallpaper)/.test(titleKey) && /(ps4|playstation|playgaming|gaming|gamer)/.test(titleKey)) return 'Utilidades';

  // As novas abas têm prioridade sobre categorias genéricas antigas do feed.
  // Sensores de torneira e módulos de deteção/controlos elétricos vão para a
  // categoria elétrica/hidráulica, não para Utilidades ou Luminárias.
  const plumbingFixture = /\b(torneiras?|tornerias?|faucets?|taps?|bacias?|cubas?|lavatorios?|lavabos?|sifoes?|ralos?)\b/.test(titleKey);
  const electricalSensor = /\b(sensor|modulo)\b/.test(titleKey) &&
    /\b(infravermelho|corpo humano|radar|movimento|controle de luz|luz sonora)\b/.test(titleKey);
  if (plumbingFixture || electricalSensor) return 'ELÉTRICA & HIDRÁULICA';

  if (/\b(luminarias?|abajures?|lustres?|arandelas?|pendentes?|plafons?|spots? de luz|lampadas?|luzes? de mesa|luz noturna|desk lamps?|table lamps?|floor lamps?|wall lamps?|light fixtures?|ceiling lights?)\b/.test(titleKey)) return 'LUMINÁRIAS';
  const laptopCarryItem = /\bmaletas?(?: de| para)? (?:notebook|laptop)\b|\bporta[- ]?(?:notebook|laptop)s?\b/.test(titleKey);
  if (laptopCarryItem || /\b(mochilas?|backpacks?|rucksacks?)\b/.test(titleKey)) return 'BOLSAS & MOCHILAS';

  // Brinquedos que citam máquina de lavar não são eletrodomésticos reais.
  if (/(kit lavanderia.{0,40}boneca|lavanderia.{0,40}boneca|boneca.{0,40}(lavanderia|maquina de lavar))/.test(titleKey)) return 'Brinquedos';
  // Peças de lavadoras, tanquinhos, fogões e fornos são acessórios de eletro.
  // Não deslocar ferramentas usadas para desmontar/reparar esses aparelhos.
  const toolForAppliance = /^(chave|ferramenta|extrator|saca|kit de ferramentas)\b/.test(titleKey);
  const washerOrAppliancePart = /(molas? de tirantes?|kit.{0,35}vara de suspensao.{0,45}(lavadora|tanquinho|maquina de lavar)|kit.{0,45}(potencia|mangueiras?).{0,50}(lavadora|tanquinho|maquina de lavar)|membranas?.{0,40}(painel|lavadora)|motor(?:es)?.{0,35}tanquinho|polias?.{0,35}tanquinho|grades?.{0,35}fornos?|grelhas?.{0,35}fornos?|grades?.{0,35}(de|para) forno|grelhas?.{0,35}(de|para) forno|p[eé]s?.{0,25}fogao|tampinhas?.{0,25}fogao|retentor(?:es)?.{0,55}(lavadora|tanquinho|maquina de lavar|fogao|forno)|porcas?.{0,55}(lavadora|tanquinho|maquina de lavar|fogao|forno)|(lavadora|tanquinho|maquina de lavar|fogao|forno).{0,55}porcas?|((tirantes?|pressostatos?|agitador(?:es)?|atuador(?:es)?|mangueiras?|juntas?|cintas?|bandas?|protetor(?:es)? de polia|p[eé]s?).{0,70}(lavadora|tanquinho|maquina de lavar)|(lavadora|tanquinho|maquina de lavar).{0,70}(tirantes?|pressostatos?|agitador(?:es)?|atuador(?:es)?|mangueiras?|juntas?|cintas?|bandas?|protetor(?:es)? de polia|p[eé]s?)))/.test(titleKey);
  if (!toolForAppliance && washerOrAppliancePart) return 'ELETRO & ACESSÓRIOS';

  // Alimentos e utensílios/acessórios de Air Fryer não são eletrodomésticos.
  if (/\badocantes?\b/.test(text)) return 'Alimentos & Bebidas';
  if (/(botao|peca|reparo|reposicao).{0,60}air fryer|air fryer.{0,60}(botao|peca|reparo|reposicao)/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/(silicone.{0,50}(panela|forma|forro|cesto).{0,70}air fryer|air fryer.{0,70}(silicone.{0,50}(panela|forma|forro|cesto)|forro|papel descartavel|pegador|pinca|limpa|limpeza|desengordurante)|forro.{0,50}air fryer|pegador culinario.{0,60}air fryer|pinca.{0,60}air fryer|tapete.{0,40}silicone.{0,40}air fryer|limpa air fryer|kit.{0,40}limpa air fryer)/.test(titleKey)) return 'Utilidades';
  if (/(fogareiro|fogao).{0,50}eletric|eletric.{0,50}(fogareiro|fogao)/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';

  // O produto principal prevalece sobre acessórios incluídos no kit ou citados
  // como compatibilidade no título.
  if (/\bmoto serras?\b|\bmotosserras?\b/.test(titleKey)) return 'Ferramentas';
  if (/(mini moto de dedo|moto de dedo|moto.{0,35}brinquedo|brinquedo.{0,35}moto)/.test(titleKey)) return 'Brinquedos';
  if (/^(kit )?(pc gamer|computador.{0,25}(gamer|desktop)|desktop.{0,25}gamer)/.test(titleKey)) return 'Computadores';
  if (/(som automotivo|radio automotivo|radio de carro|som de carro|aparelho de som.{0,45}(carro|automotivo)|radio veicular)/.test(titleKey)) return 'AUTO & ACESSÓRIOS';
  if (/(radio portatil|radio fm|radio am|radio digital|radio de emergencia|radio transistor|receptor de radio)/.test(titleKey)) return 'Aparelhos de Som';
  if (/(bicicleta ergometrica|bicicleta de academia|bike de academia)/.test(titleKey)) return 'Esportes & Lazer';
  if (/(electric scooter|scooter eletrica|bicicleta.{0,70}(eletrica|bateria|motor)|bike.{0,70}(eletrica|bateria|motor)|e bike|ebike)/.test(titleKey) ||
      (/\b(bicicleta|bike)\b/.test(titleKey) && !/(ergometrica|de academia)/.test(titleKey))) return 'Bike Elétrica e Acessórios';

  // O tipo concreto do produto prevalece sobre termos de público como “feminino”.
  const footwear = /\b(tenis|sapatos?|sandalias?|chinelos?|botas?|sapatilhas?|scarpins?|calcados?|chuteiras?|mocassins?|coturnos?|tamancos?)\b/.test(text);
  const feminineAudience = /\b(feminin[oa]s?|mulheres?|women|womens)\b/.test(text);
  const masculineAudience = /\b(masculin[oa]s?|homens?|men|mens)\b/.test(text);
  if (footwear && feminineAudience && masculineAudience) return undefined;
  if (footwear && feminineAudience) return 'Calçados Femininos';
  if (footwear && masculineAudience) return 'Calçados Masculino';
  if (/\b(perfumes?|shampoos?|cosmeticos?|hidratantes?|maquiagens?|skincare|esmaltes?|protetor(?:es)? solar(?:es)?)\b/.test(text) &&
      feminineAudience && !/\b(bone|chapeu|viseira|visor)\b/.test(text)) return 'Cuidado & Beleza';
  if (/(agulhas? (de|para) (costura|bordado|ponto cruz|colcha)|linhas? (de|para) costura|linhas? de colcha|fios? (de|para) croch[e]|l[aã] (para|de) tric[o]|barbante|novelo|calcador.{0,50}maquina de costura|acessorios? (para|de) maquina de costura|kit de costura|ziper invisivel|botoes? de pressao|\btear\b)/.test(text)) return 'ARMARINHOS & TRICÔ';
  if (/(tapetes?.{0,30}(banheiro|banho|box|chuveiro)|(banheiro|banho|box|chuveiro).{0,30}tapetes?|toalhas?.{0,25}(banho|banheiro|rosto)|roupao|jogo de cama|lencol|fronha|edredom|colcha|capa de colchao|toalha de mesa|caminho de mesa|guardanapo de tecido)/.test(text)) return 'CAMA/MESA/BANHO';
  if (/(smartwatch|smart watch|relogio inteligente|galaxy watch|apple watch)/.test(text) && !/(headphones?|fone[s]? de ouvido|earbuds?)/.test(text)) return 'RELÓGIOS';
  if (/(pelicula|capa|capinha|case|pouch|estojo|suporte|carregador|cabo|power bank|protetor de tela).{0,120}(celular|smartphone|iphone|galaxy|android|samsung|xiaomi|motorola|redmi|phone)|(celular|smartphone|iphone|galaxy|android|samsung|xiaomi|motorola|redmi|phone).{0,120}(pelicula|capa|capinha|case|pouch|estojo|suporte|carregador|cabo|power bank|protetor de tela)/.test(text)) return 'Acessórios para celulares';
  if (/(som automotivo|radio automotivo|radio de carro|som de carro|aparelho de som.{0,45}(carro|automotivo)|carro.{0,45}(radio|som automotivo)|amplificador.{0,60}(carro|automotivo|veicular)|audio.{0,60}(carro|automotivo|veicular)|moldura.{0,35}(radio|som))/.test(text)) return 'AUTO & ACESSÓRIOS';
  if (/\bmoto\b|motocicleta|capacete|bauleto|cb ?\d|biz 125|crosser|twister/.test(text) && !/(bicicleta.{0,40}eletrica|bike.{0,40}eletrica|e bike|ebike|motorola.{0,20}\bmoto\b)/.test(text)) return 'MOTOS & ACESSÓRIOS';
  if (/(headset|fone de ouvido|headphone).{0,60}(mouse gamer|teclado gamer)|(mouse gamer|teclado gamer).{0,60}(headset|fone de ouvido|headphone)/.test(text)) return 'Computadores';
  if (/(fone[s]? (bluetooth|sem fio|tws|gamer|de ouvido)|headset|headphone|fone de ouvido|fone gamer|earphone|earbud)/.test(text) && !/(amplificador|amplifier|\bdac\b)/.test(text)) return 'Fones & Headphones';
  if (/\b(microfone|microfones)\b/.test(text)) return 'Aparelhos de Som';
  if (/(videogame|video game|mini game|console gamer|console de jogos|game console|console de videogame|joystick|controle gamer)/.test(text)) return 'Games';
  if (/\b(air fryer|fritadeira eletrica|fritadeira a ar)\b/.test(text)) return 'Eletrodomésticos';

  // Regras prioritárias: elas corrigem categorias genéricas que chegam do feed.
  // A ordem é intencional: acessórios e peças específicas vencem a categoria
  // ampla atribuída pela plataforma.
  // Roupas com tricô, crochê ou renda continuam sendo Moda Feminina; só os
  // materiais e ferramentas de artesanato ficam em Armarinhos & Tricô.
  if (/(vestido|saia|camisola|pijama|macacao|jaqueta|casaco|moletom|blusa|blusao|top|lingerie|sutia|conjunto|calca|shorts?|bermuda|roupa)/.test(text) &&
      /(feminin|mulher|senhora|women|menina|tric[oô]|croche|renda|boho|florid|verao|cetim|decote|alca|vestido|saia|camisola)/.test(text) &&
      !/(agulha|linha de bordado|fio de bordado|barbante|kit de croche|conjunto de acessorios|acessorios de renda|fita de cetim)/.test(text)) return 'Moda Feminina';
  if (/(feminin|mulher|senhora|women|menina)/.test(text) &&
      !/(agulha|linha|fio|barbante|croche|tric[oô]|costura|bordado|acessorios de renda|fita de cetim|artesanato)/.test(text)) return 'Moda Feminina';
  if (/\b(guarda roupa|roupeiro|closet|wardrobe)\b/.test(text)) return 'Móveis';
  if (/(armario|armário).{0,45}(quarto|porta|modulado|modular|roupeiro|closet)?/.test(text) &&
      !/(organizador|caixa organizadora|armario organizador)/.test(text)) return 'Móveis';
  if (/(croche|crochetar|\btrico\b|agulha[s]? de (croche|trico)|agulha[s]? para (croche|trico)|linha[s]? de (croche|trico)|fio[s]? de (croche|trico)|la para trico|barbante|\btear\b|bordado|bordadeira|costura|linha para bordar|fio para bordado)/.test(text)) return 'ARMARINHOS & TRICÔ';
  // Ferramentas têm prioridade mesmo quando o anúncio usa palavras como
  // "brinquedo" ou "acessório" para descrever o formato do produto.
  if (/(furadeira|parafusadeira|serra|serrote|martelo|martelete|broca|motosserra|esmerilhadeira|lixadeira|alicate|chave[s]? de|chave sextavada|chave allen|chave torx|chave philips|chave de fenda|kit de ferramentas|caixa de ferramentas|organizador de ferramentas|escada|grampeador|pregador|torno|chave inglesa|(?:organizador|caixa organizadora).{0,80}(parafuso|bucha|cavilha|fixador|terminal|ferramenta))/.test(text) &&
      !/(martelo de carne|amaciador de carne|batedor de carne|amassador de carne)/.test(text)) return 'Ferramentas';
  if (/(impressora|jato de tinta|plotter|scanner|rotulador|etiquetadora|gravadora a laser|gravacao a laser|cortadora|rolo rotativo|prensa termica|maquina gravadora)/.test(text)) return 'MÁQUINAS & IMPRESSORAS';
  if (/(toyota|yaris|corolla|honda|volkswagen|fiat|ford|chevrolet|hyundai|kia).{0,90}(valvula|virabrequim|cabecote|motor|pistao|biela|embreagem|comando|peca)|\b(virabrequim|cabecote|pistao|biela|tampa( de)? valvulas?)\b/.test(text)) return 'AUTO & ACESSÓRIOS';
  if (/(microondas|micro ondas|forno).{0,80}(prato|carrossel|carrocel|bandeja|suporte)|\b(prato|carrossel|carrocel|bandeja).{0,80}(microondas|micro ondas|forno)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(capacitor|fusivel|magnetron|membrana.{0,35}(microondas|micro ondas)|motor prato|prato.{0,35}(microondas|micro ondas)|kit mica|eletrobomba|batedor.{0,35}(batedeira|tanquinho)|bucha.{0,35}(agitador|lavadora)|gabinete.{0,35}(maquina de lavar|lavadora)|bomba de agua.{0,35}(maquina de lavar|lavadora)|conjunto eletrodo.{0,25}(fogao|cooktop)|kit.{0,35}(espalhador|queimador).{0,25}fogao|acessorios?.{0,45}(fogao|microondas|micro ondas|lavadora|tanquinho|aspirador|geladeira|batedeira)|pecas?.{0,45}(fogao|microondas|micro ondas|lavadora|tanquinho|aspirador|geladeira|batedeira)|fusivel.{0,45}(microondas|micro ondas)|termostato.{0,45}(microondas|micro ondas))/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(pc gamer|computador gamer|computador desktop|desktop gamer|placa mae|placa de video|memoria ram|processador para pc|processador intel|processador amd)/.test(text)) return 'Computadores';
  if (/(painel|rack|estante|moveis?).{0,45}(tv|televisao)|\b(tv|televisao).{0,45}(painel|rack|estante|moveis?)/.test(text)) return 'Móveis';
  if (/(smart ?tv|televis|\btv\b)/.test(text)) return 'TVs';
  if (/(smartphone|celular|iphone|galaxy|poco [a-z0-9]+|android phone)/.test(text)) return 'Smartphones';
  if (/(videogame|video game|mini game|console gamer|playstation|xbox|nintendo|joystick|controle gamer)/.test(text)) return 'Games';
  // Peças hidráulicas e kits de fixação prevalecem sobre a categoria genérica
  // da Shopee (alguns itens deste tipo chegam incorretamente marcados como Pets).
  if (/(valvula.{0,45}(esgoto|retencao|hidraul|agua|descarga)|esgoto.{0,45}valvula|tubo.{0,35}(hidraul|esgoto)|conexao.{0,35}(hidraul|esgoto)|sifao|ralo.{0,30}(banheiro|pia|esgoto)|encanamento|hidraulica)/.test(text)) return 'Ferramentas';
  if (/(bucha.{0,45}(fixacao|parede|parafuso|gancho)|parafuso.{0,35}(fixacao|bucha)|gancho.{0,35}(bucha|fixacao|parede)|fixacao.{0,35}(parede|bucha|gancho)|kit.{0,30}(bucha|parafuso|gancho)|buchas? de fixacao)/.test(text)) return 'Ferramentas';
  // Animais e produtos para animais têm prioridade sobre brinquedos e eletros.
  if (/\b(racao|petiscos?|cachorros?|caes|cao|gatos?|coleiras?|peitoral|arranhador|aquario|passaro|comedouro|bebedouro pet|produto pet|pets?)\b/.test(text)) return 'Pets';
  // Sinais específicos vencem palavras genéricas como "boneca", "brinquedo"
  // ou "pelúcia" usadas no título do anúncio.
  if (/(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado|chuteira|mocassim|coturno|tamanco).{0,55}(feminino|mulher|women)|\b(feminino|mulher|women).{0,55}(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado|chuteira|mocassim|coturno)/.test(text)) return 'Calçados Femininos';
  if (/(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado|chuteira|mocassim|coturno).{0,55}(masculino|homem|men)|\b(masculino|homem|men).{0,55}(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado|chuteira|mocassim|coturno)/.test(text)) return 'Calçados Masculino';
  if (/(escova de limpeza|escova para limpeza|limpeza|limpador|limpa janela|limpa vidro|faxina|lavagem|higienizacao|higienizador|lixeira|lixo|cesto de lixo|organizador|caixa organizadora|cesto|cesta|armazenamento|multiuso|armario organizador|luminaria|abajur|luz noturna|luz de mesa)/.test(text)) return 'Utilidades';
  if (/(cozinha infantil de brinquedo|cozinha de brinquedo|mini cozinha.{0,25}brinquedo|fogao.{0,25}de brinquedo|kit cozinha infantil.{0,25}brinquedo)/.test(text)) return 'Brinquedos';
  // Utensílios de cozinha vencem termos comerciais como "multifuncional";
  // frigideiras e panelas não são máquinas nem impressoras.
  if (/(frigideira|panela|espremedor manual|espremedor de frutas|utensilio de cozinha|prato|talher|cozinha|garrafa termica|cafeteira|chaleira|jarra para cafeteira)/.test(text)) return 'Casa & Cozinha';
  // Equipamentos de preparo de alimentos não são computadores, mesmo quando
  // o anúncio usa "processador" ou "multifuncional".
  if (/(mixer|batedeira|liquidificador|triturador de alimentos|processador de alimentos|processador.{0,30}(ovo|alimento|cozinha)|triturador.{0,30}(ovo|alimento|cozinha))/.test(text)) return 'Eletrodomésticos';
  // Cortadoras de papel e máquinas de corte pertencem a Máquinas & Impressoras,
  // ainda que o feed tenha enviado a categoria Notebook.
  if (/(maquina de corte|cortadora de papel|cortador de papel|corte de papel|papel redondo)/.test(text)) return 'MÁQUINAS & IMPRESSORAS';
  if (/(capacitor|capacitores).{0,70}(microondas|micro ondas|forno)|\b(microondas|micro ondas|forno).{0,70}(capacitor|capacitores)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(monitor|display).{0,55}(computador|pc|desktop|hdmi|vga)|\b(computador|pc|desktop).{0,55}(monitor|display)/.test(text)) return 'Computadores';
  if (/(tanquinho|maquina de lavar|lavadora|lavar roupa).{0,90}(\d+\s?kg|programas?|timer|capacidade|centrifug|automatica|automatico|digital)|\b(tanquinho|maquina de lavar|lavadora)\b/.test(text)) return 'Eletrodomésticos';
  if (/(brinqued|boneca|boneco|lego|pelucia|quebra cabeca|massinha|playset|carrinho infantil|jogo infantil|tabuleiro infantil|fantasia infantil)/.test(text)) return 'Brinquedos';
  if (/(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado).{0,55}(feminino|mulher|women)|\b(feminino|mulher|women).{0,55}(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado)/.test(text)) return 'Calçados Femininos';
  if (/(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado).{0,55}(masculino|homem|men)|\b(masculino|homem|men).{0,55}(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado)/.test(text)) return 'Calçados Masculino';
  if (/(teclado gamer|teclado mecanico gamer|mouse gamer|mouse para jogos|monitor para pc|webcam|hub usb|adaptador bluetooth para pc|placa de video|memoria ram|processador)/.test(text)) return 'Computadores';
  if (/(martelo de carne|amaciador de carne|batedor de carne|amassador de carne|ralador|descascador|abridor de lata|utensilio culinario)/.test(text)) return 'Casa & Cozinha';
  if (/(escova de limpeza|escova para limpeza|limpeza|limpador|limpa janela|limpa vidro|faxina|lavagem|higienizacao|higienizador)/.test(text)) return 'Utilidades';
  if (/(organizador|caixa organizadora).{0,80}(parafuso|bucha|cavilha|fixador|terminal|ferramenta)|\b(kit|caixa) de ferramentas\b/.test(text)) return 'Ferramentas';
  if (/(organizador|caixa organizadora|cesto|cesta|armazenamento|multiuso|armario organizador|luminaria|luminaria de mesa|abajur|luz de mesa|mosquiteiro|mosquiteira)/.test(text)) return /mosquiteir/.test(text) ? 'CAMA/MESA/BANHO' : 'Utilidades';
  if (/(escorredor de louca|escorredor de pratos|secador de louca|secador de pratos|porta pratos|prateleira de cozinha)/.test(text)) return 'Casa & Cozinha';
  if (/(extratora|lavadora de estofados|limpa estofado|aspirador de estofado)/.test(text)) return 'Eletrodomésticos';
  if (/(pneu|camara de ar).{0,35}(bicicleta|bike)|\b(bicicleta|bike).{0,45}(pneu|camara de ar|e bike|eletrica)/.test(text)) return 'Bike Elétrica e Acessórios';
  if (/(torneira|registro de agua|arejador|adaptador de torneira|conector de torneira|mangueira de torneira)/.test(text)) return 'Utilidades';
  if (/(tomada|interruptor|plugue|adaptador eletrico|conector eletrico|soquete)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(mini impressora|impressora termica|impressora portatil|rotulador|etiquetadora)/.test(text)) return 'MÁQUINAS & IMPRESSORAS';
  // TV continua em TVs mesmo quando o anúncio também inclui soundbar.
  if (/(smart ?tv|televis|\btv\b)/.test(text)) return 'TVs';
  if (/(som carro|radio automotivo|radio carro|aparelho radio automotivo|alto falante automotivo)/.test(text)) return 'AUTO & ACESSÓRIOS';
  if (/(radio|aparelho de som|caixa de som|soundbar|microfone)/.test(text)) return 'Aparelhos de Som';
  if (/(amplificador|alto falante de som|saude auditiva|radio portatil|radio fm|speaker|caixa de som|aparelho de som|som bluetooth)/.test(text)) return 'Aparelhos de Som';
  if (/(bicicleta ergometrica|bicicleta de academia|bike de academia)/.test(text)) return 'Esportes & Lazer';
  if (/(bicicleta|bike|e bike|ebike|bike eletrica|bicicleta eletrica)/.test(text)) return 'Bike Elétrica e Acessórios';
  if (/(mochila|mala|bolsa|case|capa).{0,45}(notebook|laptop)|\b(conector|adaptador|fonte|carregador|alto falante).{0,45}(notebook|laptop)/.test(text)) return /\b(conector|adaptador|fonte|carregador|alto falante)\b/.test(text) ? 'Computadores' : 'Utilidades';
  if (/(headset|headphone|fone de ouvido|fone gamer|earphone|earbud)/.test(text)) return 'Fones & Headphones';
  if (/(lixeira|lixo|cesto de lixo|cesto para lixo|varal|cabideiro|secador de roupas|organizador de roupas|cabide|prendedor de roupa)/.test(text)) return 'Utilidades';
  if (/(lavadora de alta pressao|maquina de lavar.{0,30}alta press|hidrolavadora|lavadora pressao)/.test(text)) return 'Ferramentas';
  // Motores e peças de tanquinho pertencem a peças de eletrodomésticos;
  // o tanquinho completo pertence a Eletrodomésticos.
  if (/(motor|peca|modulo|sensor|bomba|agitador).{0,45}(tanquinho|lavadora|maquina de lavar)|\b(tanquinho|lavadora|maquina de lavar).{0,45}(motor|peca|modulo|sensor|bomba|agitador)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(tanquinho|maquina de lavar|lavadora|lavar roupa).{0,90}(\d+\s?kg|programas?|timer|capacidade|centrifug|automatica|automatico|digital)|\b(tanquinho|maquina de lavar|lavadora)\b/.test(text)) return 'Eletrodomésticos';
  if (/(acendedor|acendimento|chicote|interruptor|usina|resistencia|resisival|membrana|teclado|display|diodo|magnetron|pressostato|eletrobomba|suspensao|kit mica|ponta piteira|placa|interface|bomba drenagem).{0,80}(fogao|forno|cooktop|fogareiro|lavadora|lavar|micro ondas|microondas)|\b(fogao|forno|cooktop|fogareiro|lavadora|lavar|micro ondas|microondas).{0,80}(acendedor|acendimento|chicote|interruptor|usina|resistencia|resisival|membrana|teclado|display|diodo|magnetron|pressostato|eletrobomba|suspensao|kit mica|ponta piteira|placa|interface|bomba drenagem)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(fogao eletrico|fogareiro eletrico|fogao portatil|fogao semi industrial|fogao de ferro)/.test(text)) return 'Eletrodomésticos';
  if (/(painel|rack|estante|moveis?).{0,45}(tv|televisao)|\b(tv|televisao).{0,45}(painel|rack|estante|moveis?)/.test(text)) return 'Móveis';
  if (/(smart ?tv|televis|\btv\b)/.test(text)) return 'TVs';
  if (mobilePhoneAccessoryPattern.test(text)) return 'Acessórios para celulares';
  if (/(smartphone|celular|iphone|android phone)/.test(text)) return 'Smartphones';
  if (/(smartwatch|smart watch|relogio inteligente|galaxy watch|apple watch)/.test(text)) return 'RELÓGIOS';
  if (/(honda|motociclet|\bmoto\b|gear shift|pedal de moto|protetor de calcado|protetor de tenis)/.test(text)) return 'MOTOS & ACESSÓRIOS';
  if (/(carro|automotivo|veiculo|autopeca|acessorio automotivo|tapete automotivo|suporte veicular|camera veicular)/.test(text)) return 'AUTO & ACESSÓRIOS';
  if (/(ferramenta|furadeira|parafusadeira|serra|serrote|martelo|martelete|broca|motosserra|esmerilhadeira|lixadeira|alicate|chave[s]? de|kit de ferramentas|caixa de ferramentas|organizador de ferramentas|escada|grampeador|pregador|torno|chave inglesa)/.test(text)) return 'Ferramentas';
  if (/(impressora|jato de tinta|multifuncional|plotter|scanner|rotulador|etiquetadora)/.test(text)) return 'MÁQUINAS & IMPRESSORAS';
  if (/(espalhador|tampinha|boca[s]? de fogao|sorvete[s]? fogao|protetor fogao|queimador|kit completo.{0,35}fogao|acessorio[s]? de fogao)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  // Peças, módulos e reposição de lavadoras e micro-ondas são acessórios de eletro.
  if (/(peca|modulo|sensor|agitador|micro chave|protetor de polia|banda|cinta|atuador|tirante|reparo|reposicao).{0,80}(lavadora|lavar|maquina de lavar|micro ondas|microondas|brastemp|consul)|\b(lavadora|maquina de lavar|micro ondas|microondas).{0,80}(peca|modulo|sensor|agitador|micro chave|protetor|banda|cinta|atuador|tirante|reparo|reposicao)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(frigideira|panela|espremedor manual|espremedor de frutas|utensilio de cozinha|prato|talher|cozinha|garrafa termica|cafeteira|chaleira|jarra para cafeteira)/.test(text)) return 'Casa & Cozinha';
  if (/(bico infravermelho|sensor.{0,35}torneira|torneira.{0,35}sensor)/.test(text)) return 'Utilidades';
  // Vestidos, saias e peças explicitamente femininas não podem cair em Moda Masculina
  // só porque o feed forneceu essa categoria genérica.
  if (/(vestido|saia|cropped|lingerie|blusa feminina|calca feminina|calca de mulher|moda feminina|feminina|mulher|women)/.test(text)) return 'Moda Feminina';
  if (/(camisa|camiseta|regata|shorts?|bermuda|calca|blusa|roupa|jaqueta)/.test(text)) {
    if (/(infantil|bebe|crianca|kids)/.test(text)) return 'CALÇADOS INFANTIS M/F';
    if (/(feminin|mulher|women)/.test(text)) return 'Moda Feminina';
    return 'Moda Masculina';
  }

  if (/(croche|crochetar|\btric[oô]\b|agulha[s]? de (croche|trico)|agulha[s]? para (croche|trico)|linha[s]? de (croche|trico)|fio[s]? de (croche|trico)|la para trico|barbante|\btear\b|bordado|bordadeira|costura|linha para bordar|fio para bordado)/.test(text)) return 'ARMARINHOS & TRICÔ';
  if (/(ponto cruz|bordado|bordadeira|bandagem de bordado|maquina de bordado|costura|linha para bordar|fio para bordado)/.test(text)) return 'ARMARINHOS & TRICÔ';
  if (/(tenis|sapato|calcado|sandalia|chinelo|bota|sapatilha|chuteira).{0,40}(infantil|menino|menina|bebe|crianca|kids)/.test(text) || /(infantil|menino|menina|bebe|crianca|kids).{0,40}(tenis|sapato|calcado|sandalia|chinelo|bota|sapatilha|chuteira)/.test(text)) return 'CALÇADOS INFANTIS M/F';
  if (/(gravadora|gravacao|cortadora|rolo rotativo|sculpfun|artilume|acmer|mecolour|lightburn).{0,45}laser|laser.{0,45}(gravadora|gravacao|cortadora|rolo rotativo)/.test(text)) return 'MÁQUINAS & IMPRESSORAS';

  // Acessórios devem sair de Smartphones mesmo quando o feed atribui a
  // categoria principal do aparelho.
  if (mobilePhoneAccessoryPattern.test(text)) return 'Acessórios para celulares';

  // Painéis, racks e suportes para TV são móveis; a TV eletrônica fica em TVs.
  if (/(painel|rack|estante|moveis?).{0,45}(tv|televisao)|\b(tv|televisao).{0,45}(painel|rack|estante|moveis?)/.test(text)) return 'Móveis';

  // Peças e proteção de moto não são calçados, mesmo quando o título cita
  // pedal, tênis ou sapato para descrever o produto.
  if (/(\bhonda\b|motociclet|\bmoto\b|gear shift|pedal de moto|protetor de calcado|protetor de tenis).{0,90}(calcado|tenis|sapato|pedal|protetor)?/.test(text)) return 'MOTOS & ACESSÓRIOS';

  // Ferramentas manuais e elétricas não devem ficar junto de impressoras.
  if (/(ferramenta|furadeira|parafusadeira|serra|serrote|martelo|martelete|broca|motosserra|esmerilhadeira|lixadeira|alicate|chave[s]? de|kit de ferramentas|caixa de ferramentas|organizador de ferramentas|escada|grampeador|pregador|torno|chave inglesa)/.test(text)) return 'Ferramentas';

  // Impressoras, scanners e multifuncionais ficam em máquinas & impressoras;
  // furadeiras, serras e chaves continuam em ferramentas.
  if (/(impressora|jato de tinta|multifuncional|plotter|scanner|rotulador|etiquetadora)/.test(text)) return 'MÁQUINAS & IMPRESSORAS';

  // Acessórios de fogão pertencem à categoria de eletro e acessórios.
  if (/(espalhador|tampinha|boca[s]? de fogao|sorvete[s]? fogao|protetor fogao|queimador|kit completo.{0,35}fogao|acessorio[s]? de fogao)/.test(text)) return 'ELETRO & ACESSÓRIOS';

  // Frigideiras, panelas, espremedores e utensílios pertencem a Casa & Cozinha.
  if (/(frigideira|panela|espremedor manual|espremedor de frutas|utensilio de cozinha|prato|talher|cozinha|garrafa termica|cafeteira|chaleira|jarra para cafeteira)/.test(text)) return 'Casa & Cozinha';
  // Torneiras com sensor e itens domésticos semelhantes permanecem em Utilidades.
  if (/(bico infravermelho|sensor.{0,35}torneira|torneira.{0,35}sensor)/.test(text)) return 'Utilidades';

  if (/(coala home|odorizante|aromatizante|difusor de aromas|home spray|antimofo|evita mofo|desumidificador|limpeza|limpador)/.test(text)) return 'Utilidades';
  if (/(relogio despertador|despertador|relogio de mesa)/.test(text)) return 'Utilidades';
  if (/(vela.{0,25}(filtro de barro|filtro de agua)|filtro de barro.{0,25}vela)/.test(text)) return 'Casa & Cozinha';
  if (/(caminhao.{0,35}(engolir|dinossauro)|dinossauro.{0,35}(caminhao|carros))/.test(text)) return 'Brinquedos';
  if (/(brinqued|toys?|bonec|lego|pelucia|quebra cabeca|massinha de modelar|playset|carrinho infantil)/.test(text)) return 'Brinquedos';
  if (/\b(creme facial|hidratante facial|protetor solar|creme para pentear|escova secadora|oleo nutritivo)\b/.test(text)) return 'Cuidado & Beleza';
  if (/\b(petiscos?|racao|racoes|coleiras?|peitoral|cachorros?|cao|caes|gatos?|animal de estimacao|produto pet|pets?)\b/.test(text)) return 'Pets';
  if (/(instrumento musical|violino|violao|guitarra|ukulele|espaleira|cavaquinho|bateria musical|teclado musical)/.test(text)) return 'Instrumentos Musicais';
  if (/(moda infantil|roupa infantil|roupas infantis|vestido infantil|conjunto infantil|roupa de bebe|roupas de bebe)/.test(text)) return 'CALÇADOS INFANTIS M/F';
  if (/(smart ?tv|televis|\btv\b)/.test(text)) return 'TVs';
  if (/(notebook|laptop|chromebook)/.test(text)) return 'Notebook';
  if (/(camera de seguranca|camera wi fi|camera wifi)/.test(text)) return 'ELETRÔNICOS';
  if (/(computador|desktop|pc gamer|placa mae|placa de video|memoria ram)/.test(text)) return 'Computadores';
  if (/(smartwatch|smart watch|relogio inteligente)/.test(text)) return 'ELETRÔNICOS';
  if (/(smartphone|celular|iphone|android phone)/.test(text)) return 'Smartphones';
  if (/(fone de ouvido|headphone|headset|earbud|caixa de som|soundbar|alto falante)/.test(text)) return 'Fones & Headphones';
  if (/(playstation|xbox|nintendo|videogame|video game|console gamer|joystick|controle gamer)/.test(text)) return 'Games';
  if (/(geladeira|refrigerador|fogao|microondas|micro ondas|lava roupa|lavadora|air fryer|ar condicionado|cafeteira eletrica|sanduicheira|liquidificador|batedeira|aspirador (de )?po|aspirador vertical|aspirador robo|espremedor.{0,70}(eletric|watts|mondial))/.test(text)) return 'Eletrodomésticos';
  if (/(sofa|mesa de jantar|cadeira|armario|estante|cama|colchao)/.test(text)) return 'Móveis';
  if (/(panela|frigideira|prato|talher|utensilio de cozinha|cozinha|garrafa termica|cafeteira|chaleira|jarra para cafeteira)/.test(text) ||
      /\b(tacas?|copos?|faqueiros?)\b/.test(text) ||
      /\bpotes? (de |para |p )?(vidro|mantimentos|hermetic)/.test(text)) return 'Casa & Cozinha';
  if (/(ferramenta|furadeira|parafusadeira|torneira|tinta|material de construcao|aparador de cerca|cerca viva|jardinagem)/.test(text)) return 'Ferramentas';
  if (/\b(tenis|sandalias?|sapatos?|chinelos?|chuteiras?|botas?|botinas?|calcados?|mocassim|mocassins|sapatilhas?|sapatenis|coturnos?|tamancos?|scarpin)\b/.test(text)) {
    if (/\b(infantil|infantis|bebe|crianca|kids|meninas?|meninos?)\b/.test(text)) return 'CALÇADOS INFANTIS M/F';
    const feminine = /\b(feminin[oa]s?|mulheres?|women|womens|scarpin|slingback)\b/.test(text);
    const masculine = /\b(masculin[oa]s?|homem|homens|men|mens|unissex|unisex)\b/.test(text);
    return feminine && !masculine ? 'Calçados Femininos' : 'Calçados Masculino';
  }
  if (/(electric scooter|scooter eletrica)/.test(text) || /(bicicleta|bike|e bike|ebike|scooter).{0,45}(eletric|bateria|motor)|bateria.{0,35}(bicicleta|bike|scooter)|acessorio.{0,35}(bicicleta|bike eletrica)/.test(text)) return 'Bike Elétrica e Acessórios';
  if (/(academia|halter|esteira|bicicleta|camping|esporte|fitness|bola de futebol)/.test(text)) return 'Esportes & Lazer';
  if (/(maquiagem|cosmetico|skincare|perfume|cuidado com a pele|beleza|monitor de pressao|aparelho de pressao|manicure|unhas?|esmalte|gel uv|pinceis)/.test(text)) return 'Cuidado & Beleza';
  if (/(cafe|\bcha\b|alimento|bebida|suplemento|chocolate|mantimento)/.test(text)) return 'Alimentos & Bebidas';
  if (/\b(carros?|automotivo|moto|veiculo|scooter|patinete eletrico|acessorio automotivo)\b/.test(text)) return 'MOTOS & ACESSÓRIOS';
  if (/(utilidade|organizador|selador|limpeza|armazenamento|pote hermetico)/.test(text)) return 'Utilidades';
  if (/(camisa|camiseta|regata|shorts?|bermuda|calca|blusa|saia|vestido|roupa|jaqueta|cropped|lingerie)/.test(text)) {
    if (/(masculin|homem|men\b)/.test(text)) return 'Moda Masculina';
    if (/(infantil|bebe|crianca|kids)/.test(text)) return 'CALÇADOS INFANTIS M/F';
    return /(feminin|mulher|women|unissex|unisex)/.test(text) ? 'Moda Feminina' : 'Moda Masculina';
  }
  return undefined;
};

/** Maps feed categories to the site's taxonomy and infers a category when the feed omits or mismatches it. */
export function resolveProductCategory(category: unknown, title = '', description = ''): string {
  const raw = typeof category === 'string' ? category.trim() : '';
  const key = normalizeKey(raw);
  const exact = canonicalCategories.get(key) || categoryAliases[key];
  const titleKey = normalizeKey(title);
  // Correções específicas confirmadas pelo utilizador. Estas regras ficam na
  // resolução final para vencer inclusive quando o feed já traz uma categoria.
  if (/\btapete[s]?\b/.test(titleKey) && /\b(pedagogic|amarelinha|coordenacao motora|brincadeiras ludicas)\b/.test(titleKey)) return 'Brinquedos';
  if (/\b(toalha[s]?|toalhas?)\b/.test(titleKey) && /\bmesa[s]?\b/.test(titleKey)) return 'CAMA/MESA/BANHO';
  if (/\b(sensor|sensores)\b/.test(titleKey) && /\b(pressao|contato|alarme|cama escolar|resistencia)\b/.test(titleKey)) return 'ELETRÔNICOS';
  if (/\b(rgb|luz de perseguicao|monitor de mesa)\b/.test(titleKey) && /\b(luz|decoracao|computador|monitor|jogos?)\b/.test(titleKey)) return 'ELETRÔNICOS';
  if (/\bpratos?\b/.test(titleKey) && /\b(jogo de pratos?|prato de jantar|ceramica|mesa posta)\b/.test(titleKey)) return 'Utilidades';
  if (/\b(escova|escovas)\b/.test(titleKey) && /\b(lavar louca|lava louca|fogao de cozinha)\b/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/\bhanjia\b/.test(titleKey) && /\b(desinfeccao|utensilios de mesa|secagem|dreno)\b/.test(titleKey)) return 'Eletrodomésticos';
  if (/\b(maquina de lavar louca|lavadora de louca|lava loucas?|lavar louca)\b/.test(titleKey)) return 'Eletrodomésticos';
  if (/\b(mangueiras?|mangureiras?)\b/.test(titleKey) && /\b(tanquinho|lavadora|maquina de lavar)\b/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/\b(radio|aparelho de som)\b/.test(titleKey) && /\b(h[- ]?tech|bluetooth usb am fm|saida de som forte)\b/.test(titleKey)) return 'AUTO & ACESSÓRIOS';
  if (/\b(eletrodo|centelhador|vela)\b/.test(titleKey) && /\b(fogao|cooktop)\b/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/\b(manipulo|man[ií]pulo)\b/.test(titleKey) && /\bfogao\b/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/\btigela\b/.test(titleKey) && /\b(batedeira|planetaria)\b/.test(titleKey)) return 'Casa & Cozinha';
  if (/\b(vedacao|gaxeta)\b/.test(titleKey) && /\b(porta forno|forno|fogao)\b/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/\b(enfeite televisor retro|monitor boneca|tela expositor)\b/.test(titleKey)) return 'Utilidades';
  if (/\b(escrivaninha|mesa de estudos|mesa home office)\b/.test(titleKey) && /\b(estudos?|home office|gaveta)\b/.test(titleKey)) return 'Móveis';
  if (/\b(tanquinho|maquina de lavar|lavadora|lavar roupa)\b/.test(titleKey) && !/\b(mangueiras?|pecas?|modulo|sensor|acessorios?|removedor(?:es)?)\b/.test(titleKey)) return 'Eletrodomésticos';
  if (/\b(air fryer|fritadeira de ar|fritadeira eletrica|forno de fritadeira)\b/.test(titleKey)) return 'Eletrodomésticos';
  if (/\b(maleta de ferramentas?|caixa de ferramenta|saco(?: de)? ferramentas?|ferramenta multiuso|chave 48 em 1|chave soquete universal)\b/.test(titleKey) ||
      /\bferramenta\b.{0,40}\b(saco|chave|reparo)\b/.test(titleKey)) return 'Ferramentas';

  if (/\b(mangueiras?|removedor(?:es)? de cabelo|acessorios?)\b/.test(titleKey) && /\b(tanquinho|lavadora|maquina de lavar|robo aspirador|aspirador de po)\b/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/\b(espalhadores?|queimadores?|bocas?)\b/.test(titleKey) && /\b(fogao|fogoes)\b/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/\b(torneiras?|torneira|faucets?|taps?)\b/.test(titleKey)) return 'ELÉTRICA & HIDRÁULICA';
  if (/\b(saude auditiva|aparelho[s]? de osso)\b/.test(titleKey) && /\b(alto[- ]falante|bluetooth|fone[s]? de ouvido)\b/.test(titleKey)) return 'Cuidado & Beleza';
  if (/(som carro|som automotivo|kit som automotivo|radio de carro|radio automotivo|alto falante.{0,35}carro|aparelho de som.{0,120}carro)/.test(titleKey)) return 'AUTO & ACESSÓRIOS';
  // Exceções confirmadas pelo utilizador: o objeto principal do título vence
  // categorias antigas e palavras secundárias (bicicleta, lâmpada, mochila).
  if (/\bcabo de forca\b/.test(titleKey) && /\b(bipolar|energia|10a)\b/.test(titleKey) &&
      /\b(tv|samsung|lg|ps4|ps5|xbox|impressoras?)\b/.test(titleKey)) return 'ELETRÔNICOS';
  if (/\b(playstation|ps[1-5])\b/.test(titleKey) && /\b(kit festa|festa em casa|aniversario|mesversario)\b/.test(titleKey)) return 'Utilidades';
  if (/\b(bonecos?|figuras?)\b/.test(titleKey) && /\b(playstation|simbolos? playstation)\b/.test(titleKey) && /\b(impressao 3d|articulados?)\b/.test(titleKey)) return 'Utilidades';
  if (/\b(fogao|cooktop)\b/.test(titleKey) && /\b(4 bocas|quatro bocas)\b/.test(titleKey) &&
      /\b(inox|embutir|acendimento|bivolt|star new|essencial|mesa cozinha|cozinha moderna|vidro)\b/.test(titleKey)) return 'Eletrodomésticos';
  if (/\b(caixas? de som|soundbar|alto falante)\b/.test(titleKey) && /\b(bluetooth|sem fio|wireless)\b/.test(titleKey)) return 'Aparelhos de Som';
  if (/\b(mesas?)\b/.test(titleKey) && /\b(redonda|parede dobravel|jantar|cozinha|sala|industrial|mdf|pe ferro)\b/.test(titleKey) &&
      !/\b(mesa de som|mesa digitalizadora|mesa de trabalho de costura)\b/.test(titleKey)) return 'Móveis';
  if (/\b(mini cozinha|cozinha de brincar|freezer cooker|brincar de cozinhar)\b/.test(titleKey) &&
      /\b(brinquedo|brincar|infantil|rosa|educativo|comidinhas|fogao|forno|freezer)\b/.test(titleKey)) return 'Brinquedos';
  if (/\b(carimbo|marcador|molde)\b/.test(titleKey) && /\b(brigadeiros?|confeitaria|confeiteiros?|aniversario|festa)\b/.test(titleKey)) return 'Utilidades';
  if (/(smartwatch|smart watch)/.test(titleKey) && /\b(fone de ouvido|fone|headphone|earphone)\b/.test(titleKey) && /\b(conjunto|kit|em 1|presente)\b/.test(titleKey)) return 'RELÓGIOS';
  if (/\b(bolsas?|bolsinhas?|clutches?|mini bags?)\b/.test(titleKey) &&
      /\b(mao|tiracolo|transversal|clutch|mini bag|handbag)\b/.test(titleKey)) return 'BOLSAS & MOCHILAS';
  if (/\b(camisetas?|camisas?)\b/.test(titleKey) && /\beu odeio cardio\b/.test(titleKey)) return 'Moda Feminina';
  if (/\b(camisas?|camisetas?)\b/.test(titleKey) &&
      /\b(masculino|masculina)\b/.test(titleKey) && /\b(feminino|feminina)\b/.test(titleKey) &&
      /\b(musculacao|academia)\b/.test(titleKey)) return 'Moda Masculina';
  if (/\b(relogios? despertador|despertadores?|alarm clocks?)\b/.test(titleKey)) return 'Utilidades';
  if (/\b(vestidos?|macaquinhos?)\b/.test(titleKey) &&
      /\b(infantil|juvenil|crianca|criancas|menina|meninas|kids)\b/.test(titleKey) &&
      /\b(princesa|ballet|bale|jazz|ginastica ritmica|tule|festa infantil|decote halter)\b/.test(titleKey)) return 'MODA INFANTIL FEMININA';
  if (/\b(chuteiras?|cleats?)\b/.test(titleKey) && /\b(futebol|campo|football|soccer|trava)\b/.test(titleKey)) return 'Esportes & Lazer';
  if (/\b(cestas?|cestos?|baskets?)\b/.test(titleKey) && /\b(bicicletas?|bikes?|mountain bike|e bike)\b/.test(titleKey)) return 'Bike Elétrica e Acessórios';
  if (/\b(bolsas?|bags?|pouches?)\b/.test(titleKey) && /\b(guid[aã]o|handlebar|bicicletas?|bikes?|mountain bike)\b/.test(titleKey)) return 'BOLSAS & MOCHILAS';
  if (/\b(ziper(?:es)?|zippers?|fechos? eclair)\b/.test(titleKey) && /\b(reparo|repair|remov[ií]veis?|removable|cursor|puxador|cabe[çc]a|substitui[cç][ãa]o|fixadores?|extrator|kit)\b/.test(titleKey)) return 'ARMARINHOS & TRICÔ';
  if (/\b(maquina de solda|ferro de solda|ponta de ferro de solda)\b/.test(titleKey)) return 'Ferramentas';
  if (/\b(moto|motocicleta|motorcycle|bmw f\d{3})\b/.test(titleKey) && /\b(farol|lampadas?|luzes?|led|protetor do farol|luz de freio)\b/.test(titleKey)) return 'MOTOS & ACESSÓRIOS';
  if (/\b(fogao|forno|cooktop)\b/.test(titleKey) && /\b(bacias?|espalhadores?|queimadores?)\b/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/\b(lampadas?|bulbs?)\b/.test(titleKey) && /\b(g9|fogao|fogoes|forno|fornos|cooktop|fisher|electrolux)\b/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  // Componentes de computador podem conter traduções erradas como “liquidificador”.
  if (/^(processador de chip cpu de computador|liquidificador computador cpu chip su processador)/.test(titleKey) &&
      /(cpu|processador)/.test(titleKey) && /(chip|c4d|snapdragon|qualcomm|maya|rhino|3dmax|fbx)/.test(titleKey)) return 'Computadores';
  // Organizadores e forros de geladeira são utilidades, não eletrodomésticos.
  if (/geladeira/.test(titleKey) && /(caixa|cesta|cesto|organiz|armazenamento)/.test(titleKey)) return 'Utilidades';
  if (/geladeira/.test(titleKey) && /toalhas?/.test(titleKey)) return 'Utilidades';
  // Grades/grelhas vendidas como acessórios para micro-ondas são peças de eletro.
  if (/(microondas|micro ondas)/.test(titleKey) && /(grade|grelha|malha)/.test(titleKey) && /acessorios?/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  // Componentes de lavadora não são aparelhos completos.
  if (/(micro\s*chave|microchave)/.test(titleKey) && /(lavadora|tanquinho|maquina de lavar)/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (/(kit.{0,50}mangueira.{0,80}(lavadora|tanquinho|maquina de lavar)|(lavadora|tanquinho|maquina de lavar).{0,80}kit.{0,50}mangueira)/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  // Exceções de categoria confirmadas nos anúncios concretos do catálogo.
  if (/^r raf vara de cozinha com fio 5 em 1/.test(titleKey) && /utensilios de cozinha eletricos/.test(titleKey)) return 'Eletrodomésticos';
  if (/^kit minha nova cozinha\b/.test(titleKey) && /(geladeira|fogao)/.test(titleKey)) return 'Brinquedos';
  if (/(roupas? de danca|roupas? de ballet|roupas? de bale|roupas? de ginastica|calcas? de danca|kit ballet|uniforme.{0,25}ballet)/.test(titleKey) &&
      /(infantil|crianca|menina|meninas|feminina|feminino)/.test(titleKey) && !/(masculino|menino|meninos|kung fu|artes marciais)/.test(titleKey)) return 'MODA INFANTIL FEMININA';
  if (titleKey === normalizeKey('Shorts Masculino Tactel Praia Academia Treino Corrida Verão Secagem Rápida') ||
      titleKey === normalizeKey('Shorts Masculino Tactel Praia Academia Treino Corrida E CASUAL SECAGEM RAPIDA')) return 'Moda Masculina';
  if (/^capa de chuva moto motoqueiro impermeavel reforcada\b/.test(titleKey)) return 'MOTOS & ACESSÓRIOS';
  if (/^kit mechas salao de beleza brinquedo menina crianca camarim faz de conta pinta cabelo\b/.test(titleKey)) return 'MODA INFANTIL FEMININA';
  if (titleKey === normalizeKey('Camiseta Feminina Masculina São Bento Camisa Religiosa Cristã 100% Algodão 30.1')) return 'Moda Masculina';
  if (/^lixeira c pedal jardim encantado rosa menina\b/.test(titleKey)) return 'Utilidades';
  // O título identifica uma ferramenta de manutenção, não a peça mencionada.
  if (/^(chave|ferramenta|extrator|saca)\b/.test(titleKey) && /(agitador|lavadora|tanquinho)/.test(titleKey)) return 'Ferramentas';
  const clothingItem = /\b(camisas?|camisetas?|regatas?|polos?|vestidos?|saias?|camisolas?|pijamas?|macacoes?|jaquetas?|casacos?|moletons?|blusas?|lingeries?|shorts?|bermudas?|calcas?|roupas?)\b/.test(titleKey);
  const titleHasFemaleAudience = /\b(feminin[oa]s?|mulheres?|women|womens|meninas?)\b/.test(titleKey);
  const titleHasMaleAudience = /\b(masculin[oa]s?|homens?|men|mens|meninos?)\b/.test(titleKey);
  // O produto principal vence palavras incidentais do título (por exemplo,
  // “computador” num controle compatível ou “fone” num anúncio de smartphone).
  if (/^(controle|controlador|gamepad|joystick)\b/.test(titleKey) &&
      /(playstation|\bps[1-5]\b|xbox|nintendo|switch|videogame|video game|console)/.test(titleKey)) return 'Games';
  if (/^(controle remoto|controle universal|controle para tv|controle tv|remote control|tv voz universal controle remoto)/.test(titleKey) ||
      (/controle remoto/.test(titleKey) && /(universal|compativel|rmf[- ]|ponteiro magico|mr24)/.test(titleKey))) return 'ELETRÔNICOS';
  // Insumos e acessórios específicos de costura/crochê vencem palavras como
  // “feminina”, “camisola” ou “multifuncional” presentes em títulos de produtos.
  if (/(croche|crochetar|barbante|\btear\b|bordadeira|ponto cruz|maquina de costura|kit de costura|calcador.{0,60}(costura|bordado|ziper)|agulhas?.{0,45}(costura|bordado|croche|trico)|linhas?.{0,45}(costura|bordado|croche|trico)|fios?.{0,45}(costura|bordado|croche|trico)|la.{0,25}para trico)/.test(titleKey)) return 'ARMARINHOS & TRICÔ';
  // Dois anúncios específicos do catálogo foram confirmados pelo utilizador:
  // a camiseta feminina e o kit de pijama infantil masculino.
  if (titleKey === normalizeKey('Camisa Camiseta Fé Masculino Feminino Casual 100% Algodão')) return 'Moda Feminina';
  if (titleKey === normalizeKey('KIT 4 Peça Conjunto Manga Longa Calça + Manga Curta Shorts Verão e Inverno Pijama Masculino Feminina Afd')) return 'MODA INFANTIL MASCULINA';
  if (/^conjunto cozinha fogao geladeira pia micro ondas e armario rosa\b/.test(titleKey)) return 'Brinquedos';
  if (/^(smart ?watch|relogio inteligente|galaxy watch|apple watch|relogio de pulso|relogio digital)/.test(titleKey)) return 'RELÓGIOS';
  if (/^(smart ?tv|tv\b|televisor|televisao)/.test(titleKey) ||
      /^(samsung|lg|tcl|philips|sony|panasonic|aoc).{0,35}\b(smart ?tv|tv|televisor|televisao)\b/.test(titleKey)) return 'TVs';
  if (/^(smartphone|celular|iphone|samsung galaxy|galaxy [aszm]|redmi (note|[0-9])|xiaomi (redmi|poco)|poco [a-z0-9]|motorola (edge|moto)|realme )/.test(titleKey)) return 'Smartphones';
  // Placas, módulos e amplificadores de potência são componentes eletrónicos;
  // amplificadores Hi-Fi completos sem estes sinais continuam em Aparelhos de Som.
  if (/(placas?.{0,70}(amplificador|amplificadora|audio|som|potencia)|amplificador[a-z]*.{0,70}placa|modulos?.{0,70}(audio|som|amplificador|potencia)|(audio|som|amplificador|potencia).{0,70}modulos?|pre amplificador(?:es)?|amplificador(?:es)?.{0,60}potencia|potencia.{0,60}amplificador(?:es)?)/.test(titleKey)) return 'ELETRÔNICOS';
  // Regras específicas precisam vencer categorias genéricas do feed e as
  // regras automotivas abaixo (que também reconhecem “carro”, “pneu” e “biela”).
  if (/(geladeira|frigobar|refrigerador)/.test(titleKey) && /(portatil|veicular|compacta|caminhao|carro|mini)/.test(titleKey)) return 'Eletrodomésticos';
  if (/\bpneus?\b/.test(titleKey) && /(moto|motociclet)/.test(titleKey) && /(remendo|reparo|reparador|vacina|selante|spray|macarrao|tapa furo|furo)/.test(titleKey)) return 'MOTOS & ACESSÓRIOS';
  if (/(chave|jogo).{0,20}biela/.test(titleKey) && /(kit|jogo|ferramentas?)/.test(titleKey)) return 'Ferramentas';
  if (/(halter(es)?|caneleira|mini band|ginastica|academia residencial|corda de pular|colchonete.{0,35}(exercicio|treino)|kit.{0,40}(treino|academia))/.test(titleKey)) return 'Esportes & Lazer';
  if (/(luminaria|abajur|lustre|arandela|pendente|spot de luz|lampada)/.test(titleKey)) return 'LUMINÁRIAS';
  if (/(agulhas? (de|para) (costura|bordado|ponto cruz|colcha)|linhas? (de|para) costura|linhas? de colcha|fios? (de|para) croch[e]|l[aã] (para|de) tric[o]|barbante|novelo|calcador.{0,50}maquina de costura|acessorios? (para|de) maquina de costura|kit de costura|ziper invisivel|botoes? de pressao|\btear\b)/.test(titleKey)) return 'ARMARINHOS & TRICÔ';
  if (/(toalhas?.{0,35}(banho|banheiro|rosto|infantil|bebe)|roupao.{0,35}(infantil|bebe)|\b(toalha|toalhas)\b.{0,35}(banho|rosto|infantil|bebe))/.test(titleKey)) return 'CAMA/MESA/BANHO';
  if (/(capacitor|fusivel|magnetron|membrana.{0,35}(microondas|micro ondas)|motor prato|prato.{0,35}(microondas|micro ondas)|kit mica|eletrobomba|batedor.{0,35}(batedeira|tanquinho)|bucha.{0,35}(agitador|lavadora)|gabinete.{0,35}(maquina de lavar|lavadora)|bomba de agua.{0,35}(maquina de lavar|lavadora)|conjunto eletrodo.{0,25}(fogao|cooktop)|kit.{0,35}(espalhador|queimador).{0,25}fogao|acessorios?.{0,45}(fogao|microondas|micro ondas|lavadora|tanquinho|aspirador|geladeira|batedeira)|pecas?.{0,45}(fogao|microondas|micro ondas|lavadora|tanquinho|aspirador|geladeira|batedeira)|fusivel.{0,45}(microondas|micro ondas)|termostato.{0,45}(microondas|micro ondas))/.test(titleKey)) return 'ELETRO & ACESSÓRIOS';
  if (exact === 'MOTOS & ACESSÓRIOS' && /(moto|motocicleta|capacete|bauleto|cb ?\d|biz 125|crosser|twister)/.test(titleKey) && !/(bicicleta.{0,40}eletrica|bike.{0,40}eletrica|e bike|ebike)/.test(titleKey)) return exact;
  if (exact === 'AUTO & ACESSÓRIOS' && /(automotivo|som de carro|radio de carro|vw gol|fiat uno|pneu|radiador|retrovisor|virabrequim|cabecote|peca automotiva)/.test(titleKey)) return exact;
  if (/(controle gamer|controle de videogame|controle de video game|joystick)/.test(titleKey)) return 'Games';
  if (exact === 'MODA VERÃO PRAIA' && clothingItem && titleHasMaleAudience && !titleHasFemaleAudience && !/(sunga|maio|biquini|shorts?.{0,30}(praia|piscina|surf)|bermuda.{0,30}(praia|piscina|surf))/.test(titleKey)) return 'Moda Masculina';
  if (clothingItem && exact === 'Moda Masculina' && !(titleHasFemaleAudience && !titleHasMaleAudience)) return exact;
  if (clothingItem && exact === 'Moda Feminina' && !(titleHasMaleAudience && !titleHasFemaleAudience)) return exact;
  if (exact === 'CALÇADOS INFANTIS M/F') return exact;
  if (exact === 'MODA VERÃO PRAIA' && curatedCategoryByTitle.get(titleKey) === 'Moda Masculina') return 'Moda Masculina';
  if (exact === 'CAMA/MESA/BANHO' || exact === 'MODA VERÃO PRAIA' || exact === 'MODA INFANTIL FEMININA' || exact === 'MODA INFANTIL MASCULINA') return exact;
  const curatedCategory = curatedCategoryByTitle.get(titleKey);
  if (curatedCategory) return curatedCategory;
  if (/(^| )(sofa|mesa de jantar|cadeira|armario|estante|cama|colchao)( |$)/.test(titleKey) &&
      !/(organizador|caixa organizadora|extratora|lavadora de estofados|mosquiteiro|mosquiteira|pet|cachorro|cao|gato|canil)/.test(titleKey)) return 'Móveis';

  // O feed também coloca roupas em Calçados Femininos/Masculino. Só manter
  // a categoria de calçados quando o título realmente indicar um calçado.
  const hasGarment = /(vestido|saia|camisola|pijama|macacao|jaqueta|blusa|top|lingerie|sutia|shorts?|bermuda|calca|camisa|camiseta|roupa|moletom)/.test(titleKey);
  const hasFootwear = /\b(tenis|sapatos?|sandalias?|chinelos?|botas?|sapatilhas?|scarpins?|calcados?|chuteiras?|mocassins?|coturnos?|tamancos?)\b/.test(titleKey);
  if (hasFootwear && exact === 'Calçados Femininos' && !(titleHasMaleAudience && !titleHasFemaleAudience)) return exact;
  if (hasFootwear && exact === 'Calçados Masculino' && !(titleHasFemaleAudience && !titleHasMaleAudience)) return exact;
  if (hasGarment && !hasFootwear && (exact === 'Calçados Femininos' || exact === 'Calçados Masculino')) {
    return /(feminin|mulher|women)/.test(titleKey) || exact === 'Calçados Femininos' ? 'Moda Feminina' : 'Moda Masculina';
  }

  // O título do produto é o melhor sinal para corrigir categorias genéricas erradas do feed.
  const titleCategory = inferFromText(title, '');
  const titleDrivenCategories = new Set([
    'Brinquedos', 'Pets', 'Instrumentos Musicais', 'ARMARINHOS & TRICÔ', 'Moda Feminina', 'Moda Masculina', 'CALÇADOS INFANTIS M/F',
    'TVs', 'Notebook', 'ELETRÔNICOS', 'RELÓGIOS', 'Computadores', 'Smartphones', 'Acessórios para celulares',
    'CAMA/MESA/BANHO',
    'Fones & Headphones', 'Aparelhos de Som', 'Games', 'ARMARINHOS & TRICÔ', 'CALÇADOS INFANTIS M/F', 'Eletrodomésticos', 'Móveis', 'Casa & Cozinha', 'Ferramentas',
    'Calçados Masculino', 'Calçados Femininos', 'Bike Elétrica e Acessórios', 'Esportes & Lazer', 'Cuidado & Beleza', 'Alimentos & Bebidas',
    'MÁQUINAS & IMPRESSORAS', 'ELETRO & ACESSÓRIOS', 'AUTO & ACESSÓRIOS', 'MOTOS & ACESSÓRIOS', 'Utilidades',
    'ELÉTRICA & HIDRÁULICA', 'LUMINÁRIAS', 'BOLSAS & MOCHILAS',
  ]);
  if (titleCategory && titleDrivenCategories.has(titleCategory)) return titleCategory;

  const inferred = inferFromText(title, description);
  const specificCategories = new Set(['Brinquedos', 'Calçados Masculino', 'Calçados Femininos', 'Pets', 'Instrumentos Musicais', 'Bike Elétrica e Acessórios', 'Móveis', 'ELÉTRICA & HIDRÁULICA', 'LUMINÁRIAS', 'BOLSAS & MOCHILAS']);
  if (inferred && (specificCategories.has(inferred) || !exact)) return inferred;
  if (exact) return exact;

  // Some feeds return hierarchical category paths; inspect the most specific segments first.
  const pathParts = raw.split(/[>/|:]+/).map(normalizeKey).filter(Boolean).reverse();
  for (const part of pathParts) {
    const mapped = canonicalCategories.get(part) || categoryAliases[part];
    if (mapped) return mapped;
  }

  return inferred || raw || 'Outros';
}


