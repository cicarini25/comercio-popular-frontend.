import { CATEGORIES } from '../data/mockProducts';

const normalizeKey = (value: unknown) =>
  typeof value === 'string'
    ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    : '';


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
  [normalizeKey("Edredom Cama Quarto Casal Queen Dupla Face Quentinho"), 'Utilidades'],
  [normalizeKey("Kit Cobre Leito Colcha Casal 3 Peças Boutis Estampada Dupla Face Porta Travesseiro Aba Americana"), 'Utilidades'],
  [normalizeKey("Escrivaninha De Estudos Home Office 1 Gaveta Bonatto Oficial"), 'Utilidades'],
  [normalizeKey("Kit Jogo Pano De Prato Cozinha Copa Cheff Algodão Sortidos"), 'Utilidades'],
  [normalizeKey("Tapete Sala 1,50x1,00 Peludo 4 Cm De Altura Shaggy Promoção"), 'Utilidades'],
  [normalizeKey("Cabo De Carregamento Rápido Baseus Pd Usb C Para Typec Qc 4.0 Para iPhone 15 / Xiaomi / Huawei / Macbook (100W)"), 'ELETRÔNICOS'],
  [normalizeKey("Inova Carregador Portátil Power Bank Grande 20000mah/10000mAh Turbo 22.5W PD Rápido Com Display Portátil"), 'ELETRÔNICOS'],
  [normalizeKey("Teclado Mecanico Gamer TGT Sherman Compacto, Rainbow, ABNT2, Switch Azul, Preto, TGT-SHTKL-RBW01"), 'ELETRÔNICOS'],
  [normalizeKey("Mouse Para Jogos Sem Fio Leve ATTACK SHARK X11 Com Base De Carregamento RGB Tri-Mode-2.4G/USB-C/BT"), 'ELETRÔNICOS'],
  [normalizeKey("UGREEN USB Bluetooth 5.4 5.3 Adaptador Receptor De Transmissor Sem Fio Dongle Para PC Windows 11 10 8.1 7 Fone De Ouvido"), 'ELETRÔNICOS'],
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

  // Regras prioritárias: elas corrigem categorias genéricas que chegam do feed.
  // A ordem é intencional: acessórios e peças específicas vencem a categoria
  // ampla atribuída pela plataforma.
  if (/(croche|crochetar|\btrico\b|agulha[s]? de (croche|trico)|agulha[s]? para (croche|trico)|linha[s]? de (croche|trico)|fio[s]? de (croche|trico)|la para trico|barbante|tear|bordado|bordadeira|costura|linha para bordar|fio para bordado)/.test(text)) return 'ARMARINHOS & TRICÔ';
  // Animais e produtos para animais têm prioridade sobre brinquedos e eletros.
  if (/(racao|petiscos?|cachorro|caes|cao\b|gato|gatos|coleira|peitoral|arranhador|aquario|passaro|comedouro|bebedouro pet|produto pet|pets?\b)/.test(text)) return 'Pets';
  if (/(brinqued|boneca|boneco|lego|pelucia|quebra cabeca|massinha|playset|carrinho infantil|jogo infantil|tabuleiro infantil|fantasia infantil)/.test(text)) return 'Brinquedos';
  if (/(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado).{0,55}(feminino|mulher|women)|\b(feminino|mulher|women).{0,55}(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado)/.test(text)) return 'Calçados Femininos';
  if (/(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado).{0,55}(masculino|homem|men)|\b(masculino|homem|men).{0,55}(tamanco|sandalia|sapato|chinelo|bota|sapatilha|scarpin|calcado)/.test(text)) return 'Calçados Masculino';
  if (/(martelo de carne|amaciador de carne|batedor de carne|amassador de carne|ralador|descascador|abridor de lata|utensilio culinario)/.test(text)) return 'Casa & Cozinha';
  if (/(escova de limpeza|escova para limpeza|limpeza|limpador|limpa janela|limpa vidro|faxina|lavagem|higienizacao|higienizador)/.test(text)) return 'Utilidades';
  if (/(organizador|caixa organizadora).{0,80}(parafuso|bucha|cavilha|fixador|terminal|ferramenta)|\b(kit|caixa) de ferramentas\b/.test(text)) return 'Ferramentas';
  if (/(torneira|registro de agua|arejador|adaptador de torneira|conector de torneira|mangueira de torneira)/.test(text)) return 'Utilidades';
  if (/(tomada|interruptor|plugue|adaptador eletrico|conector eletrico|soquete)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(lavadora de alta pressao|maquina de lavar.{0,30}alta press|hidrolavadora|lavadora pressao)/.test(text)) return 'Ferramentas';
  if (/(maquina de lavar|lavadora).{0,90}(\d+\s?kg|programas?|timer|capacidade|centrifug|automatica|automatico|digital)/.test(text)) return 'Eletrodomésticos';
  if (/(acendedor|acendimento|chicote|interruptor|usina|resistencia|resisival|membrana|teclado|display|diodo|magnetron|pressostato|eletrobomba|suspensao|kit mica|ponta piteira|placa|interface|bomba drenagem).{0,80}(fogao|forno|cooktop|fogareiro|lavadora|lavar|micro ondas|microondas)|\b(fogao|forno|cooktop|fogareiro|lavadora|lavar|micro ondas|microondas).{0,80}(acendedor|acendimento|chicote|interruptor|usina|resistencia|resisival|membrana|teclado|display|diodo|magnetron|pressostato|eletrobomba|suspensao|kit mica|ponta piteira|placa|interface|bomba drenagem)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(fogao eletrico|fogareiro eletrico|fogao portatil|fogao semi industrial|fogao de ferro)/.test(text)) return 'Eletrodomésticos';
  if (/(painel|rack|estante|moveis?).{0,45}(tv|televisao)|\b(tv|televisao).{0,45}(painel|rack|estante|moveis?)/.test(text)) return 'Móveis';
  if (/(smart ?tv|televis|\btv\b)/.test(text)) return 'TVs';
  if (/(pelicula|capa|capinha|suporte para (celular|smartphone|tablet)|carregador de celular|acessorio para celular|case para celular)/.test(text)) return 'Acessórios para celulares';
  if (/(smartphone|celular|iphone|android phone)/.test(text)) return 'Smartphones';
  if (/(smartwatch|smart watch|relogio inteligente|galaxy watch|apple watch)/.test(text)) return 'RELÓGIOS';
  if (/(honda|motociclet|moto\b|gear shift|pedal de moto|protetor de calcado|protetor de tenis)/.test(text)) return 'MOTOS & ACESSÓRIOS';
  if (/(carro|automotivo|veiculo|autopeca|acessorio automotivo|tapete automotivo|suporte veicular|camera veicular)/.test(text)) return 'AUTO & ACESSÓRIOS';
  if (/(ferramenta|furadeira|parafusadeira|serra|serrote|martelo|martelete|broca|motosserra|esmerilhadeira|lixadeira|alicate|chave[s]? de|kit de ferramentas|caixa de ferramentas|organizador de ferramentas|escada|grampeador|pregador|torno|chave inglesa)/.test(text)) return 'Ferramentas';
  if (/(impressora|jato de tinta|multifuncional|plotter|scanner|rotulador|etiquetadora)/.test(text)) return 'MÁQUINAS & IMPRESSORAS';
  if (/(espalhador|tampinha|boca[s]? de fogao|sorvete[s]? fogao|protetor fogao|queimador|kit completo.{0,35}fogao|acessorio[s]? de fogao)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  // Peças, módulos e reposição de lavadoras e micro-ondas são acessórios de eletro.
  if (/(peca|modulo|sensor|agitador|micro chave|protetor de polia|banda|cinta|atuador|tirante|reparo|reposicao).{0,80}(lavadora|lavar|maquina de lavar|micro ondas|microondas|brastemp|consul)|\b(lavadora|maquina de lavar|micro ondas|microondas).{0,80}(peca|modulo|sensor|agitador|micro chave|protetor|banda|cinta|atuador|tirante|reparo|reposicao)/.test(text)) return 'ELETRO & ACESSÓRIOS';
  if (/(frigideira|panela|espremedor manual|espremedor de frutas|utensilio de cozinha|prato|talher|cozinha|garrafa termica|cafeteira|chaleira|jarra para cafeteira)/.test(text)) return 'Casa & Cozinha';
  if (/(bico infravermelho|sensor.{0,35}torneira|torneira.{0,35}sensor)/.test(text)) return 'Utilidades';
  if (/(camisa|camiseta|regata|shorts?|bermuda|calca|blusa|saia|vestido|roupa|jaqueta|cropped|lingerie)/.test(text)) {
    if (/(infantil|bebe|crianca|kids)/.test(text)) return 'CALÇADOS INFANTIS M/F';
    if (/(feminin|mulher|women)/.test(text)) return 'Moda Feminina';
    return 'Moda Masculina';
  }

  if (/(croche|crochetar|\btric[oô]\b|agulha[s]? de (croche|trico)|agulha[s]? para (croche|trico)|linha[s]? de (croche|trico)|fio[s]? de (croche|trico)|la para trico|barbante|tear|bordado|bordadeira|costura|linha para bordar|fio para bordado)/.test(text)) return 'ARMARINHOS & TRICÔ';
  if (/(ponto cruz|bordado|bordadeira|bandagem de bordado|maquina de bordado|costura|linha para bordar|fio para bordado)/.test(text)) return 'ARMARINHOS & TRICÔ';
  if (/(tenis|sapato|calcado|sandalia|chinelo|bota|sapatilha|chuteira).{0,40}(infantil|menino|menina|bebe|crianca|kids)/.test(text) || /(infantil|menino|menina|bebe|crianca|kids).{0,40}(tenis|sapato|calcado|sandalia|chinelo|bota|sapatilha|chuteira)/.test(text)) return 'CALÇADOS INFANTIS M/F';
  if (/(gravadora|gravacao|cortadora|rolo rotativo|sculpfun|artilume|acmer|mecolour|lightburn).{0,45}laser|laser.{0,45}(gravadora|gravacao|cortadora|rolo rotativo)/.test(text)) return 'MÁQUINAS & IMPRESSORAS';

  // Acessórios devem sair de Smartphones mesmo quando o feed atribui a
  // categoria principal do aparelho.
  if (/(pelicula|capa|capinha|suporte para (celular|smartphone|tablet)|carregador de celular|acessorio para celular|case para celular)/.test(text)) return 'Acessórios para celulares';

  // Painéis, racks e suportes para TV são móveis; a TV eletrônica fica em TVs.
  if (/(painel|rack|estante|moveis?).{0,45}(tv|televisao)|\b(tv|televisao).{0,45}(painel|rack|estante|moveis?)/.test(text)) return 'Móveis';

  // Peças e proteção de moto não são calçados, mesmo quando o título cita
  // pedal, tênis ou sapato para descrever o produto.
  if (/(honda|motociclet|moto\b|gear shift|pedal de moto|protetor de calcado|protetor de tenis).{0,90}(calcado|tenis|sapato|pedal|protetor)?/.test(text)) return 'MOTOS & ACESSÓRIOS';

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
  if (/(carro|automotivo|moto|veiculo|scooter|patinete eletrico|acessorio automotivo)/.test(text)) return 'MOTOS & ACESSÓRIOS';
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
  if (exact === 'CALÇADOS INFANTIS M/F') return exact;
  if (exact === 'CAMA/MESA/BANHO' || exact === 'MODA VERÃO PRAIA' || exact === 'MODA INFANTIL FEMININA' || exact === 'MODA INFANTIL MASCULINA') return exact;
  const titleKey = normalizeKey(title);
  const curatedCategory = curatedCategoryByTitle.get(titleKey);
  if (curatedCategory) return curatedCategory;
  if (/(^| )(sofa|mesa de jantar|cadeira|armario|estante|cama|colchao)( |$)/.test(titleKey)) return 'Móveis';

  // O título do produto é o melhor sinal para corrigir categorias genéricas erradas do feed.
  const titleCategory = inferFromText(title, '');
  const titleDrivenCategories = new Set([
    'Brinquedos', 'Pets', 'Instrumentos Musicais', 'ARMARINHOS & TRICÔ', 'Moda Feminina', 'Moda Masculina', 'CALÇADOS INFANTIS M/F',
    'TVs', 'Notebook', 'ELETRÔNICOS', 'RELÓGIOS', 'Computadores', 'Smartphones', 'Acessórios para celulares',
    'Fones & Headphones', 'Games', 'ARMARINHOS & TRICÔ', 'CALÇADOS INFANTIS M/F', 'Eletrodomésticos', 'Móveis', 'Casa & Cozinha', 'Ferramentas',
    'Calçados Masculino', 'Calçados Femininos', 'Bike Elétrica e Acessórios', 'Esportes & Lazer', 'Cuidado & Beleza', 'Alimentos & Bebidas',
    'MÁQUINAS & IMPRESSORAS', 'ELETRO & ACESSÓRIOS', 'AUTO & ACESSÓRIOS', 'MOTOS & ACESSÓRIOS', 'Utilidades',
  ]);
  if (titleCategory && titleDrivenCategories.has(titleCategory)) return titleCategory;

  const inferred = inferFromText(title, description);
  const specificCategories = new Set(['Brinquedos', 'Calçados Masculino', 'Calçados Femininos', 'Pets', 'Instrumentos Musicais', 'Bike Elétrica e Acessórios', 'Móveis']);
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


