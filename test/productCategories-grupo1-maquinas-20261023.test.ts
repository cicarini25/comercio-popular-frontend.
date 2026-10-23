import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Grupo 1: 11 máquinas de lavar confirmadas', () => {
  it('move somente os 11 títulos informados de Utilidades para Eletrodomésticos', () => {
    for (const title of [
      'Tanquinho 10kg Newmaq',
      'Máquina de Lavar Roupa Semiautomático | 9 Programas de Lavagem',
      'Máquina de lavar Ideal+ Panasonic 15Kg Lavagem Eficiente SmartSense Função Vanish Preta - NA-F150B1B',
      'Máquina de lavar Ideal+ Panasonic 15Kg Lavagem Eficiente SmartSense Função Vanish Branca - NA-F150B1W',
      'Máquina de Lavar Frontal Electrolux 12kg Cinza Ônix Inverter com Água Quente e Lavagem Inteligente (LFC12)',
      'Máquina de Lavar Frontal Electrolux 12kg Branca Inverter com Água Quente e Lavagem Inteligente (LFB12)',
      'Máquina de Lavar Electrolux Premium Care 15Kg com Cesto Inox, Jet&Clean e Time Control',
      'Máquina de Lavar Electrolux 15kg Branca Essential Care com Cesto Inox e Jet&Clean (LED15)',
      'Máquina de Lavar 15kg Electrolux Premium Care com Cesto Inox. Jet&Clean e Time Control (LEC15)',
      'Máquina de Lavar 15kg /Electrolux Premium Care com Cesto Inox. Jet&Clean e Time Control (LEC15)',
      'Máquina de Lavar 15kg /tanquinho Semi-Automática Wanke Evolution Lavagem por Agitação Com 4 programas',
    ]) {
      expect(resolveProductCategory('Utilidades', title)).toBe('Eletrodomésticos');
    }
  });
});
