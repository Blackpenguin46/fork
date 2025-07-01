import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback to STORAGE_ prefixed versions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.STORAGE_NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.STORAGE_NEXT_PUBLIC_SUPABASE_ANON_KEY

// Simple validation and client creation like the original working version
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Some functionality may be disabled.')
}

// Create client if we have the required variables
const supabaseClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) : null

export const supabase = supabaseClient

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