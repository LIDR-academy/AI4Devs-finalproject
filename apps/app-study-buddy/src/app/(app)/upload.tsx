import { ScreenContainer } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { ApiKeyGate } from '@helsoft/study-buddy';
import { Text } from 'react-native';

export default function UploadScreen() {
  const { t } = useLocalization();

  return (
    <ScreenContainer>
      <ApiKeyGate>
        <Text>{t('upload.intro')}</Text>
      </ApiKeyGate>
    </ScreenContainer>
  );
}
