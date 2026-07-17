jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useLessonGeneration: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

import { useLessonGeneration } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import type { SupabaseClient } from '@helsoft/supabase-services';
import { initSupabase } from '@helsoft/supabase-services';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { LessonGeneration } from '../lesson-generation/lesson-generation';
import { PdfDocuments } from './pdf-documents';

const mockUseLessonGeneration = useLessonGeneration as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

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

/**
 * Mirrors upload.tsx composition glue (task-12): lifted documentId + reloadToken.
 * Kept here so the screen stays a thin shell with no business logic to unit-test.
 */
const UploadScreenGlue = ({ onOpenLesson }: { onOpenLesson: (lessonId: string) => void }) => {
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [reloadToken, setReloadToken] = useState(0);

  const bumpReload = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  const handleExtracted = useCallback(
    (id: string) => {
      setDocumentId(id);
      bumpReload();
    },
    [bumpReload],
  );

  return (
    <View>
      {/* Stand-in for PdfUpload.onExtracted — press to simulate extract success (@s10). */}
      <Pressable accessibilityRole="button" onPress={() => handleExtracted('doc-from-upload')}>
        <Text>simulate-extract</Text>
      </Pressable>
      <PdfDocuments
        onGenerate={setDocumentId}
        onOpenLesson={onOpenLesson}
        reloadToken={reloadToken}
      />
      <LessonGeneration documentId={documentId} onGenerated={bumpReload} />
      <Text>{documentId ? `active:${documentId}` : 'active:none'}</Text>
      <Text>{`token:${reloadToken}`}</Text>
    </View>
  );
};

const mockUserDocumentsOrder = (rows: unknown[]) => {
  const order = jest.fn().mockResolvedValue({ data: rows, error: null });
  const select = jest.fn(() => ({ order }));
  return { select, order };
};

/**
 * Integration: PdfDocuments → usePdfDocuments → PdfDocumentsService → PdfDocumentsDao
 * + upload-screen composition glue (@s1/@s5/@s6/@s9/@s10).
 */
describe('PdfDocuments integration (wiring → hook → service → DAO + upload glue)', () => {
  let client: SupabaseClient;

  beforeAll(() => {
    client = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseLocalization.mockReturnValue({
      t,
      locale: 'en',
      setLocale: jest.fn(),
      supportedLocales: ['en'],
    });
    mockUseLessonGeneration.mockReturnValue({
      stage: 'idle',
      currentStep: 'reading',
      result: undefined,
      error: undefined,
      generate: jest.fn(),
      retry: jest.fn(),
    });
  });

  afterEach(() => jest.restoreAllMocks());

  // @s1 — list loads through the real chain alongside the upload-screen heading.
  it('loads documents from Supabase and renders filenames newest-first', async () => {
    const { select } = mockUserDocumentsOrder([
      {
        id: 'doc-2',
        filename: 'newer.pdf',
        page_count: 5,
        created_at: '2026-07-14T12:00:00.000Z',
        generation_error_code: null,
        lesson_id: null,
      },
      {
        id: 'doc-1',
        filename: 'older.pdf',
        page_count: 2,
        created_at: '2026-07-13T12:00:00.000Z',
        generation_error_code: null,
        lesson_id: 'lesson-1',
      },
    ]);
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    await render(<PdfDocuments onGenerate={jest.fn()} onOpenLesson={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('newer.pdf')).toBeTruthy());
    expect(screen.getByText('older.pdf')).toBeTruthy();
    expect(screen.getByText('Your PDFs')).toBeTruthy();
    expect(client.from).toHaveBeenCalledWith('user_documents');
  });

  // @s5 — Generate sets the active documentId that feeds LessonGeneration (shared panel).
  it('Generate on a ready row sets the active documentId for the shared panel', async () => {
    const { select } = mockUserDocumentsOrder([
      {
        id: 'doc-ready',
        filename: 'notes.pdf',
        page_count: 12,
        created_at: '2026-07-13T12:00:00.000Z',
        generation_error_code: null,
        lesson_id: null,
      },
    ]);
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    await render(<UploadScreenGlue onOpenLesson={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('notes.pdf')).toBeTruthy());
    expect(screen.getByText('active:none')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Generate notes.pdf' }));
    });

    expect(screen.getByText('active:doc-ready')).toBeTruthy();
  });

  // @s6 — Retry also targets that document via the same onGenerate path.
  it('Retry on a failed row sets the active documentId for the shared panel', async () => {
    const { select } = mockUserDocumentsOrder([
      {
        id: 'doc-failed',
        filename: 'failed.pdf',
        page_count: 4,
        created_at: '2026-07-12T12:00:00.000Z',
        generation_error_code: 'timeout',
        lesson_id: null,
      },
    ]);
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    await render(<UploadScreenGlue onOpenLesson={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('failed.pdf')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Retry failed.pdf' }));
    });

    expect(screen.getByText('active:doc-failed')).toBeTruthy();
  });

  // @s10 — extract success bumps reloadToken (list refetch is covered in unit tests).
  it('bumps reloadToken when a new upload extracts successfully', async () => {
    const { select } = mockUserDocumentsOrder([]);
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    await render(<UploadScreenGlue onOpenLesson={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('token:0')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'simulate-extract' }));
    });

    expect(screen.getByText('token:1')).toBeTruthy();
    expect(screen.getByText('active:doc-from-upload')).toBeTruthy();
  });

  // @s9 — generation success bumps reloadToken so the list can flip to lesson ready.
  it('bumps reloadToken when LessonGeneration fires onGenerated', async () => {
    const { select } = mockUserDocumentsOrder([]);
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    mockUseLessonGeneration.mockReturnValue({
      stage: 'content',
      currentStep: 'reading',
      result: {
        lessonId: 'lesson-new',
        title: 'Ready',
        composition: 'both',
        slides: [],
      },
      error: undefined,
      generate: jest.fn(),
      retry: jest.fn(),
    });

    await render(<UploadScreenGlue onOpenLesson={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('token:1')).toBeTruthy());
  });
});
