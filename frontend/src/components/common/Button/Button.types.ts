import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button variants following common design patterns
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button component
 * Extends native HTML button attributes for full flexibility
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Whether the button should take full width of its container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether the button is in a loading state
   * Disables the button and shows loading indicator
   * @default false
   */
  isLoading?: boolean;

  /**
   * Icon to display before the button text
   */
  leftIcon?: ReactNode;

  /**
   * Icon to display after the button text
   */
  rightIcon?: ReactNode;

  /**
   * Button content
   */
  children: ReactNode;
}
