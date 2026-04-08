import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Cart, CartLineItem } from '@/types';
import { CartService } from '@/services/cartService';

const CART_ID_STORAGE_KEY = 'medusa_cart_id';

interface CartContextValue {
  cart: Cart | null;
  items: CartLineItem[];
  totalItems: number;
  subtotal: number;
  taxTotal: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  addItem: (item: {
    productId: string;
    variantId: string;
    productName: string;
    price: number;
    quantity: number;
    thumbnail?: string;
  }) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItem: (productId: string) => CartLineItem | undefined;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Get the stored cart ID from localStorage */
function getStoredCartId(): string | null {
  try {
    return localStorage.getItem(CART_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Store the cart ID in localStorage */
function storeCartId(id: string): void {
  try {
    localStorage.setItem(CART_ID_STORAGE_KEY, id);
  } catch {
    // Silently fail — localStorage may be unavailable
  }
}

/** Clear the stored cart ID from localStorage */
function clearStoredCartId(): void {
  try {
    localStorage.removeItem(CART_ID_STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize cart on mount
  useEffect(() => {
    let mounted = true;

    async function initCart() {
      const storedId = getStoredCartId();

      if (storedId) {
        try {
          const fetchedCart = await CartService.getCart(storedId);
          if (mounted) {
            if (fetchedCart) {
              setCart(fetchedCart);
            } else {
              // Stale ID — create new cart
              clearStoredCartId();
              const newCart = await CartService.createCart();
              if (mounted) {
                setCart(newCart);
                storeCartId(newCart.id);
              }
            }
          }
        } catch {
          // Fetch failed — create new cart
          if (mounted) {
            clearStoredCartId();
            try {
              const newCart = await CartService.createCart();
              setCart(newCart);
              storeCartId(newCart.id);
            } catch (createError) {
              setError(
                createError instanceof Error
                  ? createError.message
                  : 'Failed to create cart',
              );
            }
          }
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    }

    initCart();
    return () => {
      mounted = false;
    };
  }, []);

  const addItem = useCallback(
    async (item: {
      productId: string;
      variantId: string;
      productName: string;
      price: number;
      quantity: number;
      thumbnail?: string;
    }) => {
      setError(null);

      try {
        let currentCart = cart;

        // If no cart exists, create one first
        if (!currentCart) {
          currentCart = await CartService.createCart();
          setCart(currentCart);
          storeCartId(currentCart.id);
        }

        const updatedCart = await CartService.addLineItem(currentCart.id, {
          variantId: item.variantId,
          quantity: item.quantity,
          productId: item.productId,
          title: item.productName,
          thumbnail: item.thumbnail,
          unitPrice: item.price,
        });

        setCart(updatedCart);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add item';
        setError(message);
        throw err;
      }
    },
    [cart],
  );

  const removeItem = useCallback(async (lineId: string) => {
    setError(null);

    try {
      const storedId = getStoredCartId();
      if (!storedId) return;

      const updatedCart = await CartService.deleteLineItem(storedId, lineId);
      setCart(updatedCart);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      setError(message);
      throw err;
    }
  }, []);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    setError(null);

    try {
      const storedId = getStoredCartId();
      if (!storedId) return;

      const updatedCart = await CartService.updateLineItem(storedId, lineId, {
        quantity,
      });
      setCart(updatedCart);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update quantity';
      setError(message);
      throw err;
    }
  }, []);

  const clearCart = useCallback(async () => {
    setError(null);

    try {
      const storedId = getStoredCartId();
      if (!storedId) return;

      const updatedCart = await CartService.clearCart(storedId);
      setCart(updatedCart);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(message);
      throw err;
    }
  }, []);

  const getItem = useCallback(
    (productId: string) => {
      return cart?.items.find((item) => item.productId === productId);
    },
    [cart?.items],
  );

  const totalItems = cart?.itemCount ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const taxTotal = cart?.taxTotal ?? 0;
  const total = cart?.total ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart?.items ?? [],
        totalItems,
        subtotal,
        taxTotal,
        total,
        isLoading,
        error,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Keep legacy CartItem type for backward compatibility with existing code
export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
