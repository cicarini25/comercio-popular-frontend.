import { describe, it, expect } from 'vitest';
import { Blob, File } from 'node:buffer';
import { csvRows, prepareFeed, validAffiliate } from '../src/services/shopeeImport';

describe('Shopee import files', () => {
  it('reads BOM, quoted commas, quotes and multiline fields', async () => {
    const rows = [];
    for await (const row of csvRows(new Blob(['\uFEFFid,title\r\n1,"a,b\n""c"""\r\n']) as unknown as globalThis.Blob)) rows.push(row);
    expect(rows).toEqual([['id', 'title'], ['1', 'a,b\n"c"']]);
  });
  const feed = () => new File(['itemid,title,price,product_link,image_link\n123,Produto,12.50,https://shopee.com.br/product/1/123,https://example.com/photo.jpg'], 'feed.csv') as unknown as globalThis.File;
  it('joins by ID, never row order', async () => {
    const links = new File(['Item Id,Offer Link\n123,https://s.shopee.com.br/abc'], 'links.csv') as unknown as globalThis.File;
    const result = await prepareFeed(feed(), links, '');
    expect(result).toHaveLength(1);
    expect(result[0].affiliateUrl).toBe('https://s.shopee.com.br/abc');
  });
  it('blocks missing products and conflicting affiliate links', async () => {
    await expect(prepareFeed(feed(), null, '456 https://s.shopee.com.br/abc')).rejects.toThrow('ausentes');
    await expect(prepareFeed(feed(), null, '123 https://s.shopee.com.br/abc\n123 https://s.shopee.com.br/def')).rejects.toThrow('Dois links');
  });
  it('rejects lookalike domains', () => {
    expect(validAffiliate('https://s.shopee.com.br.evil.com/abc')).toBe(false);
    expect(validAffiliate('https://s.shopee.com.br/abc')).toBe(true);
  });
});
