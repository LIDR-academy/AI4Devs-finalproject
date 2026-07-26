import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { correct, total, streak } = useLocalSearchParams<{
    correct: string;
    total: string;
    streak: string;
  }>();

  const correctNum = Number(correct ?? 0);
  const totalNum = Number(total ?? 10);
  const streakNum = Number(streak ?? 0);
  const isPerfect = correctNum === totalNum;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>{isPerfect ? '🎉' : '✅'}</Text>
        <Text style={styles.title}>{t('results.title')}</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.score}>
            {t('results.score', { correct: correctNum, total: totalNum })}
          </Text>
          {isPerfect && <Text style={styles.perfect}>{t('results.perfect')}</Text>}
        </View>

        {streakNum > 0 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakText}>
              {t('results.streakMessage', { count: streakNum })}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.primaryButtonText}>{t('results.backHome')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)/dictionary')}
        >
          <Text style={styles.secondaryButtonText}>{t('results.viewDictionary')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  emoji: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', textAlign: 'center' },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  score: { fontSize: 32, fontWeight: '800', color: '#4F46E5' },
  perfect: { fontSize: 16, color: '#10B981', fontWeight: '600' },
  streakCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  streakText: { fontSize: 20, fontWeight: '700', color: '#92400E' },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#4F46E5', fontWeight: '600', fontSize: 16 },
});
