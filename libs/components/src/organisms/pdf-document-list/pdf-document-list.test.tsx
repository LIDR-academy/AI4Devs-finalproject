import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { PDF_DOCUMENT_LIST_LOADING_TEST_ID, PdfDocumentList } from './pdf-document-list';

jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

const mockUseLocalization = useLocalization as jest.Mock;

/** Resolves pdfList keys so molecule-owned copy matches prior prop-driven expectations. */
const defaultT = (key: string, options?: Record<string, unknown>) => {
  if (key === 'pdfList.createdDate') return String(options?.date ?? '');
  if (key === 'pdfList.pageCount') return `${options?.count} pages`;
  if (key === 'pdfList.status.ready') return 'Ready to generate';
  if (key === 'pdfList.status.failed') return 'Generation failed';
  if (key === 'pdfList.status.generated') return 'Lesson ready';
  if (key === 'pdfList.action.generate') return 'Generate';
  if (key === 'pdfList.action.retry') return 'Retry';
  if (key === 'pdfList.action.openLesson') return 'Open lesson';
  if (key === 'pdfList.action.generateA11y') return `Generate ${options?.filename}`;
  if (key === 'pdfList.action.retryA11y') return `Retry ${options?.filename}`;
  if (key === 'pdfList.action.openLessonA11y') return `Open lesson for ${options?.filename}`;
  if (key === 'pdfList.delete.action') return `Delete ${options?.filename}`;
  return key;
};

const documents = [
  {
    id: 'doc-2',
    filename: 'newer.pdf',
    status: 'ready' as const,
    createdAt: '2026-07-14T12:00:00.000Z',
    pageCount: 8,
  },
  {
    id: 'doc-1',
    filename: 'older.pdf',
    status: 'generated' as const,
    createdAt: '2026-07-10T12:00:00.000Z',
    pageCount: 12,
  },
];

describe('PdfDocumentList', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue({ t: defaultT, locale: 'en' });
  });

  // @s15 — loading shows a progress indicator.
  it('renders the loading indicator while state is loading', async () => {
    await render(
      <PdfDocumentList
        state="loading"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByTestId('pdf-document-list-loading-indicator')).toBeTruthy();
  });

  it('renders a polite visually-hidden live-region loading label beside the spinner', async () => {
    await render(
      <PdfDocumentList
        state="loading"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    const loadingText = screen.getByText('pdfList.loading');
    expect(loadingText.props.accessibilityLiveRegion).toBe('polite');
    expect(loadingText).toHaveStyle({
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
    });
    expect(
      screen.getByTestId(PDF_DOCUMENT_LIST_LOADING_TEST_ID).props.accessibilityRole,
    ).toBeUndefined();
  });

  // @s1 — content lists each PDF with filename + status + date + pages.
  it('renders each document filename, status, date, and page count', async () => {
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText('newer.pdf')).toBeTruthy();
    expect(screen.getByText('Ready to generate')).toBeTruthy();
    expect(screen.getByText(/Jul(y)?\s*14,?\s*2026/)).toBeTruthy();
    expect(screen.getByText('8 pages')).toBeTruthy();
    expect(screen.getByText('older.pdf')).toBeTruthy();
    expect(screen.getByText('Lesson ready')).toBeTruthy();
  });

  it('renders content documents in a FlatList for virtualization', async () => {
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByTestId('pdf-document-list')).toBeTruthy();
  });

  it('extracts each document id as the FlatList key', async () => {
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    const list = screen.getByTestId('pdf-document-list');
    expect(list.props.keyExtractor(documents[0])).toBe('doc-2');
    expect(list.props.keyExtractor(documents[1])).toBe('doc-1');
  });

  // @s5 — Generate forwards document id.
  it('calls onGenerate with the document id when Generate is pressed', async () => {
    const onGenerate = jest.fn();
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={onGenerate}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Generate newer.pdf' }));
    expect(onGenerate).toHaveBeenCalledWith('doc-2');
  });

  // @s7 — Open lesson forwards document id.
  it('calls onOpenLesson with the document id when Open lesson is pressed', async () => {
    const onOpenLesson = jest.fn();
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={onOpenLesson}
        onRetry={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Open lesson for older.pdf' }));
    expect(onOpenLesson).toHaveBeenCalledWith('doc-1');
  });

  // @s14 — empty state.
  it('renders the empty-state message when state is empty', async () => {
    await render(
      <PdfDocumentList
        state="empty"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText('pdfList.empty')).toBeTruthy();
    expect(screen.queryByText('newer.pdf')).toBeNull();
  });

  // @s16 — error + retry.
  it('renders the error message and calls onRetry when retry is pressed', async () => {
    const onRetry = jest.fn();
    await render(
      <PdfDocumentList
        state="error"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('pdfList.error')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'pdfList.retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // @s21 — loading / empty / error announced.
  it('announces loading, empty, and error states via AccessibilityInfo', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});

    await render(
      <PdfDocumentList
        state="loading"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(announceSpy).toHaveBeenCalledWith('pdfList.loading');

    announceSpy.mockClear();
    await render(
      <PdfDocumentList
        state="empty"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(announceSpy).toHaveBeenCalledWith('pdfList.empty');

    announceSpy.mockClear();
    await render(
      <PdfDocumentList
        state="error"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(announceSpy).toHaveBeenCalledWith('pdfList.error');

    announceSpy.mockRestore();
  });

  // @s21 — accessible action names.
  it('exposes accessible action names per document', async () => {
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Generate newer.pdf' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open lesson for older.pdf' })).toBeTruthy();
  });

  // @s21 — each row exposes an accessible name.
  it('exposes an accessible name on each document row', async () => {
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('newer.pdf, Ready to generate')).toBeTruthy();
    expect(screen.getByLabelText('older.pdf, Lesson ready')).toBeTruthy();
  });

  // @s11/@s21 — delete only for ready/failed when onDelete is provided.
  it('exposes an accessible delete control for deletable documents when onDelete is provided', async () => {
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Delete newer.pdf' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Delete older.pdf' })).toBeNull();
  });

  // @s12 — delete → confirm → onDelete(id).
  it('calls onDelete with the document id only after the confirmation is accepted', async () => {
    const onDelete = jest.fn();
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete newer.pdf' }));
    });

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText('pdfList.delete.confirmHeadline')).toBeTruthy();
    expect(screen.getByText('pdfList.delete.confirmBody')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'pdfList.delete.confirmAction' }));
    });

    expect(onDelete).toHaveBeenCalledWith('doc-2');
    expect(screen.queryByText('pdfList.delete.confirmHeadline')).toBeNull();
  });

  // @s13 — dismiss keeps the PDF.
  it('does not call onDelete when the confirmation is dismissed', async () => {
    const onDelete = jest.fn();
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete newer.pdf' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'pdfList.delete.cancelAction' }));
    });

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText('pdfList.delete.confirmHeadline')).toBeNull();
  });

  it('does not call onDelete when the pending document id is empty', async () => {
    const onDelete = jest.fn();
    await render(
      <PdfDocumentList
        state="content"
        documents={[
          {
            ...documents[0],
            id: '',
            filename: 'blank.pdf',
          },
        ]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete blank.pdf' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'pdfList.delete.confirmAction' }));
    });

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('does not announce error or empty labels while state is content', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});

    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(announceSpy).not.toHaveBeenCalledWith('pdfList.error');
    expect(announceSpy).not.toHaveBeenCalledWith('pdfList.empty');
    expect(announceSpy).not.toHaveBeenCalledWith('pdfList.loading');
    announceSpy.mockRestore();
  });

  it('re-announces when the loading label changes while state stays loading', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    mockUseLocalization.mockReturnValue({
      t: (key: string) => (key === 'pdfList.loading' ? 'Loading PDFs…' : key),
      locale: 'en',
    });

    const { rerender } = await render(
      <PdfDocumentList
        state="loading"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(announceSpy).toHaveBeenCalledWith('Loading PDFs…');

    announceSpy.mockClear();
    mockUseLocalization.mockReturnValue({
      t: (key: string) => (key === 'pdfList.loading' ? 'Still loading PDFs…' : key),
      locale: 'en',
    });
    await rerender(
      <PdfDocumentList
        state="loading"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(announceSpy).toHaveBeenCalledWith('Still loading PDFs…');
    announceSpy.mockRestore();
  });

  // Mutation: `onDelete &&` → true — omit onDelete and delete must stay hidden.
  it('does not offer delete when onDelete is omitted', async () => {
    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Delete newer.pdf' })).toBeNull();
  });

  // @s11 — generated rows never expose delete even when onDelete is wired.
  it('does not offer delete for generated rows when onDelete is provided', async () => {
    await render(
      <PdfDocumentList
        state="content"
        documents={[documents[1]!]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull();
  });

  // Mutation: emptied renderItem deps — must call the latest onGenerate after rerender.
  it('calls the latest onGenerate after the prop updates', async () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={first}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    await act(async () => {
      rerender(
        <PdfDocumentList
          state="content"
          documents={documents}
          onGenerate={second}
          onOpenLesson={jest.fn()}
          onRetry={jest.fn()}
        />,
      );
    });

    fireEvent.press(screen.getByRole('button', { name: 'Generate newer.pdf' }));
    expect(second).toHaveBeenCalledWith('doc-2');
    expect(first).not.toHaveBeenCalled();
  });

  // Mutation: PdfDocumentListRow handleOpenLesson deps → [] — stale onOpenLesson.
  it('calls the latest onOpenLesson after the prop updates', async () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={first}
        onRetry={jest.fn()}
      />,
    );

    await act(async () => {
      rerender(
        <PdfDocumentList
          state="content"
          documents={documents}
          onGenerate={jest.fn()}
          onOpenLesson={second}
          onRetry={jest.fn()}
        />,
      );
    });

    fireEvent.press(screen.getByRole('button', { name: 'Open lesson for older.pdf' }));
    expect(second).toHaveBeenCalledWith('doc-1');
    expect(first).not.toHaveBeenCalled();
  });

  // Mutation: PdfDocumentListRow handleDelete deps → [] — stale item.id after list update.
  it('requests delete for the current row id after documents are replaced', async () => {
    const onDelete = jest.fn();
    const firstDocs = [
      {
        ...documents[0],
        id: 'doc-old',
        filename: 'swap.pdf',
      },
    ];
    const secondDocs = [
      {
        ...documents[0],
        id: 'doc-new',
        filename: 'swap.pdf',
      },
    ];

    const { rerender } = await render(
      <PdfDocumentList
        state="content"
        documents={firstDocs}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
        onDelete={onDelete}
      />,
    );

    await act(async () => {
      rerender(
        <PdfDocumentList
          state="content"
          documents={secondDocs}
          onGenerate={jest.fn()}
          onOpenLesson={jest.fn()}
          onRetry={jest.fn()}
          onDelete={onDelete}
        />,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete swap.pdf' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'pdfList.delete.confirmAction' }));
    });

    expect(onDelete).toHaveBeenCalledWith('doc-new');
    expect(onDelete).not.toHaveBeenCalledWith('doc-old');
  });

  // Mutation: emptied StyleSheet empty/error tokens.
  it('styles the empty and error copy with theme colors', async () => {
    const flattenStyle = (style: unknown): Record<string, unknown> =>
      Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

    await render(
      <PdfDocumentList
        state="empty"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(flattenStyle(screen.getByText('pdfList.empty').props.style).color).toBeTruthy();

    await render(
      <PdfDocumentList
        state="error"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(flattenStyle(screen.getByText('pdfList.error').props.style).color).toBeTruthy();
  });

  // Mutation: emptied root/list/listContent/errorBanner StyleSheet objects.
  it('applies flex layout on the content list and error banner container', async () => {
    const flattenStyle = (style: unknown): Record<string, unknown> =>
      Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

    await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    const list = screen.getByTestId('pdf-document-list');
    const listFlat = flattenStyle(list.props.style);
    expect(listFlat.flex).toBe(1);
    const rootFlat = flattenStyle(list.parent?.props?.style);
    expect(rootFlat.flex).toBe(1);

    await render(
      <PdfDocumentList
        state="error"
        documents={[]}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    const errorText = screen.getByText('pdfList.error');
    const bannerFlat = flattenStyle(errorText.parent?.props?.style);
    expect(bannerFlat.backgroundColor).toBeTruthy();
  });

  // Mutation: keyExtractor deps `[]` → `["Stryker…"]` — extractor must stay referentially stable.
  it('keeps a stable FlatList keyExtractor identity across rerenders', async () => {
    const { rerender } = await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={jest.fn()}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    const first = screen.getByTestId('pdf-document-list').props.keyExtractor;

    await act(async () => {
      rerender(
        <PdfDocumentList
          state="content"
          documents={documents}
          onGenerate={jest.fn()}
          onOpenLesson={jest.fn()}
          onRetry={jest.fn()}
        />,
      );
    });

    expect(screen.getByTestId('pdf-document-list').props.keyExtractor).toBe(first);
    expect(first(documents[0])).toBe('doc-2');
  });

  // Full-review minor [perf] — renderItem must stay stable when parent callbacks are stable.
  it('keeps a stable FlatList renderItem identity across rerenders when callbacks are stable', async () => {
    const onGenerate = jest.fn();
    const onOpenLesson = jest.fn();
    const onRetry = jest.fn();
    const { rerender } = await render(
      <PdfDocumentList
        state="content"
        documents={documents}
        onGenerate={onGenerate}
        onOpenLesson={onOpenLesson}
        onRetry={onRetry}
      />,
    );
    const first = screen.getByTestId('pdf-document-list').props.renderItem;

    await act(async () => {
      rerender(
        <PdfDocumentList
          state="content"
          documents={documents}
          onGenerate={onGenerate}
          onOpenLesson={onOpenLesson}
          onRetry={onRetry}
        />,
      );
    });

    expect(screen.getByTestId('pdf-document-list').props.renderItem).toBe(first);
  });
});
