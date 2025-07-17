-- Comprehensive Row Level Security Policies
-- This migration adds RLS policies for all tables

-- =============================================
-- CATEGORIES TABLE POLICIES
-- =============================================

-- Everyone can view active categories
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Admins can manage all categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- USER LIKES TABLE POLICIES
-- =============================================

-- Users can manage their own likes
CREATE POLICY "Users can manage own likes" ON user_likes
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- USER BOOKMARKS TABLE POLICIES
-- =============================================

-- Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON user_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view all bookmarks for analytics
CREATE POLICY "Admins can view all bookmarks" ON user_bookmarks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- LEARNING PATHS TABLE POLICIES
-- =============================================

-- Everyone can view published learning paths
CREATE POLICY "Anyone can view published learning paths" ON learning_paths
  FOR SELECT USING (is_published = true);

-- Premium users can view premium learning paths
CREATE POLICY "Premium users can view premium learning paths" ON learning_paths
  FOR SELECT USING (
    is_published = true AND (
      is_premium = false OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND subscription_tier IN ('premium', 'enterprise')
        AND subscription_status = 'active'
      )
    )
  );

-- Content creators can create learning paths
CREATE POLICY "Content creators can create learning paths" ON learning_paths
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'content_creator')
    )
  );

-- Creators can update their own learning paths
CREATE POLICY "Creators can update own learning paths" ON learning_paths
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete learning paths
CREATE POLICY "Admins can delete learning paths" ON learning_paths
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- LEARNING PATH RESOURCES TABLE POLICIES
-- =============================================

-- Everyone can view resources in published learning paths
CREATE POLICY "Anyone can view learning path resources" ON learning_path_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM learning_paths lp
      WHERE lp.id = learning_path_id
      AND lp.is_published = true
    )
  );

-- Content creators can manage learning path resources
CREATE POLICY "Creators can manage learning path resources" ON learning_path_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM learning_paths lp
      WHERE lp.id = learning_path_id
      AND (
        lp.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'super_admin')
        )
      )
    )
  );

-- =============================================
-- LEARNING PATH ENROLLMENTS TABLE POLICIES
-- =============================================

-- Users can manage their own enrollments
CREATE POLICY "Users can manage own enrollments" ON learning_path_enrollments
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments" ON learning_path_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- FORUM CATEGORIES TABLE POLICIES
-- =============================================

-- Everyone can view active forum categories
CREATE POLICY "Anyone can view active forum categories" ON forum_categories
  FOR SELECT USING (is_active = true);

-- Admins can manage forum categories
CREATE POLICY "Admins can manage forum categories" ON forum_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- =============================================
-- FORUM POSTS TABLE POLICIES
-- =============================================

-- Everyone can view forum posts
CREATE POLICY "Anyone can view forum posts" ON forum_posts
  FOR SELECT USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts" ON forum_posts
  FOR UPDATE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Authors and moderators can delete posts
CREATE POLICY "Authors and moderators can delete posts" ON forum_posts
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- =============================================
-- FORUM REPLIES TABLE POLICIES
-- =============================================

-- Everyone can view forum replies
CREATE POLICY "Anyone can view forum replies" ON forum_replies
  FOR SELECT USING (true);

-- Authenticated users can create replies
CREATE POLICY "Authenticated users can create replies" ON forum_replies
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own replies
CREATE POLICY "Authors can update own replies" ON forum_replies
  FOR UPDATE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Authors and moderators can delete replies
CREATE POLICY "Authors and moderators can delete replies" ON forum_replies
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- =============================================
-- NOTIFICATIONS TABLE POLICIES
-- =============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- ACHIEVEMENTS TABLE POLICIES
-- =============================================

-- Everyone can view active achievements
CREATE POLICY "Anyone can view active achievements" ON achievements
  FOR SELECT USING (is_active = true);

-- Admins can manage achievements
CREATE POLICY "Admins can manage achievements" ON achievements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- USER ACHIEVEMENTS TABLE POLICIES
-- =============================================

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- System can award achievements
CREATE POLICY "System can award achievements" ON user_achievements
  FOR INSERT WITH CHECK (true);

-- Admins can view all user achievements
CREATE POLICY "Admins can view all user achievements" ON user_achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- USER PREFERENCES TABLE POLICIES
-- =============================================

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- USER SESSIONS TABLE POLICIES
-- =============================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- System can create and update sessions
CREATE POLICY "System can manage sessions" ON user_sessions
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- PAGE VIEWS TABLE POLICIES
-- =============================================

-- Users can view their own page views
CREATE POLICY "Users can view own page views" ON page_views
  FOR SELECT USING (auth.uid() = user_id);

-- System can create page views
CREATE POLICY "System can create page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- Admins can view all page views for analytics
CREATE POLICY "Admins can view all page views" ON page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- HELPER FUNCTIONS FOR RLS
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
-- GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_moderator_or_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_premium_content(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_manage_content(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_resources_advanced(TEXT, TEXT[], TEXT[], BOOLEAN, UUID[], TEXT[], INTEGER, INTEGER) TO authenticated, anon;

-- Grant select permissions on lookup tables to anonymous users
GRANT SELECT ON categories TO anon;
GRANT SELECT ON forum_categories TO anon;
GRANT SELECT ON achievements TO anon;

COMMIT;