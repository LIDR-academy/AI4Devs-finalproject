export type GenreResolutionAction = 'assign' | 'create' | 'skip';

export type GenreResolution =
  | { action: 'assign'; genre_id: string }
  | { action: 'create' }
  | { action: 'skip' };

export type GenreResolutionMap = Record<string, GenreResolution>;
