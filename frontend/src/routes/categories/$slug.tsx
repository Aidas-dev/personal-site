import { createFileRoute, Link } from '@tanstack/react-router';
import { CartProvider } from '@/context/cartContext';
import { FilterProvider } from '@/context/filterContext';
import { SearchProvider } from '@/context/searchContext';
import { PricingModeProvider } from '@/context/pricingModeContext';
import { ProductGrid } from '@/components/ProductGrid';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { ProductService } from '@/services/productService';
import { CategoryService } from '@/services/categoryService';
import type { Product, Category } from '@/types';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/categories/$slug')({
  component: CategoryRoute,
  loader: async ({ params }) => {
    const category = await CategoryService.getBySlug(params.slug);
    if (!category) throw new Error('Category not found');
    const allCategories = await CategoryService.getAll();
    const childCategories = allCategories.filter((c) => c.parentId === category.id);
    const categoryIds = [category.id, ...childCategories.map((c) => c.id)];
    const products = await ProductService.filter({ categoryIds });
    const parentCategory = category.parentId
      ? await CategoryService.getById(category.parentId)
      : null;
    return { category, products, childCategories, parentCategory };
  },
  errorComponent: ({ error }) => (
    <Container className="py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/products' },
          { label: 'Not Found', current: true },
        ]}
      />
      <div className="text-center py-16">
        <p className="text-xl text-neutral-500">{error.message}</p>
        <Link to="/products" className="text-primary-500 hover:underline mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    </Container>
  ),
});

function CategoryRoute() {
  const loaderData = Route.useLoaderData();
  const { category, products, childCategories, parentCategory } = loaderData ?? {};

  if (!category) return null;

  return (
    <CartProvider>
      <FilterProvider>
        <SearchProvider>
          <PricingModeProvider>
            <Container className="py-8">
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Products', href: '/products' },
                  ...(parentCategory ? [{ label: parentCategory.name, href: `/categories/${parentCategory.slug}` }] : []),
                  { label: category.name, current: true },
                ]}
              />

              {/* Category Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-900 mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-neutral-600">{category.description}</p>
                )}
              </div>

              {/* Child Categories */}
              {childCategories.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {childCategories.map((child) => (
                    <Link
                      key={child.id}
                      to="/categories/$slug"
                      params={{ slug: child.slug }}
                      className="px-4 py-2 bg-neutral-100 hover:bg-primary-50 text-neutral-700 hover:text-primary-700 rounded-lg border border-neutral-200 hover:border-primary-200 transition-colors text-sm"
                    >
                      {child.name}
                      {child.productCount !== undefined && (
                        <span className="ml-2 text-xs text-neutral-400">({child.productCount})</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* Product Grid */}
              {products.length > 0 ? (
                <ProductGrid products={products} />
              ) : (
                <Card variant="info" className="text-center py-12">
                  <p className="text-lg text-neutral-500">
                    No products in this category yet.
                  </p>
                </Card>
              )}
            </Container>
          </PricingModeProvider>
        </SearchProvider>
      </FilterProvider>
    </CartProvider>
  );
}
