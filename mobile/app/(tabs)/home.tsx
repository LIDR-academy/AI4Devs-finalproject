import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useWordStore } from '../../store/wordStore';
import { useSessionStore } from '../../store/sessionStore';
import { MIN_WORDS_FOR_PRACTICE } from '../../constants/config';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { words, fetchWords } = useWordStore();
  const { streak, session, loading, fetchStreak } = useSessionStore();

  useEffect(() => {
    fetchWords();
    fetchStreak();
  }, []);

  const canPractice = words.length >= MIN_WORDS_FOR_PRACTICE;
  const sessionDoneToday = session?.completed === true;

  const handleStartPractice = () => {
    router.push('/practice');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>Lexio</Text>

        <View style={styles.streakCard}>
          {streak && streak.currentStreak > 0 ? (
            <Text style={styles.streakText}>
              {t('home.streak', { count: streak.currentStreak })}
            </Text>
          ) : (
            <Text style={styles.streakText}>{t('home.noStreak')}</Text>
          )}
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.stats}>
            {t('home.wordCount', { count: words.length })}
          </Text>
        </View>

        {sessionDoneToday ? (
          <View style={[styles.practiceButton, styles.practiceButtonDone]}>
            <Text style={styles.practiceButtonTextDone}>
              {t('home.practiceCompleted')}
            </Text>
          </View>
        ) : canPractice ? (
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={handleStartPractice}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.practiceButtonText}>
                {t('home.practiceButton')}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={[styles.practiceButton, styles.practiceButtonDisabled]}>
            <Text style={styles.practiceButtonTextDisabled}>
              {t('home.needMoreWords', { min: MIN_WORDS_FOR_PRACTICE })}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
    gap: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4F46E5',
  },
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
    width: '100%',
  },
  streakText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  statsRow: { alignItems: 'center' },
  stats: { fontSize: 16, color: '#6B7280' },
  practiceButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  practiceButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  practiceButtonDone: {
    backgroundColor: '#D1FAE5',
  },
  practiceButtonTextDone: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '600',
  },
  practiceButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  practiceButtonTextDisabled: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
