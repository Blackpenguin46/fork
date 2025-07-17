-- Simple RLS Policies Migration
-- Basic security policies without complex function calls

-- =============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_collections ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. PROFILES POLICIES
-- =============================================

-- Users can read their own profile
CREATE POLICY "profiles_read_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_admin_read" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- =============================================
-- 3. RESOURCES POLICIES
-- =============================================

-- Anyone can read published, non-premium resources
CREATE POLICY "resources_read_public" ON resources
  FOR SELECT
  USING (is_published = true AND (is_premium = false OR is_premium IS NULL));

-- Premium users can read premium resources
CREATE POLICY "resources_read_premium" ON resources
  FOR SELECT
  USING (
    is_published = true 
    AND is_premium = true 
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.subscription_tier IN ('premium', 'enterprise')
      AND p.subscription_status = 'active'
    )
  );

-- Admins can read all resources
CREATE POLICY "resources_admin_read" ON resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Admins can manage resources
CREATE POLICY "resources_admin_manage" ON resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 4. CATEGORIES POLICIES
-- =============================================

-- Anyone can read categories
CREATE POLICY "categories_read" ON categories
  FOR SELECT
  USING (true);

-- Only admins can modify categories
CREATE POLICY "categories_admin_manage" ON categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 5. USER PROGRESS POLICIES
-- =============================================

-- Users can manage their own progress
CREATE POLICY "user_progress_own" ON user_progress
  FOR ALL
  USING (user_id = auth.uid());

-- Admins can read all progress
CREATE POLICY "user_progress_admin_read" ON user_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- =============================================
-- 6. BOOKMARKS POLICIES
-- =============================================

-- Users can manage their own bookmarks
CREATE POLICY "user_bookmarks_own" ON user_bookmarks
  FOR ALL
  USING (user_id = auth.uid());

-- Users can manage their own bookmark collections
CREATE POLICY "bookmark_collections_own" ON bookmark_collections
  FOR ALL
  USING (user_id = auth.uid());

-- Users can read public collections
CREATE POLICY "bookmark_collections_public" ON bookmark_collections
  FOR SELECT
  USING (is_public = true);

-- =============================================
-- 7. USER LIKES POLICIES
-- =============================================

-- Users can manage their own likes
CREATE POLICY "user_likes_own" ON user_likes
  FOR ALL
  USING (user_id = auth.uid());

-- =============================================
-- 8. LEARNING PATHS POLICIES
-- =============================================

-- Anyone can read published, non-premium learning paths
CREATE POLICY "learning_paths_read_public" ON learning_paths
  FOR SELECT
  USING (is_published = true AND (is_premium = false OR is_premium IS NULL));

-- Premium users can read premium learning paths
CREATE POLICY "learning_paths_read_premium" ON learning_paths
  FOR SELECT
  USING (
    is_published = true 
    AND is_premium = true 
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.subscription_tier IN ('premium', 'enterprise')
      AND p.subscription_status = 'active'
    )
  );

-- Admins can manage learning paths
CREATE POLICY "learning_paths_admin_manage" ON learning_paths
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 9. LEARNING PATH RESOURCES POLICIES
-- =============================================

-- Users can read learning path resources for accessible paths
CREATE POLICY "learning_path_resources_read" ON learning_path_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths lp
      WHERE lp.id = learning_path_resources.learning_path_id
      AND lp.is_published = true
      AND (
        lp.is_premium = false 
        OR lp.is_premium IS NULL
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() 
          AND p.subscription_tier IN ('premium', 'enterprise')
          AND p.subscription_status = 'active'
        )
      )
    )
  );

-- Admins can manage learning path resources
CREATE POLICY "learning_path_resources_admin_manage" ON learning_path_resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 10. LEARNING PATH ENROLLMENTS POLICIES
-- =============================================

-- Users can manage their own enrollments
CREATE POLICY "learning_path_enrollments_own" ON learning_path_enrollments
  FOR ALL
  USING (user_id = auth.uid());

-- Admins can read all enrollments
CREATE POLICY "learning_path_enrollments_admin_read" ON learning_path_enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- =============================================
-- 11. FORUM POLICIES
-- =============================================

-- Anyone can read forum categories
CREATE POLICY "forum_categories_read" ON forum_categories
  FOR SELECT
  USING (true);

-- Anyone can read forum posts
CREATE POLICY "forum_posts_read" ON forum_posts
  FOR SELECT
  USING (true);

-- Anyone can read forum replies
CREATE POLICY "forum_replies_read" ON forum_replies
  FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "forum_posts_create" ON forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- Authenticated users can create replies
CREATE POLICY "forum_replies_create" ON forum_replies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- Users can update their own posts
CREATE POLICY "forum_posts_update_own" ON forum_posts
  FOR UPDATE
  USING (author_id = auth.uid());

-- Users can update their own replies
CREATE POLICY "forum_replies_update_own" ON forum_replies
  FOR UPDATE
  USING (author_id = auth.uid());

-- Admins can manage all forum content
CREATE POLICY "forum_admin_manage_posts" ON forum_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin', 'moderator')
    )
  );

CREATE POLICY "forum_admin_manage_replies" ON forum_replies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- =============================================
-- 12. NOTIFICATIONS POLICIES
-- =============================================

-- Users can manage their own notifications
CREATE POLICY "notifications_own" ON notifications
  FOR ALL
  USING (user_id = auth.uid());

-- Admins can create notifications
CREATE POLICY "notifications_admin_create" ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 13. ACHIEVEMENTS POLICIES
-- =============================================

-- Anyone can read achievements
CREATE POLICY "achievements_read" ON achievements
  FOR SELECT
  USING (true);

-- Users can read their own achievements
CREATE POLICY "user_achievements_own" ON user_achievements
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage achievements
CREATE POLICY "achievements_admin_manage" ON achievements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "user_achievements_admin_manage" ON user_achievements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 14. USER PREFERENCES POLICIES
-- =============================================

-- Users can manage their own preferences
CREATE POLICY "user_preferences_own" ON user_preferences
  FOR ALL
  USING (user_id = auth.uid());

-- =============================================
-- 15. SUBSCRIPTION POLICIES
-- =============================================

-- Users can read their own subscriptions
CREATE POLICY "subscriptions_read_own" ON subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can read their own payment history
CREATE POLICY "payment_history_read_own" ON payment_history
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage subscriptions and payments
CREATE POLICY "subscriptions_admin_manage" ON subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "payment_history_admin_manage" ON payment_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 16. ANALYTICS POLICIES
-- =============================================

-- Users can read their own analytics data
CREATE POLICY "user_sessions_own" ON user_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "page_views_own" ON page_views
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "resource_views_own" ON resource_views
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own analytics data
CREATE POLICY "resource_views_insert_own" ON resource_views
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can read all analytics
CREATE POLICY "analytics_admin_read_sessions" ON user_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "analytics_admin_read_page_views" ON page_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "analytics_admin_read_resource_views" ON resource_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- 17. AUDIT LOG POLICIES
-- =============================================

-- Only admins can read audit logs
CREATE POLICY "admin_audit_log_admin_only" ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "resource_audit_log_admin_only" ON resource_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "webhook_logs_admin_only" ON webhook_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 'Simple RLS policies created successfully! Your database is now secure.' as status;