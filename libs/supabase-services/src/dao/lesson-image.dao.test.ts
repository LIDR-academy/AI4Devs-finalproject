jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { getSupabase } from '../supabase/supabase-client';
import { LessonImageDao } from './lesson-image.dao';

const mockGetSupabase = getSupabase as jest.Mock;

describe('LessonImageDao', () => {
  const createSignedUrl = jest.fn();
  const storageFrom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    createSignedUrl.mockReset();
    storageFrom.mockReset();
    storageFrom.mockReturnValue({ createSignedUrl });
    mockGetSupabase.mockReturnValue({ storage: { from: storageFrom } });
  });

  // @s7 feed — signed URL from pdf-images bucket + storagePath.
  it('createSignedUrl requests a signed URL from the pdf-images bucket', async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://example.com/signed.png' },
      error: null,
    });

    const url = await LessonImageDao.createSignedUrl('user/doc/img.png', 120);

    expect(storageFrom).toHaveBeenCalledWith('pdf-images');
    expect(createSignedUrl).toHaveBeenCalledWith('user/doc/img.png', 120);
    expect(url).toBe('https://example.com/signed.png');
  });

  it('throws the raw supabase error when createSignedUrl fails', async () => {
    const error = { message: 'not found' };
    createSignedUrl.mockResolvedValue({ data: null, error });

    await expect(LessonImageDao.createSignedUrl('missing.png', 60)).rejects.toBe(error);
  });
});
