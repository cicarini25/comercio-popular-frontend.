import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Reclassificação para as novas abas do Comércio Popular', () => {
  it('move luminárias LED e abajures de Utilidades para LUMINÁRIAS', () => {
    expect(resolveProductCategory('Utilidades', 'Luminária LED Abajur de mesa com toque')).toBe('LUMINÁRIAS');
    expect(resolveProductCategory('Utilidades', 'Abajur LED para quarto com luz noturna')).toBe('LUMINÁRIAS');
  });

  it('move papel de parede PS4 PlayGaming de Casa & Cozinha para Utilidades', () => {
    expect(resolveProductCategory('Casa & Cozinha', 'Papel de Parede PS4 PlayGaming para quarto gamer')).toBe('Utilidades');
    expect(resolveProductCategory('Casa & Cozinha', 'Wallpaper PlayStation 4 Gaming decorativo')).toBe('Utilidades');
  });

  it('move kits de barras LED para TVs para ELETRÔNICOS sem mover o televisor completo', () => {
    expect(resolveProductCategory('TVs', 'Kit Barras de LED para TVs 32 a 55 polegadas')).toBe('ELETRÔNICOS');
    expect(resolveProductCategory('TVs', 'LED strips for television backlight repair kit')).toBe('ELETRÔNICOS');
    expect(resolveProductCategory('TVs', 'Smart TV 50 polegadas 4K UHD')).toBe('TVs');
  });

  it('mantém porta-chaves, cortadores de biscoito de Páscoa e arejador de torneira em Utilidades', () => {
    expect(resolveProductCategory('Casa & Cozinha', 'Porta-Chaves de parede para organização')).toBe('Utilidades');
    expect(resolveProductCategory('Casa & Cozinha', 'Cortadores de biscoito da Páscoa em formatos variados')).toBe('Utilidades');
    expect(resolveProductCategory('Casa & Cozinha', '1/2/5 Pcs Chuveirinho Bico Arejador para Torneira 360° Filtro De Água Torneira Ejador para Torneira Lavatorio Cozinha')).toBe('Utilidades');
  });

  it('move torneiras, bacias e acessórios de lavatório para ELÉTRICA & HIDRÁULICA', () => {
    expect(resolveProductCategory('Utilidades', 'Torneira de pia gourmet com bica alta')).toBe('ELÉTRICA & HIDRÁULICA');
    expect(resolveProductCategory('Casa & Cozinha', '22 Torneiras de Pia Gourmet em Aço Inoxidável')).toBe('ELÉTRICA & HIDRÁULICA');
    expect(resolveProductCategory('Utilidades', 'Torneria de pia gourmet misturador para cozinha')).toBe('ELÉTRICA & HIDRÁULICA');
    expect(resolveProductCategory('Utilidades', 'Bacia para lavatório de banheiro com torneira')).toBe('ELÉTRICA & HIDRÁULICA');
    expect(resolveProductCategory('Casa & Cozinha', 'Bacia inteligente cozinha sensor de alta curva torneira locais públicos sensor infravermelho automático bacia mão')).toBe('ELÉTRICA & HIDRÁULICA');
    expect(resolveProductCategory('Utilidades', 'TSTS sensor torneira automático inteligente saída de água quente e fria')).toBe('ELÉTRICA & HIDRÁULICA');
    expect(resolveProductCategory('Utilidades', 'HEMOTON Torneira Retrô em Liga de Zinco, Torneira de Pia em Latão')).toBe('ELÉTRICA & HIDRÁULICA');
  });

  it('move módulos sensores infravermelhos/de radar para ELÉTRICA & HIDRÁULICA, não para LUMINÁRIAS', () => {
    expect(resolveProductCategory('Utilidades', 'Pinjian LED módulo sensor de corpo humano infravermelho controle de luz sonora sensor de Radar inteligente')).toBe('ELÉTRICA & HIDRÁULICA');
  });

  it('move mochilas e malas de notebook para BOLSAS & MOCHILAS sem mover o computador completo', () => {
    expect(resolveProductCategory('Utilidades', 'Mochila escolar impermeável com vários compartimentos')).toBe('BOLSAS & MOCHILAS');
    expect(resolveProductCategory('Utilidades', 'Backpack casual resistente para viagem')).toBe('BOLSAS & MOCHILAS');
    expect(resolveProductCategory('Notebook', 'Maleta para Notebook acolchoada 15,6 polegadas')).toBe('BOLSAS & MOCHILAS');
    expect(resolveProductCategory('Notebook', 'Porta Notebook acolchoado para transporte')).toBe('BOLSAS & MOCHILAS');
    expect(resolveProductCategory('Notebook', 'Notebook portátil Intel Core i5 16GB')).toBe('Notebook');
    expect(resolveProductCategory('Utilidades', 'Caixa organizadora multiuso para cozinha')).toBe('Utilidades');
  });
});
