import type { Product, ProductFilter } from '@/types';
import { mockProducts } from '@/data/mockData';

const USE_MOCK = import.meta.env.VITE_API_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

/**
 * ProductService - handles product data fetching.
 * Switches between mock and real API based on VITE_API_USE_MOCK env var.
 */
export const ProductService = {
  /** Get all products */
  async getAll(): Promise<Product[]> {
    if (USE_MOCK) {
      return [...mockProducts];
    }

    const response = await fetch(`${API_URL}/store/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    const data = await response.json();
    return data.products as Product[];
  },

  /** Get a single product by ID */
  async getById(id: string): Promise<Product | undefined> {
    if (USE_MOCK) {
      return mockProducts.find((p) => p.id === id);
    }

    const response = await fetch(`${API_URL}/store/products/${id}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    const data = await response.json();
    return data.product as Product;
  },

  /** Get a single product by slug */
  async getBySlug(slug: string): Promise<Product | undefined> {
    if (USE_MOCK) {
      return mockProducts.find((p) => p.slug === slug);
    }

    // Real API would use a handle or slug endpoint
    const response = await fetch(`${API_URL}/store/products?handle=${slug}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    const data = await response.json();
    return data.products?.[0] as Product | undefined;
  },

  /** Get products filtered by category ID */
  async getByCategory(categoryId: string): Promise<Product[]> {
    if (USE_MOCK) {
      return mockProducts.filter((p) => p.categoryId === categoryId);
    }

    const response = await fetch(
      `${API_URL}/store/products?category_id[]=${categoryId}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    const data = await response.json();
    return data.products as Product[];
  },

  /** Search products by text query */
  async search(query: string): Promise<Product[]> {
    if (USE_MOCK) {
      const lowerQuery = query.toLowerCase();
      return mockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.tags?.some((t) => t.toLowerCase().includes(lowerQuery)),
      );
    }

    const response = await fetch(`${API_URL}/store/products?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.statusText}`);
    }
    const data = await response.json();
    return data.products as Product[];
  },

  /** Filter and sort products */
  async filter(filter: ProductFilter): Promise<Product[]> {
    let products = [...mockProducts];

    if (USE_MOCK) {
      // Apply search
      if (filter.searchQuery) {
        const lowerQuery = filter.searchQuery.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.tags?.some((t) => t.toLowerCase().includes(lowerQuery)),
        );
      }

      // Apply price range
      if (filter.minPrice !== undefined) {
        products = products.filter((p) => p.price.amount >= filter.minPrice!);
      }
      if (filter.maxPrice !== undefined) {
        products = products.filter((p) => p.price.amount <= filter.maxPrice!);
      }

      // Apply category filter
      if (filter.categoryIds && filter.categoryIds.length > 0) {
        products = products.filter((p) =>
          filter.categoryIds!.includes(p.categoryId),
        );
      }

      // Apply availability filter
      if (filter.availability) {
        products = products.filter((p) => p.availability === filter.availability);
      }

      // Apply sorting
      if (filter.sortBy) {
        products.sort((a, b) => {
          switch (filter.sortBy) {
            case 'price_asc':
              return a.price.amount - b.price.amount;
            case 'price_desc':
              return b.price.amount - a.price.amount;
            case 'name_asc':
              return a.name.localeCompare(b.name);
            case 'name_desc':
              return b.name.localeCompare(a.name);
            case 'newest':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            default:
              return 0;
          }
        });
      }

      return products;
    }

    // Real API implementation would build query params
    const params = new URLSearchParams();
    if (filter.categoryIds?.length) {
      filter.categoryIds.forEach((id) => params.append('category_id[]', id));
    }
    if (filter.searchQuery) {
      params.append('q', filter.searchQuery);
    }

    const response = await fetch(`${API_URL}/store/products?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    const data = await response.json();
    return data.products as Product[];
  },
};
