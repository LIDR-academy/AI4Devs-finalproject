import React from 'react';
import Link from 'next/link';
import { Heading, Label } from '@/components/shared/ui';

const COMPANY_LINKS = [
  { label: 'Sustainability', href: '#' },
  { label: 'Press Kit', href: '#' },
];
const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Contact', href: '#' },
];

/** Global editorial footer: brand blurb + Company/Legal link columns + copyright. */
export function Footer() {
  return (
    <footer className="border-t border-divider bg-canvas px-16 py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Heading level={3} className="tracking-[0.12em] uppercase">STAYHUB</Heading>
          <p className="mt-4 max-w-xs font-sans text-sm text-taupe">
            Curated hospitality for the modern traveler.
          </p>
        </div>
        <nav aria-label="Company">
          <Label>Company</Label>
          <ul className="mt-4 space-y-3">
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="font-sans text-sm text-taupe transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Legal">
          <Label>Legal</Label>
          <ul className="mt-4 space-y-3">
            {LEGAL_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="font-sans text-sm text-taupe transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-12 max-w-6xl font-sans text-xs text-taupe">
        © 2024 StayHub Boutique Hospitality. All rights reserved.
      </p>
    </footer>
  );
}
