import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { FillInTheBlankActivity } from '../fill-in-the-blank-activity/fill-in-the-blank-activity';
import { FlashcardActivity } from '../flashcard-activity/flashcard-activity';
import { MatchingActivity } from '../matching-activity/matching-activity';
import { MultipleChoiceActivity } from '../multiple-choice-activity/multiple-choice-activity';
import { OpenEndedActivity } from '../open-ended-activity/open-ended-activity';
import { SlideImage } from '../slide-image/slide-image';
import type { ActivityBodyProps, SlideViewProps } from './slide-view.types';

/**
 * SlideView — presentational renderer for one content Slide (instructional or activity).
 * Results slide is NOT rendered here — the player mounts LessonResults for that step.
 */
export const SlideView = ({ slide, onAnswered }: SlideViewProps) => (
  <View style={styles.root}>
    <Text accessibilityRole="header" style={styles.title}>
      {slide.title}
    </Text>
    <SlideImage image={slide.image} />
    {slide.kind === 'instructional' ? (
      <Text style={styles.content}>{slide.content}</Text>
    ) : (
      <ActivityBody slide={slide} onAnswered={onAnswered} />
    )}
  </View>
);

const ActivityBody = ({ slide, onAnswered }: ActivityBodyProps) => {
  switch (slide.activityType) {
    case 'multiple-choice':
      return <MultipleChoiceActivity slide={slide} onAnswered={onAnswered} />;
    case 'fill-in-the-blank':
      return <FillInTheBlankActivity slide={slide} onAnswered={onAnswered} />;
    case 'matching':
      return <MatchingActivity slide={slide} onAnswered={onAnswered} />;
    case 'flashcard':
      return <FlashcardActivity slide={slide} onAnswered={onAnswered} />;
    case 'open-ended':
      return <OpenEndedActivity slide={slide} onAnswered={onAnswered} />;
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
