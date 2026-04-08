import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductService } from './productService';
import { CategoryService } from './categoryService';
import { mockProducts, mockCategories } from '@/data/mockData';

describe('API Services', () => {
  describe('ProductService', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_API_USE_MOCK', 'true');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
    });

    describe('getAll', () => {
      it('should return all products from mock data', async () => {
        const products = await ProductService.getAll();
        expect(products).toEqual(mockProducts);
      });

      it('should return products with valid Product shape', async () => {
        const products = await ProductService.getAll();
        products.forEach((p) => {
          expect(p).toHaveProperty('id');
          expect(p).toHaveProperty('name');
          expect(p).toHaveProperty('price');
        });
      });
    });

    describe('getById', () => {
      it('should return a product by ID', async () => {
        const product = await ProductService.getById(mockProducts[0].id);
        expect(product).toEqual(mockProducts[0]);
      });

      it('should return undefined for non-existent ID', async () => {
        const product = await ProductService.getById('non-existent');
        expect(product).toBeUndefined();
      });
    });

    describe('getBySlug', () => {
      it('should return a product by slug', async () => {
        const product = await ProductService.getBySlug(mockProducts[0].slug);
        expect(product).toEqual(mockProducts[0]);
      });

      it('should return undefined for non-existent slug', async () => {
        const product = await ProductService.getBySlug('non-existent');
        expect(product).toBeUndefined();
      });
    });

    describe('getByCategory', () => {
      it('should return products filtered by category ID', async () => {
        const catId = mockProducts[0].categoryId;
        const products = await ProductService.getByCategory(catId);
        expect(products.length).toBeGreaterThan(0);
        products.forEach((p) => expect(p.categoryId).toBe(catId));
      });

      it('should return empty array for unknown category', async () => {
        const products = await ProductService.getByCategory('unknown');
        expect(products).toEqual([]);
      });
    });

    describe('search', () => {
      it('should filter products by search query (case-insensitive)', async () => {
        const products = await ProductService.search('brake');
        expect(products.length).toBeGreaterThan(0);
        products.forEach((p) => {
          const nameMatch = p.name.toLowerCase().includes('brake');
          const descMatch = p.description.toLowerCase().includes('brake');
          expect(nameMatch || descMatch).toBe(true);
        });
      });

      it('should return empty array for no matches', async () => {
        const products = await ProductService.search('xyznonexistent');
        expect(products).toEqual([]);
      });
    });

    describe('filter', () => {
      it('should filter by price range', async () => {
        const products = await ProductService.filter({
          minPrice: 40,
          maxPrice: 60,
        });
        products.forEach((p) => {
          expect(p.price.amount).toBeGreaterThanOrEqual(40);
          expect(p.price.amount).toBeLessThanOrEqual(60);
        });
      });

      it('should filter by availability', async () => {
        const products = await ProductService.filter({
          availability: 'low_stock',
        });
        expect(products.length).toBeGreaterThan(0);
        products.forEach((p) => expect(p.availability).toBe('low_stock'));
      });

      it('should filter by category IDs', async () => {
        const catIds = [mockProducts[0].categoryId];
        const products = await ProductService.filter({ categoryIds: catIds });
        products.forEach((p) => expect(p.categoryId).toBe(catIds[0]));
      });

      it('should sort by price ascending', async () => {
        const products = await ProductService.filter({ sortBy: 'price_asc' });
        for (let i = 1; i < products.length; i++) {
          expect(products[i].price.amount).toBeGreaterThanOrEqual(
            products[i - 1].price.amount,
          );
        }
      });

      it('should sort by price descending', async () => {
        const products = await ProductService.filter({ sortBy: 'price_desc' });
        for (let i = 1; i < products.length; i++) {
          expect(products[i].price.amount).toBeLessThanOrEqual(
            products[i - 1].price.amount,
          );
        }
      });

      it('should sort by name ascending', async () => {
        const products = await ProductService.filter({ sortBy: 'name_asc' });
        for (let i = 1; i < products.length; i++) {
          expect(products[i].name.localeCompare(products[i - 1].name)).toBeGreaterThanOrEqual(0);
        }
      });

      it('should combine search with filters', async () => {
        const products = await ProductService.filter({
          searchQuery: 'bike',
          minPrice: 30,
          maxPrice: 100,
        });
        products.forEach((p) => {
          expect(p.price.amount).toBeGreaterThanOrEqual(30);
          expect(p.price.amount).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe('CategoryService', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_API_USE_MOCK', 'true');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
    });

    describe('getAll', () => {
      it('should return all categories from mock data', async () => {
        const categories = await CategoryService.getAll();
        expect(categories).toEqual(mockCategories);
      });
    });

    describe('getById', () => {
      it('should return a category by ID', async () => {
        const category = await CategoryService.getById(mockCategories[0].id);
        expect(category).toEqual(mockCategories[0]);
      });

      it('should return undefined for non-existent ID', async () => {
        const category = await CategoryService.getById('non-existent');
        expect(category).toBeUndefined();
      });
    });

    describe('getBySlug', () => {
      it('should return a category by slug', async () => {
        const category = await CategoryService.getBySlug('bike-parts');
        expect(category).toEqual(mockCategories[0]);
      });

      it('should return undefined for non-existent slug', async () => {
        const category = await CategoryService.getBySlug('non-existent');
        expect(category).toBeUndefined();
      });
    });

    describe('getRootCategories', () => {
      it('should return only root categories (no parentId)', async () => {
        const roots = await CategoryService.getRootCategories();
        expect(roots.length).toBeGreaterThan(0);
        roots.forEach((c) => expect(c.parentId).toBeUndefined());
      });
    });

    describe('getChildren', () => {
      it('should return child categories for a parent ID', async () => {
        const parentId = mockCategories[0].id;
        const children = await CategoryService.getChildren(parentId);
        expect(children.length).toBeGreaterThan(0);
        children.forEach((c) => expect(c.parentId).toBe(parentId));
      });

      it('should return empty array for category with no children', async () => {
        const children = await CategoryService.getChildren('non-existent-parent');
        expect(children).toEqual([]);
      });
    });
  });
});
