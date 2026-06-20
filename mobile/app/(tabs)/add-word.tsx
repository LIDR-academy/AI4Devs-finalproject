import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useWordStore } from '../../store/wordStore';
import type { DefinitionLanguage, UnsplashImage } from '../../types';

export default function AddWordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createWord, updateWord, loading } = useWordStore();

  const [term, setTerm] = useState('');
  const [lang, setLang] = useState<DefinitionLanguage>('es');
  const [definition, setDefinition] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [wordCardId, setWordCardId] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'select_image' | 'done'>('input');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!term.trim()) {
      setError(t('addWord.errorEmpty'));
      return;
    }
    setError('');
    try {
      const result = await createWord(term.trim(), lang);
      setDefinition(result.wordCard.definition);
      setImages(result.suggestedImages);
      setWordCardId(result.wordCard.id);
      setStep('select_image');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (msg === 'DUPLICATE_TERM') {
        setError(t('addWord.errorDuplicate', { term: term.trim() }));
      } else {
        setError(t('common.somethingWentWrong'));
      }
    }
  };

  const handleSave = async () => {
    if (!selectedImage || !wordCardId) {
      setError(t('addWord.errorEmpty'));
      return;
    }
    await updateWord(wordCardId, {
      imageUrl: selectedImage.url,
      unsplashPhotoId: selectedImage.photoId,
      definition,
    });
    Alert.alert('', '✓', [{ text: 'OK', onPress: () => {
      setTerm('');
      setDefinition('');
      setImages([]);
      setSelectedImage(null);
      setWordCardId(null);
      setStep('input');
      router.push('/(tabs)/dictionary');
    }}]);
  };

  if (step === 'select_image') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t('addWord.chooseImageLabel')}</Text>
          <Text style={styles.termBadge}>{term}</Text>

          <TextInput
            style={styles.definitionInput}
            value={definition}
            onChangeText={setDefinition}
            multiline
            numberOfLines={3}
            placeholder={t('addWord.definitionLabel')}
          />

          <FlatList
            data={images}
            keyExtractor={(i) => i.photoId}
            numColumns={2}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.imageCard,
                  selectedImage?.photoId === item.photoId && styles.imageCardSelected,
                ]}
                onPress={() => setSelectedImage(item)}
              >
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  style={styles.thumbnail}
                />
              </TouchableOpacity>
            )}
            columnWrapperStyle={{ gap: 8 }}
            contentContainerStyle={{ gap: 8 }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, !selectedImage && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!selectedImage || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('addWord.saveButton')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('addWord.title')}</Text>

        <Text style={styles.label}>{t('addWord.termLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('addWord.termPlaceholder')}
          value={term}
          onChangeText={setTerm}
          autoCapitalize="none"
        />

        <Text style={styles.label}>{t('addWord.langLabel')}</Text>
        <View style={styles.langRow}>
          {(['es', 'en'] as DefinitionLanguage[]).map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.langOption, lang === l && styles.langOptionActive]}
              onPress={() => setLang(l)}
            >
              <Text
                style={[styles.langText, lang === l && styles.langTextActive]}
              >
                {l === 'es' ? t('addWord.langEs') : t('addWord.langEn')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('addWord.generateButton')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 24, gap: 12 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  definitionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  langRow: { flexDirection: 'row', gap: 8 },
  langOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  langOptionActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  langText: { color: '#6B7280', fontWeight: '500' },
  langTextActive: { color: '#4F46E5', fontWeight: '700' },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#A5B4FC' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: { color: '#EF4444', fontSize: 14 },
  termBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: '700',
    fontSize: 18,
  },
  imageCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  imageCardSelected: { borderColor: '#4F46E5' },
  thumbnail: { width: '100%', aspectRatio: 1 },
});
