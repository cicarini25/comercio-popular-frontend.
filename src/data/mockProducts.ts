import { Product, SellerPlan } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // --- ACHADINHOS & AFILIADOS ---
  {
    id: 'ach-01',
    title: 'Mini Selador Térmico Portátil de Embalagens e Sacos Plásticos',
    description: 'Mantenha seus alimentos frescos por muito mais tempo. Selagem instantânea magnética para geladeira, recarregável via USB.',
    price: 19.90,
    originalPrice: 49.90,
    discountPercentage: 60,
    platform: 'shopee',
    affiliateUrl: 'https://shopee.com.br/universal-link?af=comerciopopular_selador',
    affiliateCommissionRate: 8.5,
    rating: 4.9,
    reviewCount: 3420,
    images: [
      '/images/mini_selador_portatil.jpg'
    ],
    category: 'Utilidades',
    isAchadinho: true,
    stockUnits: 4,
    badge: 'Achadinho < R$ 20 🔥',
    ean: '7898501230014',
    specs: {
      'Alimentação': 'Bateria Recarregável USB-C',
      'Material': 'ABS reforçado + Imã',
      'Garantia': '90 dias'
    },
    isFreeShipping: true,
    isVerified: true,
    isFastShipping: true,
    isBestPrice: true
  },
  {
    id: 'ach-02',
    title: 'Garrafa Térmica 1000ml Inox com Display Digital LED de Temperatura',
    description: 'Isolamento a vácuo duplo que mantém bebidas geladas por 24h ou quentes por 12h. Tampa inteligente touch com sensor de temperatura.',
    price: 39.90,
    originalPrice: 89.90,
    discountPercentage: 55,
    platform: 'mercadolivre',
    affiliateUrl: 'https://mercadolivre.com.br/p/MLB298172?af=comerciopopular',
    affiliateCommissionRate: 9.0,
    rating: 4.8,
    reviewCount: 1890,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Casa & Cozinha',
    isAchadinho: true,
    stockUnits: 7,
    badge: '55% OFF Hoje',
    ean: '7898501230021',
    specs: {
      'Capacidade': '1000 ml',
      'Material': 'Aço Inox 304 livre de BPA',
      'Display': 'LED inteligente à prova dágua'
    },
    isFreeShipping: true,
    isVerified: true,
    isFastShipping: true,
    isBestPrice: true
  },
  {
    id: 'ach-03',
    title: 'Kit 3 Luminárias LED Sem Fio com Sensor de Movimento e Ímã',
    description: 'Iluminação inteligente para guarda-roupas, escadas e armários da cozinha. Sensor infravermelho de 3m e fixação sem furos.',
    price: 34.50,
    originalPrice: 79.00,
    discountPercentage: 56,
    platform: 'aliexpress',
    affiliateUrl: 'https://aliexpress.com/item/10050062?af=comerciopopular',
    affiliateCommissionRate: 7.5,
    rating: 4.7,
    reviewCount: 940,
    images: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Tecnologia',
    isAchadinho: true,
    stockUnits: 0,
    badge: 'Esgotado',
    ean: '7898501230038',
    specs: {
      'Quantidade': '3 unidades',
      'Recarga': 'Cabo USB incluso',
      'Autonomia': 'Até 45 dias em modo automático'
    },
    isFreeShipping: false
  },
  {
    id: 'ach-04',
    title: 'Fone de Ouvido Bluetooth 5.3 TWS Sem Fio com Cancelamento de Ruído',
    description: 'Graves profundos, baixa latência para vídeos e jogos, estojo de carregamento compacto com bateria para 28 horas totais.',
    price: 49.90,
    originalPrice: 119.90,
    discountPercentage: 58,
    platform: 'amazon',
    affiliateUrl: 'https://amazon.com.br/dp/B0CFG91?tag=comerciopopular-20',
    affiliateCommissionRate: 10.0,
    rating: 4.9,
    reviewCount: 5120,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Tecnologia',
    isAchadinho: true,
    stockUnits: 12,
    badge: 'Mais Vendido Amazon',
    ean: '7898501230045',
    specs: {
      'Bluetooth': 'Versão 5.3 Dual Channel',
      'Bateria': '6h contínuas + 22h no estojo',
      'Microfone': 'Duplo HD com redução de ruído'
    },
    isFreeShipping: true
  },
  {
    id: 'ach-05',
    title: 'Organizador Giratório 360° para Cosméticos, Maquiagem e Temperos',
    description: 'Aproveite 100% do espaço da sua bancada ou armário. Giro suave silencioso e bandejas ajustáveis em acrílico reforçado.',
    price: 29.90,
    originalPrice: 65.00,
    discountPercentage: 54,
    platform: 'shopee',
    affiliateUrl: 'https://shopee.com.br/universal-link?af=comerciopopular_giratorio',
    affiliateCommissionRate: 8.5,
    rating: 4.8,
    reviewCount: 2210,
    images: [
      '/images/organizador_giratorio.jpg'
    ],
    category: 'Casa & Cozinha',
    isAchadinho: true,
    stockUnits: 6,
    badge: 'Viral no TikTok',
    ean: '7898501230052',
    specs: {
      'Dimensões': '28cm x 22cm',
      'Material': 'Acrílico cristal de alta densidade',
      'Suporta': 'Até 8 kg'
    },
    isFreeShipping: true
  },
  {
    id: 'ach-06',
    title: 'Smartwatch Esportivo AMOLED com Monitor Cardíaco e Notificações',
    description: 'Tela ultra nítida de 1.85", mais de 100 modos de treino, medição de oxigenação SpO2, resistente à água IP68.',
    price: 89.90,
    originalPrice: 199.90,
    discountPercentage: 55,
    platform: 'aliexpress',
    affiliateUrl: 'https://aliexpress.com/item/smartwatch?af=comerciopopular',
    affiliateCommissionRate: 8.0,
    rating: 4.7,
    reviewCount: 1670,
    images: [
      '/images/smartwatch_esportivo.jpg'
    ],
    category: 'Tecnologia',
    isAchadinho: true,
    stockUnits: 5,
    badge: 'Preço Histórico',
    ean: '7898501230069',
    specs: {
      'Tela': '1.85" HD Curva',
      'Compatibilidade': 'Android 5.0+ e iOS 9.0+',
      'Bateria': 'Até 10 dias de uso normal'
    },
    isFreeShipping: true
  },

  // --- MARKETPLACE PRÓPRIO (COMERCIANTES PARCEIROS DO COMÉRCIO POPULAR) ---
  {
    id: 'par-01',
    title: 'Café Especial Mantiqueira de Minas 100% Arábica Torrado e Moído 500g',
    description: 'Produção artesanal familiar na Serra da Mantiqueira. Notas sensoriais de chocolate ao leite e caramelo, torra média fresca da semana.',
    price: 38.90,
    originalPrice: 48.00,
    discountPercentage: 18,
    platform: 'parceiro',
    rating: 5.0,
    reviewCount: 318,
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Alimentos & Bebidas',
    isAchadinho: false,
    stockUnits: 45,
    badge: 'Produtor Familiar',
    ean: '7898501230113',
    seller: {
      id: 'sel-01',
      name: 'Armazém da Mantiqueira',
      city: 'São Lourenço',
      state: 'MG',
      verified: true,
      plan: 'Plano Pro Comércio',
      rating: 4.9,
      salesCount: 1420
    },
    specs: {
      'Origem': 'Serra da Mantiqueira - MG (1.200m altitude)',
      'Variedade': 'Catuaí Amarelo 100% Arábica',
      'Pontuação SCA': '84 pontos especiais'
    },
    isFreeShipping: false
  },
  {
    id: 'par-02',
    title: 'Jogo de Panelas Cerâmica Premium Antiaderente Indução 5 Peças',
    description: 'Cozimento uniforme sem grudar nada e com menos óleo. Cabos com toque suave de baquelite que não esquentam. Compatível com fogão a gás e indução.',
    price: 269.90,
    originalPrice: 389.00,
    discountPercentage: 30,
    platform: 'parceiro',
    rating: 4.9,
    reviewCount: 480,
    images: [
      '/images/jogo-panelas-ceramica-premium.png',
      '/images/jogo-panelas-ceramica-premium.png'
    ],
    category: 'Casa & Cozinha',
    isAchadinho: false,
    stockUnits: 18,
    badge: 'Comerciante Verificado',
    ean: '7898501230120',
    seller: {
      id: 'sel-02',
      name: 'Casa & Conforto Paulista',
      city: 'São Paulo',
      state: 'SP',
      verified: true,
      plan: 'Plano Pro Comércio',
      rating: 4.8,
      salesCount: 3890
    },
    specs: {
      'Revestimento': 'Cerâmico mineral de 4.5mm atóxico',
      'Compatibilidade': 'Gás, Elétrico, Vitrocerâmico e Indução',
      'Itens inclusos': '2 Panelas, 1 Caçarola, 1 Frigideira, 1 Fervedor'
    },
    isFreeShipping: true,
    isVerified: true,
    isFastShipping: true,
    isBestPrice: true
  },
  {
    id: 'par-03',
    title: 'Mochila Executiva Impermeável Reforçada Antifurto para Notebook 15.6"',
    description: 'Tecido oxford repelente a água com costuras duplas travadas. Compartimento acolchoado para laptop, entrada USB externa e zíper oculto.',
    price: 119.90,
    originalPrice: 189.90,
    discountPercentage: 36,
    platform: 'parceiro',
    rating: 4.8,
    reviewCount: 612,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Moda Masculina',
    isAchadinho: false,
    stockUnits: 25,
    badge: 'Envio Rápido 24h',
    ean: '7898501230137',
    isVerified: true,
    isFastShipping: true,
    isBestPrice: true,
    seller: {
      id: 'sel-03',
      name: 'Couros & Cia Sul',
      city: 'Novo Hamburgo',
      state: 'RS',
      verified: true,
      plan: 'Plano Destaque Premium',
      rating: 4.9,
      salesCount: 5210
    },
    specs: {
      'Capacidade': '35 Litros',
      'Bolso': 'Porta notebook até 15.6 polegadas',
      'Material': 'Oxford 900D alta densidade'
    },
    isFreeShipping: true
  },
  {
    id: 'par-04',
    title: 'Kit 10 Panos de Prato Algodão 100% Felpudo Alto Poder de Absorção',
    description: 'Costura reforçada de bainha larga feita à mão. Não solta fiapos e enxuga louça de primeira. Estampas brasileiras vibrantes.',
    price: 42.00,
    originalPrice: 65.00,
    discountPercentage: 35,
    platform: 'parceiro',
    rating: 4.9,
    reviewCount: 890,
    images: [
      '/images/panos_de_prato.jpg'
    ],
    category: 'Casa & Cozinha',
    isAchadinho: true,
    stockUnits: 30,
    badge: 'Feito no Brasil 🇧🇷',
    ean: '7898501230144',
    seller: {
      id: 'sel-04',
      name: 'Bazar Popular Carioca',
      city: 'Rio de Janeiro',
      state: 'RJ',
      verified: true,
      plan: 'Plano Básico Parceiro',
      rating: 4.8,
      salesCount: 1980
    },
    specs: {
      'Composição': '100% Algodão Premium Fio Tinto',
      'Tamanho': '45cm x 70cm',
      'Gramatura': '320 g/m²'
    },
    isFreeShipping: false
  },
  {
    id: 'par-05',
    title: 'Sandália Ortopédica Conforto Anatômica em Couro Legítimo Feminina',
    description: 'Desenvolvida com palmilha massageadora que alivia dores na coluna, esporão de calcâneo e fascite plantar. Solado antiderrapante flexível.',
    price: 89.90,
    originalPrice: 149.00,
    discountPercentage: 40,
    platform: 'parceiro',
    rating: 4.9,
    reviewCount: 750,
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Calçados',
    isAchadinho: false,
    stockUnits: 14,
    badge: 'Saúde & Conforto',
    ean: '7898501230151',
    seller: {
      id: 'sel-05',
      name: 'Calçados Franca Real',
      city: 'Franca',
      state: 'SP',
      verified: true,
      plan: 'Plano Pro Comércio',
      rating: 4.9,
      salesCount: 4120
    },
    specs: {
      'Cabedal': 'Couro bovino legítimo macio',
      'Palmilha': 'EVA anatômico com memória',
      'Salto': '3,5 cm ergonômico'
    },
    isFreeShipping: true
  },
  {
    id: 'par-06',
    title: 'Conjunto 6 Facas Profissionais de Cozinha Aço Inox com Cepo de Madeira',
    description: 'Lâminas com tratamento térmico sub-zero que preservam o fio por meses. Cepo decorativo em madeira nobre tratada para sua bancada.',
    price: 139.90,
    originalPrice: 219.00,
    discountPercentage: 36,
    platform: 'parceiro',
    rating: 4.8,
    reviewCount: 340,
    images: [
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Casa & Cozinha',
    isAchadinho: false,
    stockUnits: 0,
    badge: 'Esgotado',
    ean: '7898501230168',
    seller: {
      id: 'sel-02',
      name: 'Casa & Conforto Paulista',
      city: 'São Paulo',
      state: 'SP',
      verified: true,
      plan: 'Plano Pro Comércio',
      rating: 4.8,
      salesCount: 3890
    },
    specs: {
      'Aço': 'Inox DIN 1.4110 Forjado',
      'Cabos': 'Polipropileno antibacteriano',
      'Garantia': '1 ano de fábrica'
    },
    isFreeShipping: true
  }
];

export const SELLER_PLANS: SellerPlan[] = [
  {
    id: 'iniciante',
    name: 'Plano Parceiro Iniciante',
    price: 39.90,
    period: 'mês',
    description: 'Perfeito para quem está começando e quer vender na internet com custo fixo mínimo.',
    maxProducts: 25,
    feePercentage: 0,
    badge: 'Mais Econômico',
    features: [
      'Até 25 produtos ativos na vitrine',
      'Zero comissão por venda (0% de taxa percentual)',
      'Frete direto por conta do vendedor',
      'Recebimento via PIX e Cartão com Split automático',
      'Painel de controle com controle de estoque e pedidos',
      'Selo de comerciante verificado básico'
    ]
  },
  {
    id: 'pro',
    name: 'Plano Pro Comércio',
    price: 69.90,
    period: 'mês',
    popular: true,
    description: 'A melhor relação custo-benefício para lojistas que querem acelerar as vendas diárias.',
    maxProducts: 'Ilimitados',
    feePercentage: 0,
    badge: 'Mais Escolhido ⭐',
    features: [
      'Produtos ilimitados no catálogo',
      'Prioridade nos resultados de busca e categorias',
      'Selo oficial "Comerciante Parceiro Verificado"',
      'Zero taxa percentual de comissão sobre vendas',
      'Recomendação automática pelo Chatbot de IA Pop',
      'Suporte prioritário via WhatsApp',
      'Etiquetas de envio prontas para impressão'
    ]
  },
  {
    id: 'empresa',
    name: 'Plano Destaque Premium',
    price: 99.90,
    period: 'mês',
    description: 'Máxima exposição com banners rotativos e inclusão nos disparos automáticos.',
    maxProducts: 'Ilimitados',
    feePercentage: 0,
    badge: 'Máximo Alcance',
    features: [
      'Tudo do Plano Pro Comércio',
      'Banner rotativo com a sua marca na página inicial',
      'Inclusão nas campanhas de tráfego pago do Comércio Popular',
      'Destaque no topo da seção de Comerciantes',
      'Assessoria individual de precificação e catálogo',
      'Split financeiro com saque diário disponível'
    ]
  }
];

export const CATEGORIES = [
  'Todas as Categorias',
  'Utilidades',
  'Casa & Cozinha',
  'Casa & Construção',
  'Eletrodomésticos',
  'Móveis',
  'Tecnologia',
  'Games',
  'Computadores',
  'Notebook',
  'Smartphones',
  'Acessórios para celulares',
  'Aparelhos de Som',
  'Fones & Headphones',
  'Instrumentos Musicais',
  'Automotivo',
  'Pets',
  'Moda Masculina',
  'Moda Feminina',
  'Moda Infantil',
  'Brinquedos',
  'TVs',
  'Calçados',
  'Esportes & Lazer',
  'Bike Elétrica e Acessórios',
  'Cuidado & Beleza',
  'Alimentos & Bebidas'
];

export const PLATFORM_INFO: Record<string, { name: string; color: string; bg: string; border: string; logoText: string }> = {
  mercadolivre: {
    name: 'Mercado Livre',
    color: '#2962ff',
    bg: '#eff6ff',
    border: '#bfdbfe',
    logoText: 'Mercado Livre'
  },
  shopee: {
    name: 'Shopee',
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    logoText: 'Shopee'
  },
  amazon: {
    name: 'Amazon Brasil',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    logoText: 'Amazon'
  },
  aliexpress: {
    name: 'AliExpress',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    logoText: 'AliExpress'
  },
  parceiro: {
    name: 'Comércio Popular',
    color: '#0F6E56',
    bg: '#E1F5EE',
    border: '#5DCAA5',
    logoText: 'Vendedor Local'
  },
  netshoes: {
    name: 'Netshoes',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    logoText: 'Netshoes'
  },
  shein: {
    name: 'Shein',
    color: '#000000',
    bg: '#f5f5f5',
    border: '#d4d4d4',
    logoText: 'Shein'
  },
  tiktokshop: {
    name: 'TikTok Shop',
    color: '#000000',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    logoText: 'TikTok Shop'
  },
  magalu: {
    name: 'Magalu',
    color: '#0086ff',
    bg: '#eff8ff',
    border: '#bfdbfe',
    logoText: 'Magalu'
  }
};
