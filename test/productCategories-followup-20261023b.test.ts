import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções adicionais de produtos reportadas em 2026-10-23', () => {
  it('move jogo de pratos de Móveis para Utilidades', () => {
    expect(resolveProductCategory('Móveis', 'Pratos Jogo de Prato Jantar Pratos Raso De Cerâmica Luxo Com Borda Mesa Posta - Wolff')).toBe('Utilidades');
  });
  it('classifica mini máquina de lavar louça como Eletrodomésticos', () => {
    expect(resolveProductCategory('Móveis', 'Hanjia armário de desinfecção utensílios de mesa domésticos pequeno Mini desktop utensílios de cozinha secagem dreno-liv máquina de lavar louça')).toBe('Eletrodomésticos');
  });
  it('mantém mangueira de tanquinho fora de Eletrodomésticos', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Kit Mangureiras de Entrada e de Saida com 2 Metros cada Tanquinho todas as marcas branca')).toBe('ELETRO & ACESSÓRIOS');
  });
  it('move rádio H-Tech para AUTO & ACESSÓRIOS', () => {
    expect(resolveProductCategory('Aparelhos de Som', 'Rádio Aparelho de Som H-Tech Bluetooth USB AM FM Com Controle Saída de Som Forte')).toBe('AUTO & ACESSÓRIOS');
  });
});
