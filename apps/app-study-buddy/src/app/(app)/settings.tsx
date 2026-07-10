import { LanguageSettings, ScreenContainer } from '@helsoft/components';
import { SignOut } from '@helsoft/study-buddy';

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <LanguageSettings />
      <SignOut />
    </ScreenContainer>
  );
}
