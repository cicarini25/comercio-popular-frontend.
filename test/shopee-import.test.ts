import { describe, it, expect, vi } from 'vitest';
import { Blob, File } from 'node:buffer';
import { csvRows, prepareFeed, toBulkPayload, validAffiliate } from '../src/services/shopeeImport';

describe('Shopee import files', () => {
  it('reads BOM, quoted commas, quotes and multiline fields', async () => {
    const rows = [];
    for await (const row of csvRows(new Blob(['\uFEFFid,title\r\n1,"a,b\n""c"""\r\n']) as unknown as globalThis.Blob)) rows.push(row);
    expect(rows).toEqual([['id', 'title'], ['1', 'a,b\n"c"']]);
  });

  const feed = () => new File([
    'itemid,title,price,product_link,image_link,description,global_category1,shop_name\n' +
    '123,Produto,12.50,https://shopee.com.br/product/1/123,https://example.com/photo.jpg,Desc,Brinquedos,Loja\n'
  ], 'feed.csv') as unknown as globalThis.File;

  it('joins the Shopee bulk link CSV by Item Id, never by row order', async () => {
    const links = new File([
      'Item Id,Item Name,Price,Sales,Nome da loja,Commission Rate,Commission,Product Link,Offer Link\n' +
      '123,Produto,12.50,10,Loja,10%,R$1.25,https://shopee.com.br/product/1/123,https://s.shopee.com.br/abc\n'
    ], 'BatchProductLinks.csv') as unknown as globalThis.File;

    const result = await prepareFeed(feed(), links, '');
    expect(result).toHaveLength(1);
    expect(result[0].affiliateUrl).toBe('https://s.shopee.com.br/abc');
  });

  it('blocks missing products and conflicting affiliate links', async () => {
    await expect(prepareFeed(feed(), null, '456 https://s.shopee.com.br/abc')).rejects.toThrow('ausentes');
    await expect(prepareFeed(
      feed(),
      null,
      '123 https://s.shopee.com.br/abc\n123 https://s.shopee.com.br/def'
    )).rejects.toThrow('Dois links');
  });

  it('accepts more than 100 products for the bulk workflow', async () => {
    const rows = Array.from({ length: 101 }, (_, i) =>
      (i + 1) + ',Produto ' + (i + 1) + ',12.50,https://shopee.com.br/product/1/' + (i + 1) +
      ',https://example.com/' + (i + 1) + '.jpg\n'
    ).join('');
    const linkRows = Array.from({ length: 101 }, (_, i) =>
      (i + 1) + ',Produto,12.50,0,Loja,10%,1,https://shopee.com.br/product/1/' + (i + 1) +
      ',https://s.shopee.com.br/a' + (i + 1) + '\n'
    ).join('');

    const result = await prepareFeed(
      new File(['itemid,title,price,product_link,image_link\n' + rows], 'feed.csv') as unknown as globalThis.File,
      new File(['Item Id,Item Name,Price,Sales,Nome da loja,Commission Rate,Commission,Product Link,Offer Link\n' + linkRows], 'links.csv') as unknown as globalThis.File,
      ''
    );
    expect(result).toHaveLength(101);
    expect(result[100].itemid).toBe('101');
  });

  it('limits the payload to fields needed by the backend', () => {
    const result = toBulkPayload([{
      itemid: '123',
      title: 'Produto',
      price: '12.50',
      sale_price: '10',
      description: 'a'.repeat(6000),
      global_category1: 'Cat',
      shop_name: 'Loja',
      image_link: 'https://example.com/a.jpg',
      product_link: 'https://shopee.com.br/product/1/123',
      affiliateUrl: 'https://s.shopee.com.br/abc',
      ignored_column: 'nao deve ir'
    }]);
    expect(result[0].ignored_column).toBeUndefined();
    expect(result[0].description).toHaveLength(5000);
    expect(result[0].affiliateUrl).toBe('https://s.shopee.com.br/abc');
  });

  it('rejects lookalike domains', () => {
    expect(validAffiliate('https://s.shopee.com.br.evil.com/abc')).toBe(false);
    expect(validAffiliate('https://s.shopee.com.br/abc')).toBe(true);
  });
});
