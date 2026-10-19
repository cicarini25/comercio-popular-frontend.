import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções adicionais da classificação de eletrodomésticos', () => {
  it.each([
    'SILICONE - PANELA P/ AIR FRYER CINZA Ø20 X 6 CM',
    'Pegador Culinário de Alimentos Pegador Pinça para Air Fryer Pegador de Carne',
    'Kit 50 Forros de Papel Descartável para Air Fryer 3L a 5L Antiaderente',
    'Forro Silicone Reutilizável Para Air Fryer Antiaderente',
    'Spray Limpa Air Fryer Super Dom Desengordurante',
    'Tapete Protetor Silicone para Air Fryer – Não Gruda na Cesta',
  ])('move utensílio/acessório de Air Fryer para Utilidades: %s', (title) => {
    expect(resolveProductCategory('Eletrodomésticos', title)).toBe('Utilidades');
  });

  it('mantém o aparelho Air Fryer completo em Eletrodomésticos', () => {
    expect(resolveProductCategory('Utilidades', 'Air Fryer Elétrica 6,5L Fritadeira Elétrica Multifuncional')).toBe('Eletrodomésticos');
  });

  it.each([
    'Fogao Fogareiro Eletrico 800W/127V 01 Boca Resiswal Camping',
    'Fogareiro Eletrico 1 Boca Fogão Resiswal 800 Watts 127v',
    'Fogao Fogareiro Eletrico 800w/127v 01 Boca Resiswal - 127 Volts',
  ])('classifica fogareiro elétrico em ELETRO & ACESSÓRIOS: %s', (title) => {
    expect(resolveProductCategory('Eletrodomésticos', title)).toBe('ELETRO & ACESSÓRIOS');
  });

  it('classifica adoçante em pó em Alimentos & Bebidas apesar de citar forno e fogão', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Adoçante Natural em Pó Snew Forno e Fogão 250g Chocolife')).toBe('Alimentos & Bebidas');
  });
});
