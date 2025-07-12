// Database types based on the actual Supabase schema

export interface Profile {
  id: string
  username?: string
  full_name?: string
  email: string
  avatar_url?: string
  bio?: string
  subscription_tier: 'free' | 'pro'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon_name: string
  color_scheme: string
  parent_category_id?: string
  sort_order: number
  is_active: boolean
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  title: string
  slug: string
  description: string
  content?: string
  resource_type: 'course' | 'article' | 'video' | 'tool' | 'community' | 'documentation' | 'cheat_sheet' | 'podcast' | 'threat' | 'breach'
  url?: string
  thumbnail_url?: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_time_minutes?: number
  is_premium: boolean
  is_featured: boolean
  is_published: boolean
  view_count: number
  like_count: number
  bookmark_count: number
  author_id?: string
  created_by?: string
  category_id?: string
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  created_at: string
  updated_at: string
  published_at?: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  usage_count: number
  created_at: string
}

export interface LearningPath {
  id: string
  title: string
  slug: string
  description: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_hours?: number
  is_premium: boolean
  is_published: boolean
  created_by: string
  thumbnail_url?: string
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  resource_id?: string
  learning_path_id?: string
  progress_percentage: number
  status: 'not_started' | 'in_progress' | 'completed'
  time_spent_minutes?: number
  last_accessed_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  tier: 'free' | 'pro'
  status: 'active' | 'canceled' | 'expired'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_start?: string
  current_period_end?: string
  canceled_at?: string
  created_at: string
  updated_at: string
}

// Additional types for features mentioned in the summary
export interface Bookmark {
  id: string
  user_id: string
  resource_id: string
  created_at: string
}

export interface Meeting {
  id: string
  user_id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
  meeting_url?: string
  status: 'scheduled' | 'completed' | 'canceled'
  expert_id?: string
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon_name: string
  badge_url?: string
  points: number
  requirement_type: 'course_completion' | 'time_spent' | 'streak' | 'resource_views'
  requirement_value: number
  is_active: boolean
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'achievement' | 'course_update' | 'meeting_reminder' | 'subscription' | 'general'
  is_read: boolean
  action_url?: string
  created_at: string
}

// Response types for API calls
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}