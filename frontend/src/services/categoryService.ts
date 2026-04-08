import type { Category } from '@/types';
import { mockCategories } from '@/data/mockData';

const USE_MOCK = import.meta.env.VITE_API_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

/**
 * CategoryService - handles category data fetching.
 * Switches between mock and real API based on VITE_API_USE_MOCK env var.
 */
export const CategoryService = {
  /** Get all categories */
  async getAll(): Promise<Category[]> {
    if (USE_MOCK) {
      return [...mockCategories];
    }

    const response = await fetch(`${API_URL}/store/product-categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data.product_categories as Category[];
  },

  /** Get a single category by ID */
  async getById(id: string): Promise<Category | undefined> {
    if (USE_MOCK) {
      return mockCategories.find((c) => c.id === id);
    }

    const response = await fetch(`${API_URL}/store/product-categories/${id}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error(`Failed to fetch category: ${response.statusText}`);
    }
    const data = await response.json();
    return data.product_category as Category;
  },

  /** Get a single category by slug */
  async getBySlug(slug: string): Promise<Category | undefined> {
    if (USE_MOCK) {
      return mockCategories.find((c) => c.slug === slug);
    }

    const response = await fetch(
      `${API_URL}/store/product-categories?handle=${slug}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.statusText}`);
    }
    const data = await response.json();
    return data.product_categories?.[0] as Category | undefined;
  },

  /** Get root categories (categories without a parent) */
  async getRootCategories(): Promise<Category[]> {
    if (USE_MOCK) {
      return mockCategories.filter((c) => !c.parentId);
    }

    const response = await fetch(
      `${API_URL}/store/product-categories?parent_category_id=null`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch root categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data.product_categories as Category[];
  },

  /** Get child categories for a given parent ID */
  async getChildren(parentId: string): Promise<Category[]> {
    if (USE_MOCK) {
      return mockCategories.filter((c) => c.parentId === parentId);
    }

    const response = await fetch(
      `${API_URL}/store/product-categories?parent_category_id=${parentId}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch child categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data.product_categories as Category[];
  },
};
