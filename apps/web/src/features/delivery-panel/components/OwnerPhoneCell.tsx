interface OwnerPhoneCellProps {
  phone: string | null;
  phoneDisplay?: string | null;
}

export function OwnerPhoneCell({ phone, phoneDisplay }: OwnerPhoneCellProps) {
  if (!phone) {
    return (
      <span className="italic text-slate-400" data-testid="owner-phone-empty">
        Sin teléfono
      </span>
    );
  }

  const label = phoneDisplay ?? phone;

  return (
    <a
      href={`tel:${phone}`}
      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
      aria-label={`Llamar al ${label}`}
    >
      {label}
    </a>
  );
}
