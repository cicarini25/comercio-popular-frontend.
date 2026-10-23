import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correção específica do anúncio Hanjia', () => {
  it('move Hanjia de Móveis para Eletrodomésticos pelo título real do catálogo', () => {
    expect(resolveProductCategory(
      'Móveis',
      'Hanjia armário de desinfecção utensílios de mesa domésticos pequeno Mini desktop utensílios de cozinha secagem dreno-liv',
    )).toBe('Eletrodomésticos');
  });
});
