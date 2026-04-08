import { mockCategories, mockProducts, getCategories, getProducts, getProductBySlug, getProductsByCategory, getProductById } from './mockData';

describe('Mock data', () => {
  describe('mockCategories', () => {
    it('should have categories array', () => {
      expect(Array.isArray(mockCategories)).toBe(true);
      expect(mockCategories.length).toBeGreaterThan(0);
    });

    it('should have bike parts categories', () => {
      const bikeParts = mockCategories.find((c) => c.slug === 'bike-parts');
      expect(bikeParts).toBeDefined();
      expect(bikeParts?.name).toBe('Bike Parts');
    });

    it('should have parking solutions categories', () => {
      const parking = mockCategories.find((c) => c.slug === 'parking-solutions');
      expect(parking).toBeDefined();
      expect(parking?.name).toBe('Parking Solutions');
    });

    it('should have sub-categories under bike-parts', () => {
      const subCats = mockCategories.filter(
        (c) => c.parentId === mockCategories.find((x) => x.slug === 'bike-parts')?.id,
      );
      expect(subCats.length).toBeGreaterThan(0);
    });

    it('should have sub-categories under parking-solutions', () => {
      const subCats = mockCategories.filter(
        (c) => c.parentId === mockCategories.find((x) => x.slug === 'parking-solutions')?.id,
      );
      expect(subCats.length).toBeGreaterThan(0);
    });

    it('should have valid Category shape for all entries', () => {
      mockCategories.forEach((cat) => {
        expect(cat).toHaveProperty('id');
        expect(cat).toHaveProperty('name');
        expect(cat).toHaveProperty('slug');
        expect(typeof cat.id).toBe('string');
        expect(typeof cat.name).toBe('string');
        expect(typeof cat.slug).toBe('string');
      });
    });
  });

  describe('mockProducts', () => {
    it('should have products array', () => {
      expect(Array.isArray(mockProducts)).toBe(true);
      expect(mockProducts.length).toBeGreaterThan(0);
    });

    it('should have bike part products (in sub-categories of bike-parts)', () => {
      const bikePartsCat = mockCategories.find((c) => c.slug === 'bike-parts');
      const subCatIds = mockCategories
        .filter((c) => c.parentId === bikePartsCat?.id)
        .map((c) => c.id);
      const bikeProducts = mockProducts.filter((p) =>
        subCatIds.includes(p.categoryId),
      );
      expect(bikeProducts.length).toBeGreaterThan(0);
    });

    it('should have parking solution products (in sub-categories of parking-solutions)', () => {
      const parkingCat = mockCategories.find(
        (c) => c.slug === 'parking-solutions',
      );
      const subCatIds = mockCategories
        .filter((c) => c.parentId === parkingCat?.id)
        .map((c) => c.id);
      const parkingProducts = mockProducts.filter((p) =>
        subCatIds.includes(p.categoryId),
      );
      expect(parkingProducts.length).toBeGreaterThan(0);
    });

    it('should have valid Product shape for all entries', () => {
      mockProducts.forEach((product) => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('slug');
        expect(product).toHaveProperty('categoryId');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('images');
        expect(product).toHaveProperty('availability');
        expect(product).toHaveProperty('createdAt');
        expect(product).toHaveProperty('updatedAt');
        expect(product.price).toHaveProperty('amount');
        expect(product.price).toHaveProperty('currency');
        expect(Array.isArray(product.images)).toBe(true);
      });
    });

    it('should include products with B2B pricing', () => {
      const b2bProducts = mockProducts.filter(
        (p) => p.price.b2bAmount !== undefined,
      );
      expect(b2bProducts.length).toBeGreaterThan(0);
    });

    it('should include products with sale pricing', () => {
      const saleProducts = mockProducts.filter(
        (p) => p.price.saleAmount !== undefined,
      );
      expect(saleProducts.length).toBeGreaterThan(0);
    });

    it('should include products with specs', () => {
      const withSpecs = mockProducts.filter((p) => p.specs && p.specs.length > 0);
      expect(withSpecs.length).toBeGreaterThan(0);
    });

    it('should include products with tags', () => {
      const withTags = mockProducts.filter((p) => p.tags && p.tags.length > 0);
      expect(withTags.length).toBeGreaterThan(0);
    });

    it('should cover multiple bike part sub-categories (brakes, gears, chains, tires, wheels)', () => {
      const bikePartCats = mockCategories.filter(
        (c) => c.parentId === mockCategories.find((x) => x.slug === 'bike-parts')?.id,
      );
      const coveredCategoryIds = new Set(mockProducts.map((p) => p.categoryId));
      const coveredSubCats = bikePartCats.filter((c) =>
        coveredCategoryIds.has(c.id),
      );
      expect(coveredSubCats.length).toBeGreaterThanOrEqual(3);
    });

    it('should cover multiple parking sub-categories (stands, shelters, locks)', () => {
      const parkingCats = mockCategories.filter(
        (c) => c.parentId === mockCategories.find((x) => x.slug === 'parking-solutions')?.id,
      );
      const coveredCategoryIds = new Set(mockProducts.map((p) => p.categoryId));
      const coveredSubCats = parkingCats.filter((c) =>
        coveredCategoryIds.has(c.id),
      );
      expect(coveredSubCats.length).toBeGreaterThanOrEqual(3);
    });

    it('should have varied availability statuses', () => {
      const statuses = new Set(mockProducts.map((p) => p.availability));
      expect(statuses.size).toBeGreaterThanOrEqual(2);
    });

    it('should have placeholder images with hexagon theme', () => {
      mockProducts.forEach((product) => {
        if (product.images.length > 0) {
          product.images.forEach((img) => {
            expect(img).toHaveProperty('url');
            expect(img).toHaveProperty('alt');
            expect(typeof img.url).toBe('string');
            expect(typeof img.alt).toBe('string');
          });
        }
      });
    });
  });

  describe('getCategories', () => {
    it('should return all categories', () => {
      const categories = getCategories();
      expect(categories).toEqual(mockCategories);
    });
  });

  describe('getProducts', () => {
    it('should return all products', () => {
      const products = getProducts();
      expect(products).toEqual(mockProducts);
    });
  });

  describe('getProductBySlug', () => {
    it('should find a product by slug', () => {
      const product = getProductBySlug(mockProducts[0].slug);
      expect(product).toEqual(mockProducts[0]);
    });

    it('should return undefined for unknown slug', () => {
      const product = getProductBySlug('non-existent-slug');
      expect(product).toBeUndefined();
    });
  });

  describe('getProductsByCategory', () => {
    it('should filter products by category ID', () => {
      const catId = mockProducts[0].categoryId;
      const products = getProductsByCategory(catId);
      expect(products.length).toBeGreaterThan(0);
      products.forEach((p) => expect(p.categoryId).toBe(catId));
    });

    it('should return empty array for unknown category', () => {
      const products = getProductsByCategory('unknown-cat');
      expect(products).toEqual([]);
    });
  });

  describe('getProductById', () => {
    it('should find a product by ID', () => {
      const product = getProductById(mockProducts[0].id);
      expect(product).toEqual(mockProducts[0]);
    });

    it('should return undefined for unknown ID', () => {
      const product = getProductById('non-existent-id');
      expect(product).toBeUndefined();
    });
  });
});
