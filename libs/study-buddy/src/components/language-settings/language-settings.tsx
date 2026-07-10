import { LanguageSelector } from '@helsoft/components';
import { LOCALE_LABELS, useLocalization } from '@helsoft/localization';
import { isSupportedLocale } from '@helsoft/types';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * LanguageSettings — feature component that wires the presentational LanguageSelector
 * to the localization hook. Builds the option list from the static endonym labels,
 * reflects the active locale, and switches (immediately + persisted) on selection.
 * Keeps the app's Settings screen a thin shell.
 */
export const LanguageSettings = () => {
  const { t, locale, setLocale, supportedLocales } = useLocalization();

  const options = supportedLocales.map((code) => ({ value: code, label: LOCALE_LABELS[code] }));

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t('settings.language.heading')}
      </Text>
      <LanguageSelector
        options={options}
        value={locale}
        // The presentational selector emits a plain string; guard the type boundary so only a
        // supported locale is forwarded to setLocale (no unchecked cast to Locale).
        onChange={(value) => {
          if (isSupportedLocale(value)) {
            setLocale(value);
          }
        }}
        accessibilityLabel={t('settings.language.a11yLabel')}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.s3,
  },
  heading: {
    ...theme.typography.titleSmall,
    color: theme.colors.onSurfaceVariant,
  },
}));
