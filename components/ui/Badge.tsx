'use client';

import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver'> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export default function Badge({ className, variant = 'primary', children, ...props }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-primary text-background',
    secondary: 'bg-surface text-text-secondary border border-border',
    outline: 'border-2 border-primary text-primary',
  };

  return (
    <motion.span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all',
        variantStyles[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      {...props}
    >
      {children}
    </motion.span>
  );
}
