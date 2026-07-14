jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  usePdfDocuments: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));

import { usePdfDocuments } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { PdfDocuments } from './pdf-documents';

const mockUsePdfDocuments = usePdfDocuments as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;

const t = (key: string, options?: Record<string, unknown>) => {
  if (key === 'pdfList.heading') return 'Your PDFs';
  if (key === 'pdfList.loading') return 'Loading your PDFs…';
  if (key === 'pdfList.empty') return 'No extracted PDFs yet. Upload one to get started.';
  if (key === 'pdfList.error') return "We couldn't load your PDFs.";
  if (key === 'pdfList.retry') return 'Try again';
  if (key === 'pdfList.status.ready') return 'Ready to generate';
  if (key === 'pdfList.status.failed') return 'Generation failed';
  if (key === 'pdfList.status.generated') return 'Lesson ready';
  if (key === 'pdfList.action.generate') return 'Generate';
  if (key === 'pdfList.action.retry') return 'Retry';
  if (key === 'pdfList.action.openLesson') return 'Open lesson';
  if (key === 'pdfList.action.generateA11y') return `Generate ${options?.filename}`;
  if (key === 'pdfList.action.retryA11y') return `Retry ${options?.filename}`;
  if (key === 'pdfList.action.openLessonA11y') return `Open lesson for ${options?.filename}`;
  if (key === 'pdfList.createdDate') return String(options?.date ?? '');
  if (key === 'pdfList.pageCount') return `${options?.count} pages`;
  if (key === 'pdfList.delete.action') return `Delete ${options?.filename}`;
  if (key === 'pdfList.delete.confirmHeadline') return 'Delete this PDF?';
  if (key === 'pdfList.delete.confirmBody') {
    return 'This permanently removes the PDF and its extracted data.';
  }
  if (key === 'pdfList.delete.confirmAction') return 'Delete';
  if (key === 'pdfList.delete.cancelAction') return 'Cancel';
  return key;
};

const docsValue = (overrides: Partial<ReturnType<typeof usePdfDocuments>> = {}) => ({
  documents: [],
  isLoading: false,
  error: null,
  refetch: jest.fn(),
  deleteDocument: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const noop = () => {};

describe('PdfDocuments', () => {
  const onGenerate = jest.fn();
  const onOpenLesson = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue({ t, locale: 'en' }));
  });

  // @s15 — loading.
  it('shows the loading indicator while documents are loading', async () => {
    mockUsePdfDocuments.mockReturnValue(docsValue({ isLoading: true }));

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);

    expect(screen.getByTestId('pdf-document-list-loading-indicator')).toBeTruthy();
    expect(screen.getByText('Loading your PDFs…')).toBeTruthy();
  });

  // @s14 — empty.
  it('shows the empty state when there are no documents', async () => {
    mockUsePdfDocuments.mockReturnValue(docsValue());

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);

    expect(screen.getByText('No extracted PDFs yet. Upload one to get started.')).toBeTruthy();
  });

  // @s1/@s2/@s3/@s4 — content rows with status labels.
  it('renders document filenames and status labels from usePdfDocuments', async () => {
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-1',
            filename: 'notes.pdf',
            pageCount: 12,
            createdAt: '2026-07-13T12:00:00.000Z',
            status: 'ready',
            lessonId: null,
          },
          {
            id: 'doc-2',
            filename: 'failed.pdf',
            pageCount: 4,
            createdAt: '2026-07-12T12:00:00.000Z',
            status: 'failed',
            lessonId: null,
          },
          {
            id: 'doc-3',
            filename: 'done.pdf',
            pageCount: 3,
            createdAt: '2026-07-11T12:00:00.000Z',
            status: 'generated',
            lessonId: 'lesson-9',
          },
        ],
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);

    expect(screen.getByText('Your PDFs')).toBeTruthy();
    expect(screen.getByText('notes.pdf')).toBeTruthy();
    expect(screen.getByText('Ready to generate')).toBeTruthy();
    expect(screen.getByText('Generation failed')).toBeTruthy();
    expect(screen.getByText('Lesson ready')).toBeTruthy();
    expect(screen.getByText(/Jul(y)?\s*13,?\s*2026/)).toBeTruthy();
  });

  // @s5 — Generate raises onGenerate(documentId).
  it('raises onGenerate with the document id when Generate is pressed', async () => {
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-ready',
            filename: 'notes.pdf',
            pageCount: 12,
            createdAt: '2026-07-13T12:00:00.000Z',
            status: 'ready',
            lessonId: null,
          },
        ],
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    fireEvent.press(screen.getByRole('button', { name: 'Generate notes.pdf' }));

    expect(onGenerate).toHaveBeenCalledWith('doc-ready');
    expect(onOpenLesson).not.toHaveBeenCalled();
  });

  // @s6 — Retry raises onGenerate(documentId).
  it('raises onGenerate with the document id when Retry is pressed', async () => {
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-failed',
            filename: 'failed.pdf',
            pageCount: 4,
            createdAt: '2026-07-12T12:00:00.000Z',
            status: 'failed',
            lessonId: null,
          },
        ],
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    fireEvent.press(screen.getByRole('button', { name: 'Retry failed.pdf' }));

    expect(onGenerate).toHaveBeenCalledWith('doc-failed');
  });

  // @s7 — Open lesson raises onOpenLesson(lessonId), not document id.
  it('raises onOpenLesson with the lesson id when Open lesson is pressed', async () => {
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-gen',
            filename: 'done.pdf',
            pageCount: 3,
            createdAt: '2026-07-11T12:00:00.000Z',
            status: 'generated',
            lessonId: 'lesson-42',
          },
        ],
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    fireEvent.press(screen.getByRole('button', { name: 'Open lesson for done.pdf' }));

    expect(onOpenLesson).toHaveBeenCalledWith('lesson-42');
    expect(onGenerate).not.toHaveBeenCalled();
  });

  // @s16 — error + retry wired to refetch.
  it('shows error copy and retries via refetch', async () => {
    const refetch = jest.fn();
    mockUsePdfDocuments.mockReturnValue(docsValue({ error: new Error('network'), refetch }));

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);

    expect(screen.getByText("We couldn't load your PDFs.")).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  // @s12 — confirm delete calls deleteDocument.
  it('calls deleteDocument when delete is confirmed', async () => {
    const deleteDocument = jest.fn().mockResolvedValue(undefined);
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-ready',
            filename: 'notes.pdf',
            pageCount: 12,
            createdAt: '2026-07-13T12:00:00.000Z',
            status: 'ready',
            lessonId: null,
          },
        ],
        deleteDocument,
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete notes.pdf' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    });

    expect(deleteDocument).toHaveBeenCalledWith('doc-ready');
  });

  // @s13 — dismiss keeps the document.
  it('does not call deleteDocument when the confirmation is dismissed', async () => {
    const deleteDocument = jest.fn().mockResolvedValue(undefined);
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-ready',
            filename: 'notes.pdf',
            pageCount: 12,
            createdAt: '2026-07-13T12:00:00.000Z',
            status: 'ready',
            lessonId: null,
          },
        ],
        deleteDocument,
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete notes.pdf' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    });

    expect(deleteDocument).not.toHaveBeenCalled();
  });

  // @s11 — generated rows offer no delete.
  it('does not offer delete for generated documents', async () => {
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-gen',
            filename: 'done.pdf',
            pageCount: 3,
            createdAt: '2026-07-11T12:00:00.000Z',
            status: 'generated',
            lessonId: 'lesson-1',
          },
        ],
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);

    expect(screen.queryByRole('button', { name: 'Delete done.pdf' })).toBeNull();
  });

  // @s9/@s10 — reloadToken change triggers refetch (skips initial mount).
  it('calls refetch when reloadToken changes after mount', async () => {
    const refetch = jest.fn();
    mockUsePdfDocuments.mockReturnValue(docsValue({ refetch }));

    const { rerender } = await render(
      <PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} reloadToken={0} />,
    );
    expect(refetch).not.toHaveBeenCalled();

    await act(async () => {
      rerender(
        <PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} reloadToken={1} />,
      );
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  // Failed delete must not become an unhandled rejection.
  it('does not leave a rejected deleteDocument promise unhandled', async () => {
    const unhandledRejectionSpy = jest.fn();
    process.on('unhandledRejection', unhandledRejectionSpy);

    const deleteDocument = jest.fn().mockRejectedValue(new Error('delete failed'));
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-ready',
            filename: 'notes.pdf',
            pageCount: 12,
            createdAt: '2026-07-13T12:00:00.000Z',
            status: 'ready',
            lessonId: null,
          },
        ],
        deleteDocument,
      }),
    );

    await render(<PdfDocuments onGenerate={noop} onOpenLesson={noop} />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete notes.pdf' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    });
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

    process.off('unhandledRejection', unhandledRejectionSpy);
    expect(deleteDocument).toHaveBeenCalledWith('doc-ready');
    expect(unhandledRejectionSpy).not.toHaveBeenCalled();
  });
});
