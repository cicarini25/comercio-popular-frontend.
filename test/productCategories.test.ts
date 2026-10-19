import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Categorias de produtos importados do feed Shopee', () => {
  it.each([
    ['Jogo de 4 a 6 Taças de Vidro Diamond Cores Transparente Ambar Furta Cor Verde Azul Fume Bico De Jaca 330ml', 'Instruções de conservação e decoração da mesa.'],
    ['Kit Conjunto Jogo De Faqueiro Búzios 24 Peças Aço Inox Tramontina', 'Conservação: lavar e secar após o uso.'],
    ['Potes de Vidro P/ Mantimentos C/ Tampa Bambu Oikos - 5 Pçs', 'Kit de potes de vidro hermético redondo para mantimentos.'],
    ['Jogo de Pratos Jantar Rústico Marrom Tramontina Porcelana Conjunto de Pratos Raso, Prato Fundo e Sobremesa Opções de Kit', 'Você pode repetir o processo para combinar diferentes kits.'],
    ['Escorredor De Louça Cozinha Prato Duplo Porta Talheres Metaltru', 'Organização da cozinha.'],
  ])('classifica o utensílio em Casa & Cozinha: %s', (title, description) => {
    expect(resolveProductCategory('Home & Living', title, description)).toBe('Casa & Cozinha');
  });

  it('não transforma palavras terminadas em -ção ou contendo pet em animais', () => {
    expect(resolveProductCategory('Home & Living', 'Artigo para decoração', 'Conservação: repetir a limpeza.')).not.toBe('Pets');
  });

  it.each([
    'Disney tapete de banheiro antiderrapante absorvente tapete de banheiro',
    'Dopamina tapete de banheiro doméstico absorver água',
  ])('classifica tapete de banheiro em CAMA/MESA/BANHO: %s', (title) => {
    expect(resolveProductCategory('Casa & Cozinha', title)).toBe('CAMA/MESA/BANHO');
  });

  it('não envia tapete sem contexto de banho para CAMA/MESA/BANHO', () => {
    expect(resolveProductCategory('Casa & Cozinha', 'Tapete decorativo para sala')).toBe('Casa & Cozinha');
  });

  it.each(['Ração para cães', 'Bebedouro para gatos 3L', 'Pote para ração de cachorro', 'Coleira pet'])('preserva a categoria de animais: %s', (title) => {
    expect(resolveProductCategory('Pets', title)).toBe('Pets');
  });

  it.each([
    '2 Válvulas Retenção Esgoto 100mm 4 Polegadas',
    'Bucha de Fixação P/ Parede Com Anel Aba - 05 - 06 - 07 - 08 - 10 - 12',
    'Kit Buchas 5 6 8 e 10mm com Anel Kit Bucha 5 6 8 10 com Aba para Fixação',
    'Kit Gancho e Bucha com Anel 6 8 10 Kit 50 100 200 Gancho Aberto',
  ])('reclassifica item hidráulico/de fixação fora de Pets: %s', (title) => {
    expect(resolveProductCategory('Pets', title)).toBe('Ferramentas');
  });

  it.each([
    'Frigideira de cerâmica doméstica frigideira antiaderente multifuncional',
    'Frigideira doméstica bife frigideira multifuncional panqueca',
    'Espremedor Manual De Alumínio Prático De Frutas Multifuncional',
  ])('classifica utensílio de cozinha apesar do termo multifuncional: %s', (title) => {
    expect(resolveProductCategory('MÁQUINAS & IMPRESSORAS', title)).toBe('Casa & Cozinha');
  });

  it('mantém impressoras e equipamentos de gravação a laser em Máquinas & Impressoras', () => {
    expect(resolveProductCategory('Casa & Cozinha', 'Impressora multifuncional térmica para etiquetas')).toBe('MÁQUINAS & IMPRESSORAS');
    expect(resolveProductCategory('Casa & Cozinha', 'Rolo Rotativo para Gravação a Laser Eixo Giratório para gravadoras a laser')).toBe('MÁQUINAS & IMPRESSORAS');
  });

  it('não confunde controle remoto com acessório para motocicleta', () => {
    expect(resolveProductCategory('Brinquedos', 'Carrinho Controle Remoto 50km/h 4X4 Automodelo RC Competição')).toBe('Brinquedos');
  });

  it('classifica painel para TV como móvel, e não como aparelho de TV', () => {
    expect(resolveProductCategory('Móveis', 'Painel Ripado P/ Tv 32 Polegadas Smart Plus Sala Quarto')).toBe('Móveis');
  });

  it('mantém camas e caminhas de animais na categoria Pets, não em Móveis', () => {
    expect(resolveProductCategory('Pets', 'Caminha Pet Canelada Premium, cama para cachorro e gato')).toBe('Pets');
    expect(resolveProductCategory('Pets', 'Cama de madeira reforçada para cachorro')).toBe('Pets');
  });

  it('classifica guarda-roupa organizador como móvel', () => {
    expect(resolveProductCategory('Móveis', 'Guarda Roupa Dobrável Organizador De Roupas Portátil Multiuso')).toBe('Móveis');
  });

  it('prioriza o tipo do produto sobre a palavra “feminino”', () => {
    expect(resolveProductCategory('Calçados Femininos', 'Tênis Meia Feminino Confortável')).toBe('Calçados Femininos');
    expect(resolveProductCategory('Moda Feminina', 'Kit 4 Perfumes Femininos Árabes 100ml')).toBe('Cuidado & Beleza');
  });

  it('não confunde acessórios de celular com o aparelho citado no anúncio', () => {
    expect(resolveProductCategory('Acessórios para celulares', 'Película de vidro 3D Motorola Moto Z2 Play Protetor de Tela Celular')).toBe('Acessórios para celulares');
    expect(resolveProductCategory('Acessórios para celulares', 'Capa Estampada Feminina Galaxy S22 Ultra Com Película Cerâmica')).toBe('Acessórios para celulares');
  });

  it('mantém relógios femininos em RELÓGIOS e consoles de videogame em Games mesmo quando citam TV', () => {
    expect(resolveProductCategory('RELÓGIOS', 'Smartwatch feminino com monitoramento de saúde e chamadas Bluetooth')).toBe('RELÓGIOS');
    expect(resolveProductCategory('Games', 'Mini VideoGame Nintendo Portátil 400 Jogos Retro Console Sup Game Box com TV')).toBe('Games');
  });

  it('classifica headset gamer como fone, sem confundi-lo com computador', () => {
    expect(resolveProductCategory('Games', 'Fone de Ouvido Headset Gamer USB LED com Microfone para PC Gamer')).toBe('Fones & Headphones');
  });

  it('mantém fritadeiras em Eletrodomésticos, mesmo com o termo multifuncional', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Air Fryer Elétrica 6,5L Fritadeira Elétrica Multifuncional Inox')).toBe('Eletrodomésticos');
  });

  it('move roupas masculinas não aquáticas de MODA VERÃO PRAIA para Moda Masculina', () => {
    expect(resolveProductCategory('MODA VERÃO PRAIA', 'Regata Streetwear Camisa Masculina Estilo Verão Praia Summer Blusa Cavada Unissex Larga Algodão')).toBe('Moda Masculina');
    expect(resolveProductCategory('MODA VERÃO PRAIA', 'Kit Masculino Regata e Bermuda Tactel Estampa Frontal Águia Moderno Estilosa')).toBe('Moda Masculina');
    expect(resolveProductCategory('MODA VERÃO PRAIA', 'Shorts Masculino Tactel Praia Academia Treino Corrida Verão Secagem Rápida')).toBe('Moda Masculina');
    expect(resolveProductCategory('MODA VERÃO PRAIA', 'Biquíni feminino com bojo')).toBe('MODA VERÃO PRAIA');
  });

  it('preserva calçados e roupas quando os termos do anúncio são ambíguos', () => {
    expect(resolveProductCategory('Calçados Femininos', 'Sapatilhas Femininas Conforto Floral Calçados Femininos Macios')).toBe('Calçados Femininos');
    expect(resolveProductCategory('Calçados Masculino', 'Tênis Masculino Feminino para academia e caminhada')).toBe('Calçados Masculino');
    expect(resolveProductCategory('Moda Masculina', 'Camiseta Resident Evil Umbrella Corporation Playstation 5')).toBe('Moda Masculina');
    expect(resolveProductCategory('Moda Feminina', 'Short 5088 tecido plissado com tira de amarrar sem bolso')).toBe('Moda Feminina');
  });

  it('separa ferramentas de costura de CAMA/MESA/BANHO sem deslocar roupa de renda', () => {
    expect(resolveProductCategory('CAMA/MESA/BANHO', 'Agulha de costura doméstica, agulha de colcha e bordado')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('CAMA/MESA/BANHO', 'Linha de costura à mão para colcha')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('ARMARINHOS & TRICÔ', 'Toalha de banho infantil felpuda')).toBe('CAMA/MESA/BANHO');
    expect(resolveProductCategory('CAMA/MESA/BANHO', 'Toalha de banho infantil felpuda')).toBe('CAMA/MESA/BANHO');
    expect(resolveProductCategory('Moda Feminina', 'Blusa feminina de renda')).toBe('Moda Feminina');
  });

  it('separa acessórios/peças de eletrodomésticos do aparelho completo', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Motor prato para microondas 127v')).toBe('ELETRO & ACESSÓRIOS');
    expect(resolveProductCategory('ELETRO & ACESSÓRIOS', 'Batedor para batedeira planetária original')).toBe('ELETRO & ACESSÓRIOS');
    expect(resolveProductCategory('ELETRO & ACESSÓRIOS', 'Liquidificador doméstico 500W')).toBe('Eletrodomésticos');
  });

  it('mantém produtos automotivos e de motocicleta fora de áudio, celular e moda', () => {
    expect(resolveProductCategory('Aparelhos de Som', 'Aparelho de som automotivo Bluetooth para carro')).toBe('AUTO & ACESSÓRIOS');
    expect(resolveProductCategory('Móveis', 'Tampa Válvulas Toyota Yaris 1.5 2019 a 2026')).toBe('AUTO & ACESSÓRIOS');
    expect(resolveProductCategory('Acessórios para celulares', 'Protetor de calçado para pedal e câmbio de moto')).toBe('MOTOS & ACESSÓRIOS');
    expect(resolveProductCategory('MOTOS & ACESSÓRIOS', 'Carregador de bicicleta elétrica 60V')).toBe('Bike Elétrica e Acessórios');
  });

  it('distingue acessórios para celular, fones, microfones e computadores', () => {
    expect(resolveProductCategory('Smartphones', 'Capa Case de silicone compatível com smartphone Samsung')).toBe('Acessórios para celulares');
    expect(resolveProductCategory('ELETRÔNICOS', 'Power bank portátil para smartphone 20000mAh')).toBe('Acessórios para celulares');
    expect(resolveProductCategory('Smartphones', 'Microfone Boya XLR para câmera e smartphones')).toBe('Aparelhos de Som');
    expect(resolveProductCategory('Smartphones', 'Fone Bluetooth sem fio para celular')).toBe('Fones & Headphones');
    expect(resolveProductCategory('Fones & Headphones', 'Headset gamer com mouse gamer USB para PC')).toBe('Computadores');
  });

  it('corrige categorias de Móveis para esportes, iluminação e cozinha de brinquedo', () => {
    expect(resolveProductCategory('Móveis', 'Bola de futebol oficial para esporte e lazer')).toBe('Esportes & Lazer');
    expect(resolveProductCategory('Esportes & Lazer', 'Ginástica Academia Residencial Halteres Caneleiras Colchão Kit Mini Band')).toBe('Esportes & Lazer');
    expect(resolveProductCategory('Móveis', 'Ginástica Academia Residencial Halteres Caneleiras Colchão Kit Mini Band')).toBe('Esportes & Lazer');
    expect(resolveProductCategory('Móveis', 'Luminária de mesa LED para leitura')).toBe('Utilidades');
    expect(resolveProductCategory('Móveis', 'Cozinha infantil de brinquedo com acessórios')).toBe('Brinquedos');
  });

  it('coloca o controle de videogame em Games mesmo se o título mencionar roupa', () => {
    expect(resolveProductCategory('Moda Masculina', 'Controle Gamer com receptor USB Regata Canelada Masculina Premium Kit')).toBe('Games');
    expect(resolveProductCategory('Moda Masculina', 'Camiseta Resident Evil com estampa Playstation 5')).toBe('Moda Masculina');
  });
});

