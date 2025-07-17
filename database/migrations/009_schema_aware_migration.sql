-- Schema-Aware Migration for Cybernex Academy
-- This migration intelligently handles existing tables and only adds what's missing

-- =============================================
-- UTILITY FUNCTIONS FOR SCHEMA DETECTION
-- =============================================

-- Function to check if a column exists
CREATE OR REPLACE FUNCTION column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = $1 
    AND column_name = $2
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a constraint exists
CREATE OR REPLACE FUNCTION constraint_exists(table_name TEXT, constraint_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND table_name = $1 
    AND constraint_name = $2
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 1. PROFILES TABLE ENHANCEMENTS
-- =============================================

DO $ 
BEGIN
  -- Add missing columns to profiles table if they don't exist
  IF NOT column_exists('profiles', 'stripe_customer_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;
  
  IF NOT column_exists('profiles', 'subscription_tier') THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
  END IF;
  
  IF NOT column_exists('profiles', 'subscription_status') THEN
    ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
  END IF;
  
  IF NOT column_exists('profiles', 'subscription_start_date') THEN
    ALTER TABLE profiles ADD COLUMN subscription_start_date TIMESTAMPTZ;
  END IF;
  
  IF NOT column_exists('profiles', 'subscription_end_date') THEN
    ALTER TABLE profiles ADD COLUMN subscription_end_date TIMESTAMPTZ;
  END IF;
  
  IF NOT column_exists('profiles', 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
  
  IF NOT column_exists('profiles', 'is_verified') THEN
    ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT column_exists('profiles', 'last_sign_in_at') THEN
    ALTER TABLE profiles ADD COLUMN last_sign_in_at TIMESTAMPTZ;
  END IF;
  
  IF NOT column_exists('profiles', 'sign_in_count') THEN
    ALTER TABLE profiles ADD COLUMN sign_in_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add constraints if they don't exist
  IF NOT constraint_exists('profiles', 'profiles_subscription_tier_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
    CHECK (subscription_tier IN ('free', 'premium', 'enterprise'));
  END IF;
  
  IF NOT constraint_exists('profiles', 'profiles_role_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'moderator', 'admin', 'super_admin', 'content_creator'));
  END IF;
END $;

-- =============================================
-- 2. RESOURCES TABLE ENHANCEMENTS
-- =============================================

DO $ 
BEGIN
  -- Add missing columns to resources table if they don't exist
  IF NOT column_exists('resources', 'slug') THEN
    ALTER TABLE resources ADD COLUMN slug TEXT;
  END IF;
  
  IF NOT column_exists('resources', 'content') THEN
    ALTER TABLE resources ADD COLUMN content TEXT;
  END IF;
  
  IF NOT column_exists('resources', 'author_id') THEN
    ALTER TABLE resources ADD COLUMN author_id UUID;
  END IF;
  
  IF NOT column_exists('resources', 'created_by') THEN
    ALTER TABLE resources ADD COLUMN created_by UUID;
  END IF;
  
  IF NOT column_exists('resources', 'view_count') THEN
    ALTER TABLE resources ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT column_exists('resources', 'like_count') THEN
    ALTER TABLE resources ADD COLUMN like_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT column_exists('resources', 'bookmark_count') THEN
    ALTER TABLE resources ADD COLUMN bookmark_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT column_exists('resources', 'rating') THEN
    ALTER TABLE resources ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
  END IF;
  
  IF NOT column_exists('resources', 'rating_count') THEN
    ALTER TABLE resources ADD COLUMN rating_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT column_exists('resources', 'search_vector') THEN
    ALTER TABLE resources ADD COLUMN search_vector TSVECTOR;
  END IF;
  
  -- Add foreign key constraints if they don't exist
  IF NOT constraint_exists('resources', 'resources_author_id_fkey') THEN
    ALTER TABLE resources ADD CONSTRAINT resources_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES auth.users(id);
  END IF;
  
  IF NOT constraint_exists('resources', 'resources_created_by_fkey') THEN
    ALTER TABLE resources ADD CONSTRAINT resources_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);
  END IF;
  
  -- Add unique constraint to slug if it doesn't exist
  IF NOT constraint_exists('resources', 'resources_slug_key') THEN
    ALTER TABLE resources ADD CONSTRAINT resources_slug_key UNIQUE (slug);
  END IF;
END $;

-- =============================================
-- 3. CATEGORIES TABLE
-- =============================================

DO $ 
BEGIN
  IF NOT table_exists('categories') THEN
    CREATE TABLE categories (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      color TEXT DEFAULT '#6B7280',
      parent_id UUID REFERENCES categories(id),
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      resource_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- =============================================
-- 4. USER PROGRESS TABLE ENHANCEMENTS
-- =============================================

DO $ 
BEGIN
  -- Add missing columns to user_progress table if they don't exist
  IF NOT column_exists('user_progress', 'learning_path_id') THEN
    ALTER TABLE user_progress ADD COLUMN learning_path_id UUID;
  END IF;
  
  IF NOT column_exists('user_progress', 'status') THEN
    ALTER TABLE user_progress ADD COLUMN status TEXT DEFAULT 'not_started';
  END IF;
  
  IF NOT column_exists('user_progress', 'time_spent_minutes') THEN
    ALTER TABLE user_progress ADD COLUMN time_spent_minutes INTEGER DEFAULT 0;
  END IF;
  
  IF NOT column_exists('user_progress', 'last_accessed_at') THEN
    ALTER TABLE user_progress ADD COLUMN last_accessed_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT column_exists('user_progress', 'quiz_scores') THEN
    ALTER TABLE user_progress ADD COLUMN quiz_scores JSONB DEFAULT '[]';
  END IF;
  
  IF NOT column_exists('user_progress', 'notes') THEN
    ALTER TABLE user_progress ADD COLUMN notes TEXT;
  END IF;
  
  -- Add check constraint if it doesn't exist
  IF NOT constraint_exists('user_progress', 'user_progress_status_check') THEN
    ALTER TABLE user_progress ADD CONSTRAINT user_progress_status_check 
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused'));
  END IF;
END $;

-- =============================================
-- 5. BOOKMARKS SYSTEM
-- =============================================

-- Create bookmark_collections table first
DO $ 
BEGIN
  IF NOT table_exists('bookmark_collections') THEN
    CREATE TABLE bookmark_collections (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- Handle bookmarks table (rename if exists, create new structure)
DO $ 
BEGIN
  -- If old bookmarks table exists, rename it
  IF table_exists('bookmarks') AND NOT table_exists('user_bookmarks') THEN
    ALTER TABLE bookmarks RENAME TO user_bookmarks_old;
  END IF;
  
  -- Create new user_bookmarks table
  IF NOT table_exists('user_bookmarks') THEN
    CREATE TABLE user_bookmarks (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
      collection_id UUID REFERENCES bookmark_collections(id) ON DELETE SET NULL,
      notes TEXT,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, resource_id)
    );
  END IF;
END $;

-- =============================================
-- 6. USER LIKES TABLE
-- =============================================

DO $ 
BEGIN
  IF NOT table_exists('user_likes') THEN
    CREATE TABLE user_likes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, resource_id)
    );
  END IF;
END $;

-- =============================================
-- 7. LEARNING PATHS SYSTEM
-- =============================================

-- Create or enhance learning_paths table
DO $ 
BEGIN
  IF NOT table_exists('learning_paths') THEN
    CREATE TABLE learning_paths (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      thumbnail_url TEXT,
      difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
      estimated_hours INTEGER,
      is_premium BOOLEAN DEFAULT false,
      is_published BOOLEAN DEFAULT false,
      is_featured BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      view_count INTEGER DEFAULT 0,
      enrollment_count INTEGER DEFAULT 0,
      completion_count INTEGER DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      seo_keywords TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      published_at TIMESTAMPTZ
    );
  ELSE
    -- Add missing columns to existing learning_paths table
    IF NOT column_exists('learning_paths', 'slug') THEN
      ALTER TABLE learning_paths ADD COLUMN slug TEXT;
    END IF;
    
    IF NOT column_exists('learning_paths', 'thumbnail_url') THEN
      ALTER TABLE learning_paths ADD COLUMN thumbnail_url TEXT;
    END IF;
    
    IF NOT column_exists('learning_paths', 'difficulty_level') THEN
      ALTER TABLE learning_paths ADD COLUMN difficulty_level TEXT;
    END IF;
    
    IF NOT column_exists('learning_paths', 'estimated_hours') THEN
      ALTER TABLE learning_paths ADD COLUMN estimated_hours INTEGER;
    END IF;
    
    IF NOT column_exists('learning_paths', 'is_premium') THEN
      ALTER TABLE learning_paths ADD COLUMN is_premium BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT column_exists('learning_paths', 'is_published') THEN
      ALTER TABLE learning_paths ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT column_exists('learning_paths', 'is_featured') THEN
      ALTER TABLE learning_paths ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT column_exists('learning_paths', 'sort_order') THEN
      ALTER TABLE learning_paths ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
    
    IF NOT column_exists('learning_paths', 'created_by') THEN
      ALTER TABLE learning_paths ADD COLUMN created_by UUID;
    END IF;
    
    IF NOT column_exists('learning_paths', 'view_count') THEN
      ALTER TABLE learning_paths ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT column_exists('learning_paths', 'enrollment_count') THEN
      ALTER TABLE learning_paths ADD COLUMN enrollment_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT column_exists('learning_paths', 'completion_count') THEN
      ALTER TABLE learning_paths ADD COLUMN completion_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT column_exists('learning_paths', 'seo_title') THEN
      ALTER TABLE learning_paths ADD COLUMN seo_title TEXT;
    END IF;
    
    IF NOT column_exists('learning_paths', 'seo_description') THEN
      ALTER TABLE learning_paths ADD COLUMN seo_description TEXT;
    END IF;
    
    IF NOT column_exists('learning_paths', 'seo_keywords') THEN
      ALTER TABLE learning_paths ADD COLUMN seo_keywords TEXT[];
    END IF;
    
    IF NOT column_exists('learning_paths', 'published_at') THEN
      ALTER TABLE learning_paths ADD COLUMN published_at TIMESTAMPTZ;
    END IF;
    
    -- Add constraints if they don't exist
    IF NOT constraint_exists('learning_paths', 'learning_paths_slug_key') THEN
      ALTER TABLE learning_paths ADD CONSTRAINT learning_paths_slug_key UNIQUE (slug);
    END IF;
    
    IF NOT constraint_exists('learning_paths', 'learning_paths_difficulty_level_check') THEN
      ALTER TABLE learning_paths ADD CONSTRAINT learning_paths_difficulty_level_check 
      CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
    END IF;
    
    IF NOT constraint_exists('learning_paths', 'learning_paths_created_by_fkey') THEN
      ALTER TABLE learning_paths ADD CONSTRAINT learning_paths_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $;

-- Add foreign key to user_progress if learning_paths table now exists
DO $ 
BEGIN
  IF table_exists('learning_paths') AND column_exists('user_progress', 'learning_path_id') THEN
    IF NOT constraint_exists('user_progress', 'user_progress_learning_path_id_fkey') THEN
      ALTER TABLE user_progress ADD CONSTRAINT user_progress_learning_path_id_fkey 
      FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id);
    END IF;
  END IF;
END $;

-- Create learning_path_resources table
DO $ 
BEGIN
  IF NOT table_exists('learning_path_resources') THEN
    CREATE TABLE learning_path_resources (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
      resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL,
      is_required BOOLEAN DEFAULT true,
      estimated_minutes INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(learning_path_id, resource_id)
    );
  END IF;
END $;

-- Create learning_path_enrollments table
DO $ 
BEGIN
  IF NOT table_exists('learning_path_enrollments') THEN
    CREATE TABLE learning_path_enrollments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'paused')),
      progress_percentage INTEGER DEFAULT 0,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, learning_path_id)
    );
  END IF;
END $;

-- =============================================
-- 8. FORUM SYSTEM
-- =============================================

-- Create forum_categories table
DO $ 
BEGIN
  IF NOT table_exists('forum_categories') THEN
    CREATE TABLE forum_categories (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT DEFAULT '#6B7280',
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      post_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- Create forum_posts table
DO $ 
BEGIN
  IF NOT table_exists('forum_posts') THEN
    CREATE TABLE forum_posts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
      tags TEXT[] DEFAULT '{}',
      is_pinned BOOLEAN DEFAULT false,
      is_locked BOOLEAN DEFAULT false,
      is_solved BOOLEAN DEFAULT false,
      view_count INTEGER DEFAULT 0,
      reply_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      last_reply_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- Create forum_replies table
DO $ 
BEGIN
  IF NOT table_exists('forum_replies') THEN
    CREATE TABLE forum_replies (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
      author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
      is_solution BOOLEAN DEFAULT false,
      like_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- =============================================
-- 9. NOTIFICATIONS SYSTEM
-- =============================================

DO $ 
BEGIN
  IF NOT table_exists('notifications') THEN
    CREATE TABLE notifications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data JSONB DEFAULT '{}',
      is_read BOOLEAN DEFAULT false,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      category TEXT DEFAULT 'system' CHECK (category IN ('system', 'learning', 'community', 'billing', 'security')),
      action_url TEXT,
      action_text TEXT,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      read_at TIMESTAMPTZ
    );
  END IF;
END $;

-- =============================================
-- 10. ACHIEVEMENTS SYSTEM
-- =============================================

-- Create achievements table
DO $ 
BEGIN
  IF NOT table_exists('achievements') THEN
    CREATE TABLE achievements (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      icon TEXT,
      badge_color TEXT DEFAULT '#6B7280',
      category TEXT DEFAULT 'general',
      points INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      requirements JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- Create user_achievements table
DO $ 
BEGIN
  IF NOT table_exists('user_achievements') THEN
    CREATE TABLE user_achievements (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
      earned_at TIMESTAMPTZ DEFAULT NOW(),
      progress_data JSONB DEFAULT '{}',
      UNIQUE(user_id, achievement_id)
    );
  END IF;
END $;

-- =============================================
-- 11. USER PREFERENCES
-- =============================================

DO $ 
BEGIN
  IF NOT table_exists('user_preferences') THEN
    CREATE TABLE user_preferences (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
      language TEXT DEFAULT 'en',
      timezone TEXT DEFAULT 'UTC',
      email_notifications BOOLEAN DEFAULT true,
      push_notifications BOOLEAN DEFAULT true,
      marketing_emails BOOLEAN DEFAULT false,
      notification_preferences JSONB DEFAULT '{}',
      privacy_settings JSONB DEFAULT '{}',
      learning_preferences JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- =============================================
-- 12. SUBSCRIPTION SYSTEM
-- =============================================

-- Create subscriptions table
DO $ 
BEGIN
  IF NOT table_exists('subscriptions') THEN
    CREATE TABLE subscriptions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      stripe_subscription_id TEXT UNIQUE NOT NULL,
      stripe_customer_id TEXT NOT NULL,
      status TEXT NOT NULL,
      price_id TEXT NOT NULL,
      current_period_start TIMESTAMPTZ NOT NULL,
      current_period_end TIMESTAMPTZ NOT NULL,
      trial_start TIMESTAMPTZ,
      trial_end TIMESTAMPTZ,
      cancel_at_period_end BOOLEAN DEFAULT FALSE,
      canceled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- Create payment_history table
DO $ 
BEGIN
  IF NOT table_exists('payment_history') THEN
    CREATE TABLE payment_history (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      stripe_invoice_id TEXT,
      stripe_customer_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'usd',
      status TEXT NOT NULL,
      description TEXT,
      failure_reason TEXT,
      invoice_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- =============================================
-- 13. ANALYTICS TABLES
-- =============================================

-- Create user_sessions table
DO $ 
BEGIN
  IF NOT table_exists('user_sessions') THEN
    CREATE TABLE user_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      session_id TEXT NOT NULL,
      ip_address INET,
      user_agent TEXT,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      ended_at TIMESTAMPTZ,
      duration_minutes INTEGER,
      pages_visited INTEGER DEFAULT 0
    );
  END IF;
END $;

-- Create page_views table
DO $ 
BEGIN
  IF NOT table_exists('page_views') THEN
    CREATE TABLE page_views (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      session_id TEXT,
      page_path TEXT NOT NULL,
      page_title TEXT,
      referrer TEXT,
      load_time INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- Create resource_views table
DO $ 
BEGIN
  IF NOT table_exists('resource_views') THEN
    CREATE TABLE resource_views (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
      session_id TEXT,
      view_duration_seconds INTEGER,
      scroll_percentage INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- =============================================
-- 14. AUDIT TABLES
-- =============================================

-- Create admin_audit_log table
DO $ 
BEGIN
  IF NOT table_exists('admin_audit_log') THEN
    CREATE TABLE admin_audit_log (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id UUID,
      resource_count INTEGER,
      success_count INTEGER,
      failure_count INTEGER,
      details JSONB DEFAULT '{}',
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- Create resource_audit_log table
DO $ 
BEGIN
  IF NOT table_exists('resource_audit_log') THEN
    CREATE TABLE resource_audit_log (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      old_values JSONB,
      new_values JSONB,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $;

-- Create webhook_logs table
DO $ 
BEGIN
  IF NOT table_exists('webhook_logs') THEN
    CREATE TABLE webhook_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('success', 'error')),
      error_message TEXT,
      processed_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL
    );
  END IF;
END $;

-- =============================================
-- 15. CREATE INDEXES (ONLY IF COLUMNS EXIST)
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_resources_premium ON resources(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_view_count ON resources(view_count);
CREATE INDEX IF NOT EXISTS idx_resources_rating ON resources(rating);

-- Only create these indexes if the columns exist
DO $ 
BEGIN
  IF column_exists('resources', 'author_id') THEN
    CREATE INDEX IF NOT EXISTS idx_resources_author ON resources(author_id);
  END IF;
  
  IF column_exists('resources', 'created_by') THEN
    CREATE INDEX IF NOT EXISTS idx_resources_created_by ON resources(created_by);
  END IF;
  
  IF column_exists('resources', 'search_vector') THEN
    CREATE INDEX IF NOT EXISTS idx_resources_search_vector ON resources USING GIN(search_vector);
  END IF;
END $;

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_resource_id ON user_progress(resource_id);

DO $ 
BEGIN
  IF column_exists('user_progress', 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
  END IF;
  
  IF column_exists('user_progress', 'learning_path_id') THEN
    CREATE INDEX IF NOT EXISTS idx_user_progress_learning_path ON user_progress(learning_path_id);
  END IF;
END $;

-- Bookmark indexes (only if table exists)
DO $ 
BEGIN
  IF table_exists('user_bookmarks') THEN
    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_resource_id ON user_bookmarks(resource_id);
    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON user_bookmarks(created_at);
  END IF;
END $;

-- Learning path indexes (only if table and columns exist)
DO $ 
BEGIN
  IF table_exists('learning_paths') THEN
    CREATE INDEX IF NOT EXISTS idx_learning_paths_published ON learning_paths(is_published) WHERE is_published = true;
    CREATE INDEX IF NOT EXISTS idx_learning_paths_premium ON learning_paths(is_premium) WHERE is_premium = true;
    
    IF column_exists('learning_paths', 'is_featured') THEN
      CREATE INDEX IF NOT EXISTS idx_learning_paths_featured ON learning_paths(is_featured) WHERE is_featured = true;
    END IF;
    
    IF column_exists('learning_paths', 'difficulty_level') THEN
      CREATE INDEX IF NOT EXISTS idx_learning_paths_difficulty ON learning_paths(difficulty_level);
    END IF;
    
    IF column_exists('learning_paths', 'created_by') THEN
      CREATE INDEX IF NOT EXISTS idx_learning_paths_created_by ON learning_paths(created_by);
    END IF;
  END IF;
END $;

-- Learning path resources indexes
DO $ 
BEGIN
  IF table_exists('learning_path_resources') THEN
    CREATE INDEX IF NOT EXISTS idx_learning_path_resources_path ON learning_path_resources(learning_path_id);
    CREATE INDEX IF NOT EXISTS idx_learning_path_resources_resource ON learning_path_resources(resource_id);
    CREATE INDEX IF NOT EXISTS idx_learning_path_resources_order ON learning_path_resources(learning_path_id, sort_order);
  END IF;
END $;

-- Learning path enrollments indexes
DO $ 
BEGIN
  IF table_exists('learning_path_enrollments') THEN
    CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_user ON learning_path_enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_path ON learning_path_enrollments(learning_path_id);
    CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_status ON learning_path_enrollments(status);
  END IF;
END $;

-- Forum indexes
DO $ 
BEGIN
  IF table_exists('forum_posts') THEN
    CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
    CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
    CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(is_pinned) WHERE is_pinned = true;
  END IF;
  
  IF table_exists('forum_replies') THEN
    CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
    CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON forum_replies(author_id);
    CREATE INDEX IF NOT EXISTS idx_forum_replies_parent ON forum_replies(parent_reply_id);
  END IF;
END $;

-- Notification indexes
DO $ 
BEGIN
  IF table_exists('notifications') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;
  END IF;
END $;

-- Achievement indexes
DO $ 
BEGIN
  IF table_exists('user_achievements') THEN
    CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);
  END IF;
END $;

-- Subscription indexes
DO $ 
BEGIN
  IF table_exists('subscriptions') THEN
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
  END IF;
  
  IF table_exists('payment_history') THEN
    CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
    CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at);
  END IF;
END $;

-- Analytics indexes
DO $ 
BEGIN
  IF table_exists('page_views') THEN
    CREATE INDEX IF NOT EXISTS idx_page_views_user ON page_views(user_id);
    CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
    CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
  END IF;
  
  IF table_exists('resource_views') THEN
    CREATE INDEX IF NOT EXISTS idx_resource_views_user ON resource_views(user_id);
    CREATE INDEX IF NOT EXISTS idx_resource_views_resource ON resource_views(resource_id);
    CREATE INDEX IF NOT EXISTS idx_resource_views_created_at ON resource_views(created_at);
  END IF;
END $;

-- =============================================
-- 16. CREATE FUNCTIONS AND TRIGGERS
-- =============================================

-- Search vector update function for resources
CREATE OR REPLACE FUNCTION update_resources_search_vector()
RETURNS TRIGGER AS $
BEGIN
  IF column_exists('resources', 'search_vector') THEN
    NEW.search_vector := 
      setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
      setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'D');
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Only create trigger if search_vector column exists
DO $ 
BEGIN
  IF column_exists('resources', 'search_vector') THEN
    DROP TRIGGER IF EXISTS trigger_update_resources_search_vector ON resources;
    CREATE TRIGGER trigger_update_resources_search_vector
      BEFORE INSERT OR UPDATE ON resources
      FOR EACH ROW EXECUTE FUNCTION update_resources_search_vector();
  END IF;
END $;

-- Dashboard stats function
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_uuid UUID)
RETURNS JSONB AS $
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_resources_viewed', COALESCE((
      SELECT COUNT(DISTINCT resource_id) 
      FROM resource_views 
      WHERE user_id = user_uuid AND table_exists('resource_views')
    ), 0),
    'learning_paths_enrolled', COALESCE((
      SELECT COUNT(*) 
      FROM learning_path_enrollments 
      WHERE user_id = user_uuid AND table_exists('learning_path_enrollments')
    ), 0),
    'learning_paths_completed', COALESCE((
      SELECT COUNT(*) 
      FROM learning_path_enrollments 
      WHERE user_id = user_uuid AND status = 'completed' AND table_exists('learning_path_enrollments')
    ), 0),
    'achievements_earned', COALESCE((
      SELECT COUNT(*) 
      FROM user_achievements 
      WHERE user_id = user_uuid AND table_exists('user_achievements')
    ), 0),
    'total_study_time', COALESCE((
      SELECT SUM(CASE WHEN column_exists('user_progress', 'time_spent_minutes') THEN time_spent_minutes ELSE 0 END) 
      FROM user_progress 
      WHERE user_id = user_uuid
    ), 0),
    'bookmarks_count', COALESCE((
      SELECT COUNT(*) 
      FROM user_bookmarks 
      WHERE user_id = user_uuid AND table_exists('user_bookmarks')
    ), 0),
    'forum_posts_count', COALESCE((
      SELECT COUNT(*) 
      FROM forum_posts 
      WHERE author_id = user_uuid AND table_exists('forum_posts')
    ), 0)
  ) INTO result;
  
  RETURN result;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Advanced search function
CREATE OR REPLACE FUNCTION search_resources_advanced(
  search_query TEXT DEFAULT '',
  categories TEXT[] DEFAULT '{}',
  resource_types TEXT[] DEFAULT '{}',
  premium_only BOOLEAN DEFAULT FALSE,
  difficulty_levels TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  resource_type TEXT,
  difficulty_level TEXT,
  is_premium BOOLEAN,
  view_count INTEGER,
  rating DECIMAL,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.resource_type,
    r.difficulty_level,
    r.is_premium,
    r.view_count,
    r.rating,
    r.created_at,
    CASE 
      WHEN search_query = '' OR NOT column_exists('resources', 'search_vector') THEN 0::REAL
      ELSE ts_rank(r.search_vector, plainto_tsquery('english', search_query))
    END as rank
  FROM resources r
  WHERE r.is_published = true
    AND (search_query = '' OR NOT column_exists('resources', 'search_vector') OR r.search_vector @@ plainto_tsquery('english', search_query))
    AND (array_length(categories, 1) IS NULL OR r.category_id = ANY(categories::UUID[]))
    AND (array_length(resource_types, 1) IS NULL OR r.resource_type = ANY(resource_types))
    AND (NOT premium_only OR r.is_premium = premium_only)
    AND (array_length(difficulty_levels, 1) IS NULL OR r.difficulty_level = ANY(difficulty_levels))
    AND (array_length(tags, 1) IS NULL OR r.tags && tags)
  ORDER BY 
    CASE WHEN search_query = '' THEN r.created_at END DESC,
    CASE WHEN search_query != '' AND column_exists('resources', 'search_vector') THEN ts_rank(r.search_vector, plainto_tsquery('english', search_query)) END DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 17. CLEANUP UTILITY FUNCTIONS
-- =============================================

-- Drop the utility functions we created for this migration
DROP FUNCTION IF EXISTS column_exists(TEXT, TEXT);
DROP FUNCTION IF EXISTS table_exists(TEXT);
DROP FUNCTION IF EXISTS constraint_exists(TEXT, TEXT);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 'Schema-aware migration completed successfully! All missing tables and columns have been added.' as status;

COMMIT;