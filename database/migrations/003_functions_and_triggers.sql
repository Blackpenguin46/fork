-- Functions and Triggers Migration
-- Creates all necessary functions before RLS policies

-- =============================================
-- 1. SEARCH VECTOR UPDATE FUNCTION
-- =============================================

-- Function to update search vector for resources
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

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS trigger_update_resources_search_vector ON resources;
CREATE TRIGGER trigger_update_resources_search_vector
  BEFORE INSERT OR UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_resources_search_vector();

-- =============================================
-- 2. DASHBOARD STATS FUNCTION
-- =============================================

-- Function to get user dashboard statistics
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_uuid UUID)
RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. ADVANCED SEARCH FUNCTION
-- =============================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. RLS HELPER FUNCTIONS
-- =============================================

-- Function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION is_moderator_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access premium content
CREATE OR REPLACE FUNCTION can_access_premium_content(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND (
      subscription_tier IN ('premium', 'enterprise') 
      AND subscription_status = 'active'
      OR role IN ('admin', 'super_admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns or can manage content
CREATE OR REPLACE FUNCTION can_manage_content(user_id UUID, content_creator_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    user_id = content_creator_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = user_id 
      AND role IN ('admin', 'super_admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. COUNT UPDATE TRIGGERS
-- =============================================

-- Update resource view count trigger
CREATE OR REPLACE FUNCTION update_resource_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE resources 
  SET view_count = view_count + 1 
  WHERE id = NEW.resource_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_resource_view_count ON resource_views;
CREATE TRIGGER trigger_update_resource_view_count
  AFTER INSERT ON resource_views
  FOR EACH ROW EXECUTE FUNCTION update_resource_view_count();

-- Update forum post reply count trigger
CREATE OR REPLACE FUNCTION update_forum_post_reply_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_forum_post_reply_count ON forum_replies;
CREATE TRIGGER trigger_update_forum_post_reply_count
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_forum_post_reply_count();

-- Update learning path enrollment count trigger
CREATE OR REPLACE FUNCTION update_learning_path_enrollment_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_learning_path_counts ON learning_path_enrollments;
CREATE TRIGGER trigger_update_learning_path_counts
  AFTER INSERT OR UPDATE OR DELETE ON learning_path_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_learning_path_enrollment_count();

-- =============================================
-- 6. PROFILE CREATION TRIGGER
-- =============================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 7. SEARCH INDEX CREATION
-- =============================================

-- Create search index for resources
CREATE INDEX IF NOT EXISTS idx_resources_search_vector ON resources USING GIN(search_vector);

-- Update existing resources to have search vectors
UPDATE resources 
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(content, '')), 'C') ||
  setweight(to_tsvector('english', array_to_string(tags, ' ')), 'D')
WHERE search_vector IS NULL;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 'Functions and triggers created successfully! You can now run the RLS policies migration.' as status;