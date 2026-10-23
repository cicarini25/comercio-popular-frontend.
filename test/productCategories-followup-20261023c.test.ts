import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções adicionais de produtos reportadas em 2026-10-23', () => {
  it('move peças de fogão para ELETRO & ACESSÓRIOS', () => {
    for (const title of [
      'Eletrodo Centelhador Vela Fogão Cooktop Fischer 1 Peça',
      'Manípulo Do Fogão Consul Cfo4 Cfs5 Cfs6 W10915953 Original',
      'Vedação Gaxeta Porta Forno Fogão Brastemp 3 Lados Original',
    ]) {
      expect(resolveProductCategory('Eletrodomésticos', title)).toBe('ELETRO & ACESSÓRIOS');
    }
  });

  it('move tigela de batedeira para Casa & Cozinha', () => {
    expect(resolveProductCategory(
      'Eletrodomésticos',
      'TIGELA BATEDEIRA PLANETÁRIA 4L ORIGINAL PLÁSTICO PHILCO BRITANIA PHP500 BBT500P BBP515P BBP520P',
    )).toBe('Casa & Cozinha');
  });

  it('move escova de lavar louça para ELETRO & ACESSÓRIOS', () => {
    expect(resolveProductCategory(
      'Eletrodomésticos',
      'Escova de limpeza descontaminação escova de lavar louça doméstica fogão de cozinha escova de limpeza pote escova de lava',
    )).toBe('ELETRO & ACESSÓRIOS');
  });

  it('mantém a máquina de lavar louça em Eletrodomésticos', () => {
    expect(resolveProductCategory(
      'Móveis',
      'Hanjia armário de desinfecção utensílios de mesa domésticos pequeno Mini desktop utensílios de cozinha secagem dreno-liv máquina de lavar louça',
    )).toBe('Eletrodomésticos');
  });

  it('move os dois produtos de TV para Utilidades', () => {
    for (const title of [
      'Enfeite Televisor Retrô Natalino com Neve Líquida e Música, Presente Criativo de Natal',
      'Monitor boneca tela expositor computador exposição gancho cabide tela do computador TV uso controle Central',
    ]) {
      expect(resolveProductCategory('TVs', title)).toBe('Utilidades');
    }
  });
});
