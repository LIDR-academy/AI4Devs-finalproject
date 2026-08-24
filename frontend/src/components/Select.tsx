import type { SelectHTMLAttributes } from "react";

export type SelectOption = {
   value: string;
   label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
   options: SelectOption[];
};

export function Select({ options, className, ...props }: SelectProps) {
   return (
      <select className={`select ${className ?? ""}`.trim()} {...props}>
         {options.map((option) => (
            <option key={option.value} value={option.value}>
               {option.label}
            </option>
         ))}
      </select>
   );
}
