import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Grupo 1 confirmado: Utilidades', () => {
  it('move apenas os títulos confirmados de máquinas de lavar e air fryer para Eletrodomésticos', () => {
    for (const title of [
      'Tanquinho 10kg Newmaq',
      'Máquina de lavar Ideal+ Panasonic 15Kg',
      'Máquina de lavar Ideal+ Panasonic 15Kg Lavagem Eficiente SmartSense Função Vanish Titânio - NA-F150B1T',
      'Máquina de Lavar Frontal Electrolux 12kg',
      'Máquina de Lavar Frontal Electrolux 12kg Branca',
      'Máquina de Lavar Electrolux Premium Care',
      'Máquina de Lavar Electrolux LEC15 15kg',
      'Máquina de Lavar Electrolux 15kg Branca',
      'Máquina de Lavar Electrolux 15kg Branca Essentia',
      'Máquina de Lavar 15kg Electrolux Premium Care com Cesto Inox',
      'Forno de fritadeira de ar 8L utensílios de cozinha multiuso para casa utensílios de cozinha assar automaticamente',
    ]) {
      expect(resolveProductCategory('Utilidades', title)).toBe('Eletrodomésticos');
    }
  });

  it('move a escrivaninha confirmada para Móveis', () => {
    expect(resolveProductCategory('Utilidades', 'Escrivaninha De Estudos Home Office 1 Gaveta Bonatto Oficial')).toBe('Móveis');
  });
});
