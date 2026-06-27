'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TOCProps {
  content: string;
}

function extractHeadings(content: string): TOCItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s\u00C0-\u024F]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    headings.push({ id, text, level });
  }

  return headings;
}

export default function TOC({ content }: TOCProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const extracted = extractHeadings(content);
    setHeadings(extracted);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      className="rounded-xl border border-border bg-surface p-5"
      aria-label="İçindekiler"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 font-semibold text-text-primary">
          <List className="h-5 w-5 text-primary" />
          İçindekiler
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="text-text-tertiary text-sm"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ol
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 space-y-1 overflow-hidden"
          >
            {headings.map((heading, index) => (
              <li
                key={index}
                style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
              >
                <a
                  href={`#${heading.id}`}
                  className={`block rounded-md px-3 py-1.5 text-sm transition-all ${
                    activeId === heading.id
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(heading.id);
                    if (el) {
                      const offset = 100;
                      const top = el.getBoundingClientRect().top + window.scrollY - offset;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </nav>
  );
}
