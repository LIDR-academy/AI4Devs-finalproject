import { LanguageSettings, ScreenContainer } from '@helsoft/components';
import { ApiKeySettings } from '@helsoft/study-buddy';

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <LanguageSettings />
      <ApiKeySettings />
    </ScreenContainer>
  );
}
