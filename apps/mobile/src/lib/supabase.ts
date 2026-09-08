import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Null until the project is configured, so the app runs fully offline on day
 * one. Every call site treats a null client as "keep it on the phone".
 */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // React Native has no URL bar for the OAuth redirect to land in.
          detectSessionInUrl: false,
        },
      })
    : null;

export const isCloudEnabled = supabase !== null;
