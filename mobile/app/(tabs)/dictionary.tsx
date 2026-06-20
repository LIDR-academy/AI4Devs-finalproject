import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useWordStore } from '../../store/wordStore';
import type { WordCard, WordCardStatus } from '../../types';

export default function DictionaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { words, loading, fetchWords } = useWordStore();
  const [tab, setTab] = useState<WordCardStatus>('active');

  useEffect(() => {
    fetchWords();
  }, []);

  const filtered = words.filter((w) => w.status === tab);

  const renderItem = ({ item }: { item: WordCard }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/card/${item.id}`)}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={styles.cardImagePlaceholderText}>📷</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTerm}>{item.term}</Text>
        <Text style={styles.cardDefinition} numberOfLines={2}>
          {item.definition}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('dictionary.title')}</Text>
        <View style={styles.tabs}>
          {(['active', 'learned'] as WordCardStatus[]).map((t2) => (
            <TouchableOpacity
              key={t2}
              style={[styles.tab, tab === t2 && styles.tabActive]}
              onPress={() => setTab(t2)}
            >
              <Text style={[styles.tabText, tab === t2 && styles.tabTextActive]}>
                {t2 === 'active'
                  ? t('dictionary.tabActive')
                  : t('dictionary.tabLearned')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4F46E5" />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('dictionary.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 24, paddingTop: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#EEF2FF' },
  tabText: { color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#4F46E5', fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: { width: 88, height: 88 },
  cardImagePlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImagePlaceholderText: { fontSize: 28 },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  cardTerm: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardDefinition: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 16 },
});
