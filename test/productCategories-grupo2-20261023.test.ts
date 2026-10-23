import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Grupo 2 confirmado', () => {
  it('move fio para crochê de Bolsas & Mochilas para Armarinhos & Tricô', () => {
    expect(resolveProductCategory('BOLSAS & MOCHILAS', 'Fio de algodão preenchido para bolsas tecidas à mão, fio para crochê.')).toBe('ARMARINHOS & TRICÔ');
  });
  it('move o pote organizador de pastilhas de Eletrodomésticos para Eletro & Acessórios', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Pote Organizador de Pastilhas Lava - Louças Preto - Máquina de Lavar Louça')).toBe('ELETRO & ACESSÓRIOS');
  });
});
