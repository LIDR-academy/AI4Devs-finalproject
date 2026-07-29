import type { HTMLAttributes, ReactNode, TableHTMLAttributes } from 'react';
import './Table.css';

export type TableScrollProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function TableScroll({ children, className = '', ...rest }: TableScrollProps) {
  return (
    <div className={`ui-table-scroll ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export type TableProps = TableHTMLAttributes<HTMLTableElement>;

export function Table({ className = '', children, ...rest }: TableProps) {
  return (
    <table className={`ui-table ${className}`.trim()} {...rest}>
      {children}
    </table>
  );
}
