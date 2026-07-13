import { render, screen } from '@testing-library/react-native';

import {
  GENERATION_PROGRESS_ANNOUNCEMENT_TEST_ID,
  GenerationProgress,
} from './generation-progress';

const steps = [
  { label: 'Reading content' },
  { label: 'Generating slides' },
  { label: 'Attaching images' },
];

// Fixture status labels — deliberately NOT the English words the component used to hardcode, so
// a test passing only proves the label came from this prop, not from an internal literal
// (review.md round-1 finding #1).
const statusLabels = { done: 'listo', current: 'en curso', upcoming: 'próximo' };

describe('GenerationProgress', () => {
  // @s14 — every labeled step renders (discrete labeled steps, not a bare spinner/percentage).
  // currentIndex is past the last step so the live-region announcement (which mirrors the
  // current step's label) doesn't collide with a visible step label in this query.
  it('renders every step label', async () => {
    await render(
      <GenerationProgress steps={steps} currentIndex={steps.length} statusLabels={statusLabels} />,
    );

    expect(screen.getByText('Reading content')).toBeTruthy();
    expect(screen.getByText('Generating slides')).toBeTruthy();
    expect(screen.getByText('Attaching images')).toBeTruthy();
  });

  // @s14 — steps before currentIndex are marked done (a check indicator, not just a number).
  it('marks a step before currentIndex as done', async () => {
    await render(<GenerationProgress steps={steps} currentIndex={1} statusLabels={statusLabels} />);

    expect(screen.getByLabelText('Reading content, listo')).toBeTruthy();
  });

  it('marks the step at currentIndex as current', async () => {
    await render(<GenerationProgress steps={steps} currentIndex={1} statusLabels={statusLabels} />);

    expect(screen.getByLabelText('Generating slides, en curso')).toBeTruthy();
  });

  it('marks a step after currentIndex as upcoming', async () => {
    await render(<GenerationProgress steps={steps} currentIndex={1} statusLabels={statusLabels} />);

    expect(screen.getByLabelText('Attaching images, próximo')).toBeTruthy();
  });

  // review.md round-1 finding #1 (blocker) — the status suffix must come from the injected
  // `statusLabels` prop, never a hardcoded English literal baked into the component.
  it('never hardcodes the English status words itself', async () => {
    await render(<GenerationProgress steps={steps} currentIndex={1} statusLabels={statusLabels} />);

    expect(screen.queryByLabelText('Reading content, done')).toBeNull();
    expect(screen.queryByLabelText('Generating slides, current')).toBeNull();
    expect(screen.queryByLabelText('Attaching images, upcoming')).toBeNull();
  });

  // a11y (task-8 Done criteria) — the current step's label is announced to assistive tech via a
  // polite live region.
  it('announces the current step label via a polite live region', async () => {
    await render(<GenerationProgress steps={steps} currentIndex={2} statusLabels={statusLabels} />);

    const announcement = screen.getByTestId(GENERATION_PROGRESS_ANNOUNCEMENT_TEST_ID);
    expect(announcement.props.accessibilityLiveRegion).toBe('polite');
    expect(announcement.props.children).toBe('Attaching images');
  });
});
