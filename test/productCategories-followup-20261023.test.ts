import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções de produtos reportadas em 2026-10-23', () => {
  it('move peças e acessórios de tanquinho, lavadora e robô aspirador para ELETRO & ACESSÓRIOS', () => {
    for (const title of [
      'Kit Mangueiras de Entrada e de Saida com 2 Metros cada Tanquinho todas as marcas branca',
      '2 Unidades Removedor De Cabelo Reutilizável Da Máquina De Lavar Roupa',
      'T7 T7PRO Tanque De Água Caixa De Poeira Mop Rack Robô Aspirador De Pó Acessórios',
      'Kit 4 Espalhador + 4 Queimador do Fogão Esmaltec Ágata para Fogões',
      'Bocas do Fogão 4 Bocas Mueller Decorato Vetro Queimadores e Espalhadores',
    ]) {
      expect(resolveProductCategory('Eletrodomésticos', title)).toBe('ELETRO & ACESSÓRIOS');
    }
  });

  it('move tapetes pedagógicos de Móveis para Brinquedos', () => {
    expect(resolveProductCategory(
      'Móveis',
      'Tapete Pedagógico - Brincadeiras Lúdicas - Atividade de Coordenação Motora - Tapete Amarelinha De Animais Antiderrapante',
    )).toBe('Brinquedos');
  });

  it('move toalhas de mesa de Móveis para CAMA/MESA/BANHO', () => {
    for (const title of [
      'Toalha de Mesa Redonda 4 Lugares',
      'Toalha de Mesa Quadrada Impermeável',
      'Toalha de Mesa Retangular para Jantar',
    ]) {
      expect(resolveProductCategory('Móveis', title)).toBe('CAMA/MESA/BANHO');
    }
  });

  it('move sensores e decoração RGB de Móveis para ELETRÔNICOS', () => {
    expect(resolveProductCategory(
      'Móveis',
      'Sensor de pressão da cama escolar, sensor de contato de imprensa inteligente, resistência à pressão do alarme, sensor',
    )).toBe('ELETRÔNICOS');
    expect(resolveProductCategory(
      'Móveis',
      'Luz de contorno de atmosfera RGB com a mesma tela Luz de perseguição Sala de jogos Monitor de mesa de computador Decoração',
    )).toBe('ELETRÔNICOS');
  });

  it('move torneiras de Móveis para ELÉTRICA & HIDRÁULICA', () => {
    expect(resolveProductCategory(
      'Móveis',
      'Torneira Gourmet Torneira de Mesa com Filtro Torneira de Cozinha Torneira Moderna Purificador',
    )).toBe('ELÉTRICA & HIDRÁULICA');
  });

  it('move som automotivo de Aparelhos de Som para AUTO & ACESSÓRIOS', () => {
    for (const title of [
      'Aparelho Som Carro MP3 com Bluetooth Rádio FM USB + Alto Falante Leson 5 Polegadas',
      'Aparelho MP3 Bluetooth Rádio FM USB SD Par Alto Falante Carro 5 Pol 120 Watts RMS Kit Som Automotivo',
      'Kit Som Carro Par Alto Falante 6 Polegadas Bomber 100W + Rádio Aparelho H-Tech Bluetooth USB',
      'Rádio Aparelho de Som H-Tech Bluetooth USB AM FM com Controle Saída de Som Forte para Carro',
    ]) {
      expect(resolveProductCategory('Aparelhos de Som', title)).toBe('AUTO & ACESSÓRIOS');
    }
  });

  it('move produto de saúde auditiva para Cuidado & Beleza', () => {
    expect(resolveProductCategory(
      'Aparelhos de Som',
      'Saúde Auditiva, Alto-Falante de Som Claro, Conforto Extremo de Cristal, Bluetooth, Aparelho de Osso, Fone de Ouvido',
    )).toBe('Cuidado & Beleza');
  });
});
