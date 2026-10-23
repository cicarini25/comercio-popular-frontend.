import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Conflito Eletrodomésticos x ELETRO & ACESSÓRIOS', () => {
  it.each([
    'Agitador Batedor Tanquinho Colormaq 12/13/15kg Completo',
    'Tirante Lavadora Brastemp 7kg A 11kg 4 Peças',
    'Pressostato Lavadora Roupas Consul Facilite Cwe11 Cwe10',
    'Capacitor Maquina de Lavar 45uf 127v Para Lavadora Roupas Electrolux',
    'Banda Cinta do Freio Lavadora Maquina de Lavar Brastemp Consul',
    'Eletrobomba Bomba Drenagem 127v Lavadora Electrolux Lt12b',
    'Micro Chave Lavadora Brastemp Bwc10a Bwf08b Bwf09a Bwh09a',
    'Kit 4 Molas Tirante Vara De Suspensão maquina de lavar Lavadora Electrolux 6 A 15kg',
    'Kit Mica Micro-ondas 14x14cm + Ponta Ponteira Bico Magnetron Microondas Triangular',
    'MOTOR PRATO P/ MICROONDAS 127V 4/4RPM Electrolux',
    'Membrana Teclado Microondas LG Ms3042r Ms3042b',
    'Polia Agitador Tanquinho Colormaq Lcm 9 / 10 / 13 / 15kg',
    'Forno de microondas pé almofada forno microondas alta Base fogão indução pé almofada',
  ])('envia o componente confirmado para ELETRO & ACESSÓRIOS: %s', (title) => {
    expect(resolveProductCategory('Eletrodomésticos', title)).toBe('ELETRO & ACESSÓRIOS');
  });

  it.each([
    'Tanquinho Britânia 15kg Semi Automático BLT15A 510W Silencioso Dispenser Duplo 110/220V',
    'Máquina de lavar 12Kg Philco 16 Modos de operação PLR12A',
    'Micro-Ondas Mondial 21 Litros MO-01-21-B Preto 1200W Display Digital',
    'Fogão a Gás 4 Bocas Inox Embutir e Mesa Cozinha e Restaurante 4 Queimadores',
    'Fogão Itatiaia Star New 4 Bocas Com Acendimento Automático Branco/Preto - Cozinha Fogões',
  ])('mantém aparelho completo confirmado em Eletrodomésticos: %s', (title) => {
    expect(resolveProductCategory('ELETRO & ACESSÓRIOS', title)).toBe('Eletrodomésticos');
  });

  it('preserva a categoria recebida quando o título é ambíguo e não está confirmado', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Fogão 4 bocas anunciado sem outros detalhes')).toBe('Eletrodomésticos');
    expect(resolveProductCategory('ELETRO & ACESSÓRIOS', 'Micro-ondas mencionado em título sem dados do produto')).toBe('ELETRO & ACESSÓRIOS');
  });

  it('não altera outras categorias por causa destas regras', () => {
    expect(resolveProductCategory('Utilidades', 'Organizador de cozinha para gaveta')).toBe('Utilidades');
  });
});
