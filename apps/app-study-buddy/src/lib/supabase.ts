import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { initSupabase } from '@helsoft/supabase-services';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  initSupabase({
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    // On web, supabase-js falls back to localStorage; AsyncStorage is for native.
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    detectSessionInUrl: Platform.OS === 'web',
  });
} else if (__DEV__) {
  console.warn(
    'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (see .env.example).'
  );
}
