jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

import { useLocalization } from '@helsoft/localization';
import type { Session, SupabaseClient } from '@helsoft/supabase-services';
import { initSupabase } from '@helsoft/supabase-services';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { LessonGeneration } from './lesson-generation';

const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

/**
 * Slice-1 integration (ai-lesson-generation, task-10): LessonGeneration -> useLessonGeneration
 * -> LessonGenerationService -> LessonGenerationDao, exercised for real against a mocked
 * Supabase client boundary (only `auth.getSession`/`onAuthStateChange` and `functions.invoke`
 * are stubbed) — mirrors `api-key.integration.test.ts`'s pattern. `useLocalization` (i18n) and
 * `useRouter` (R4's not-yet-built player) are mocked as orthogonal concerns, same as every
 * LessonGeneration/LessonGenerationPanel unit test.
 */
let client: SupabaseClient;

const authenticatedSession = { access_token: 'tok-1', user: { id: 'user-1' } } as Session;

const mockInvoke = (impl: (...args: unknown[]) => unknown) =>
  jest.spyOn(Object.getPrototypeOf(client.functions), 'invoke').mockImplementation(impl as never);

describe('ai-lesson-generation slice-1 integration (component -> hook -> service -> DAO)', () => {
  beforeAll(() => {
    client = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  beforeEach(() => {
    mockUseLocalization.mockReturnValue(localizationValue());
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    jest.spyOn(client.auth, 'getSession').mockResolvedValue({
      data: { session: authenticatedSession },
      error: null,
    } as never);
    jest
      .spyOn(client.auth, 'onAuthStateChange')
      .mockImplementation(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }) as never);
  });

  afterEach(() => jest.restoreAllMocks());

  // @s1/@s3/@s6/@s16/@s17 — the full happy path for composition "both": pressing Generate with
  // an extracted documentId invokes generate-lesson with { documentId, composition }, and the
  // panel settles to Content with the real assembled deck's slide count.
  it('generates with the default "both" composition and reaches Content with the deck it received', async () => {
    const lesson = {
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both',
      slides: [{}, {}, {}, {}],
    };
    const invoke = jest.fn().mockResolvedValue({ data: lesson, error: null });
    mockInvoke(invoke);
    const t = jest.fn((key: string) => key);
    mockUseLocalization.mockReturnValue(localizationValue({ t }));

    await render(<LessonGeneration documentId="doc-1" />);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'generation.generate', disabled: false }),
      ).toBeTruthy(),
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'generation.generate', disabled: false }));
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'generation.ready.openInPlayer' })).toBeTruthy(),
    );
    expect(t).toHaveBeenCalledWith('generation.ready.slideCount', { count: 4 });
    expect(invoke).toHaveBeenCalledWith('generate-lesson', {
      body: { documentId: 'doc-1', composition: 'both' },
    });
  });
});
