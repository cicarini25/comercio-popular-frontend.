import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções de AUTO & ACESSÓRIOS', () => {
  it.each([
    'Geladeira Portátil 4 Litros Bivolt Compacta para Viagem, Carro e Casa',
    'Geladeira Portátil Preta 15 Litros Freezer 12v/24v 110v/220v Mini Geladeira Caminhão Ônibus Van Carro Maxfreeze',
    'Geladeira Portátil Preta 45 Litros Freezer 12v/24v 110v/220v Mini Geladeira Caminhão Ônibus Carro Bluetooth Maxfreeze',
    'Geladeira Portátil Mini 9 Litros Compacta 127/220v E 12/24v Van Caminhão Motorhome',
    'Mini Geladeira Portátil Prime Aquece/Refrigera 4,0L USB Tipo C 5V Cor Preta Automotiva Compacta',
  ])('move geladeira portátil para Eletrodomésticos: %s', (title) => {
    expect(resolveProductCategory('AUTO & ACESSÓRIOS', title)).toBe('Eletrodomésticos');
  });

  it.each([
    'Kit reparo pneu remendo pneu sem câmara Reparo pneu moto carro Ferramenta conserto pneu Kit vulcanização pneu 8 Peças',
    'Kit 2 Reparador de Pneus SOS Pneus Spray Instantâneo 400ml Cada Enche Veda Pneus de Carro Moto',
    'KIT 3 REPARADOR DE PNEUS MOTO AE 200ML reparo de pneu remendo de pneu de moto sem camara',
    'REPARADOR DE PNEU MOTO REMENDO DE PNEU DE MOTO KIT 2UNI VACINA DE PNEU MOTO',
  ])('classifica remendo/reparo de pneu de moto em MOTOS & ACESSÓRIOS: %s', (title) => {
    expect(resolveProductCategory('AUTO & ACESSÓRIOS', title)).toBe('MOTOS & ACESSÓRIOS');
  });

  it.each([
    'Kit Jogo de chave Biela kit ferramentas 12 pecas 8 a 19mm Jogo chaves biela Chave boca',
    'Kit 12 peças Jogo de chave biela kit ferramentas 8 a 19mm chave boca Tramontina Pro',
    'Jogo chave Biela 3 pecas com furo kit ferramentas 8/10/12mm conjunto chave biela',
  ])('mantém jogo de chave biela na categoria Ferramentas: %s', (title) => {
    expect(resolveProductCategory('AUTO & ACESSÓRIOS', title)).toBe('Ferramentas');
  });

  it('não desloca uma biela de motor automotivo para Ferramentas', () => {
    expect(resolveProductCategory('AUTO & ACESSÓRIOS', 'Biela do motor Ford Focus 2.0')).toBe('AUTO & ACESSÓRIOS');
  });
});
