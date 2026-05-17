import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import type { Database } from './database.types'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder =
  !rawUrl ||
  !rawAnonKey ||
  rawUrl.includes('your-project') ||
  rawAnonKey.includes('your-anon-key')

const fallbackUrl = `https://${projectId}.supabase.co`
const fallbackAnonKey = publicAnonKey

if (isPlaceholder) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_* not set in .env — using project credentials from utils/supabase/info.tsx.',
  )
}

const supabaseUrl = isPlaceholder ? fallbackUrl : rawUrl
const supabaseAnonKey = isPlaceholder ? fallbackAnonKey : rawAnonKey

export const supabaseConfigSource = isPlaceholder ? 'info-fallback' : 'env'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
