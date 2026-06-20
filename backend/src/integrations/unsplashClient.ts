import { UnsplashImage } from '../types';

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; thumb: string };
  user: { name: string };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
}

export async function searchImages(
  query: string,
  count = 5
): Promise<UnsplashImage[]> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const data = (await response.json()) as UnsplashSearchResponse;

  return data.results.map((photo) => ({
    photoId: photo.id,
    url: photo.urls.regular,
    thumbnailUrl: photo.urls.thumb,
    photographer: photo.user.name,
  }));
}
