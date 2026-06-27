'use client';

import { HTMLAttributes } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver'> {
  src?: string;
  alt: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-full bg-surface ring-2 ring-border hover:ring-primary transition-all duration-200',
        sizeStyles[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      {...props}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="100px" />
      ) : (
        <span className="font-semibold text-text-primary">
          {fallback || getInitials(alt)}
        </span>
      )}
    </motion.div>
  );
}
