import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../src/data/mockProducts';
import { AUDITED_PRODUCT_CATEGORY_OVERRIDES, getAuditedProductCategoryOverride } from '../src/utils/catalogProductCategoryOverrides';

describe('correções auditadas de categoria por produto', () => {
  it('mantém 215 IDs únicos e usa apenas categorias oficiais', () => {
    const entries = Object.entries(AUDITED_PRODUCT_CATEGORY_OVERRIDES);
    expect(entries).toHaveLength(215);
    expect(new Set(entries.map(([id]) => id)).size).toBe(215);
    for (const [id, category] of entries) {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(CATEGORIES).toContain(category);
    }
  });

  it('preserva decisões anteriores e não generaliza para títulos parecidos', () => {
    expect(getAuditedProductCategoryOverride('282b3aaf-9b88-4cbb-bb68-c8a8fbfdb566')).toBe('BOLSAS & MOCHILAS');
    expect(getAuditedProductCategoryOverride('787e81a4-3687-4abe-b699-072ba6fe9722')).toBeUndefined();
    expect(getAuditedProductCategoryOverride('63a85548-2ba5-4e81-b57e-d81af5399c1e')).toBeUndefined();
    expect(getAuditedProductCategoryOverride('95113ca2-c2f1-45bb-b3c3-8292daacb142')).toBeUndefined();
    expect(getAuditedProductCategoryOverride('produto-novo-com-palavra-comum')).toBeUndefined();
  });
});
