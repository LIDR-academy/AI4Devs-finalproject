/**
 * CheckboxGroup Component
 * 
 * T-0506-FRONT: Reusable multi-select checkbox UI
 * 
 * @module CheckboxGroup
 */

export interface CheckboxGroupOption {
  value: string;
  label: string;
  color?: string;
}

export interface CheckboxGroupProps {
  options: CheckboxGroupOption[];
  value: string[];
  onChange: (value: string[]) => void;
  ariaLabel?: string;
}

/**
 * Checkbox item container styles
 */
const CHECKBOX_ITEM_STYLES: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
};

/**
 * Checkbox input styles
 */
const CHECKBOX_INPUT_STYLES: React.CSSProperties = {
  marginRight: '8px',
};

/**
 * Label container styles
 */
const LABEL_STYLES: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

/**
 * Color badge styles
 */
const COLOR_BADGE_STYLES: React.CSSProperties = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  marginLeft: '8px',
  display: 'inline-block',
};

/**
 * CheckboxGroup: Multi-select checkbox list with optional color badges
 * 
 * @param props.options - Array of checkbox options
 * @param props.value - Array of selected values
 * @param props.onChange - Callback with updated array (add/remove)
 * @param props.ariaLabel - Optional aria-label for accessibility
 * 
 * @example
 * ```tsx
 * <CheckboxGroup
 *   options={TIPOLOGIA_OPTIONS}
 *   value={filters.tipologia}
 *   onChange={(tipologia) => setFilters({ tipologia })}
 *   ariaLabel="Filtro de tipología"
 * />
 * ```
 */
export default function CheckboxGroup({ 
  options, 
  value, 
  onChange, 
  ariaLabel 
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string) => {
    if (value.includes(optionValue)) {
      // Remove from array
      onChange(value.filter(v => v !== optionValue));
    } else {
      // Add to array
      onChange([...value, optionValue]);
    }
  };

  return (
    <fieldset aria-label={ariaLabel}>
      {options.map(option => (
        <div key={option.value} style={CHECKBOX_ITEM_STYLES}>
          <input
            type="checkbox"
            id={`checkbox-${option.value}`}
            checked={value.includes(option.value)}
            onChange={() => handleChange(option.value)}
            style={CHECKBOX_INPUT_STYLES}
          />
          <label htmlFor={`checkbox-${option.value}`} style={LABEL_STYLES}>
            {option.label}
            {option.color && (
              <span
                data-testid={`color-badge-${option.value}`}
                style={{
                  ...COLOR_BADGE_STYLES,
                  backgroundColor: option.color,
                }}
              />
            )}
          </label>
        </div>
      ))}
    </fieldset>
  );
}
