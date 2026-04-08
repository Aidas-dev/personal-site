import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from './Card';
import { Container } from './Container';
import { ProductGrid } from './ProductGrid';
import { CategoryList } from './CategoryList';
import { SearchBar } from './SearchBar';
import { PriceRangeFilter } from './PriceRangeFilter';
import { AvailabilityFilter } from './AvailabilityFilter';
import { SortDropdown } from './SortDropdown';
import { FilterBadges } from './FilterBadges';
import { ProductService } from '@/services/productService';
import { CategoryService } from '@/services/categoryService';
import { useFilter } from '@/context/filterContext';
import { useSearch } from '@/context/searchContext';
import type { Product, Category, Availability, ProductSortOption } from '@/types';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { filter, setCategories: setFilterCategories, setAvailability, setSortBy, resetFilters, clearPriceRange, setPriceRange } = useFilter();
  const { query, setQuery } = useSearch();

  // Load categories on mount
  useEffect(() => {
    let mounted = true;
    CategoryService.getAll()
      .then((cats) => {
        if (mounted) setCategories(cats);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      });
    return () => { mounted = false; };
  }, []);

  // Load products when filters change
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ProductService.filter({
        searchQuery: query || undefined,
        minPrice: filter.minPrice,
        maxPrice: filter.maxPrice,
        categoryIds: filter.categoryIds.length > 0 ? filter.categoryIds : undefined,
        availability: filter.availability,
        sortBy: filter.sortBy,
      });
      setProducts(result);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query, filter.minPrice, filter.maxPrice, filter.categoryIds, filter.availability, filter.sortBy]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, [setQuery]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setFilterCategories([categoryId]);
  }, [setFilterCategories]);

  const handlePriceChange = useCallback((range: { min?: number; max?: number }) => {
    setPriceRange(range.min, range.max);
  }, [setPriceRange]);

  const handleAvailabilityChange = useCallback((availability?: Availability) => {
    setAvailability(availability);
  }, [setAvailability]);

  const handleSortChange = useCallback((sortBy: ProductSortOption) => {
    setSortBy(sortBy);
  }, [setSortBy]);

  const handleClearAll = useCallback(() => {
    resetFilters();
    setQuery('');
  }, [resetFilters, setQuery]);

  // Build filter badges
  const activeFilters = useMemo(() => {
    const badges: { label: string; onRemove: () => void }[] = [];

    if (query) {
      badges.push({ label: `Search: "${query}"`, onRemove: () => setQuery('') });
    }
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      const minStr = filter.minPrice !== undefined ? `\u20AC${filter.minPrice}` : '';
      const maxStr = filter.maxPrice !== undefined ? `\u20AC${filter.maxPrice}` : '';
      badges.push({ label: `Price: ${minStr} - ${maxStr}`, onRemove: () => clearPriceRange() });
    }
    if (filter.availability) {
      const labels: Record<Availability, string> = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };
      badges.push({ label: labels[filter.availability], onRemove: () => setAvailability(undefined) });
    }
    if (filter.categoryIds.length > 0) {
      const catNames = filter.categoryIds.map((id) => categories.find((c) => c.id === id)?.name ?? id);
      badges.push({ label: `Category: ${catNames.join(', ')}`, onRemove: () => setFilterCategories([]) });
    }
    if (filter.sortBy) {
      const sortLabels: Record<ProductSortOption, string> = {
        name_asc: 'Name A-Z', name_desc: 'Name Z-A',
        price_asc: 'Price Low-High', price_desc: 'Price High-Low',
        newest: 'Newest', oldest: 'Oldest',
      };
      badges.push({ label: `Sort: ${sortLabels[filter.sortBy]}`, onRemove: () => setSortBy(undefined) });
    }

    return badges;
  }, [query, filter, categories, setQuery, clearPriceRange, setAvailability, setFilterCategories, setSortBy]);

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">Products</h1>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg text-error">
          {error}
          <button
            className="ml-2 underline"
            onClick={() => loadProducts()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Badges */}
      {activeFilters.length > 0 && (
        <div className="mb-6">
          <FilterBadges filters={activeFilters} onClearAll={handleClearAll} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          {/* Search */}
          <Card variant="info">
            <SearchBar onSearch={handleSearch} initialQuery={query} />
          </Card>

          {/* Categories */}
          <Card variant="info">
            <h2 className="text-sm font-semibold text-primary-700 mb-3">Categories</h2>
            <CategoryList
              categories={categories}
              activeCategoryId={filter.categoryIds[0]}
              onCategoryClick={handleCategoryClick}
            />
          </Card>

          {/* Price Range */}
          <Card variant="info">
            <PriceRangeFilter
              onChange={handlePriceChange}
              min={filter.minPrice}
              max={filter.maxPrice}
            />
          </Card>

          {/* Availability */}
          <Card variant="info">
            <AvailabilityFilter
              onChange={handleAvailabilityChange}
              value={filter.availability}
            />
          </Card>

          {/* Sort */}
          <Card variant="info">
            <SortDropdown
              onChange={handleSortChange}
              value={filter.sortBy}
            />
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <ProductGrid products={products} isLoading={isLoading} />
        </main>
      </div>
    </Container>
  );
}
