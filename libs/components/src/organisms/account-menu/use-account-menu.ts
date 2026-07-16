import { useEffect, useState } from 'react';

type BrowserDocument = {
  addEventListener: (type: string, listener: (event: { key?: string }) => void) => void;
  removeEventListener: (type: string, listener: (event: { key?: string }) => void) => void;
};

export const useAccountMenu = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const browserDocument = (globalThis as { document?: BrowserDocument }).document;
    if (!open || !browserDocument) return;

    const onKeyDown = (event: { key?: string }) => {
      if (event.key === 'Escape') setOpen(false);
    };

    browserDocument.addEventListener('keydown', onKeyDown);
    return () => browserDocument.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return { open, setOpen };
};
