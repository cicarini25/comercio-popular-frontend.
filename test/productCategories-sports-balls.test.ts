import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('classificação de artigos desportivos costurados', () => {
  it.each([
    'Futebol n5 bola campeonato futebol copa do mundo futebol costurado à máquina',
    'Bola De Futebol São Paulo Campo Tamanho 5 Costurada PVC Resistente',
    'Bola do Santos Futebol Campo Oficial 5 Licenciada Costurada',
    'Padrão de Futebol Spalding No. 5 bolas de Material PVC futebol bola costurada',
    'Kit 40 Bolas De Futebol N°5 Couro Sintético Costurada Bola De Futebol',
    'kit 100 Bolas De Futebol N°2 Couro Sintético Costurada bola futebol',
    'Kit Chuteira Masculina Adulto Trava Futebol Campo Costurada + Mochila Meiao e Relogio',
  ])('classifica o artigo de futebol em Esportes & Lazer: %s', (title) => {
    expect(resolveProductCategory('ARMARINHOS & TRICÔ', title)).toBe('Esportes & Lazer');
  });

  it.each([
    'Bolas de lã para tricô e crochê, fio de lã para artesanato DIY',
    'Bola de lã nº 8, fio de renda, fio para crochê, algodão puro, kit de materiais para tricô manual DIY',
  ])('mantém bolas de lã e fio em ARMARINHOS & TRICÔ: %s', (title) => {
    expect(resolveProductCategory('ARMARINHOS & TRICÔ', title)).toBe('ARMARINHOS & TRICÔ');
  });
});
