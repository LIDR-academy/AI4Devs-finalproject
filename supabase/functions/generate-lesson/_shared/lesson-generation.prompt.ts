// Mirrors libs/supabase-services/src/services/lesson-generation.prompt.ts -- kept manually in
// sync by hand (task-4 note, same rule as R1's pdf-extraction/_shared mirrors).
import { MIN_LESSON_SLIDES } from './lesson-generation.schema.ts';
import type { BuildDeckPromptInput, PromptImageManifestEntry } from './lesson-generation.types.ts';
import type { LessonComposition } from './types.ts';

const COMPOSITION_INSTRUCTIONS: Record<LessonComposition, string> = {
  both: `Generate a deck of at least ${MIN_LESSON_SLIDES} slides that mixes instructional slides (kind: "instructional") and activity slides (kind: "activity") covering the five supported activity types where relevant.`,
  'instructional-only': `Generate a deck of at least ${MIN_LESSON_SLIDES} slides containing ONLY instructional slides (kind: "instructional"). Do not include any activity slides.`,
  'activity-only': `Generate a deck of at least ${MIN_LESSON_SLIDES} slides containing ONLY activity slides (kind: "activity") covering the five supported activity types where relevant. Do not include any instructional slides.`,
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

export const buildDeckPrompt = ({ composition, pages, images }: BuildDeckPromptInput): string =>
  `${COMPOSITION_INSTRUCTIONS[composition]}\n\nSource content:\n${formatPages(pages)}${formatImageManifest(images)}`;
