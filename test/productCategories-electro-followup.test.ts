import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções adicionais de eletrodomésticos e acessórios', () => {
  it.each([
    'Processador de chip CPU de computador C4D, modelo 3d Snapdragon Qualcomm, liquidificador de chip rinoceronte, formato fb',
    'Liquidificador Computador CPU Chip SU Processador Maya/Rhino Rhino C4D/3Dmax Modelo FBX OBJ',
  ])('classifica modelos de chip/CPU para computador: %s', (title) => {
    expect(resolveProductCategory('Eletrodomésticos', title)).toBe('Computadores');
  });

  it.each([
    'Caixa Organizadora Compacta Armário Geladeira Frutas',
    'Caixa De Armazenamento Com Fechadura Transparente Grande Capacidade Empilhável Compacta Geladeira',
    'Kit 2x Caixa Organizadora Compacta Armario Geladeira Frutas',
  ])('classifica organizador de geladeira em Utilidades: %s', (title) => {
    expect(resolveProductCategory('Eletrodomésticos', title)).toBe('Utilidades');
  });

  it.each([
    'TOALHA GELADEIRA em PVC tamanho 35x53cm que imita Crochê e Renda para forração de geladeira',
    'Kit Toalha de Geladeira Rendada em PVC - Kit 01 - 02 ou 03 Toalha de Geladeira - 52cm x 35cm Branco - PANAMI',
  ])('classifica forros/toalhas de geladeira em Utilidades: %s', (title) => {
    expect(resolveProductCategory('Eletrodomésticos', title)).toBe('Utilidades');
  });

  it('classifica grades vendidas como acessórios para micro-ondas em ELETRO & ACESSÓRIOS', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Grans forno de microondas 23L L churrasqueira doméstica malha forno microondas grelha elétrica acessórios')).toBe('ELETRO & ACESSÓRIOS');
  });

  it.each([
    'Micro Chave Lavadora Brastemp Bwc10a Bwf08b Bwf09a Bwh09a',
    'Kit Mangueira para Lavadora Brastemp',
  ])('classifica componente de lavadora em ELETRO & ACESSÓRIOS: %s', (title) => {
    expect(resolveProductCategory('Eletrodomésticos', title)).toBe('ELETRO & ACESSÓRIOS');
  });

  it('preserva a categoria de eletrodomésticos completos e processadores culinários', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Forno Microondas 20L com função grill')).toBe('Eletrodomésticos');
    expect(resolveProductCategory('Eletrodomésticos', 'Liquidificador 500W com processador de alimentos')).toBe('Eletrodomésticos');
  });
});
