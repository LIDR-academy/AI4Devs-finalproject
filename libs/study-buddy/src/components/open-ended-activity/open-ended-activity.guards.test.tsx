/**
 * Guard-path suite — mocks OpenEnded so activity handleSubmit can be invoked when
 * the real organism would early-return (locked / unavailable). Kills answered/valid mutants.
 */
jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@helsoft/activities', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return {
    OpenEnded: ({
      unavailable,
      labels,
      onSubmit,
      explanation,
    }: {
      unavailable?: boolean;
      labels: {
        submit: string;
        unavailable: string;
        modelAnswer: string;
        explanationHeading: string;
      };
      onSubmit: (text: string) => void;
      explanation?: string;
    }) => {
      if (unavailable) {
        return (
          <View>
            <Text>{labels.unavailable}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="force-invalid-submit"
              onPress={() => onSubmit('should-not-record')}
            >
              <Text>force-invalid-submit</Text>
            </Pressable>
          </View>
        );
      }

      return (
        <View>
          <Text>{labels.modelAnswer}</Text>
          {explanation ? <Text>{labels.explanationHeading}</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={labels.submit}
            onPress={() => onSubmit('first')}
          >
            <Text>{labels.submit}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="force-resubmit"
            onPress={() => onSubmit('second')}
          >
            <Text>force-resubmit</Text>
          </Pressable>
        </View>
      );
    },
  };
});

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { OpenEndedSlide } from '@helsoft/types';

import { OpenEndedActivity } from './open-ended-activity';

const slide: OpenEndedSlide = {
  id: 'slide-oe-1',
  lessonId: 'lesson-1',
  title: 'Explain',
  content: 'What is photosynthesis?',
  position: 0,
  kind: 'activity',
  activityType: 'open-ended',
  modelAnswer: 'Conversion of light energy into chemical energy.',
  explanation: 'Key process in plants.',
};

describe('OpenEndedActivity guards (mocked organism)', () => {
  // Mutation — if (answered || !valid) → if (false); || → &&
  it('ignores a second onSubmit after answered is set', async () => {
    const onAnswered = jest.fn();
    await render(<OpenEndedActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'activity.openEnded.submit' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'force-resubmit' }));
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-oe-1',
      activityType: 'open-ended',
      submittedAnswer: 'first',
    });
  });

  // Mutation — !valid half of answered || !valid
  it('does not emit when force-submitted while the slide is invalid', async () => {
    const onAnswered = jest.fn();
    await render(
      <OpenEndedActivity
        slide={{ ...slide, content: '   ' }}
        onAnswered={onAnswered}
      />,
    );

    expect(screen.getByText('activity.openEnded.unavailable')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'force-invalid-submit' }));
    });

    expect(onAnswered).not.toHaveBeenCalled();
  });

  // Mutation — onAnswered?.(next) → onAnswered(next)
  it('does not throw when force-submitting without onAnswered', async () => {
    await render(<OpenEndedActivity slide={slide} />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'activity.openEnded.submit' }));
    });

    expect(screen.getByText('activity.openEnded.modelAnswer')).toBeTruthy();
  });
});
