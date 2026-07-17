import { ScreenContainer } from '@helsoft/components';
import { SavedLessons } from '@helsoft/study-buddy';

export default function HomeScreen() {
  return (
    <ScreenContainer style={{ gap: 10, padding: 20 }}>
      <SavedLessons />
    </ScreenContainer>
  );
}
