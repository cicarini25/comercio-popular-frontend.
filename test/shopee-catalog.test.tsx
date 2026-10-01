import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { fetchShopeeCatalog, mapCatalogProduct } from '../src/services/catalog';
import { ProductCard } from '../src/components/products/ProductCard';
import { getProductPriceComparison } from '../src/utils/priceComparison';

const row = { id: '640bf474-859a-441a-b2ad-ad643b5920e3', title: 'Armário de cozinha',
  description: 'Descrição real', category: 'Home & Living', image_url: 'https://cf.shopee.com.br/file/test',
  offers: [{ id: '0cca6aef-625c-4af4-a552-4ad9f0c988b7', platform: { code: 'shopee' }, offerType: 'afiliada',
    price: '569.90', originalPrice: '579.90', currency: 'BRL', stockUnits: null }] };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('Catálogo real da Shopee', () => {
  it('usa o UUID da oferta e preserva estoque desconhecido, sem inventar avaliações ou preços', () => {
    const product = mapCatalogProduct(row)!;
    expect(product.price).toBe(569.9);
    expect(product.stockUnits).toBeNull();
    expect(product.affiliateUrl).toMatch(/\/api\/catalog\/offers\/0cca6aef-625c-4af4-a552-4ad9f0c988b7\/go$/);
    expect(product.isVerified).toBe(false);
    expect(getProductPriceComparison(product).competitors).toEqual([]);
    expect(mapCatalogProduct({ ...row, offers: [] })).toBeNull();
    expect(mapCatalogProduct({ ...row, offers: [{ ...row.offers[0], price: null }] })).toBeNull();
  });
  it('exibe compra para estoque desconhecido e não apresenta comparação simulada', () => {
    const product = mapCatalogProduct(row)!;
    const click = vi.fn();
    render(<ProductCard product={product} onAddToCart={vi.fn()} onViewDetails={vi.fn()} onDirectAffiliateClick={click} />);
    fireEvent.click(screen.getByRole('button', { name: 'Comprar na Shopee' }));
    expect(click).toHaveBeenCalledWith(product);
    expect(screen.queryByText('Esgotado')).toBeNull();
    expect(screen.queryByText(/Restam/)).toBeNull();
    expect(document.querySelector('[id^="price-comparator-"]')).toBeNull();
    expect(screen.queryByText('Verificado')).toBeNull();
  });
  it('consulta catálogo público paginado sem token administrativo', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ products: [row] }) });
    vi.stubGlobal('fetch', fetchMock);
    const result = await fetchShopeeCatalog(100);
    expect(result.products).toHaveLength(1);
    expect(result.hasMore).toBe(false);
    expect(fetchMock.mock.calls[0][0]).toContain('platform=shopee&limit=100&offset=100');
    expect(fetchMock.mock.calls[0][1].headers).toBeUndefined();
  });
  it('reporta falha da API sem substituir por produtos fictícios', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchShopeeCatalog()).rejects.toThrow('Não foi possível carregar');
  });
});

import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
it('carrega produto acima de R$ 300 na vitrine e ignora catálogo antigo do navegador', async () => {
  localStorage.setItem('cp_products', JSON.stringify([{ id: 'demo-old', title: 'Demonstração antiga' }]));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ products: [row] }) }));
  render(<MemoryRouter><AuthProvider><App /></AuthProvider></MemoryRouter>);
  await waitFor(() => expect(document.getElementById(`product-card-${row.id}`)).not.toBeNull());
  expect(screen.queryByText('Demonstração antiga')).toBeNull();
  expect(document.getElementById(`btn-affiliate-card-${row.id}`)).not.toBeNull();
});
