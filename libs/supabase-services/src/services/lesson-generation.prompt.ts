import type { LessonComposition } from '@helsoft/types';

/** One entry of the image manifest handed to the model — ids/page/position only, never bytes
 * (@s9/@s11, spec.md architecture note). `description` is R1's reserved (currently null)
 * per-image field; when present it helps the model anchor the image without a vision call. */
export type PromptImageManifestEntry = {
  imageId: string;
  pageNumber: number;
  positionIndex: number;
  description?: string;
};

export type BuildDeckPromptInput = {
  composition: LessonComposition;
  pages: { page: number; text: string }[];
  images: PromptImageManifestEntry[];
};

/** Per-composition instruction enforcing the chosen mix (@s3/@s4/@s5/@s6) — 'both' is the only
 * branch this Slice-1 task builds; the other two land in task-11. */
const COMPOSITION_INSTRUCTIONS: Record<LessonComposition, string> = {
  both: 'Generate a deck that mixes instructional slides (kind: "instructional") and activity slides (kind: "activity") covering the five supported activity types where relevant.',
  'instructional-only':
    'Generate a deck containing ONLY instructional slides (kind: "instructional"). Do not include any activity slides.',
  'activity-only':
    'Generate a deck containing ONLY activity slides (kind: "activity") covering the five supported activity types where relevant. Do not include any instructional slides.',
};

const formatPages = (pages: BuildDeckPromptInput['pages']): string =>
  pages.map((page) => `--- Page ${page.page} ---\n${page.text}`).join('\n\n');

const formatImageManifest = (images: PromptImageManifestEntry[]): string => {
  if (images.length === 0) return '';
  const lines = images.map((image) => {
    const description = image.description ? ` — ${image.description}` : '';
    return `- id: ${image.imageId}, page: ${image.pageNumber}, position: ${image.positionIndex}${description}`;
  });
  return `\n\nAvailable images (reference by id only; anchor each to the slide whose content is drawn from its page; do not invent images):\n${lines.join('\n')}`;
};

/**
 * Builds the model prompt from the extracted page text + composition + an image manifest
 * (task-4 Goal). Enforces `both` here; `instructional-only`/`activity-only` land in task-11.
 */
export const buildDeckPrompt = ({ composition, pages, images }: BuildDeckPromptInput): string =>
  `${COMPOSITION_INSTRUCTIONS[composition]}\n\nSource content:\n${formatPages(pages)}${formatImageManifest(images)}`;
