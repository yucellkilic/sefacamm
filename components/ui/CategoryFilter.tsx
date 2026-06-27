'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory?: string;
}

export default function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <nav aria-label="Kategori filtresi" className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCategoryChange(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
          !activeCategory
            ? 'bg-primary text-background shadow-glow'
            : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border'
        }`}
        aria-pressed={!activeCategory}
      >
        Tümü
      </button>

      {categories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => handleCategoryChange(category.slug)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeCategory === category.slug
              ? 'bg-primary text-background shadow-glow'
              : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border'
          }`}
          aria-pressed={activeCategory === category.slug}
        >
          {category.name}
        </motion.button>
      ))}
    </nav>
  );
}
