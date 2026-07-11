import { LanguageSettings, ScreenContainer } from '@helsoft/components';
import { ApiKeySettings, SignOut } from '@helsoft/study-buddy';

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <LanguageSettings />
      <ApiKeySettings />
      <SignOut />
    </ScreenContainer>
  );
}
