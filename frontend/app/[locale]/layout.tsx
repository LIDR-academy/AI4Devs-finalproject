import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '../../lib/i18n/config';
import ReCaptchaProvider from '../components/ReCaptchaProvider';
import QueryProvider from '../components/QueryProvider';
import AppShell from '../components/layout/AppShell';

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
  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // Habilitar renderizado estático (evita lectura de headers)
  setRequestLocale(locale);

  // Cargar mensajes para el locale
  const messages = await getMessages();

  // No incluimos <html> y <body> aquí porque están en el layout raíz
  // Solo envuelto con los providers necesarios
  return (
    <QueryProvider>
      <ReCaptchaProvider locale={locale}>
        <NextIntlClientProvider messages={messages}>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </ReCaptchaProvider>
    </QueryProvider>
  );
}
