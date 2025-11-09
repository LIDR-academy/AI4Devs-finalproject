/**
 * Tests for file download utility functions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    downloadBlob,
    downloadPDF,
    downloadTemplatePDF,
    isDownloadSupported,
} from '../../utils/file-download';

// Mock DOM APIs
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('downloadBlob', () => {
  let mockLink: HTMLAnchorElement;

  beforeEach(() => {
    // Mock document.createElement
    mockLink = {
      href: '',
      download: '',
      style: { display: '' },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a download link and trigger download', () => {
    const blob = new Blob(['test content'], { type: 'application/pdf' });
    const filename = 'test.pdf';

    downloadBlob(blob, filename);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.href).toBe('blob:mock-url');
    expect(mockLink.download).toBe(filename);
    expect(mockLink.style.display).toBe('none');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should handle different file types', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    downloadBlob(blob, 'test.txt');

    expect(mockLink.download).toBe('test.txt');
    expect(mockLink.click).toHaveBeenCalled();
  });
});

describe('downloadPDF', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      style: { display: '' },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn());
    vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should download PDF successfully', async () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    await downloadPDF('https://api.example.com/file.pdf', 'test.pdf');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/file.pdf',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/pdf',
        }),
      })
    );
  });

  it('should include authorization token when provided', async () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    const token = 'test-token-123';
    await downloadPDF('https://api.example.com/file.pdf', 'test.pdf', token);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/file.pdf',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    );
  });

  it('should throw error when download fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(downloadPDF('https://api.example.com/file.pdf', 'test.pdf')).rejects.toThrow(
      'Failed to download PDF: Download failed: Not Found'
    );
  });

  it('should throw error when file is not a PDF', async () => {
    const mockBlob = new Blob(['not pdf'], { type: 'text/html' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    await expect(downloadPDF('https://api.example.com/file', 'test.txt')).rejects.toThrow(
      'Downloaded file is not a PDF'
    );
  });

  it('should handle network errors', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    await expect(downloadPDF('https://api.example.com/file.pdf', 'test.pdf')).rejects.toThrow(
      'Failed to download PDF: Network error'
    );
  });
});

describe('downloadTemplatePDF', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      style: { display: '' },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn());
    vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should download template with sanitized filename', async () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    await downloadTemplatePDF(
      123,
      'Template & Test',
      '1.0',
      'https://api.example.com',
      'token-123'
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/templates/123/download',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
      })
    );
  });

  it('should sanitize special characters in filename', async () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    const mockLink = {
      href: '',
      download: '',
      style: { display: '' },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    await downloadTemplatePDF(
      1,
      'Template (Special) & Test #1',
      '1.0-alpha',
      'https://api.example.com',
      'token'
    );

    // The filename should be sanitized
    expect(mockLink.download).toMatch(/Template_Special_Test_1_v1\.0-alpha\.pdf/);
  });
});

describe('isDownloadSupported', () => {
  it('should return true when download attribute is supported', () => {
    const mockElement = { download: '' } as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement);

    const result = isDownloadSupported();

    expect(result).toBe(true);
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should return false when download attribute is not supported', () => {
    const mockElement = {} as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement);

    const result = isDownloadSupported();

    expect(result).toBe(false);
  });
});

