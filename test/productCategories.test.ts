import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Categorias de produtos importados do feed Shopee', () => {
  it.each([
    ['Jogo de 4 a 6 Taças de Vidro Diamond Cores Transparente Ambar Furta Cor Verde Azul Fume Bico De Jaca 330ml', 'Instruções de conservação e decoração da mesa.'],
    ['Kit Conjunto Jogo De Faqueiro Búzios 24 Peças Aço Inox Tramontina', 'Conservação: lavar e secar após o uso.'],
    ['Potes de Vidro P/ Mantimentos C/ Tampa Bambu Oikos - 5 Pçs', 'Kit de potes de vidro hermético redondo para mantimentos.'],
    ['Jogo de Pratos Jantar Rústico Marrom Tramontina Porcelana Conjunto de Pratos Raso, Prato Fundo e Sobremesa Opções de Kit', 'Você pode repetir o processo para combinar diferentes kits.'],
    ['Escorredor De Louça Cozinha Prato Duplo Porta Talheres Metaltru', 'Organização da cozinha.'],
  ])('classifica o utensílio em Casa & Cozinha: %s', (title, description) => {
    expect(resolveProductCategory('Home & Living', title, description)).toBe('Casa & Cozinha');
  });

  it('não transforma palavras terminadas em -ção ou contendo pet em animais', () => {
    expect(resolveProductCategory('Home & Living', 'Artigo para decoração', 'Conservação: repetir a limpeza.')).not.toBe('Pets');
  });

  it.each(['Ração para cães', 'Bebedouro para gatos 3L', 'Pote para ração de cachorro', 'Coleira pet'])('preserva a categoria de animais: %s', (title) => {
    expect(resolveProductCategory('Pets', title)).toBe('Pets');
  });
});

