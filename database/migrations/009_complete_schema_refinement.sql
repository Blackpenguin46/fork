-- Complete Schema Refinement for Production
-- This migration adds all missing tables and refines existing ones

-- =============================================
-- 1. RESOURCES TABLE ENHANCEMENTS
-- =============================================

-- Add missing columns to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Create search index
CREATE INDEX IF NOT EXISTS idx_resources_search_vector ON resources USING GIN(search_vector);

-- Update search vector trigger
CREATE OR REPLACE FUNCTION update_resources_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- 4. USER BOOKMARKS TABLE (Enhanced)
-- =============================================

-- Rename existing bookmarks table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookmarks') THEN
    ALTER TABLE bookmarks RENAME TO user_bookmarks_old;
  END IF;
END $$;

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
-- 5. LEARNING PATHS SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS learning_paths (
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
-- 6. ENHANCED USER PROGRESS
-- =============================================

-- Update user_progress table
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS learning_path_id UUID REFERENCES learning_paths(id),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')),
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS quiz_scores JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rename time_spent to time_spent_minutes if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'time_spent') THEN
    ALTER TABLE user_progress RENAME COLUMN time_spent TO time_spent_old;
  END IF;
END $$;

-- =============================================
-- 7. FORUM SYSTEM
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
  last_reply_by UUID REFERENCES auth.users(id),
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
-- 8. NOTIFICATION SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'achievement')),
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. ACHIEVEMENTS SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  badge_color TEXT DEFAULT '#10B981',
  criteria JSONB NOT NULL,
  points INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,
  earned_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- 10. USER PREFERENCES
-- =============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  difficulty_preference TEXT CHECK (difficulty_preference IN ('beginner', 'intermediate', 'advanced', 'expert')),
  interests TEXT[] DEFAULT '{}',
  learning_goals TEXT[] DEFAULT '{}',
  weekly_goal_hours INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. ANALYTICS TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  page_views INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  ip_address INET,
  user_agent TEXT,
  load_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 12. INDEXES FOR PERFORMANCE
-- =============================================

-- Resource indexes
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_difficulty ON resources(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_resources_premium ON resources(is_premium);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_view_count ON resources(view_count);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_resource_id ON user_progress(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_learning_path ON user_progress(learning_path_id);

-- Bookmark indexes
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_resource_id ON user_bookmarks(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON user_bookmarks(created_at);

-- Learning path indexes
CREATE INDEX IF NOT EXISTS idx_learning_paths_published ON learning_paths(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_learning_paths_featured ON learning_paths(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_learning_paths_difficulty ON learning_paths(difficulty_level);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- =============================================
-- 13. FUNCTIONS AND PROCEDURES
-- =============================================

-- Function to get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_uuid UUID)
RETURNS TABLE(
  courses_started BIGINT,
  courses_completed BIGINT,
  bookmarks_count BIGINT,
  overall_progress NUMERIC,
  achievements_count BIGINT,
  learning_paths_enrolled BIGINT,
  total_time_spent BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT CASE WHEN up.status IN ('in_progress', 'completed') THEN up.resource_id END) as courses_started,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.resource_id END) as courses_completed,
    COUNT(DISTINCT ub.resource_id) as bookmarks_count,
    COALESCE(AVG(up.progress_percentage), 0) as overall_progress,
    COUNT(DISTINCT ua.achievement_id) as achievements_count,
    COUNT(DISTINCT lpe.learning_path_id) as learning_paths_enrolled,
    COALESCE(SUM(up.time_spent_minutes), 0) as total_time_spent
  FROM profiles p
  LEFT JOIN user_progress up ON p.id = up.user_id
  LEFT JOIN user_bookmarks ub ON p.id = ub.user_id
  LEFT JOIN user_achievements ua ON p.id = ua.user_id
  LEFT JOIN learning_path_enrollments lpe ON p.id = lpe.user_id
  WHERE p.id = user_uuid
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search resources with full-text search
CREATE OR REPLACE FUNCTION search_resources_advanced(
  search_query TEXT DEFAULT NULL,
  resource_types TEXT[] DEFAULT NULL,
  difficulty_levels TEXT[] DEFAULT NULL,
  is_premium_filter BOOLEAN DEFAULT NULL,
  category_ids_filter UUID[] DEFAULT NULL,
  tags_filter TEXT[] DEFAULT NULL,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  resource_type TEXT,
  difficulty_level TEXT,
  is_premium BOOLEAN,
  is_featured BOOLEAN,
  view_count INTEGER,
  like_count INTEGER,
  bookmark_count INTEGER,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.resource_type,
    r.difficulty_level,
    r.is_premium,
    r.is_featured,
    r.view_count,
    r.like_count,
    r.bookmark_count,
    r.created_at,
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank(r.search_vector, plainto_tsquery('english', search_query))
      ELSE 0
    END as rank
  FROM resources r
  WHERE 
    r.is_published = true
    AND (search_query IS NULL OR r.search_vector @@ plainto_tsquery('english', search_query))
    AND (resource_types IS NULL OR r.resource_type = ANY(resource_types))
    AND (difficulty_levels IS NULL OR r.difficulty_level = ANY(difficulty_levels))
    AND (is_premium_filter IS NULL OR r.is_premium = is_premium_filter)
    AND (tags_filter IS NULL OR r.tags && tags_filter)
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN ts_rank(r.search_vector, plainto_tsquery('english', search_query)) END DESC,
    r.is_featured DESC,
    r.view_count DESC,
    r.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 14. TRIGGERS
-- =============================================

-- Update resource counts in categories
CREATE OR REPLACE FUNCTION update_category_resource_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET resource_count = resource_count + 1,
        updated_at = NOW()
    WHERE id = NEW.category_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET resource_count = resource_count - 1,
        updated_at = NOW()
    WHERE id = OLD.category_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update forum post counts
CREATE OR REPLACE FUNCTION update_forum_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'forum_replies' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE forum_posts 
      SET reply_count = reply_count + 1,
          last_reply_at = NEW.created_at,
          last_reply_by = NEW.author_id,
          updated_at = NOW()
      WHERE id = NEW.post_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE forum_posts 
      SET reply_count = reply_count - 1,
          updated_at = NOW()
      WHERE id = OLD.post_id;
      RETURN OLD;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_category_resource_count ON resource_categories;
CREATE TRIGGER trigger_update_category_resource_count
  AFTER INSERT OR DELETE ON resource_categories
  FOR EACH ROW EXECUTE FUNCTION update_category_resource_count();

DROP TRIGGER IF EXISTS trigger_update_forum_reply_count ON forum_replies;
CREATE TRIGGER trigger_update_forum_reply_count
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_forum_counts();

-- =============================================
-- 15. INITIAL DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Fundamentals', 'fundamentals', 'Basic cybersecurity concepts and principles', '🎯', 1),
('Network Security', 'network-security', 'Network security, firewalls, and monitoring', '🌐', 2),
('Application Security', 'application-security', 'Secure coding and application testing', '💻', 3),
('Cloud Security', 'cloud-security', 'Cloud security and DevSecOps practices', '☁️', 4),
('Incident Response', 'incident-response', 'Incident response and digital forensics', '🚨', 5),
('Compliance', 'compliance', 'Security compliance and governance', '📋', 6),
('Tools & Technologies', 'tools-technologies', 'Security tools and software', '🛠️', 7),
('Career Development', 'career-development', 'Certifications and career guidance', '🎓', 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert default forum categories
INSERT INTO forum_categories (name, slug, description, icon, sort_order) VALUES
('General Discussion', 'general', 'General cybersecurity discussions', '💬', 1),
('Help & Support', 'help', 'Get help with cybersecurity questions', '❓', 2),
('Career Advice', 'career', 'Career guidance and job opportunities', '💼', 3),
('Tools & Resources', 'tools', 'Share and discuss security tools', '🔧', 4),
('News & Updates', 'news', 'Latest cybersecurity news and updates', '📰', 5),
('Certifications', 'certifications', 'Certification discussions and study groups', '🏆', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert default achievements
INSERT INTO achievements (name, description, icon, criteria, points, rarity) VALUES
('Welcome Aboard', 'Complete your profile setup', '👋', '{"type": "profile_complete"}', 10, 'common'),
('First Steps', 'Complete your first resource', '🎯', '{"type": "resource_completed", "count": 1}', 25, 'common'),
('Bookworm', 'Bookmark 10 resources', '📚', '{"type": "bookmarks", "count": 10}', 50, 'uncommon'),
('Dedicated Learner', 'Complete 5 resources', '🏆', '{"type": "resources_completed", "count": 5}', 100, 'uncommon'),
('Knowledge Seeker', 'Complete 25 resources', '🎓', '{"type": "resources_completed", "count": 25}', 250, 'rare'),
('Community Helper', 'Help 10 people in forums', '🤝', '{"type": "forum_helpful_replies", "count": 10}', 150, 'uncommon'),
('Expert Contributor', 'Create 5 helpful forum posts', '⭐', '{"type": "forum_quality_posts", "count": 5}', 200, 'rare'),
('Learning Path Master', 'Complete a learning path', '🛤️', '{"type": "learning_path_completed", "count": 1}', 300, 'rare'),
('Cybersecurity Expert', 'Complete 100 resources', '🛡️', '{"type": "resources_completed", "count": 100}', 500, 'epic'),
('Academy Legend', 'Earn 1000 points', '👑', '{"type": "total_points", "count": 1000}', 1000, 'legendary')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

COMMIT;