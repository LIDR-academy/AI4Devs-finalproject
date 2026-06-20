import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSessionStore } from '../store/sessionStore';
import type { Exercise, ExerciseAnswer } from '../types';

export default function PracticeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { startSession, completeSession, loading } = useSessionStore();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<ExerciseAnswer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const session = await startSession();
        setExercises(session.exercises);
        setSessionId(session.id);
        setStarted(true);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          t('common.somethingWentWrong');
        Alert.alert(t('common.error'), msg, [
          { text: t('common.ok'), onPress: () => router.back() },
        ]);
      }
    })();
  }, []);

  const exercise = exercises[current];
  const isLast = current === exercises.length - 1;

  const handleSelect = (option: string) => {
    setSelected(option);
  };

  const handleNext = () => {
    if (!selected || !exercise) return;
    const newAnswers = [
      ...answers,
      { exerciseId: exercise.id, userAnswer: selected },
    ];
    setAnswers(newAnswers);
    setSelected(null);

    if (isLast) {
      handleFinish(newAnswers);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const handleFinish = async (finalAnswers: ExerciseAnswer[]) => {
    try {
      const result = await completeSession(finalAnswers);
      router.replace({
        pathname: '/results',
        params: {
          correct: String(result.session.correctAnswers),
          total: String(result.session.totalExercises),
          streak: String(result.streak.currentStreak),
        },
      });
    } catch {
      Alert.alert(t('common.error'), t('common.somethingWentWrong'));
    }
  };

  if (!started || loading || !exercise) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 60 }} color="#4F46E5" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.progress}>
          {t('practice.progress', { current: current + 1, total: exercises.length })}
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((current + 1) / exercises.length) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.questionArea}>
          {exercise.type === 'image_match' && exercise.imageUrl ? (
            <>
              <Image source={{ uri: exercise.imageUrl }} style={styles.questionImage} />
              <Text style={styles.questionText}>{t('practice.imageQuestion')}</Text>
            </>
          ) : (
            <Text style={styles.questionText}>{exercise.question}</Text>
          )}
        </View>

        <View style={styles.options}>
          {exercise.options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                selected === option && styles.optionSelected,
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selected === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? t('practice.submitButton') : t('practice.nextButton')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 24, gap: 16 },
  progress: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  questionArea: { gap: 12, alignItems: 'center' },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 26,
  },
  options: { gap: 10, flex: 1 },
  option: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  optionSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  optionText: { fontSize: 16, color: '#374151', fontWeight: '500' },
  optionTextSelected: { color: '#4F46E5', fontWeight: '700' },
  nextButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#C7D2FE' },
  nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
