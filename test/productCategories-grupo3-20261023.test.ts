import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Grupo 3 confirmado: ELETRO & ACESSÓRIOS', () => {
  it('move fogão completo de ELETRO & ACESSÓRIOS para Eletrodomésticos', () => {
    for (const title of ['Fogão Industrial 4 Bocas com Forno', 'Fogão 4 Bocas Mesa de Inox', 'Cooktop 4 Bocas a Gás']) {
      expect(resolveProductCategory('ELETRO & ACESSÓRIOS', title)).toBe('Eletrodomésticos');
    }
  });
  it('move máquina de lavar completa e microondas para Eletrodomésticos', () => {
    expect(resolveProductCategory('ELETRO & ACESSÓRIOS', 'Máquina de Lavar Electrolux 15kg Branca')).toBe('Eletrodomésticos');
    expect(resolveProductCategory('ELETRO & ACESSÓRIOS', 'Microondas 20 Litros com Painel Digital')).toBe('Eletrodomésticos');
  });
  it('move o display industrial específico para TVs', () => {
    expect(resolveProductCategory('ELETRO & ACESSÓRIOS', '52cm HD HDMI Display Monitor de plástico 1920 * 1080 Capacitor Touch Tela secundária de computador Industrial')).toBe('TVs');
  });
  it('não move peça de fogão para Eletrodomésticos', () => {
    expect(resolveProductCategory('ELETRO & ACESSÓRIOS', 'Eletrodo Centelhador Vela Fogão Cooktop Fischer 1 Peça')).toBe('ELETRO & ACESSÓRIOS');
  });
});
