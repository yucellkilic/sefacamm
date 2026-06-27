'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onClear?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, icon, onClear, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';

    return (
      <div className="relative w-full">
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'peer h-12 w-full rounded-md border-2 border-border bg-surface px-4 text-text-primary transition-all duration-200',
              'placeholder-transparent',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
              error && 'border-error focus:border-error focus:ring-error/20',
              icon && 'pl-10',
              hasValue && onClear && 'pr-10',
              className
            )}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={label || props.placeholder || ''}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          {label && (
            <motion.label
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-all duration-200',
                'pointer-events-none',
                'peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base',
                'peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-surface peer-focus:px-1 peer-focus:text-xs peer-focus:text-primary',
                (isFocused || hasValue) &&
                  '-top-2 left-3 bg-surface px-1 text-xs text-primary',
                icon && 'peer-placeholder-shown:left-10'
              )}
              htmlFor={props.id}
            >
              {label}
            </motion.label>
          )}
          {hasValue && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-error"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {error && (
          <motion.p
            id={`${props.id}-error`}
            role="alert"
            className="mt-1 text-sm text-error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
