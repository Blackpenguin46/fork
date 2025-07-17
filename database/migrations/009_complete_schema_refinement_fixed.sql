-- Complete Schema Refinement for Production (FIXED VERSION)
-- This migration adds all missing tables and refines existing ones

-- =============================================
-- 1. RESOURCES TABLE ENHANCEMENTS
-- =============================================

-- Add missing columns to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Add unique constraint to slug if it doesn't exist
DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'resources_slug_key' 
                 AND table_name = 'resources') THEN
    ALTER TABLE resources ADD CONSTRAINT resources_slug_key UNIQUE (slug);
  END IF;
END $;

-- Create search index
CREATE INDEX IF NOT EXISTS idx_resources_search_vector ON resources USING GIN(search_vector);

-- Update search vector trigger
CREATE OR REPLACE FUNCTION update_resources_search_vector()
RETURNS TRIGGER AS $
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'D');
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_resources_search_vector ON resources;
CREATE TRIGGER trigger_update_resources_search_vector
  BEFORE INSERT OR UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_resources_search_vector();

-- =============================================
-- 2. CATEGORIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
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

-- =============================================
-- 3. USER LIKES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS user_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- =============================================
-- 4. BOOKMARK COLLECTIONS TABLE (Create first)
-- =============================================

CREATE TABLE IF NOT EXISTS bookmark_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. USER BOOKMARKS TABLE (Enhanced)
-- =============================================

-- Rename existing bookmarks table if it exists
DO $ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookmarks') THEN
    ALTER TABLE bookmarks RENAME TO user_bookmarks_old;
  END IF;
END $;

CREATE TABLE IF NOT EXISTS user_bookmarks (
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

-- =============================================
-- 6. LEARNING PATHS SYSTEM
-- =============================================

-- Create learning_paths table or add missing columns
DO $ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'learning_paths') THEN
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
    ALTER TABLE learning_paths 
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
    ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
    ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS completion_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS seo_title TEXT,
    ADD COLUMN IF NOT EXISTS seo_description TEXT,
    ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
    
    -- Add constraints if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'learning_paths_slug_key' 
                   AND table_name = 'learning_paths') THEN
      ALTER TABLE learning_paths ADD CONSTRAINT learning_paths_slug_key UNIQUE (slug);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'learning_paths_difficulty_level_check' 
                   AND table_name = 'learning_paths') THEN
      ALTER TABLE learning_paths ADD CONSTRAINT learning_paths_difficulty_level_check 
      CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'learning_paths_created_by_fkey' 
                   AND table_name = 'learning_paths') THEN
      ALTER TABLE learning_paths ADD CONSTRAINT learning_paths_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $;

CREATE TABLE IF NOT EXISTS learning_path_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  estimated_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learning_path_id, resource_id)
);

CREATE TABLE IF NOT EXISTS learning_path_enrollments (
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

-- =============================================
-- 7. ENHANCED USER PROGRESS
-- =============================================

-- Update user_progress table
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS learning_path_id UUID,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS quiz_scores JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add foreign key constraint if it doesn't exist
DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'user_progress_learning_path_id_fkey' 
                 AND table_name = 'user_progress') THEN
    ALTER TABLE user_progress ADD CONSTRAINT user_progress_learning_path_id_fkey 
    FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id);
  END IF;
END $;

-- Add check constraint if it doesn't exist
DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                 WHERE constraint_name = 'user_progress_status_check' 
                 AND table_name = 'user_progress') THEN
    ALTER TABLE user_progress ADD CONSTRAINT user_progress_status_check 
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused'));
  END IF;
END $;

-- Rename time_spent to time_spent_minutes if it exists
DO $ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'time_spent') THEN
    ALTER TABLE user_progress RENAME COLUMN time_spent TO time_spent_old;
  END IF;
END $;

-- =============================================
-- 8. FORUM SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS forum_categories (
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

CREATE TABLE IF NOT EXISTS forum_posts (
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

CREATE TABLE IF NOT EXISTS forum_replies (
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

-- =============================================
-- 9. NOTIFICATIONS SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
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

-- =============================================
-- 10. ACHIEVEMENTS SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS achievements (
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

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress_data JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- 11. USER PREFERENCES
-- =============================================

CREATE TABLE IF NOT EXISTS user_preferences (
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

-- =============================================
-- 12. SUBSCRIPTION SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS subscriptions (
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

CREATE TABLE IF NOT EXISTS payment_history (
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

-- =============================================
-- 13. ANALYTICS TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS user_sessions (
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

CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  load_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  session_id TEXT,
  view_duration_seconds INTEGER,
  scroll_percentage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 14. AUDIT TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
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

CREATE TABLE IF NOT EXISTS resource_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL
);

-- =============================================
-- 15. PERFORMANCE INDEXES
-- =============================================

-- Resource indexes
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_resources_premium ON resources(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_author ON resources(author_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON resources(created_by);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_view_count ON resources(view_count);
CREATE INDEX IF NOT EXISTS idx_resources_rating ON resources(rating);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_resource_id ON user_progress(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_learning_path ON user_progress(learning_path_id);

-- Bookmark indexes
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_resource_id ON user_bookmarks(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON user_bookmarks(created_at);

-- Learning path indexes (FIXED - only create if column exists)
DO $ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'learning_paths' AND column_name = 'is_featured') THEN
    CREATE INDEX IF NOT EXISTS idx_learning_paths_featured ON learning_paths(is_featured) WHERE is_featured = true;
  END IF;
END $;

CREATE INDEX IF NOT EXISTS idx_learning_paths_published ON learning_paths(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_learning_paths_premium ON learning_paths(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_learning_paths_difficulty ON learning_paths(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_learning_paths_created_by ON learning_paths(created_by);

-- Learning path resources indexes
CREATE INDEX IF NOT EXISTS idx_learning_path_resources_path ON learning_path_resources(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_resources_resource ON learning_path_resources(resource_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_resources_order ON learning_path_resources(learning_path_id, sort_order);

-- Learning path enrollments indexes
CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_user ON learning_path_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_path ON learning_path_enrollments(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_status ON learning_path_enrollments(status);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(is_pinned) WHERE is_pinned = true;

CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_parent ON forum_replies(parent_reply_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- Payment history indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_page_views_user ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);

CREATE INDEX IF NOT EXISTS idx_resource_views_user ON resource_views(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_resource ON resource_views(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_created_at ON resource_views(created_at);

-- =============================================
-- 16. HELPER FUNCTIONS
-- =============================================

-- Function to get user dashboard statistics
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_uuid UUID)
RETURNS JSONB AS $
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_resources_viewed', COALESCE((
      SELECT COUNT(DISTINCT resource_id) 
      FROM resource_views 
      WHERE user_id = user_uuid
    ), 0),
    'learning_paths_enrolled', COALESCE((
      SELECT COUNT(*) 
      FROM learning_path_enrollments 
      WHERE user_id = user_uuid
    ), 0),
    'learning_paths_completed', COALESCE((
      SELECT COUNT(*) 
      FROM learning_path_enrollments 
      WHERE user_id = user_uuid AND status = 'completed'
    ), 0),
    'achievements_earned', COALESCE((
      SELECT COUNT(*) 
      FROM user_achievements 
      WHERE user_id = user_uuid
    ), 0),
    'total_study_time', COALESCE((
      SELECT SUM(time_spent_minutes) 
      FROM user_progress 
      WHERE user_id = user_uuid
    ), 0),
    'bookmarks_count', COALESCE((
      SELECT COUNT(*) 
      FROM user_bookmarks 
      WHERE user_id = user_uuid
    ), 0),
    'forum_posts_count', COALESCE((
      SELECT COUNT(*) 
      FROM forum_posts 
      WHERE author_id = user_uuid
    ), 0)
  ) INTO result;
  
  RETURN result;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Advanced resource search function
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
      WHEN search_query = '' THEN 0::REAL
      ELSE ts_rank(r.search_vector, plainto_tsquery('english', search_query))
    END as rank
  FROM resources r
  WHERE r.is_published = true
    AND (search_query = '' OR r.search_vector @@ plainto_tsquery('english', search_query))
    AND (array_length(categories, 1) IS NULL OR r.category_id = ANY(categories::UUID[]))
    AND (array_length(resource_types, 1) IS NULL OR r.resource_type = ANY(resource_types))
    AND (NOT premium_only OR r.is_premium = premium_only)
    AND (array_length(difficulty_levels, 1) IS NULL OR r.difficulty_level = ANY(difficulty_levels))
    AND (array_length(tags, 1) IS NULL OR r.tags && tags)
  ORDER BY 
    CASE WHEN search_query = '' THEN r.created_at END DESC,
    CASE WHEN search_query != '' THEN ts_rank(r.search_vector, plainto_tsquery('english', search_query)) END DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 17. UPDATE EXISTING PROFILES TABLE
-- =============================================

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'super_admin', 'content_creator')),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sign_in_count INTEGER DEFAULT 0;

-- Create index on stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================
-- 18. TRIGGERS FOR MAINTAINING COUNTS
-- =============================================

-- Update resource view count trigger
CREATE OR REPLACE FUNCTION update_resource_view_count()
RETURNS TRIGGER AS $
BEGIN
  UPDATE resources 
  SET view_count = view_count + 1 
  WHERE id = NEW.resource_id;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_resource_view_count ON resource_views;
CREATE TRIGGER trigger_update_resource_view_count
  AFTER INSERT ON resource_views
  FOR EACH ROW EXECUTE FUNCTION update_resource_view_count();

-- Update forum post reply count trigger
CREATE OR REPLACE FUNCTION update_forum_post_reply_count()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts 
    SET reply_count = reply_count + 1,
        last_reply_at = NEW.created_at
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts 
    SET reply_count = reply_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_forum_post_reply_count ON forum_replies;
CREATE TRIGGER trigger_update_forum_post_reply_count
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_forum_post_reply_count();

-- Update learning path enrollment count trigger
CREATE OR REPLACE FUNCTION update_learning_path_enrollment_count()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE learning_paths 
    SET enrollment_count = enrollment_count + 1
    WHERE id = NEW.learning_path_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE learning_paths 
    SET enrollment_count = enrollment_count - 1
    WHERE id = OLD.learning_path_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
    UPDATE learning_paths 
    SET completion_count = completion_count + 1
    WHERE id = NEW.learning_path_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_learning_path_counts ON learning_path_enrollments;
CREATE TRIGGER trigger_update_learning_path_counts
  AFTER INSERT OR UPDATE OR DELETE ON learning_path_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_learning_path_enrollment_count();

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 'Schema refinement completed successfully! All tables, indexes, and functions have been created.' as status;

COMMIT;