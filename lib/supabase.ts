import { createClient } from '@supabase/supabase-js'

// Create a function to get or create Supabase client
function createSupabaseClient() {
  console.log('createSupabaseClient called')
  
  // Check for both naming conventions
  // Note: STORAGE_ prefixed vars are server-side only, so we need a different approach for client-side
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.STORAGE_NEXT_PUBLIC_SUPABASE_URL
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.STORAGE_NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // If we're on the client side and don't have NEXT_PUBLIC vars, try to get them from a different source
  if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    // On client side, we need to use the standard NEXT_PUBLIC_ vars
    // Let's check if we can get them from window or other client-side source
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  console.log('Environment debug info:', {
    clientSide: typeof window !== 'undefined',
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    STORAGE_NEXT_PUBLIC_SUPABASE_URL: !!process.env.STORAGE_NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    STORAGE_NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.STORAGE_NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // Log available environment variable keys
    availableKeys: Object.keys(process.env).filter(key => 
      key.includes('SUPABASE') || key.startsWith('NEXT_PUBLIC') || key.startsWith('STORAGE')
    ).slice(0, 10) // Limit to first 10 to avoid too much output
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return null
  }

  try {
    console.log('Attempting to create Supabase client...')
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
    console.log('Supabase client created successfully')
    return client
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    return null
  }
}

// Initialize Supabase instance
let supabaseInstance: any = null

try {
  supabaseInstance = createSupabaseClient()
  if (!supabaseInstance) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined - Supabase functionality will be disabled')
  }
} catch (error) {
  console.error('Failed to initialize Supabase:', error)
}

export const supabase = supabaseInstance

// Helper function to get Supabase instance with error handling
export function getSupabase() {
  console.log('getSupabase called, current instance:', !!supabaseInstance)
  
  // Try to create client if not already initialized and env vars are available
  if (!supabaseInstance) {
    console.log('Creating new Supabase client...')
    supabaseInstance = createSupabaseClient()
    console.log('New client created:', !!supabaseInstance)
  }
  
  if (!supabaseInstance) {
    const errorMsg = 'Supabase is not configured. Please check environment variables.'
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
  return supabaseInstance
}

// Database types (you can generate these from your Supabase schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website_url: string | null
          linkedin_url: string | null
          github_url: string | null
          twitter_url: string | null
          experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          specializations: string[] | null
          subscription_tier: 'free' | 'premium' | 'enterprise'
          subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_start_date: string | null
          subscription_end_date: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          specializations?: string[] | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          specializations?: string[] | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trial'
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          content: string | null
          resource_type: 'article' | 'tool' | 'course' | 'community' | 'documentation' | 'cheatsheet' | 'video' | 'podcast'
          url: string | null
          thumbnail_url: string | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          estimated_time_minutes: number | null
          is_premium: boolean
          is_featured: boolean
          is_published: boolean
          view_count: number
          like_count: number
          bookmark_count: number
          author_id: string | null
          created_by: string | null
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon_name: string | null
          color_scheme: string | null
          parent_category_id: string | null
          sort_order: number
          is_active: boolean
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}