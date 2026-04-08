import { useState } from 'react';
import type { CartLineItem } from '@/types';
import { useCart } from '@/context/cartContext';
import { Button } from '@/components/Button';
import { formatPrice } from '@/utils/formatPrice';

interface CartItemRowProps {
  item: CartLineItem;
  currency: string;
}

export function CartItemRow({ item, currency }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemove();
      return;
    }
    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeItem(item.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-neutral-200 last:border-0 transition-opacity ${
        isRemoving ? 'opacity-50' : ''
      }`}
    >
      {/* Image */}
      <div className="w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-neutral-900 truncate">{item.title}</h3>
        <p className="text-sm text-neutral-500 mt-1">
          Unit price: {formatPrice(item.unitPrice, currency)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-neutral-300 rounded-lg">
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating}
            className="px-3 py-2 text-lg hover:bg-neutral-100 rounded-l-lg transition-colors disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) {
                handleQuantityChange(val);
              }
            }}
            className="w-14 text-center border-x border-neutral-300 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            min={1}
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
            className="px-3 py-2 text-lg hover:bg-neutral-100 rounded-r-lg transition-colors disabled:opacity-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right min-w-[5rem]">
          <p className="font-semibold text-neutral-900">
            {formatPrice(item.total, currency)}
          </p>
        </div>

        {/* Remove Button */}
        <Button
          variant="icon"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label={`Remove ${item.title} from cart`}
          className="text-neutral-400 hover:text-error"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
