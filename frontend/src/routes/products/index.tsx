import { createFileRoute } from '@tanstack/react-router';
import { CartProvider } from '@/context/cartContext';
import { FilterProvider } from '@/context/filterContext';
import { SearchProvider } from '@/context/searchContext';
import { PricingModeProvider } from '@/context/pricingModeContext';
import { ProductsPage } from '@/components/ProductsPage';

export const Route = createFileRoute('/products/')({
  component: ProductsRoute,
});

function ProductsRoute() {
  return (
    <CartProvider>
      <FilterProvider>
        <SearchProvider>
          <PricingModeProvider>
            <ProductsPage />
          </PricingModeProvider>
        </SearchProvider>
      </FilterProvider>
    </CartProvider>
  );
}
