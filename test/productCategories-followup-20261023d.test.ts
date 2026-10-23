import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções adicionais de Utilidades reportadas em 2026-10-23', () => {
  it('move a escrivaninha para Móveis', () => {
    expect(resolveProductCategory(
      'Utilidades',
      'Escrivaninha De Estudos Home Office 1 Gaveta Bonatto Oficial',
    )).toBe('Móveis');
  });

  it('move máquinas de lavar e air fryer para Eletrodomésticos', () => {
    for (const title of [
      'Tanquinho 10kg Newmaq',
      'Máquina de lavar Ideal+ Panasonic 15Kg',
      'Máquina de lavar Ideal+ Panasonic 15Kg Lavagem Eficiente SmartSense Função Vanish Titânio - NA-F150B1T',
      'Máquina de Lavar Frontal Electrolux 12kg Branca',
      'Máquina de Lavar Electrolux Premium Care',
      'Máquina de Lavar Electrolux LEC15 15kg',
      'Máquina de Lavar Electrolux 15kg Branca Essentia',
      'Máquina de Lavar 15kg Electrolux Premium Care com Cesto Inox',
      'Forno de fritadeira de ar 8L utensílios de cozinha multiuso para casa',
    ]) {
      expect(resolveProductCategory('Utilidades', title)).toBe('Eletrodomésticos');
    }
  });

  it('move anúncios de ferramentas para Ferramentas', () => {
    for (const title of [
      '2026 novo estilo portátil chave ferramenta saco de armazenamento Amazon ferramenta saco ferramenta reparo do carro chave',
      'Kit Maleta de Ferramentas Caixa de Ferramenta Maleta Grande Reforçada',
      'Ferramenta Multiuso Chave 48 em 1, Aço Resistente Tigre Chave 48 em 1, Chave Soquete Universal, Ferramenta Multiuso',
    ]) {
      expect(resolveProductCategory('Utilidades', title)).toBe('Ferramentas');
    }
  });
});
