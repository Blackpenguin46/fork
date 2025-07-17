export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          role: string
          subscription_tier: string
          subscription_status: string
          onboarding_completed: boolean
          last_login_at: string | null
          login_count: number
          stripe_customer_id: string | null
          subscription_start_date: string | null
          subscription_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          role?: string
          subscription_tier?: string
          subscription_status?: string
          onboarding_completed?: boolean
          last_login_at?: string | null
          login_count?: number
          stripe_customer_id?: string | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          role?: string
          subscription_tier?: string
          subscription_status?: string
          onboarding_completed?: boolean
          last_login_at?: string | null
          login_count?: number
          stripe_customer_id?: string | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          slug: string | null
          description: string | null
          content: string | null
          resource_type: string
          url: string | null
          thumbnail_url: string | null
          difficulty_level: string | null
          estimated_time_minutes: number | null
          is_premium: boolean
          is_featured: boolean
          is_published: boolean
          tags: string[]
          author_id: string | null
          created_by: string | null
          view_count: number
          like_count: number
          bookmark_count: number
          rating: number
          rating_count: number
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug?: string | null
          description?: string | null
          content?: string | null
          resource_type: string
          url?: string | null
          thumbnail_url?: string | null
          difficulty_level?: string | null
          estimated_time_minutes?: number | null
          is_premium?: boolean
          is_featured?: boolean
          is_published?: boolean
          tags?: string[]
          author_id?: string | null
          created_by?: string | null
          view_count?: number
          like_count?: number
          bookmark_count?: number
          rating?: number
          rating_count?: number
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string | null
          description?: string | null
          content?: string | null
          resource_type?: string
          url?: string | null
          thumbnail_url?: string | null
          difficulty_level?: string | null
          estimated_time_minutes?: number | null
          is_premium?: boolean
          is_featured?: boolean
          is_published?: boolean
          tags?: string[]
          author_id?: string | null
          created_by?: string | null
          view_count?: number
          like_count?: number
          bookmark_count?: number
          rating?: number
          rating_count?: number
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string
          parent_id: string | null
          sort_order: number
          is_active: boolean
          resource_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          resource_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          resource_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          learning_path_id: string | null
          resource_type: string
          status: string
          progress_percentage: number
          time_spent_minutes: number
          last_accessed_at: string
          completed_at: string | null
          quiz_scores: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          learning_path_id?: string | null
          resource_type: string
          status?: string
          progress_percentage?: number
          time_spent_minutes?: number
          last_accessed_at?: string
          completed_at?: string | null
          quiz_scores?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          learning_path_id?: string | null
          resource_type?: string
          status?: string
          progress_percentage?: number
          time_spent_minutes?: number
          last_accessed_at?: string
          completed_at?: string | null
          quiz_scores?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_bookmarks: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          collection_id: string | null
          notes: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          collection_id?: string | null
          notes?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          collection_id?: string | null
          notes?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_likes: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          created_at?: string
        }
      }
      bookmark_collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      learning_paths: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          thumbnail_url: string | null
          difficulty_level: string | null
          estimated_hours: number | null
          is_premium: boolean
          is_published: boolean
          is_featured: boolean
          sort_order: number
          created_by: string | null
          view_count: number
          enrollment_count: number
          completion_count: number
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          thumbnail_url?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          is_premium?: boolean
          is_published?: boolean
          is_featured?: boolean
          sort_order?: number
          created_by?: string | null
          view_count?: number
          enrollment_count?: number
          completion_count?: number
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          thumbnail_url?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          is_premium?: boolean
          is_published?: boolean
          is_featured?: boolean
          sort_order?: number
          created_by?: string | null
          view_count?: number
          enrollment_count?: number
          completion_count?: number
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      learning_path_resources: {
        Row: {
          id: string
          learning_path_id: string
          resource_id: string
          sort_order: number
          is_required: boolean
          estimated_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          learning_path_id: string
          resource_id: string
          sort_order: number
          is_required?: boolean
          estimated_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          learning_path_id?: string
          resource_id?: string
          sort_order?: number
          is_required?: boolean
          estimated_minutes?: number | null
          created_at?: string
        }
      }
      learning_path_enrollments: {
        Row: {
          id: string
          user_id: string
          learning_path_id: string
          status: string
          progress_percentage: number
          started_at: string
          completed_at: string | null
          last_accessed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          learning_path_id: string
          status?: string
          progress_percentage?: number
          started_at?: string
          completed_at?: string | null
          last_accessed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          learning_path_id?: string
          status?: string
          progress_percentage?: number
          started_at?: string
          completed_at?: string | null
          last_accessed_at?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string
          sort_order: number
          is_active: boolean
          post_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string
          sort_order?: number
          is_active?: boolean
          post_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string
          sort_order?: number
          is_active?: boolean
          post_count?: number
          created_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          category_id: string
          tags: string[]
          is_pinned: boolean
          is_locked: boolean
          is_solved: boolean
          view_count: number
          reply_count: number
          like_count: number
          last_reply_at: string | null
          last_reply_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          category_id: string
          tags?: string[]
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean
          view_count?: number
          reply_count?: number
          like_count?: number
          last_reply_at?: string | null
          last_reply_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          category_id?: string
          tags?: string[]
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean
          view_count?: number
          reply_count?: number
          like_count?: number
          last_reply_at?: string | null
          last_reply_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_replies: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          parent_reply_id: string | null
          is_solution: boolean
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          parent_reply_id?: string | null
          is_solution?: boolean
          like_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          parent_reply_id?: string | null
          is_solution?: boolean
          like_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          action_url: string | null
          action_label: string | null
          is_read: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          action_url?: string | null
          action_label?: string | null
          is_read?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          action_url?: string | null
          action_label?: string | null
          is_read?: boolean
          metadata?: Json
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          badge_color: string
          criteria: Json
          points: number
          rarity: string
          is_active: boolean
          earned_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          badge_color?: string
          criteria: Json
          points?: number
          rarity?: string
          is_active?: boolean
          earned_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          badge_color?: string
          criteria?: Json
          points?: number
          rarity?: string
          is_active?: boolean
          earned_count?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
          metadata?: Json
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          marketing_emails: boolean
          theme: string
          language: string
          timezone: string
          difficulty_preference: string | null
          interests: string[]
          learning_goals: string[]
          weekly_goal_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          marketing_emails?: boolean
          theme?: string
          language?: string
          timezone?: string
          difficulty_preference?: string | null
          interests?: string[]
          learning_goals?: string[]
          weekly_goal_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          marketing_emails?: boolean
          theme?: string
          language?: string
          timezone?: string
          difficulty_preference?: string | null
          interests?: string[]
          learning_goals?: string[]
          weekly_goal_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string
          status: string
          price_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id: string
          status: string
          price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string
          status?: string
          price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          stripe_invoice_id: string | null
          stripe_customer_id: string
          amount: number
          currency: string
          status: string
          description: string | null
          invoice_url: string | null
          failure_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_invoice_id?: string | null
          stripe_customer_id: string
          amount: number
          currency?: string
          status: string
          description?: string | null
          invoice_url?: string | null
          failure_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_invoice_id?: string | null
          stripe_customer_id?: string
          amount?: number
          currency?: string
          status?: string
          description?: string | null
          invoice_url?: string | null
          failure_reason?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_dashboard_stats: {
        Args: {
          user_uuid: string
        }
        Returns: {
          courses_started: number
          courses_completed: number
          bookmarks_count: number
          overall_progress: number
          achievements_count: number
          learning_paths_enrolled: number
          total_time_spent: number
        }[]
      }
      search_resources_advanced: {
        Args: {
          search_query?: string
          resource_types?: string[]
          difficulty_levels?: string[]
          is_premium_filter?: boolean
          category_ids_filter?: string[]
          tags_filter?: string[]
          result_limit?: number
          result_offset?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          resource_type: string
          difficulty_level: string
          is_premium: boolean
          is_featured: boolean
          view_count: number
          like_count: number
          bookmark_count: number
          created_at: string
          rank: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}