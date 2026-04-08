import type { HTMLAttributes, ReactNode } from 'react';
import type { Product } from '@/types';
import { Card } from './Card';
import { Spinner } from './Spinner';
import { formatPrice } from '@/utils/formatPrice';

interface ProductGridProps extends HTMLAttributes<HTMLDivElement> {
  products: Product[];
  isLoading?: boolean;
}

const availabilityLabels: Record<Product['availability'], string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

const availabilityColors: Record<Product['availability'], string> = {
  in_stock: 'text-success',
  low_stock: 'text-warning',
  out_of_stock: 'text-error',
};

function ProductCard({ product }: { product: Product }) {
  const displayPrice = product.price.saleAmount ?? product.price.amount;
  const hasSale = product.price.saleAmount !== undefined;

  return (
    <Card
      variant="product"
      className="flex flex-col overflow-hidden"
      data-testid={`product-${product.id}`}
    >
      {/* Product Image */}
      <div className="relative bg-neutral-100 aspect-video mb-4 overflow-hidden">
        <img
          src={product.images[0]?.url ?? 'https://placehold.co/600x400'}
          alt={product.images[0]?.alt ?? product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <h3 className="font-semibold text-neutral-900 text-base mb-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Availability */}
        <p className={`text-sm font-medium mb-2 ${availabilityColors[product.availability]}`}>
          {availabilityLabels[product.availability]}
        </p>

        {/* Price */}
        <div className="mt-auto">
          {hasSale ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary-500">
                {formatPrice(displayPrice, product.price.currency)}
              </span>
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(product.price.amount, product.price.currency)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary-500">
              {formatPrice(displayPrice, product.price.currency)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="status" aria-label="Loading products">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} variant="info" className="animate-pulse">
          <div className="bg-neutral-200 aspect-video mb-4 rounded" />
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2" />
          <div className="h-6 bg-neutral-200 rounded w-1/3 mt-auto" />
        </Card>
      ))}
      <span className="sr-only">Loading products...</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-neutral-700 mb-2">
        No products found
      </h3>
      <p className="text-neutral-500">
        Try adjusting your search or filter criteria.
      </p>
    </div>
  );
}

export function ProductGrid({
  products,
  isLoading = false,
  className = '',
  ...props
}: ProductGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
      {...props}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
