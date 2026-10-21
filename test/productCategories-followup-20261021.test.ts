import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções de produtos reportadas em 2026-10-21', () => {
  it('move peças de queimador de fogão para ELETRO & ACESSÓRIOS', () => {
    expect(resolveProductCategory(
      'ELÉTRICA & HIDRÁULICA',
      'Jogo 4 Bocas Fogão Mueller Sem Automático Espalhador + Bacia 4 Bocas E Queimador Fogão Electrolux 4 Bocas 56SE Jogo 4 Peças Ferro Bacia',
    )).toBe('ELETRO & ACESSÓRIOS');
  });

  it('move bolsa de guidão para BOLSAS & MOCHILAS, mas cesta de bicicleta para Bike Elétrica e Acessórios', () => {
    expect(resolveProductCategory(
      'ELÉTRICA & HIDRÁULICA',
      'Bolsa dobrável para guidão de bicicleta, bolsa para torneira de bicicleta elétrica, Mountain bike, bolsa para cabeça',
    )).toBe('BOLSAS & MOCHILAS');
    expect(resolveProductCategory(
      'BOLSAS & MOCHILAS',
      'Cesta de bicicleta Extra grande plástico mochila cesta Mountain bike cesta traseira dobrável cesta vegetal elétrica',
    )).toBe('Bike Elétrica e Acessórios');
  });

  it('classifica relógio despertador decorativo como Utilidades, apesar de citar bicicleta', () => {
    expect(resolveProductCategory(
      'Bike Elétrica e Acessórios',
      'Relógio Despertador Criativo Decorativo Bicicleta Antiga De Ponteiros',
    )).toBe('Utilidades');
  });

  it('move protetor e lâmpada de moto para MOTOS & ACESSÓRIOS sem deslocar luminária doméstica', () => {
    expect(resolveProductCategory(
      'LUMINÁRIAS',
      'Para BMW F650GS F700GS F800GS F800R F 800 700 650 GS Moto Protetor De Proteção Do Farol Filme Guarda Lâmpada Dianteira',
    )).toBe('MOTOS & ACESSÓRIOS');
    expect(resolveProductCategory(
      'LUMINÁRIAS',
      'ST-SC-01 Luz de LED para freio de moto, 12V 3W 120LM Lâmpada Moto',
    )).toBe('MOTOS & ACESSÓRIOS');
    expect(resolveProductCategory('LUMINÁRIAS', 'Luminária LED de mesa para leitura')).toBe('LUMINÁRIAS');
  });

  it('classifica máquina de solda com ponta de ferro como Ferramentas', () => {
    expect(resolveProductCategory(
      'LUMINÁRIAS',
      'Máquina de solda automática lâmpada de solda com ponta de ferro de solda 911-60D meio lado 150W lâmpada de solda com pon',
    )).toBe('Ferramentas');
  });

  it('move lâmpadas G9 para fogões e fornos a ELETRO & ACESSÓRIOS', () => {
    expect(resolveProductCategory(
      'LUMINÁRIAS',
      'Kit Lâmpada Halógena G9 Fogões Fornos 25w 220v Electrolux/FISHER E ELECTROLUX',
    )).toBe('ELETRO & ACESSÓRIOS');
    expect(resolveProductCategory('LUMINÁRIAS', 'Lâmpada LED decorativa para quarto')).toBe('LUMINÁRIAS');
  });

  it('move kit de chuteira e itens de reparo de zíper para as categorias corretas', () => {
    expect(resolveProductCategory(
      'BOLSAS & MOCHILAS',
      'Kit Chuteira Masculina Adulto Trava Futebol Campo Costurada + Mochila Meiao e Relogio',
    )).toBe('Esportes & Lazer');
    expect(resolveProductCategory('BOLSAS & MOCHILAS', 'Kit conjunto Unidades De Zíperes De Reparo, Mochilas Removíveis')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('BOLSAS & MOCHILAS', '6 Unidades De Zíperes De Reparo, Mochilas Removíveis, Substituição Para Cabeça De Zíper')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('BOLSAS & MOCHILAS', '10 Peças Fixadores Zíper Aberto Para Costura 27 5 Polegada 70cm Zíperes Nylon')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('BOLSAS & MOCHILAS', 'Kit Cursor Preto Nº 6 para Zíper Reforçado Resistente Alta Qualidade Puxador')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('BOLSAS & MOCHILAS', 'Cursor para Zíper nº 5 Argola Dourado Puxador para Zíper de Bolsa Mochila')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('BOLSAS & MOCHILAS', 'Pçs Costura Zíperes Extrator Cabeça Forma De Coração Destacável Metal Zíper')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('BOLSAS & MOCHILAS', 'Mochila escolar impermeável com vários compartimentos')).toBe('BOLSAS & MOCHILAS');
  });

  it('move vestidos e macaquinhos infantis de festa/ballet para MODA INFANTIL FEMININA', () => {
    expect(resolveProductCategory(
      'Esportes & Lazer',
      'Vestido infantil preto, vestido de princesa com cauda, vestido de tule com decote halter, vestido de festa infantil.',
    )).toBe('MODA INFANTIL FEMININA');
    expect(resolveProductCategory(
      'Esportes & Lazer',
      'Macaquinho Infantil/Juvenil (Do 02 ao 16) - para Ballet, Jazz ou Ginástica Rítmica',
    )).toBe('MODA INFANTIL FEMININA');
  });

  it('classifica bolsa de mão/tiracolo em BOLSAS & MOCHILAS e camiseta mista de academia em Moda Masculina', () => {
    expect(resolveProductCategory(
      'Moda Feminina',
      'Bolsa Pequena Feminina de Mão e Tiracolo Bolsinha Transversal Clutch Mini Bag',
    )).toBe('BOLSAS & MOCHILAS');
    expect(resolveProductCategory(
      'Moda Feminina',
      'Camiseta Basica Algodão Header Masculino e Feminino Musculação Camisa Academia',
    )).toBe('Moda Masculina');
  });

  it('move a camiseta estampada Eu Odeio Cardio para Moda Feminina', () => {
    expect(resolveProductCategory(
      'Moda Masculina',
      'Camiseta Academia Estampada Eu Odeio Cardio 100% Algodão Premium',
    )).toBe('Moda Feminina');
  });

  it('classifica carimbo/molde de brigadeiro em Utilidades e conjunto smartwatch em RELÓGIOS', () => {
    expect(resolveProductCategory(
      'AUTO & ACESSÓRIOS',
      'Kit Carimbo Marcador Brigadeiros HOT WHEELS CARROS CARRINHOS TROFEUS Molde Festa Confeitaria Aniversario Brigadeiro',
    )).toBe('Utilidades');
    expect(resolveProductCategory(
      'Fones & Headphones',
      'Conjunto 4 Em 1 Smartwatch Smart Watch Fone De Ouvido Digital Sem Fio i13 Kit De Presente Para Festival',
    )).toBe('RELÓGIOS');
  });

  it('reclassifica cabo bipolar compatível com eletrônicos mesmo se estiver em acessórios para celular', () => {
    expect(resolveProductCategory(
      'Acessórios para celulares',
      'Cabo De Força Bipolar 10A Energia Compatível com Tv Samsung LG Ps4 Ps5 Xbox Impressoras',
    )).toBe('ELETRÔNICOS');
  });

  it('move decoração de festa e bonecos decorativos PlayStation para Utilidades, não Games', () => {
    expect(resolveProductCategory(
      'Games',
      'Kit Só um Bolinho - Playstation - Kit Festa em casa - Aniversário, Mêsversário',
    )).toBe('Utilidades');
    expect(resolveProductCategory(
      'Games',
      'Conjunto de 4 Bonecos Símbolos PlayStation Articulados em Impressão 3D',
    )).toBe('Utilidades');
  });

  it('classifica fogões completos em Eletrodomésticos e brinquedos de cozinha em Brinquedos', () => {
    for (const title of [
      'Fogão a Gás 4 Bocas Inox Embutir e Mesa Cozinha e Restaurante 4 Queimadores',
      'Fogão Itatiaia Star New 4 Bocas Com Acendimento Automático Branco/Preto',
      'Fogão cooktop 4 bocas preço bom ITATIAIA essencial - fogão bivolt - cozinha moderna - fogão de vidro',
    ]) {
      expect(resolveProductCategory('Casa & Cozinha', title)).toBe('Eletrodomésticos');
    }
    for (const title of [
      'Mini Cozinha Rosa com Fogão, Forno, Liquidificador, Espátula e Outros Acessórios',
      'Brinquedo Infantil Mini Freezer Cozinha Cozinha De Brincar Educativo Infantil',
      'Brinquedo Infantil Freezer Cooker Brincadeiras de Comidinhas Divertido Brincar de Cozinhar',
    ]) {
      expect(resolveProductCategory('Casa & Cozinha', title)).toBe('Brinquedos');
    }
  });

  it('classifica caixa Bluetooth como Aparelhos de Som e mesas de cozinha/jantar como Móveis', () => {
    expect(resolveProductCategory(
      'Casa & Cozinha',
      'Caixa de Som Bluetooth Retrô, Caixa de Som Bluetooth Sem Fio, Estilo Antigo e Fofo para Cozinha, Quarto, Escritório, Festa',
    )).toBe('Aparelhos de Som');
    for (const title of [
      'Mesa Redonda Lais 90cm Off White MDF 18mm Pé Ferro Preto Moderna Cozinha Sala Jantar',
      'Mesa De Parede Dobrável Cozinha Jantar Balcão Para Sala',
      'Mesa de Jantar Cozinha Industrial Para 4 Lugares Pés em Aço 105 x 75 cm Bronze Moderna Elegante Decoração',
      'Mesa Redonda Elisa 90cm Preta Base X Moderna MDF Sala Jantar Cozinha',
      'Mesa Redonda Lais 110cm Preta MDF 18mm Pé Ferro Moderna Sala Jantar Cozinha',
      'Mesa Pés Ferro Jantar Sala Cozinha Industrial Laís 90 Cm Redondo Branco',
    ]) {
      expect(resolveProductCategory('Casa & Cozinha', title)).toBe('Móveis');
    }
  });
});
