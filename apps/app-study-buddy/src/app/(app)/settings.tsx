import { ScreenContainer } from '@helsoft/components';
import { LanguageSettings, SignOut } from '@helsoft/study-buddy';

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <LanguageSettings />
      <SignOut />
    </ScreenContainer>
  );
}
