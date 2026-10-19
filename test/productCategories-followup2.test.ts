import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções adicionais da vitrine', () => {
  it('move o utensílio elétrico multifunções de suco para Eletrodomésticos', () => {
    expect(resolveProductCategory('ARMARINHOS & TRICÔ', 'R RAF Vara de cozinha com fio 5 em 1 Utensílios de cozinha elétricos Suco Moagem Carne Batendo Ovos Cozinha')).toBe('Eletrodomésticos');
  });

  it('classifica kit infantil Minha Nova Cozinha em Brinquedos', () => {
    expect(resolveProductCategory('Casa & Cozinha', 'Kit Minha Nova Cozinha(Geladeira e Fogão)')).toBe('Brinquedos');
  });

  it('move o kit infantil de salão de beleza para MODA INFANTIL FEMININA', () => {
    expect(resolveProductCategory('Moda Feminina', 'Kit Mechas Salão de beleza brinquedo menina criança camarim faz de conta Pinta cabelo')).toBe('MODA INFANTIL FEMININA');
  });

  it('move a camiseta masculina e a lixeira rosa para as categorias corretas', () => {
    expect(resolveProductCategory('Moda Feminina', 'Camiseta Feminina Masculina São Bento Camisa Religiosa Cristã 100% Algodão 30.1')).toBe('Moda Masculina');
    expect(resolveProductCategory('Moda Feminina', 'Lixeira C/ Pedal Jardim Encantado Rosa Menina 6,5 Litros Lixeira Quarto Bebê Lixeira Infantil')).toBe('Utilidades');
  });

  it.each([
    'Roupas de dança infantil roupas de prática para meninas de ginástica infantil vestido de balé infantil roupas de apresentação',
    'Roupas de dança infantil femininas verão veludo roupas de ginástica algodão roupas de corpo infantil roupas de prática',
    'Roupas de ginástica infantil roupas de dança roupas de desempenho de balé roupas de prática de meninas',
    'Kit Ballet Balé Infantil Uniforme - Collant Regata e Saia roupa de ballet para menina',
    'Calças de dança infantil meninas calças femininas de prática ballet',
  ])('classifica roupa feminina de dança/balé infantil em MODA INFANTIL FEMININA: %s', (title) => {
    expect(resolveProductCategory('Esportes & Lazer', title)).toBe('MODA INFANTIL FEMININA');
  });

  it.each([
    'Shorts Masculino Tactel Praia Academia Treino Corrida Verão Secagem Rápida',
    'Shorts Masculino Tactel Praia Academia Treino Corrida E CASUAL SECAGEM RAPIDA',
  ])('move shorts masculinos da categoria praia para Moda Masculina: %s', (title) => {
    expect(resolveProductCategory('MODA VERÃO PRAIA', title)).toBe('Moda Masculina');
  });

  it('move capa de chuva para motociclista a MOTOS & ACESSÓRIOS', () => {
    expect(resolveProductCategory('MODA VERÃO PRAIA', 'Capa De Chuva Moto Motoqueiro Impermeável Reforçada')).toBe('MOTOS & ACESSÓRIOS');
  });

  it('preserva conteúdo adulto de cozinha e acessórios de praia feminina', () => {
    expect(resolveProductCategory('Casa & Cozinha', 'Kit Cozinha Britânia Cafeteira + Liquidificador 1400W')).not.toBe('Brinquedos');
    expect(resolveProductCategory('MODA VERÃO PRAIA', 'Shorts Feminino Tactel Academia Moda Praia Verão')).toBe('MODA VERÃO PRAIA');
  });
});
