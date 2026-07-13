// Mirrors libs/supabase-services/src/services/lesson-generation.schema.ts -- Deno can't import
// the workspace package, so this file is kept manually in sync with that one (task-4 note, same
// rule as R1's pdf-extraction/_shared mirrors). Jest-tested for real at the source path above;
// this copy is verified only by manual smoke against the deployed function (risks.md R2).
import { z } from 'npm:zod@4';

const sourcePage = z.number().int().min(1).optional();

const rawMultipleChoiceOptionSchema = z.object({ id: z.string().min(1), label: z.string().min(1) });

const rawInstructionalSlideSchema = z.object({
  kind: z.literal('instructional'),
  title: z.string().min(1),
  content: z.string().min(1),
  sourcePage,
});

const rawMultipleChoiceSlideSchema = z.object({
  kind: z.literal('activity'),
  activityType: z.literal('multiple-choice'),
  title: z.string().min(1),
  content: z.string().min(1),
  options: z.array(rawMultipleChoiceOptionSchema).min(2),
  correctOptionId: z.string().min(1),
  explanation: z.string().optional(),
  sourcePage,
});

const rawMatchingItemSchema = z.object({ id: z.string().min(1), label: z.string().min(1) });
const rawMatchingPairSchema = z.object({ leftId: z.string().min(1), rightId: z.string().min(1) });

const rawMatchingSlideSchema = z.object({
  kind: z.literal('activity'),
  activityType: z.literal('matching'),
  title: z.string().min(1),
  content: z.string().min(1),
  leftItems: z.array(rawMatchingItemSchema).min(1),
  rightItems: z.array(rawMatchingItemSchema).min(1),
  correctPairs: z.array(rawMatchingPairSchema).min(1),
  explanation: z.string().optional(),
  sourcePage,
});

const rawFillInTheBlankSlideSchema = z.object({
  kind: z.literal('activity'),
  activityType: z.literal('fill-in-the-blank'),
  title: z.string().min(1),
  content: z.string().min(1),
  acceptedAnswers: z.array(z.string().min(1)).min(1),
  explanation: z.string().optional(),
  sourcePage,
});

const rawOpenEndedSlideSchema = z.object({
  kind: z.literal('activity'),
  activityType: z.literal('open-ended'),
  title: z.string().min(1),
  content: z.string().min(1),
  modelAnswer: z.string().min(1),
  explanation: z.string().optional(),
  sourcePage,
});

const rawFlashcardSlideSchema = z.object({
  kind: z.literal('activity'),
  activityType: z.literal('flashcard'),
  title: z.string().min(1),
  content: z.string().min(1),
  back: z.string().min(1),
  explanation: z.string().optional(),
  sourcePage,
});

const rawActivitySlideSchema = z.discriminatedUnion('activityType', [
  rawMultipleChoiceSlideSchema,
  rawMatchingSlideSchema,
  rawFillInTheBlankSlideSchema,
  rawOpenEndedSlideSchema,
  rawFlashcardSlideSchema,
]);

export const rawSlideSchema = z.union([rawInstructionalSlideSchema, rawActivitySlideSchema]);

export type RawSlide = z.infer<typeof rawSlideSchema>;

const isPerfectMatchingPairing = (slide: z.infer<typeof rawMatchingSlideSchema>): boolean => {
  const { leftItems, rightItems, correctPairs } = slide;
  if (leftItems.length !== rightItems.length || leftItems.length !== correctPairs.length) {
    return false;
  }
  const leftIds = new Set(leftItems.map((item) => item.id));
  const rightIds = new Set(rightItems.map((item) => item.id));
  const usedLeftIds = new Set<string>();
  const usedRightIds = new Set<string>();
  return correctPairs.every((pair) => {
    if (!leftIds.has(pair.leftId) || !rightIds.has(pair.rightId)) return false;
    if (usedLeftIds.has(pair.leftId) || usedRightIds.has(pair.rightId)) return false;
    usedLeftIds.add(pair.leftId);
    usedRightIds.add(pair.rightId);
    return true;
  });
};

export const deckSchema = z
  .object({
    title: z.string().min(1),
    slides: z.array(rawSlideSchema).min(1),
  })
  .superRefine((deck, ctx) => {
    deck.slides.forEach((slide, index) => {
      if (slide.kind !== 'activity') return;

      if (
        slide.activityType === 'multiple-choice' &&
        !slide.options.some((option) => option.id === slide.correctOptionId)
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'correctOptionId must reference one of options[].id',
          path: ['slides', index, 'correctOptionId'],
        });
      }

      if (slide.activityType === 'matching' && !isPerfectMatchingPairing(slide)) {
        ctx.addIssue({
          code: 'custom',
          message: 'correctPairs must be a perfect pairing of leftItems and rightItems',
          path: ['slides', index, 'correctPairs'],
        });
      }
    });
  });

export type Deck = z.infer<typeof deckSchema>;
