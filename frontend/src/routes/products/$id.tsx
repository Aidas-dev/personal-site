import { createFileRoute, Link } from '@tanstack/react-router';
import { CartProvider } from '@/context/cartContext';
import { FilterProvider } from '@/context/filterContext';
import { SearchProvider } from '@/context/searchContext';
import { PricingModeProvider } from '@/context/pricingModeContext';
import { ProductDetail } from '@/components/ProductDetail';
import { RelatedProducts } from '@/components/RelatedProducts';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Container } from '@/components/Container';
import { ProductService } from '@/services/productService';
import { CategoryService } from '@/services/categoryService';

export const Route = createFileRoute('/products/$id')({
  component: ProductDetailRoute,
  loader: async ({ params }) => {
    const product = await ProductService.getById(params.id);
    if (!product) throw new Error('Product not found');
    const category = product.categoryId
      ? await CategoryService.getById(product.categoryId)
      : null;
    return { product, category };
  },
  errorComponent: ({ error }) => (
    <Container className="py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
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

function ProductDetailRoute() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const product = loaderData?.product;

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
                  ...(product?.categoryId && loaderData?.category
                    ? [{ label: loaderData.category.name, href: `/products?category=${product.categoryId}` }]
                    : []),
                  { label: product?.name ?? 'Product', current: true },
                ]}
              />
            </Container>
            <ProductDetail productId={id} />
            {product?.categoryId && (
              <Container>
                <RelatedProducts
                  categoryId={product.categoryId}
                  currentProductId={id}
                />
              </Container>
            )}
          </PricingModeProvider>
        </SearchProvider>
      </FilterProvider>
    </CartProvider>
  );
}
