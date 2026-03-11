/**
 * Utility functions for handling file downloads
 */

/**
 * Download a file from a Blob
 * @param blob - Blob data to download
 * @param filename - Name for the downloaded file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  window.URL.revokeObjectURL(url);
};

/**
 * Download a PDF file from an API endpoint
 * @param url - API endpoint URL
 * @param filename - Name for the downloaded file
 * @param token - Optional JWT token for authentication
 * @throws Error if download fails
 */
export const downloadPDF = async (
  url: string,
  filename: string,
  token?: string
): Promise<void> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/pdf',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Verify it's a PDF
    if (blob.type !== 'application/pdf' && !filename.toLowerCase().endsWith('.pdf')) {
      throw new Error('Downloaded file is not a PDF');
    }

    downloadBlob(blob, filename);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to download PDF: ${error.message}`);
    }
    throw new Error('Failed to download PDF: Unknown error');
  }
};

/**
 * Download template PDF with proper filename formatting
 * @param templateId - Template ID
 * @param templateName - Template name
 * @param version - Template version
 * @param baseUrl - Base API URL
 * @param token - JWT token for authentication
 */
export const downloadTemplatePDF = async (
  templateId: number,
  templateName: string,
  version: string,
  baseUrl: string,
  token: string
): Promise<void> => {
  // Sanitize filename
  const safeName = templateName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  const safeVersion = version.replace(/[^\w.-]/g, '');
  const filename = `${safeName}_v${safeVersion}.pdf`;

  const url = `${baseUrl}/api/v1/templates/${templateId}/download`;

  await downloadPDF(url, filename, token);
};

/**
 * Get file download progress (for large files)
 * @param url - API endpoint URL
 * @param token - Optional JWT token
 * @param onProgress - Callback for progress updates (0-100)
 * @returns Promise with Blob
 */
export const downloadWithProgress = async (
  url: string,
  token?: string,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  const contentLength = response.headers.get('content-length');
  if (!contentLength || !response.body) {
    // No progress tracking available, return blob directly
    return await response.blob();
  }

  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    loaded += value.length;

    if (onProgress) {
      const progress = Math.round((loaded / total) * 100);
      onProgress(progress);
    }
  }

  // Combine chunks into a single Blob
  return new Blob(chunks);
};

/**
 * Check if downloads are supported in the browser
 * @returns true if download attribute is supported
 */
export const isDownloadSupported = (): boolean => {
  const a = document.createElement('a');
  return typeof a.download !== 'undefined';
};

/**
 * Open PDF in new tab instead of downloading
 * @param url - API endpoint URL
 * @param token - Optional JWT token
 */
export const openPDFInNewTab = async (
  url: string,
  token?: string
): Promise<void> => {
  try {
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to open PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Open in new tab
    const newWindow = window.open(blobUrl, '_blank');

    if (!newWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
    }

    // Clean up URL after a delay (to allow the window to load)
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to open PDF: ${error.message}`);
    }
    throw new Error('Failed to open PDF: Unknown error');
  }
};

