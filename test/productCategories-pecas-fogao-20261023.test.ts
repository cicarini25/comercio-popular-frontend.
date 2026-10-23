import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Peças de fogão confirmadas em 2026-10-23', () => {
  it('move somente os 11 títulos de Eletrodomésticos para Eletro & Acessórios', () => {
    for (const title of [
      'Tampinhas Fogão Dako Supreme Titan 4 Bocas Kit 4 Peças Pretas Compatível',
      'Bocas do Fogão 4 Bocas Mueller Decorato Vetro com Mesa de Vidro queimadores e espalhadores',
      'Espalhadores Boca Chama Tampinha Fogão Atlas Itatiaia Coliseum Ágata Grécia Coliseum Mônaco 4 ou 5 Bocas',
      'Kit C/ 4 Interruptor + Chicote Fogão Cooktop Fischer 4 Bocas',
      'Kit 4 Espalhadores Tampinhas Bocas Fogão Atlas Utop Glass 4 Bocas 30000075',
      'Kit Completo Atlas 4 Espalhadores + 4 Sorvetes Fogão 4 Bocas Monaco Coliseu Grécia Glass',
      'Protetor Fogão Antiaderente Reutilizável Resistente Ao Calor Para Boca Fogão Gás Kit 1 4 Ou 6 Unidades Lavável Ajustável',
      'Kit Tampinha Espalhadores Boca De Fogão Dako Delta 4 Bocas',
      'Tampinhas Espalhadores Bocas Fogão Atlas Atenas 4 Bocas',
      'kit 4 espalhadores bocas fogao atlas monaco top glass 4 bocas',
      'Tampinhas Espalhadores Bocas Fogão Atlas Atenas 4 Bocas',
    ]) {
      expect(resolveProductCategory('Eletrodomésticos', title)).toBe('ELETRO & ACESSÓRIOS');
    }
  });

  it('não altera o produto LEC15 informado como já correto', () => {
    expect(resolveProductCategory(
      'Eletrodomésticos',
      'Máquina de Lavar Electrolux LEC15 15kg Premium Care Cesto Inox',
    )).toBe('Eletrodomésticos');
  });
});
