import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CartIcon } from './cart/CartIcon';
import { CartDrawer } from './cart/CartDrawer';
import { Container } from './Container';

export function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 text-primary-500 hover:text-primary-600 transition-colors">
              <div className="hexagon bg-primary-500 w-8 h-8" />
              <span className="text-xl font-bold text-primary-900">Riedu E-Shop</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-4" aria-label="Main navigation">
              <Link
                to="/products"
                className="text-neutral-600 hover:text-primary-500 transition-colors font-medium"
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="text-neutral-600 hover:text-primary-500 transition-colors font-medium"
              >
                Categories
              </Link>

              {/* Cart Icon */}
              <CartIcon onClick={() => setIsDrawerOpen(true)} />
            </nav>
          </div>
        </Container>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
