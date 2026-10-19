import { describe, expect, it } from 'vitest';
import { resolveProductCategory } from '../src/utils/productCategories';

describe('Correções de lavadoras, fogões e acessórios de eletrodomésticos', () => {
  it('classifica o kit de lavanderia para boneca em Brinquedos', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Kit Lavanderia Boneca Casinha Luz Som Máquina De Lavar')).toBe('Brinquedos');
  });

  it.each([
    'Tirante Lavadora Brastemp 7kg A 11kg 4 Peças',
    'Kit Molas de Tirantes Lavadora Brastemp',
    'Kit Vara de Suspensão de Lavadora Brastemp',
    'Kit Potência de Lavadora Brastemp',
    'Membrana Painel de Lavadora Brastemp',
    'Pressostato Lavadora Roupas Consul Facilite Cwe11 Cwe10',
    'Banda/cinta Freio Lavadora Brastemp Consul Original',
    'Junta de Drenagem de Lavadora Consul',
    'Kit Mangueiras de Lavadora de Roupas',
    'Agitador Lavadora Brastemp',
    'Pés para Lavadora Electrolux',
    'Atuador Lavadora Consul',
    'Protetor de Polia Lavadora Brastemp',
    'Motor Tanquinho Suggar 10kg 13kg 12 Kg 15kg 20kg 220v/127V',
    'Polia Tanquinho Agitador Colormaq Lcm 9/10/13/ 15kg Compatível',
    'Retentor de Lavadora Brastemp',
    'Porca para Lavadora Consul',
    'Grade de Forno Fogão Atlas',
    'Tampinhas de Fogão Atlas',
    'Pé Fogão Consul Facilite Canela Erva Doce Kit Fogão 4 Bocas Branco',
  ])('classifica componente/acessório em ELETRO & ACESSÓRIOS: %s', (title) => {
    expect(resolveProductCategory('Eletrodomésticos', title)).toBe('ELETRO & ACESSÓRIOS');
  });

  it('mantém eletrodomésticos completos em Eletrodomésticos', () => {
    expect(resolveProductCategory('Eletrodomésticos', 'Lavadora Brastemp 11kg Automática 127V')).toBe('Eletrodomésticos');
    expect(resolveProductCategory('Eletrodomésticos', 'Fogão Consul 4 bocas com forno')).toBe('Eletrodomésticos');
  });

  it('mantém ferramenta usada para retirar o agitador em Ferramentas', () => {
    expect(resolveProductCategory('Ferramentas', 'Chave T 10mm P/ Retirar Agitador Lavadoras Electrolux')).toBe('Ferramentas');
  });

  it('não move porcas genéricas de ferramentas para eletrodomésticos', () => {
    expect(resolveProductCategory('Ferramentas', 'Porcas sextavadas de aço para uso geral')).toBe('Ferramentas');
  });
});
