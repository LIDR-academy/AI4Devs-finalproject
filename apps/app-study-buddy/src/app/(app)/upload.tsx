import { ScreenContainer } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Text } from 'react-native';

export default function UploadScreen() {
  const { t } = useLocalization();

  return (
    <ScreenContainer>
      <Text>{t('upload.intro')}</Text>
    </ScreenContainer>
  );
}
