import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { FillInTheBlank } from '../fill-in-the-blank/fill-in-the-blank';
import { Flashcard } from '../flashcard/flashcard';
import { Matching } from '../matching/matching';
import { MultipleChoice } from '../multiple-choice/multiple-choice';
import { SlideImage } from '../slide-image/slide-image';
import { OpenEndedBody } from './open-ended-body';
import type { ActivityBodyProps, SlideViewProps } from './slide-view.types';

/**
 * SlideView — presentational renderer for one content Slide (instructional or activity).
 * Results slide is NOT rendered here — the player mounts LessonResults for that step.
 */
export const SlideView = ({ slide, onAnswered, initialAnswer }: SlideViewProps) => (
  <View style={styles.root}>
    <Text accessibilityRole="header" style={styles.title}>
      {slide.title}
    </Text>
    <SlideImage image={slide.image} />
    {slide.kind === 'instructional' ? (
      <Text style={styles.content}>{slide.content}</Text>
    ) : (
      <ActivityBody slide={slide} onAnswered={onAnswered} initialAnswer={initialAnswer} />
    )}
  </View>
);

const ActivityBody = ({ slide, onAnswered, initialAnswer }: ActivityBodyProps) => {
  switch (slide.activityType) {
    case 'multiple-choice':
      return (
        <MultipleChoice
          slide={slide}
          onAnswered={onAnswered}
          initialAnswer={
            initialAnswer?.activityType === 'multiple-choice' ? initialAnswer : undefined
          }
        />
      );
    case 'fill-in-the-blank':
      return (
        <FillInTheBlank
          slide={slide}
          onAnswered={onAnswered}
          initialAnswer={
            initialAnswer?.activityType === 'fill-in-the-blank' ? initialAnswer : undefined
          }
        />
      );
    case 'matching':
      return (
        <Matching
          slide={slide}
          onAnswered={onAnswered}
          initialAnswer={initialAnswer?.activityType === 'matching' ? initialAnswer : undefined}
        />
      );
    case 'flashcard':
      return (
        <Flashcard
          slide={slide}
          onAnswered={onAnswered}
          initialAnswer={initialAnswer?.activityType === 'flashcard' ? initialAnswer : undefined}
        />
      );
    case 'open-ended':
      return (
        <OpenEndedBody
          slide={slide}
          onAnswered={onAnswered}
          initialAnswer={initialAnswer?.activityType === 'open-ended' ? initialAnswer : undefined}
        />
      );
  }
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.s3,
    flex: 1,
  },
  title: {
    ...theme.typography.headlineSmall,
    color: theme.colors.onSurface,
  },
  content: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurface,
  },
}));
