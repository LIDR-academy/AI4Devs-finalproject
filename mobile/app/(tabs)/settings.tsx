import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useWordStore } from '../../store/wordStore';
import { useSessionStore } from '../../store/sessionStore';
import type { UiLanguage } from '../../types';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout, loading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    useWordStore.setState({ words: [], suggestedImages: [], error: null });
    useSessionStore.setState({ session: null, streak: null, error: null });
    router.replace('/(auth)/login');
  };

  const changeLanguage = (lang: UiLanguage) => {
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.languageLabel')}</Text>
          <View style={styles.langRow}>
            {(['es', 'en'] as UiLanguage[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langOption,
                  i18n.language === lang && styles.langOptionActive,
                ]}
                onPress={() => changeLanguage(lang)}
              >
                <Text
                  style={[
                    styles.langText,
                    i18n.language === lang && styles.langTextActive,
                  ]}
                >
                  {lang === 'es' ? t('settings.langEs') : t('settings.langEn')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <Text style={styles.logoutText}>{t('auth.logoutButton')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 24, gap: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  langRow: { flexDirection: 'row', gap: 8 },
  langOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  langOptionActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  langText: { color: '#6B7280', fontWeight: '500' },
  langTextActive: { color: '#4F46E5', fontWeight: '700' },
  emailText: { fontSize: 14, color: '#6B7280' },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 16 },
});
