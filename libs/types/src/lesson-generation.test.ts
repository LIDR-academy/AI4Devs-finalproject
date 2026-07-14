import type { InstructionalSlide, SlideImageRef } from './lesson';
import {
  GENERATION_PROGRESS_STEPS,
  type GeneratedLesson,
  type GenerateLessonRequest,
  type GenerationError,
  type GenerationErrorCode,
  type GenerationProgressStep,
  type LessonComposition,
} from './lesson-generation';

// @s1/@s6 — the only thing the client ever sends to generate-lesson (spec.md architecture note).
describe('GenerateLessonRequest', () => {
  it('carries exactly documentId + composition', () => {
    const request: GenerateLessonRequest = { documentId: 'doc-1', composition: 'both' };

    expect(request).toEqual({ documentId: 'doc-1', composition: 'both' });
  });

  it('accepts every LessonComposition value', () => {
    const compositions: LessonComposition[] = ['instructional-only', 'activity-only', 'both'];

    expect(compositions).toHaveLength(3);
  });
});

// @s3 — the deck generation resolves with; after Edge persist, lessonId is the real DB id.
describe('GeneratedLesson', () => {
  it('carries a minted lessonId, title, composition, and an ordered slide list', () => {
    const lesson: GeneratedLesson = {
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both',
      slides: [],
    };

    expect(lesson).toEqual({
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both',
      slides: [],
    });
  });
});

// @s14 — the fixed, ordered phase list the hook advances through.
describe('GenerationProgressStep', () => {
  it('is one of reading, generating, or attaching, in that order', () => {
    const steps: GenerationProgressStep[] = ['reading', 'generating', 'attaching'];

    expect(steps).toEqual(['reading', 'generating', 'attaching']);
  });
});

// review.md round-1 finding #4 — the single source of truth both `useLessonGeneration` and
// `LessonGenerationPanel`'s helpers import, rather than each hardcoding an independent copy.
describe('GENERATION_PROGRESS_STEPS', () => {
  it('is the canonical reading -> generating -> attaching order', () => {
    expect(GENERATION_PROGRESS_STEPS).toEqual(['reading', 'generating', 'attaching']);
  });
});

// spec.md's Error contract table — the closed set of codes LessonGenerationService normalizes
// every failure to (mirrors PdfExtractionError).
describe('GenerationError', () => {
  it('carries one of the 9 closed GenerationErrorCode values', () => {
    const codes: GenerationErrorCode[] = [
      'missing_key',
      'invalid_key',
      'rate_limited',
      'timeout',
      'generation_failed',
      'document_not_ready',
      'network_error',
      'unauthenticated',
      'persist_failed',
    ];
    const error: GenerationError = { code: 'missing_key' };

    expect(codes).toHaveLength(9);
    expect(error).toEqual({ code: 'missing_key' });
  });
});

// @s11 — a slide references the persisted R1 image (never the bytes); @s1's SlideBase gains an
// optional `image` so any slide kind may carry one.
describe('SlideImageRef', () => {
  it('references the persisted R1 image by id/storagePath/dimensions, not bytes', () => {
    const ref: SlideImageRef = {
      imageId: 'image-1',
      storagePath: 'user-1/doc-1/p1-0.png',
      width: 400,
      height: 300,
      alt: 'Diagram of a cell',
    };

    expect(ref).toEqual({
      imageId: 'image-1',
      storagePath: 'user-1/doc-1/p1-0.png',
      width: 400,
      height: 300,
      alt: 'Diagram of a cell',
    });
  });

  it('is optional on a slide — an InstructionalSlide may omit it entirely (text-only, @s11)', () => {
    const slide: InstructionalSlide = {
      id: 'slide-1',
      lessonId: 'lesson-1',
      title: 'Intro',
      content: 'Welcome',
      position: 0,
      kind: 'instructional',
    };

    expect(slide.image).toBeUndefined();
  });

  it('is carried on a slide when generation attaches a relevant image (@s9/@s11)', () => {
    const slide: InstructionalSlide = {
      id: 'slide-1',
      lessonId: 'lesson-1',
      title: 'Intro',
      content: 'Welcome',
      position: 0,
      kind: 'instructional',
      image: { imageId: 'image-1', storagePath: 'user-1/doc-1/p1-0.png', width: 400, height: 300 },
    };

    expect(slide.image?.imageId).toBe('image-1');
  });
});
