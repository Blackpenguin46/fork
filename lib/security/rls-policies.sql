-- Row Level Security (RLS) Policies for Cybernex Academy
-- This file contains comprehensive RLS policies to secure the database

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Super admins can update any profile
CREATE POLICY "Super admins can update any profile" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- =============================================
-- RESOURCES TABLE POLICIES
-- =============================================

-- Everyone can view published resources
CREATE POLICY "Anyone can view published resources" ON resources
    FOR SELECT USING (is_published = true);

-- Premium users can view premium resources
CREATE POLICY "Premium users can view premium resources" ON resources
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

-- Admins can view all resources
CREATE POLICY "Admins can view all resources" ON resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Content creators can insert resources
CREATE POLICY "Content creators can insert resources" ON resources
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'content_creator')
        )
    );

-- Content creators can update their own resources
CREATE POLICY "Content creators can update own resources" ON resources
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can delete resources
CREATE POLICY "Admins can delete resources" ON resources
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- CATEGORIES TABLE POLICIES
-- =============================================

-- Everyone can view active categories
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (is_active = true);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories" ON categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- USER PROGRESS TABLE POLICIES
-- =============================================

-- Users can view their own progress
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all progress" ON user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- USER BOOKMARKS TABLE POLICIES
-- =============================================

-- Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON user_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Admins can view all bookmarks
CREATE POLICY "Admins can view all bookmarks" ON user_bookmarks
    FOR SELECT USING (
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

-- Admins can manage learning paths
CREATE POLICY "Admins can manage learning paths" ON learning_paths
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =============================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert/update subscriptions (for Stripe webhooks)
CREATE POLICY "System can manage subscriptions" ON subscriptions
    FOR ALL USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- PAYMENT HISTORY TABLE POLICIES
-- =============================================

-- Users can view their own payment history
CREATE POLICY "Users can view own payment history" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all payment history
CREATE POLICY "Admins can view all payment history" ON payment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- System can insert payment records
CREATE POLICY "System can insert payment records" ON payment_history
    FOR INSERT WITH CHECK (true);

-- =============================================
-- AUTH AUDIT LOG TABLE POLICIES
-- =============================================

-- Users can view their own auth logs
CREATE POLICY "Users can view own auth logs" ON auth_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all auth logs
CREATE POLICY "Admins can view all auth logs" ON auth_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- System can insert auth logs
CREATE POLICY "System can insert auth logs" ON auth_audit_log
    FOR INSERT WITH CHECK (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION has_premium_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND subscription_tier IN ('premium', 'enterprise')
        AND subscription_status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access resource
CREATE OR REPLACE FUNCTION can_access_resource(user_id UUID, resource_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    resource_record RECORD;
BEGIN
    SELECT is_published, is_premium INTO resource_record
    FROM resources 
    WHERE id = resource_id;
    
    -- Resource must be published
    IF NOT resource_record.is_published THEN
        -- Unless user is admin
        IF NOT is_admin(user_id) THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- If resource is premium, user must have premium access
    IF resource_record.is_premium THEN
        RETURN has_premium_access(user_id) OR is_admin(user_id);
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SECURITY VIEWS
-- =============================================

-- Secure view for public resource listing
CREATE OR REPLACE VIEW public_resources AS
SELECT 
    id,
    title,
    slug,
    description,
    resource_type,
    thumbnail_url,
    difficulty_level,
    estimated_time_minutes,
    is_premium,
    is_featured,
    view_count,
    like_count,
    bookmark_count,
    seo_title,
    seo_description,
    seo_keywords,
    created_at,
    published_at
FROM resources 
WHERE is_published = true;

-- Secure view for user dashboard
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    p.id as user_id,
    p.subscription_tier,
    p.subscription_status,
    COUNT(DISTINCT up.resource_id) as courses_started,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.resource_id END) as courses_completed,
    COUNT(DISTINCT ub.resource_id) as bookmarks_count,
    COALESCE(AVG(up.progress_percentage), 0) as overall_progress
FROM profiles p
LEFT JOIN user_progress up ON p.id = up.user_id
LEFT JOIN user_bookmarks ub ON p.id = ub.user_id
WHERE p.id = auth.uid()
GROUP BY p.id, p.subscription_tier, p.subscription_status;

-- Grant necessary permissions
GRANT SELECT ON public_resources TO authenticated;
GRANT SELECT ON user_dashboard_stats TO authenticated;