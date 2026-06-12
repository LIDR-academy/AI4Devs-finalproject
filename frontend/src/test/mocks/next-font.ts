// Mock for next/font/google and next/font/local in jsdom test environment.
// next/font uses Next.js-specific loaders that are not available in Vitest.
// This mock returns the shape that next/font functions return at runtime.

const mockFont = () => ({
  className: 'mock-font',
  variable: '--mock-font',
  style: { fontFamily: 'mock' },
});

export const Geist = mockFont;
export const GeistMono = mockFont;
export const Inter = mockFont;
export const Roboto = mockFont;
export const Lato = mockFont;
export const Montserrat = mockFont;
export const Open_Sans = mockFont;
export const Poppins = mockFont;

// Default export for local fonts
export default mockFont;
