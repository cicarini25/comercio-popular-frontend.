import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções de Games, áudio e dispositivos erroneamente em Fones & Headphones', () => {
  it('classifica controle para console em Games mesmo quando menciona computador', () => {
    expect(resolveProductCategory('Notebook', 'Controle Sem Fio Recarregável para Xbox 360 e Computador com Joystick Manete')).toBe('Games');
    expect(resolveProductCategory('Notebook', 'Controle Sem Fio Bluetooth Joystick Gamer para PC e PlayStation 4')).toBe('Games');
    expect(resolveProductCategory('Notebook', 'Notebook Lenovo ThinkPad T14 Core i5 16GB RAM SSD 256GB')).toBe('Notebook');
  });

  it('reclassifica os dois anúncios de vestuário específicos apontados pelo utilizador', () => {
    expect(resolveProductCategory('Moda Masculina', 'Camisa Camiseta Fé Masculino Feminino Casual 100% Algodão')).toBe('Moda Feminina');
    expect(resolveProductCategory('Moda Masculina', 'KIT 4 Peça Conjunto Manga Longa Calça + Manga Curta Shorts Verão e Inverno Pijama Masculino Feminina Afd')).toBe('MODA INFANTIL MASCULINA');
  });

  it('mantém insumos de costura e crochê em ARMARINHOS & TRICÔ apesar de palavras femininas', () => {
    expect(resolveProductCategory('Moda Feminina', 'Leite Algodão Macio Bebê Tricô Lã Fio Grosso Fibra Veludo Fio Mão Tricô Lã Crochê Fio para DIY Camisola')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('Moda Feminina', 'pinkyou.br Máquina de Costura Cerzido Calcador Bordado de Ferro Multifuncional 86625')).toBe('ARMARINHOS & TRICÔ');
    expect(resolveProductCategory('Moda Feminina', 'Acessórios multifuncionais para máquina de costura, calcador com zíper dupla face 7306')).toBe('ARMARINHOS & TRICÔ');
  });

  it('classifica controles remotos de TV em ELETRÔNICOS sem deslocar televisores completos', () => {
    expect(resolveProductCategory('TVs', 'TV Voz Universal Controle Remoto Ponteiro Mágico Aparelho Para LG MR24GA MR24GN QNED OLED Smart')).toBe('ELETRÔNICOS');
    expect(resolveProductCategory('TVs', 'Sony Bravia Smart TV Android OLED Voz Bluetooth Controle Remoto RMF-TX800P Compatível')).toBe('ELETRÔNICOS');
    expect(resolveProductCategory('Fones & Headphones', 'Smart TV Samsung 50 polegadas 4K UHD')).toBe('TVs');
  });

  it('classifica o conjunto de cozinha de brinquedo em Brinquedos, não em Móveis', () => {
    expect(resolveProductCategory('Brinquedos', 'Conjunto Cozinha Fogão Geladeira Pia Micro-ondas e Armário - Rosa')).toBe('Brinquedos');
  });

  it.each([
    'Amplificador Dual-channel Placa Amplificador De Potência De Áudio 5w 10w 15w 20w',
    'Hifi grau duplo canal caixa de áudio amplificador potência placa-mãe 2.0 canal módulo amplificador áudio TDA',
    'DIYMORE 300W Amplificador De Potência Mono Placa Amplificadora De Áudio',
    'Amplificador De Áudio Digital Bluetooth AK35 2.0 Canais Amplificador De Potência De Alto-falante De 800 W',
    'ZK-502MT 2x50w Placa Amplificadora de Subwoofer e Módulo de Áudio',
    'Módulo de Áudio Bluetooth Amplificador de Potência Digital',
    'Pré-amplificador de áudio valvulado HiFi',
  ])('classifica placa, módulo ou amplificador de potência em ELETRÔNICOS: %s', (title) => {
    expect(resolveProductCategory('Aparelhos de Som', title)).toBe('ELETRÔNICOS');
  });

  it('mantém amplificador Hi-Fi completo em Aparelhos de Som', () => {
    expect(resolveProductCategory('Fones & Headphones', 'Amplificador Bluetooth HIFI estéreo doméstico com entrada USB e Bluetooth')).toBe('Aparelhos de Som');
  });

  it.each([
    ['Fones & Headphones', 'Smartwatch Bluetooth com monitoramento de saúde', 'RELÓGIOS'],
    ['Fones & Headphones', 'Relógio Inteligente Smart Watch AMOLED com Bluetooth', 'RELÓGIOS'],
    ['Fones & Headphones', 'Smart TV Samsung 50 polegadas 4K UHD', 'TVs'],
    ['Fones & Headphones', 'Televisão LG LED 43 polegadas Smart TV', 'TVs'],
    ['Fones & Headphones', 'Smartphone Samsung Galaxy A55 5G 256GB', 'Smartphones'],
    ['Fones & Headphones', 'iPhone 15 128GB Apple', 'Smartphones'],
  ])('move o dispositivo principal para sua categoria: %s — %s', (category, title, expected) => {
    expect(resolveProductCategory(category, title)).toBe(expected);
  });

  it('mantém fone cuja compatibilidade menciona celular na categoria de áudio', () => {
    expect(resolveProductCategory('Fones & Headphones', 'Fone Bluetooth sem fio para smartphone Samsung')).toBe('Fones & Headphones');
  });
});
