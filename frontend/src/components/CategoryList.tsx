import { useState, type ButtonHTMLAttributes } from 'react';
import type { Category } from '@/types';

interface CategoryListProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  categories: Category[];
  activeCategoryId?: string;
  onCategoryClick?: (categoryId: string) => void;
}

function CategoryItem({
  category,
  children,
  isActive = false,
  isExpanded = true,
  onToggle,
  onClick,
}: {
  category: Category;
  children?: React.ReactNode;
  isActive?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}) {
  const hasChildren = !!children;

  return (
    <div>
      <div
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
          transition-colors cursor-pointer
          ${isActive
            ? 'bg-primary-500 text-white font-semibold'
            : 'text-neutral-700 hover:bg-neutral-100'
          }
        `}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-current={isActive ? 'page' : undefined}
        data-category-id={category.id}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <span className="flex-1 truncate">{category.name}</span>
        <div className="flex items-center gap-2">
          {category.productCount !== undefined && (
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${isActive ? 'bg-primary-400 text-white' : 'bg-neutral-200 text-neutral-500'}
              `}
            >
              {category.productCount}
            </span>
          )}
          {hasChildren && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle?.();
                }
              }}
              className={`
                ml-1 w-5 h-5 flex items-center justify-center rounded cursor-pointer
                transition-transform text-xs
                ${isActive ? 'text-white' : 'text-neutral-400'}
              `}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? '▾' : '▸'}
            </span>
          )}
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-1 space-y-1" role="group" aria-label={`${category.name} subcategories`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function CategoryList({
  categories,
  activeCategoryId,
  onCategoryClick,
}: CategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  if (categories.length === 0) return null;

  // Build hierarchy: root categories with children
  const rootCategories = categories.filter((c) => !c.parentId);
  const childMap = new Map<string, Category[]>();
  categories.forEach((c) => {
    if (c.parentId) {
      const children = childMap.get(c.parentId) || [];
      children.push(c);
      childMap.set(c.parentId, children);
    }
  });

  // Initialize expanded state for parents with children
  const initialExpanded: Record<string, boolean> = {};
  rootCategories.forEach((cat) => {
    const children = childMap.get(cat.id);
    if (children && children.length > 0) {
      initialExpanded[cat.id] = true;
    }
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <nav className="space-y-1" aria-label="Categories">
      {rootCategories.map((root) => {
        const children = childMap.get(root.id);
        const isExpanded =
          expandedCategories[root.id] ?? initialExpanded[root.id] ?? false;

        return (
          <CategoryItem
            key={root.id}
            category={root}
            isActive={root.id === activeCategoryId}
            isExpanded={isExpanded}
            onToggle={() => toggleCategory(root.id)}
            onClick={() => onCategoryClick?.(root.id)}
          >
            {children?.map((child) => (
              <CategoryItem
                key={child.id}
                category={child}
                isActive={child.id === activeCategoryId}
                onClick={() => onCategoryClick?.(child.id)}
              />
            ))}
          </CategoryItem>
        );
      })}
    </nav>
  );
}
