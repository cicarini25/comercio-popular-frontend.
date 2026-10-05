import { CATEGORIES } from '../data/mockProducts';

const normalizeKey = (value: unknown) =>
  typeof value === 'string'
    ? value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    : '';

const canonicalCategories = new Map(
  CATEGORIES.filter((category) => category !== 'Todas as Categorias')
    .map((category) => [normalizeKey(category), category])
);

const categoryAliases: Record<string, string> = {
  'home living': 'Casa & Construção',
  'home decor': 'Casa & Construção',
  'home improvement': 'Casa & Construção',
  'construction tools': 'Casa & Construção',
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
  'electronics': 'Tecnologia',
  'consumer electronics': 'Tecnologia',
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
  'automotive': 'Automotivo',
  'car accessories': 'Automotivo',
  'mens clothing': 'Moda Masculina',
  'men clothing': 'Moda Masculina',
  'mens fashion': 'Moda Masculina',
  'womens clothing': 'Moda Feminina',
  'women clothing': 'Moda Feminina',
  'womens fashion': 'Moda Feminina',
  'kids clothing': 'Moda Infantil',
  'children clothing': 'Moda Infantil',
  'baby clothing': 'Moda Infantil',
  'kids fashion': 'Moda Infantil',
  'shoes': 'Calçados',
  'footwear': 'Calçados',
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
  const text = normalizeKey(`${title} ${description}`);

  if (/(brinqued|toys?|bonec|lego|pelucia|quebra cabeca|massinha de modelar|playset|carrinho infantil)/.test(text)) return 'Brinquedos';
  if (/(moda infantil|roupa infantil|roupas infantis|vestido infantil|conjunto infantil|roupa de bebe|roupas de bebe)/.test(text)) return 'Moda Infantil';
  if (/(smart ?tv|televis|\btv\b)/.test(text)) return 'TVs';
  if (/(notebook|laptop|chromebook)/.test(text)) return 'Notebook';
  if (/(computador|desktop|pc gamer|placa mae|placa de video|memoria ram)/.test(text)) return 'Computadores';
  if (/(smartphone|celular|iphone|android phone)/.test(text)) return 'Smartphones';
  if (/(capa para celular|capinha|pelicula para celular|carregador de celular|acessorio para celular)/.test(text)) return 'Acessórios para celulares';
  if (/(fone de ouvido|headphone|headset|earbud|caixa de som|soundbar|alto falante)/.test(text)) return 'Fones & Headphones';
  if (/(playstation|xbox|nintendo|videogame|video game|console gamer|joystick|controle gamer)/.test(text)) return 'Games';
  if (/(geladeira|refrigerador|fogao|microondas|micro ondas|lava roupa|lavadora|air fryer|ar condicionado)/.test(text)) return 'Eletrodomésticos';
  if (/(panela|frigideira|prato|talher|utensilio de cozinha|cozinha|garrafa termica|cafeteira)/.test(text)) return 'Casa & Cozinha';
  if (/(sofa|mesa de jantar|cadeira|armario|estante|cama|colchao)/.test(text)) return 'Móveis';
  if (/(ferramenta|furadeira|parafusadeira|torneira|tinta|material de construcao)/.test(text)) return 'Casa & Construção';
  if (/(tenis|sandalia|sapato|chinelo|bota|calcado)/.test(text)) return 'Calçados';
  if (/(academia|halter|esteira|bicicleta|camping|esporte|fitness|bola de futebol)/.test(text)) return 'Esportes & Lazer';
  if (/(maquiagem|cosmetico|skincare|perfume|cuidado com a pele|beleza)/.test(text)) return 'Cuidado & Beleza';
  if (/(cafe|cha|alimento|bebida|suplemento|chocolate|mantimento)/.test(text)) return 'Alimentos & Bebidas';
  if (/(carro|automotivo|moto|veiculo|acessorio automotivo)/.test(text)) return 'Automotivo';
  if (/(utilidade|organizador|selador|limpeza|armazenamento|pote hermetico)/.test(text)) return 'Utilidades';
  if (/(camisa|camiseta|calca|blusa|saia|vestido|roupa|jaqueta)/.test(text)) {
    if (/(masculin|homem|men\b)/.test(text)) return 'Moda Masculina';
    if (/(infantil|bebe|crianca|kids)/.test(text)) return 'Moda Infantil';
    return 'Moda Feminina';
  }
  return undefined;
};

/** Maps feed categories to the site's taxonomy and infers a category when the feed omits or mismatches it. */
export function resolveProductCategory(category: unknown, title = '', description = ''): string {
  const raw = typeof category === 'string' ? category.trim() : '';
  const key = normalizeKey(raw);
  const exact = canonicalCategories.get(key) || categoryAliases[key];
  if (exact) return exact;

  // Some feeds return hierarchical category paths; inspect the most specific segments first.
  const pathParts = key.split(/\\s*(?:>|\\/|::)\\s*/).filter(Boolean).reverse();
  for (const part of pathParts) {
    const mapped = canonicalCategories.get(part) || categoryAliases[part];
    if (mapped) return mapped;
  }

  return inferFromText(title, description) || raw || 'Outros';
}
