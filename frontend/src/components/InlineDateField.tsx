interface InlineDateFieldProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
}

export function InlineDateField({
  value,
  onChange,
  disabled,
  label,
}: InlineDateFieldProps) {
  return (
    <input
      type="date"
      className="tracker-date"
      value={value ?? ''}
      disabled={disabled}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
