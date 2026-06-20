import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useWordStore } from '../../store/wordStore';
import type { WordCard } from '../../types';

export default function CardDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { words, updateWord, loading } = useWordStore();

  const card = words.find((w) => w.id === id);
  const [definition, setDefinition] = useState(card?.definition ?? '');

  useEffect(() => {
    if (card) setDefinition(card.definition);
  }, [card]);

  if (!card) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Card not found</Text>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    await updateWord(id, { definition });
    Alert.alert('', '✓', [{ text: 'OK', onPress: () => router.back() }]);
  };

  const handleToggleStatus = async () => {
    const newStatus = card.status === 'active' ? 'learned' : 'active';
    await updateWord(id, { status: newStatus });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {card.imageUrl ? (
          <Image source={{ uri: card.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>📷</Text>
          </View>
        )}

        <Text style={styles.term}>{card.term}</Text>

        <Text style={styles.label}>{t('cardDetail.editDefinition')}</Text>
        <TextInput
          style={styles.definitionInput}
          value={definition}
          onChangeText={setDefinition}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('cardDetail.saveChanges')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            card.status === 'learned' && styles.statusButtonActive,
          ]}
          onPress={handleToggleStatus}
          disabled={loading}
        >
          <Text
            style={[
              styles.statusButtonText,
              card.status === 'learned' && styles.statusButtonTextActive,
            ]}
          >
            {card.status === 'active'
              ? t('cardDetail.markLearned')
              : t('cardDetail.markActive')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 24, gap: 16 },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  imagePlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: { fontSize: 48 },
  term: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  definitionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statusButton: {
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statusButtonActive: { borderColor: '#6B7280' },
  statusButtonText: { color: '#10B981', fontWeight: '600', fontSize: 15 },
  statusButtonTextActive: { color: '#6B7280' },
});
