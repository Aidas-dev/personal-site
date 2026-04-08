import { useState, useEffect } from 'react';
import { Card } from './Card';
import { ProductService } from '@/services/productService';
import { formatPrice } from '@/utils/formatPrice';
import type { Product } from '@/types';

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    ProductService.getByCategory(categoryId)
      .then((prods) => {
        if (mounted) {
          const filtered = prods.filter((p) => p.id !== currentProductId);
          setProducts(filtered);
        }
      })
      .catch(() => {
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, [categoryId, currentProductId]);

  if (isLoading || products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-neutral-900 mb-4">Related Products</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {products.map((product) => (
          <Card
            key={product.id}
            variant="product"
            className="flex-shrink-0 w-64 snap-start"
          >
            <div className="bg-neutral-100 aspect-video mb-3 rounded overflow-hidden">
              <img
                src={product.images[0]?.url ?? 'https://placehold.co/400x300'}
                alt={product.images[0]?.alt ?? product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold text-sm text-neutral-900 line-clamp-2 mb-1">
              {product.name}
            </h3>
            <p className="text-primary-500 font-bold">
              {formatPrice(product.price.amount, product.price.currency)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
