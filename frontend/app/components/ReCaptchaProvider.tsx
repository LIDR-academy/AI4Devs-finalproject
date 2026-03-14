'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface ReCaptchaProviderProps {
  children: React.ReactNode;
  locale: string;
}

export default function ReCaptchaProvider({ children, locale }: ReCaptchaProviderProps) {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey} language={locale}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
