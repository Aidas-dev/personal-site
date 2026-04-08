import { useState, useEffect } from 'react';
import { Container } from './Container';
import { Card } from './Card';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { useCart } from '@/context/cartContext';
import { usePricingMode } from '@/context/pricingModeContext';
import { ProductService } from '@/services/productService';
import { formatPrice } from '@/utils/formatPrice';
import type { Product } from '@/types';

interface ProductDetailProps {
  productId: string;
}

function ImageGallery({ images }: { images: Product['images'] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="bg-neutral-100 aspect-video rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-neutral-100 rounded-xl overflow-hidden aspect-video">
        <img
          src={images[activeIndex]?.url ?? 'https://placehold.co/800x600'}
          alt={images[activeIndex]?.alt ?? 'Product image'}
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                index === activeIndex
                  ? 'border-primary-500'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecsTable({ specs }: { specs: Product['specs'] }) {
  if (!specs || specs.length === 0) return null;

  return (
    <Card variant="info">
      <h3 className="text-lg font-semibold text-primary-700 mb-3">Specifications</h3>
      <table className="w-full text-sm">
        <tbody>
          {specs.map((spec, index) => (
            <tr
              key={spec.key}
              className={index % 2 === 0 ? 'bg-neutral-50' : ''}
            >
              <td className="py-2 pr-4 font-medium text-neutral-700 w-1/3">
                {spec.key}
              </td>
              <td className="py-2 text-neutral-900">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function QuantitySelector({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="quantity" className="text-sm font-medium text-neutral-700">
        Quantity
      </label>
      <div className="flex items-center border border-neutral-300 rounded-lg">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, quantity - 1))}
          className="px-3 py-2 text-lg hover:bg-neutral-100 rounded-l-lg"
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
        >
          -
        </button>
        <input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-12 text-center border-x border-neutral-300 py-2 focus:outline-none"
          min={1}
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={() => onChange(quantity + 1)}
          className="px-3 py-2 text-lg hover:bg-neutral-100 rounded-r-lg"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem, totalItems } = useCart();
  const { isB2B, toggleMode } = usePricingMode();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    ProductService.getById(productId)
      .then((p) => {
        if (mounted) {
          setProduct(p ?? null);
          if (!p) setError('Product not found');
        }
      })
      .catch(() => {
        if (mounted) setError('Failed to load product');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addItem({
        productId: product.id,
        variantId: product.id, // Single-variant products use product ID as variant ID
        productName: product.name,
        price: isB2B ? (product.price.b2bAmount ?? product.price.amount) : product.price.amount,
        quantity,
        thumbnail: product.images?.[0]?.url,
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      // Error handled by context — just don't show success
    }
  };

  const displayPrice = isB2B
    ? (product?.price.b2bAmount ?? product?.price.amount ?? 0)
    : (product?.price.saleAmount ?? product?.price.amount ?? 0);

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="animate-pulse space-y-6" role="status">
          <div className="h-96 bg-neutral-200 rounded-xl" />
          <div className="h-8 bg-neutral-200 rounded w-1/2" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
          <span className="sr-only">Loading product details...</span>
        </div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-8">
        <div className="text-center py-16">
          <p className="text-xl text-neutral-500">{error ?? 'Product not found'}</p>
        </div>
      </Container>
    );
  }

  const availabilityLabels = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };
  const availabilityColors = {
    in_stock: 'text-success',
    low_stock: 'text-warning',
    out_of_stock: 'text-error',
  };

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Gallery */}
        <ImageGallery images={product.images} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {product.name}
            </h1>
            {product.sku && (
              <p className="text-sm text-neutral-500">SKU: {product.sku}</p>
            )}
          </div>

          {/* Availability */}
          <p className={`text-sm font-medium ${availabilityColors[product.availability]}`}>
            {availabilityLabels[product.availability]}
          </p>

          {/* Price */}
          <Card variant="action">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">
                  {isB2B ? 'B2B Price' : 'Price'}
                </p>
                <p className="text-3xl font-bold text-primary-500">
                  {formatPrice(displayPrice, product.price.currency)}
                </p>
                {isB2B && product.price.b2bAmount && product.price.amount !== product.price.b2bAmount && (
                  <p className="text-sm text-neutral-400 line-through">
                    Regular: {formatPrice(product.price.amount, product.price.currency)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={toggleMode}
                className="px-3 py-1.5 text-sm border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
              >
                Switch to {isB2B ? 'B2C' : 'B2B'}
              </button>
            </div>
          </Card>

          {/* Description */}
          <p className="text-neutral-700 leading-relaxed">{product.description}</p>

          {/* Add to Cart */}
          <div className="space-y-4">
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              disabled={product.availability === 'out_of_stock'}
              className="w-full"
            >
              {addedToCart
                ? `Added! (${totalItems} in cart)`
                : product.availability === 'out_of_stock'
                  ? 'Out of Stock'
                  : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <SpecsTable specs={product.specs} />
    </Container>
  );
}
