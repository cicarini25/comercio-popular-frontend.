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

  it('move apenas a camiseta masculina identificada de MODA VERÃO PRAIA para Moda Masculina', () => {
    expect(resolveProductCategory('MODA VERÃO PRAIA', 'Regata Streetwear Camisa Masculina Estilo Verão Praia Summer Blusa Cavada Unissex Larga Algodão')).toBe('Moda Masculina');
    expect(resolveProductCategory('MODA VERÃO PRAIA', 'Regata Streetwear Bataria 100% Masculina Estilo Verão Praia Summer Blusa Cavada Unissex Larga Algodão')).toBe('MODA VERÃO PRAIA');
  });

  it('preserva calçados e roupas quando os termos do anúncio são ambíguos', () => {
    expect(resolveProductCategory('Calçados Femininos', 'Sapatilhas Femininas Conforto Floral Calçados Femininos Macios')).toBe('Calçados Femininos');
    expect(resolveProductCategory('Calçados Masculino', 'Tênis Masculino Feminino para academia e caminhada')).toBe('Calçados Masculino');
    expect(resolveProductCategory('Moda Masculina', 'Camiseta Resident Evil Umbrella Corporation Playstation 5')).toBe('Moda Masculina');
    expect(resolveProductCategory('Moda Feminina', 'Short 5088 tecido plissado com tira de amarrar sem bolso')).toBe('Moda Feminina');
  });
});

