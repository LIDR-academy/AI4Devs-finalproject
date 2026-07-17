jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  usePdfDocuments: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));

/** Capture list props so mutation tests can invoke onOpenLesson with a missing id. */
const capturedListProps: {
  current?: { onOpenLesson: (id: string) => void };
} = {};
jest.mock('@helsoft/components', () => {
  const actual = jest.requireActual('@helsoft/components') as typeof import('@helsoft/components');
  return {
    ...actual,
    PdfDocumentList: (props: Parameters<typeof actual.PdfDocumentList>[0]) => {
      capturedListProps.current = props;
      return actual.PdfDocumentList(props);
    },
  };
});

import { usePdfDocuments } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

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
  if (key === 'pdfList.delete.failed') return "We couldn't delete that PDF.";
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

  // @s13 — disabling creation keeps existing generated lessons openable.
  it('hides Generate while preserving Open lesson when onGenerate is omitted', async () => {
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

    await render(<PdfDocuments onOpenLesson={onOpenLesson} />);

    expect(screen.queryByRole('button', { name: 'Generate notes.pdf' })).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Open lesson for done.pdf' }));
    expect(onOpenLesson).toHaveBeenCalledWith('lesson-42');
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

  // Mutation: `if (reloadToken === undefined) return` → `if (false) return`.
  it('does not refetch when reloadToken stays omitted even if refetch identity changes', async () => {
    const refetch1 = jest.fn();
    const refetch2 = jest.fn();
    mockUsePdfDocuments.mockReturnValue(docsValue({ refetch: refetch1 }));

    const { rerender } = await render(
      <PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />,
    );

    mockUsePdfDocuments.mockReturnValue(docsValue({ refetch: refetch2 }));
    await act(async () => {
      rerender(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    });

    expect(refetch1).not.toHaveBeenCalled();
    expect(refetch2).not.toHaveBeenCalled();
  });

  // Mutation: drop `.trim()` / `if (!lessonId)` / find predicate / optional chaining.
  it('does not open a lesson when lessonId is whitespace-only', async () => {
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-gen',
            filename: 'done.pdf',
            pageCount: 3,
            createdAt: '2026-07-11T12:00:00.000Z',
            status: 'generated',
            lessonId: '   ',
          },
        ],
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    fireEvent.press(screen.getByRole('button', { name: 'Open lesson for done.pdf' }));

    expect(onOpenLesson).not.toHaveBeenCalled();
  });

  // Mutation: `?.lessonId.trim()` without optional on lessonId — null must not throw.
  it('does not throw when a generated row has a null lessonId', async () => {
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-gen',
            filename: 'done.pdf',
            pageCount: 3,
            createdAt: '2026-07-11T12:00:00.000Z',
            status: 'generated',
            lessonId: null,
          },
        ],
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    expect(() => {
      fireEvent.press(screen.getByRole('button', { name: 'Open lesson for done.pdf' }));
    }).not.toThrow();
    expect(onOpenLesson).not.toHaveBeenCalled();
  });

  it('does not throw when Open lesson is pressed for an unknown document id', async () => {
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
    expect(() => {
      capturedListProps.current?.onOpenLesson('missing-id');
    }).not.toThrow();
    expect(onOpenLesson).not.toHaveBeenCalled();
  });

  it('opens the lessonId of the pressed row, not the first document', async () => {
    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-a',
            filename: 'first.pdf',
            pageCount: 1,
            createdAt: '2026-07-13T12:00:00.000Z',
            status: 'generated',
            lessonId: 'lesson-a',
          },
          {
            id: 'doc-b',
            filename: 'second.pdf',
            pageCount: 2,
            createdAt: '2026-07-12T12:00:00.000Z',
            status: 'generated',
            lessonId: 'lesson-b',
          },
        ],
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    fireEvent.press(screen.getByRole('button', { name: 'Open lesson for second.pdf' }));

    expect(onOpenLesson).toHaveBeenCalledWith('lesson-b');
    expect(onOpenLesson).not.toHaveBeenCalledWith('lesson-a');
  });

  // Mutation: empty useCallback deps — must see the latest onOpenLesson after rerender.
  it('calls the latest onOpenLesson after the prop updates', async () => {
    const first = jest.fn();
    const second = jest.fn();
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

    const { rerender } = await render(
      <PdfDocuments onGenerate={onGenerate} onOpenLesson={first} />,
    );
    await act(async () => {
      rerender(<PdfDocuments onGenerate={onGenerate} onOpenLesson={second} />);
    });
    fireEvent.press(screen.getByRole('button', { name: 'Open lesson for done.pdf' }));

    expect(second).toHaveBeenCalledWith('lesson-1');
    expect(first).not.toHaveBeenCalled();
  });

  // Mutation: empty deleteDocument deps — must call the latest deleteDocument.
  it('calls the latest deleteDocument after the hook return updates', async () => {
    const firstDelete = jest.fn().mockResolvedValue(undefined);
    const secondDelete = jest.fn().mockResolvedValue(undefined);
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
        deleteDocument: firstDelete,
      }),
    );

    const { rerender } = await render(
      <PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />,
    );
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
        deleteDocument: secondDelete,
      }),
    );
    await act(async () => {
      rerender(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete notes.pdf' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    });

    expect(secondDelete).toHaveBeenCalledWith('doc-ready');
    expect(firstDelete).not.toHaveBeenCalled();
  });

  // Mutation: emptied StyleSheet root/heading — layout tokens must remain.
  it('applies row layout styles on the heading container', async () => {
    mockUsePdfDocuments.mockReturnValue(docsValue());
    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);

    const heading = screen.getByText('Your PDFs');
    const flat = Object.assign(
      {},
      ...[heading.props.style].flat(Infinity).filter(Boolean),
    ) as Record<string, unknown>;
    expect(flat.color).toBeTruthy();
  });

  // Mutation: `root: {}` — wiring root must flex to fill the screen column.
  it('applies flex:1 on the PdfDocuments root container', async () => {
    mockUsePdfDocuments.mockReturnValue(docsValue());
    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    const root = screen.getByText('Your PDFs').parent;
    const flat = Object.assign(
      {},
      ...[root?.props?.style].flat(Infinity).filter(Boolean),
    ) as Record<string, unknown>;
    expect(flat.flex).toBe(1);
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

  // Full-review major [a11y]/[code] WCAG 4.1.3 — surface delete failure while keeping content.
  it('shows a delete-failure banner when content has an error', async () => {
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
        error: new Error('delete failed'),
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);

    expect(screen.getByText('notes.pdf')).toBeTruthy();
    expect(screen.queryByText("We couldn't load your PDFs.")).toBeNull();
    expect(screen.getByText("We couldn't delete that PDF.")).toBeTruthy();
  });

  it('announces delete failure via AccessibilityInfo when content shows a delete error', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});

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
        error: new Error('delete failed'),
      }),
    );

    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);

    expect(announceSpy).toHaveBeenCalledWith("We couldn't delete that PDF.");
    announceSpy.mockRestore();
  });

  // Mutation: announce effect deps → [] — must re-announce when error appears after content mount.
  it('announces delete failure when error appears after a successful content load', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    const deleteFailed = "We couldn't delete that PDF.";
    const contentDocs = [
      {
        id: 'doc-ready',
        filename: 'notes.pdf',
        pageCount: 12,
        createdAt: '2026-07-13T12:00:00.000Z',
        status: 'ready' as const,
        lessonId: null,
      },
    ];

    mockUsePdfDocuments.mockReturnValue(docsValue({ documents: contentDocs }));
    const { rerender } = await render(
      <PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />,
    );
    expect(announceSpy).not.toHaveBeenCalledWith(deleteFailed);

    mockUsePdfDocuments.mockReturnValue(
      docsValue({ documents: contentDocs, error: new Error('delete failed') }),
    );
    await act(async () => {
      rerender(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    });

    expect(announceSpy).toHaveBeenCalledWith(deleteFailed);
    announceSpy.mockRestore();
  });

  it('does not show the delete-failure banner while loading or on load error', async () => {
    mockUsePdfDocuments.mockReturnValue(
      docsValue({ isLoading: true, error: new Error('delete failed') }),
    );
    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    expect(screen.queryByText("We couldn't delete that PDF.")).toBeNull();

    mockUsePdfDocuments.mockReturnValue(
      docsValue({ error: new Error('load failed'), documents: [] }),
    );
    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    expect(screen.queryByText("We couldn't delete that PDF.")).toBeNull();
    expect(screen.getByText("We couldn't load your PDFs.")).toBeTruthy();
  });

  it('does not announce delete failure unless content shows a delete error', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    const deleteFailed = "We couldn't delete that PDF.";

    mockUsePdfDocuments.mockReturnValue(
      docsValue({
        documents: [
          {
            id: 'doc-1',
            filename: 'one.pdf',
            pageCount: 1,
            createdAt: '2026-07-13T12:00:00.000Z',
            status: 'ready',
            lessonId: null,
          },
        ],
      }),
    );
    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    expect(announceSpy).not.toHaveBeenCalledWith(deleteFailed);

    announceSpy.mockClear();
    mockUsePdfDocuments.mockReturnValue(
      docsValue({ isLoading: true, error: new Error('delete failed') }),
    );
    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    expect(announceSpy).not.toHaveBeenCalledWith(deleteFailed);

    announceSpy.mockClear();
    mockUsePdfDocuments.mockReturnValue(
      docsValue({ error: new Error('load failed'), documents: [] }),
    );
    await render(<PdfDocuments onGenerate={onGenerate} onOpenLesson={onOpenLesson} />);
    expect(announceSpy).not.toHaveBeenCalledWith(deleteFailed);

    announceSpy.mockRestore();
  });
});
