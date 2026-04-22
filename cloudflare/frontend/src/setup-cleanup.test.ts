import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(__dirname, '..');

describe('Task 1.1: E-commerce cleanup', () => {
  describe('package.json', () => {
    const pkg = JSON.parse(
      readFileSync(join(frontendRoot, 'package.json'), 'utf-8')
    );

    it('should not have medusa-related dependencies', () => {
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const medusaDeps = Object.keys(allDeps).filter((dep) =>
        dep.toLowerCase().includes('medusa')
      );
      expect(medusaDeps).toEqual([]);
    });

    it('should not have stripe/payment-related dependencies', () => {
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const stripeDeps = Object.keys(allDeps).filter((dep) =>
        dep.toLowerCase().includes('stripe')
      );
      expect(stripeDeps).toEqual([]);
    });

    it('should be named portfolio-frontend', () => {
      expect(pkg.name).toBe('portfolio-frontend');
    });

    it('should have a portfolio description', () => {
      expect(pkg.description).toBeDefined();
      expect(pkg.description?.toLowerCase()).toContain('portfolio');
    });
  });

  describe('e-commerce components removed', () => {
    const removedComponents = [
      'ProductGrid',
      'ProductDetail',
      'CategoryList',
      'PriceRangeFilter',
      'AvailabilityFilter',
      'FilterBadges',
      'ProductsPage',
      'Breadcrumb',
      'RelatedProducts',
      'SortDropdown',
    ];

    removedComponents.forEach((component) => {
      it(`should remove ${component}.tsx`, () => {
        const path = join(frontendRoot, 'src', 'components', `${component}.tsx`);
        expect(existsSync(path)).toBe(false);
      });
    });
  });

  describe('e-commerce directories removed', () => {
    const removedDirs = ['cart', 'checkout', 'order'];
    removedDirs.forEach((dir) => {
      it(`should remove components/${dir}/`, () => {
        const path = join(frontendRoot, 'src', 'components', dir);
        expect(existsSync(path)).toBe(false);
      });
    });
  });

  describe('e-commerce contexts removed', () => {
    const removedContexts = [
      'cartContext',
      'checkoutContext',
    ];

    removedContexts.forEach((ctx) => {
      it(`should remove ${ctx}.tsx`, () => {
        const path = join(frontendRoot, 'src', 'context', `${ctx}.tsx`);
        expect(existsSync(path)).toBe(false);
      });
    });
  });

  describe('e-commerce services removed', () => {
    const removedServices = [
      'cartService',
      'categoryService',
      'checkoutService',
      'nodaService',
      'orderService',
      'productService',
      'stripeService',
    ];

    removedServices.forEach((svc) => {
      it(`should remove ${svc}.ts`, () => {
        const path = join(frontendRoot, 'src', 'services', `${svc}.ts`);
        expect(existsSync(path)).toBe(false);
      });
    });
  });

  describe('e-commerce hooks removed', () => {
    it('should remove useCheckout.ts', () => {
      const path = join(frontendRoot, 'src', 'hooks', 'useCheckout.ts');
      expect(existsSync(path)).toBe(false);
    });
  });

  describe('e-commerce routes removed', () => {
    const removedRoutes = [
      'cart.tsx',
      'checkout.tsx',
    ];
    const removedRouteDirs = ['products', 'categories', 'account', 'order', 'checkout'];

    removedRoutes.forEach((route) => {
      it(`should remove routes/${route}`, () => {
        const path = join(frontendRoot, 'src', 'routes', route);
        expect(existsSync(path)).toBe(false);
      });
    });

    removedRouteDirs.forEach((dir) => {
      it(`should remove routes/${dir}/`, () => {
        const path = join(frontendRoot, 'src', 'routes', dir);
        expect(existsSync(path)).toBe(false);
      });
    });
  });

  describe('component index exports', () => {
    it('should not export e-commerce components', () => {
      const indexPath = join(frontendRoot, 'src', 'components', 'index.ts');
      const content = readFileSync(indexPath, 'utf-8');
      const ecommerceExports = [
        'ProductGrid',
        'CategoryList',
        'PriceRangeFilter',
        'AvailabilityFilter',
        'FilterBadges',
        'ProductsPage',
        'Breadcrumb',
        'RelatedProducts',
        'SortDropdown',
        'SearchBar',
        'CartIcon',
        'CartDrawer',
        'CartItemRow',
        'CartPage',
        'StepIndicator',
        'AddressStep',
        'ShippingStep',
        'PaymentStep',
        'ReviewStep',
        'ConfirmationStep',
        'CheckoutPage',
        'OrderConfirmation',
        'OrderHistory',
        'OrderDetail',
      ];
      ecommerceExports.forEach((exp) => {
        expect(content).not.toContain(exp);
      });
    });

    it('should still export generic components', () => {
      const indexPath = join(frontendRoot, 'src', 'components', 'index.ts');
      const content = readFileSync(indexPath, 'utf-8');
      const genericExports = ['Button', 'Card', 'Input', 'Alert', 'Container'];
      genericExports.forEach((exp) => {
        expect(content).toContain(exp);
      });
    });
  });

  describe('e-commerce data/utils removed', () => {
    it('should remove mockData (product-specific)', () => {
      const path = join(frontendRoot, 'src', 'data', 'mockData.ts');
      expect(existsSync(path)).toBe(false);
    });

    it('should remove formatPrice (e-commerce utility)', () => {
      const path = join(frontendRoot, 'src', 'utils', 'formatPrice.ts');
      expect(existsSync(path)).toBe(false);
    });
  });
});

describe('Task 1.2: Portfolio structure', () => {
  describe('portfolio route files exist', () => {
    const portfolioRoutes = ['about.tsx', 'projects.tsx', 'dashboard.tsx', 'security.tsx'];

    portfolioRoutes.forEach((route) => {
      it(`should have routes/${route}`, () => {
        const path = join(frontendRoot, 'src', 'routes', route);
        expect(existsSync(path)).toBe(true);
      });
    });
  });

  describe('component directories exist', () => {
    const componentDirs = ['hero', 'layout', 'ui', 'three', 'dashboard'];

    componentDirs.forEach((dir) => {
      it(`should have src/components/${dir}/`, () => {
        const path = join(frontendRoot, 'src', 'components', dir);
        expect(existsSync(path)).toBe(true);
      });
    });
  });

  describe('__root.tsx', () => {
    it('should not reference CartProvider', () => {
      const path = join(frontendRoot, 'src', 'routes', '__root.tsx');
      const content = readFileSync(path, 'utf-8');
      expect(content).not.toContain('CartProvider');
      expect(content).not.toContain('cartContext');
    });

    it('should not have Riedu branding', () => {
      const path = join(frontendRoot, 'src', 'routes', '__root.tsx');
      const content = readFileSync(path, 'utf-8');
      expect(content).not.toContain('Riedu');
    });
  });
});
