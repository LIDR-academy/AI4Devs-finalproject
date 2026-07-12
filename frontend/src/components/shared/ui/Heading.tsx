import React, { HTMLAttributes, ReactNode } from 'react';

type HeadingProps = {
  level?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLHeadingElement>;

const sizeClasses: Record<1 | 2 | 3, string> = {
  1: 'text-[40px] leading-[48px]',
  2: 'text-[32px] leading-[40px]',
  3: 'text-[24px] leading-[32px]',
};

/** Playfair serif heading in ink. level controls tag + size (1=40, 2=32, 3=24). */
export function Heading({ level = 2, children, className = '', ...rest }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  return (
    <Tag className={`font-serif text-ink ${sizeClasses[level]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
