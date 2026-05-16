import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder =
  !rawUrl ||
  !rawAnonKey ||
  rawUrl.includes('your-project') ||
  rawAnonKey.includes('your-anon-key')

if (isPlaceholder) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Using placeholder credentials — queries will fail. Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect.',
  )
}

const supabaseUrl = isPlaceholder ? 'https://placeholder.supabase.co' : rawUrl
const supabaseAnonKey = isPlaceholder ? 'placeholder-anon-key' : rawAnonKey

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
