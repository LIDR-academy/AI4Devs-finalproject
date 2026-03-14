import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '../../lib/i18n/config';
import ReCaptchaProvider from '../components/ReCaptchaProvider';
import QueryProvider from '../components/QueryProvider';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  // Validar locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Cargar mensajes para el locale
  const messages = await getMessages();

  // No incluimos <html> y <body> aquí porque están en el layout raíz
  // Solo envuelto con los providers necesarios
  return (
    <QueryProvider>
      <ReCaptchaProvider locale={locale}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </ReCaptchaProvider>
    </QueryProvider>
  );
}
