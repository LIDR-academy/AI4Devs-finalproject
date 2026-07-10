jest.mock('../dao/pdf-upload.dao', () => ({
  PdfUploadDao: {
    uploadPdf: jest.fn(),
    insertDocument: jest.fn(),
    invokeExtraction: jest.fn(),
  },
}));

import { PdfUploadDao } from '../dao/pdf-upload.dao';
import { PdfExtractionService } from './pdf-extraction.service';

const dao = PdfUploadDao as jest.Mocked<typeof PdfUploadDao>;

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('PdfExtractionService', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s1/@s4 — the happy path uploads through the DAO, inserts the document row, invokes
  // extraction, and returns the typed result — going through service -> DAO only, never
  // parsing the PDF itself (@s4).
  it('extract generates a documentId, uploads, inserts, invokes extraction, and returns the typed result', async () => {
    dao.uploadPdf.mockResolvedValue({ path: 'ignored' } as never);
    dao.insertDocument.mockResolvedValue({ id: 'ignored' } as never);
    const extractionResult = {
      documentId: 'ignored',
      filename: 'notes.pdf',
      pageCount: 2,
      imageCount: 1,
      pages: [],
      images: [],
    };
    dao.invokeExtraction.mockResolvedValue(extractionResult);

    const bytes = new Uint8Array([1, 2, 3]);
    const result = await PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes }, 'user-1');

    expect(result).toBe(extractionResult);

    const [uploadArgs] = dao.uploadPdf.mock.calls[0];
    expect(uploadArgs).toEqual({ userId: 'user-1', documentId: expect.stringMatching(UUID_V4_PATTERN), bytes });

    const [insertArgs] = dao.insertDocument.mock.calls[0];
    expect(insertArgs).toEqual({
      documentId: uploadArgs.documentId,
      userId: 'user-1',
      filename: 'notes.pdf',
      sizeBytes: 3,
    });

    expect(dao.invokeExtraction).toHaveBeenCalledWith(uploadArgs.documentId);
  });

  // Uniqueness — two separate extract() calls generate two different documentIds, so concurrent
  // uploads never collide on the same storage path/row.
  it('generates a different documentId for each extract() call', async () => {
    dao.uploadPdf.mockResolvedValue({} as never);
    dao.insertDocument.mockResolvedValue({} as never);
    dao.invokeExtraction.mockResolvedValue({} as never);

    await PdfExtractionService.extract({ filename: 'a.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1');
    await PdfExtractionService.extract({ filename: 'b.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1');

    const firstId = dao.uploadPdf.mock.calls[0][0].documentId;
    const secondId = dao.uploadPdf.mock.calls[1][0].documentId;
    expect(firstId).not.toBe(secondId);
  });
});
