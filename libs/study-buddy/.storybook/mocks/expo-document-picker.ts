/**
 * Storybook-only stand-in for expo-document-picker. PdfUpload opens the native picker; in
 * Storybook we cancel so stories stay presentational (panel states come from
 * configurePdfExtractionMock). Real picker wiring is covered by pdf-upload.test.tsx.
 */
export const getDocumentAsync = async (_options?: { type?: string }) => ({
  canceled: true as const,
  assets: null,
});
