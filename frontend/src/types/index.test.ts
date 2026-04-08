import type {
  Product,
  Category,
  Price,
  ProductFilter,
  ProductSortOption,
  Availability,
  ProductSpec,
} from './index';

describe('TypeScript interfaces', () => {
  describe('Price interface', () => {
    it('should accept a valid Price object', () => {
      const price: Price = {
        amount: 29.99,
        currency: 'EUR',
      };
      expect(price.amount).toBe(29.99);
      expect(price.currency).toBe('EUR');
    });

    it('should support optional sale price', () => {
      const price: Price = {
        amount: 49.99,
        currency: 'EUR',
        saleAmount: 39.99,
      };
      expect(price.saleAmount).toBe(39.99);
    });

    it('should support optional B2B price', () => {
      const price: Price = {
        amount: 49.99,
        currency: 'EUR',
        b2bAmount: 35.0,
      };
      expect(price.b2bAmount).toBe(35.0);
    });

    it('should support all price fields together', () => {
      const price: Price = {
        amount: 99.99,
        currency: 'EUR',
        saleAmount: 79.99,
        b2bAmount: 70.0,
      };
      expect(price.amount).toBe(99.99);
      expect(price.saleAmount).toBe(79.99);
      expect(price.b2bAmount).toBe(70.0);
    });
  });

  describe('Category interface', () => {
    it('should accept a valid Category object', () => {
      const category: Category = {
        id: 'cat-1',
        name: 'Bike Parts',
        slug: 'bike-parts',
      };
      expect(category.id).toBe('cat-1');
      expect(category.name).toBe('Bike Parts');
      expect(category.slug).toBe('bike-parts');
    });

    it('should support optional parent category', () => {
      const category: Category = {
        id: 'cat-2',
        name: 'Brakes',
        slug: 'brakes',
        parentId: 'cat-1',
      };
      expect(category.parentId).toBe('cat-1');
    });

    it('should support optional description', () => {
      const category: Category = {
        id: 'cat-3',
        name: 'Parking',
        slug: 'parking',
        description: 'Parking solutions',
      };
      expect(category.description).toBe('Parking solutions');
    });

    it('should support optional product count', () => {
      const category: Category = {
        id: 'cat-4',
        name: 'Wheels',
        slug: 'wheels',
        productCount: 12,
      };
      expect(category.productCount).toBe(12);
    });
  });

  describe('ProductSpec interface', () => {
    it('should accept a valid ProductSpec object', () => {
      const spec: ProductSpec = {
        key: 'Weight',
        value: '250g',
      };
      expect(spec.key).toBe('Weight');
      expect(spec.value).toBe('250g');
    });
  });

  describe('Product interface', () => {
    it('should accept a valid Product object with all required fields', () => {
      const product: Product = {
        id: 'prod-1',
        name: 'Hydraulic Disc Brake',
        description: 'High-performance hydraulic disc brake for mountain bikes',
        slug: 'hydraulic-disc-brake',
        categoryId: 'cat-brakes',
        price: {
          amount: 89.99,
          currency: 'EUR',
        },
        images: [
          {
            url: '/images/brake-front.jpg',
            alt: 'Front view of hydraulic disc brake',
          },
        ],
        availability: 'in_stock',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-03-20T14:30:00Z',
      };
      expect(product.id).toBe('prod-1');
      expect(product.name).toBe('Hydraulic Disc Brake');
      expect(product.description).toBe(
        'High-performance hydraulic disc brake for mountain bikes',
      );
      expect(product.slug).toBe('hydraulic-disc-brake');
      expect(product.categoryId).toBe('cat-brakes');
      expect(product.price.amount).toBe(89.99);
      expect(product.images).toHaveLength(1);
      expect(product.availability).toBe('in_stock');
    });

    it('should support optional fields: sku, specs, tags, salePrice', () => {
      const product: Product = {
        id: 'prod-2',
        name: 'Mountain Bike Tire',
        description: 'All-terrain mountain bike tire',
        slug: 'mtb-tire',
        categoryId: 'cat-tires',
        price: {
          amount: 45.0,
          currency: 'EUR',
          saleAmount: 35.0,
        },
        images: [],
        availability: 'in_stock',
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
        sku: 'MTB-TIRE-29',
        specs: [
          { key: 'Size', value: '29"' },
          { key: 'TPI', value: '120' },
        ],
        tags: ['mountain', 'all-terrain', 'tubeless'],
      };
      expect(product.sku).toBe('MTB-TIRE-29');
      expect(product.specs).toHaveLength(2);
      expect(product.tags).toContain('tubeless');
      expect(product.price.saleAmount).toBe(35.0);
    });

    it('should support B2B pricing', () => {
      const product: Product = {
        id: 'prod-3',
        name: 'Bike Stand',
        description: 'Commercial bike stand',
        slug: 'bike-stand',
        categoryId: 'cat-parking',
        price: {
          amount: 500.0,
          currency: 'EUR',
          b2bAmount: 400.0,
        },
        images: [],
        availability: 'in_stock',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      expect(product.price.b2bAmount).toBe(400.0);
    });
  });

  describe('ProductFilter interface', () => {
    it('should accept an empty filter object', () => {
      const filter: ProductFilter = {};
      expect(filter).toEqual({});
    });

    it('should support price range filter', () => {
      const filter: ProductFilter = {
        minPrice: 10,
        maxPrice: 100,
      };
      expect(filter.minPrice).toBe(10);
      expect(filter.maxPrice).toBe(100);
    });

    it('should support category filter', () => {
      const filter: ProductFilter = {
        categoryIds: ['cat-1', 'cat-2'],
      };
      expect(filter.categoryIds).toEqual(['cat-1', 'cat-2']);
    });

    it('should support availability filter', () => {
      const filter: ProductFilter = {
        availability: 'in_stock',
      };
      expect(filter.availability).toBe('in_stock');
    });

    it('should support search query', () => {
      const filter: ProductFilter = {
        searchQuery: 'brake',
      };
      expect(filter.searchQuery).toBe('brake');
    });

    it('should support sort options', () => {
      const filter: ProductFilter = {
        sortBy: 'price_asc',
      };
      expect(filter.sortBy).toBe('price_asc');
    });

    it('should support combined filters', () => {
      const filter: ProductFilter = {
        minPrice: 20,
        maxPrice: 200,
        categoryIds: ['cat-brakes'],
        availability: 'in_stock',
        searchQuery: 'disc',
        sortBy: 'name_asc',
      };
      expect(filter.minPrice).toBe(20);
      expect(filter.maxPrice).toBe(200);
      expect(filter.categoryIds).toContain('cat-brakes');
      expect(filter.availability).toBe('in_stock');
      expect(filter.searchQuery).toBe('disc');
      expect(filter.sortBy).toBe('name_asc');
    });
  });

  describe('Availability type', () => {
    it('should accept valid availability values', () => {
      const values: Availability[] = ['in_stock', 'low_stock', 'out_of_stock'];
      expect(values).toContain('in_stock');
      expect(values).toContain('low_stock');
      expect(values).toContain('out_of_stock');
    });
  });

  describe('ProductSortOption type', () => {
    it('should accept valid sort options', () => {
      const options: ProductSortOption[] = [
        'name_asc',
        'name_desc',
        'price_asc',
        'price_desc',
        'newest',
        'oldest',
      ];
      expect(options).toHaveLength(6);
    });
  });
});
