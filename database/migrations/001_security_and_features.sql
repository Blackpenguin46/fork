-- Comprehensive Database Migration for Cybernex Academy
-- This migration adds security features, audit logging, and enhanced functionality

-- =============================================
-- 1. AUDIT LOGGING TABLES
-- =============================================

-- Auth audit log for tracking authentication events
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook logs for Stripe events
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'error')),
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Resource view tracking
CREATE TABLE IF NOT EXISTS resource_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search query analytics
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    filters JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. ENHANCED SUBSCRIPTION MANAGEMENT
-- =============================================

-- Detailed subscription tracking
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    status TEXT NOT NULL,
    price_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history tracking
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT,
    stripe_customer_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL,
    description TEXT,
    invoice_url TEXT,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. ENHANCED RESOURCE MANAGEMENT
-- =============================================

-- Resource categories junction table
CREATE TABLE IF NOT EXISTS resource_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, category_id)
);

-- Resource tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource tags junction table
CREATE TABLE IF NOT EXISTS resource_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, tag_name)
);

-- =============================================
-- 4. LEARNING MANAGEMENT SYSTEM
-- =============================================

-- Learning paths
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
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Learning path resources (ordered)
CREATE TABLE IF NOT EXISTS learning_path_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(learning_path_id, resource_id)
);

-- User achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    badge_color TEXT DEFAULT '#10B981',
    criteria JSONB NOT NULL, -- Conditions for earning the achievement
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- =============================================
-- 5. NOTIFICATION SYSTEM
-- =============================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. USER PREFERENCES AND SETTINGS
-- =============================================

-- User preferences
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. ENHANCED PROFILES TABLE UPDATES
-- =============================================

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin', 'content_creator')),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- =============================================
-- 8. INDEXES FOR PERFORMANCE
-- =============================================

-- Auth audit log indexes
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_action ON auth_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON auth_audit_log(created_at);

-- Resource view indexes
CREATE INDEX IF NOT EXISTS idx_resource_views_resource_id ON resource_views(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_user_id ON resource_views(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_viewed_at ON resource_views(viewed_at);

-- Search query indexes
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Payment history indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at);

-- Resource management indexes
CREATE INDEX IF NOT EXISTS idx_resource_categories_resource_id ON resource_categories(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_categories_category_id ON resource_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource_id ON resource_tags(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag_name ON resource_tags(tag_name);

-- Learning path indexes
CREATE INDEX IF NOT EXISTS idx_learning_path_resources_path_id ON learning_path_resources(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_resources_resource_id ON learning_path_resources(resource_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_resources_sort_order ON learning_path_resources(sort_order);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =============================================
-- 9. UTILITY FUNCTIONS
-- =============================================

-- Function to check if user exists by email or username
CREATE OR REPLACE FUNCTION check_user_exists(
    email_input TEXT DEFAULT NULL,
    username_input TEXT DEFAULT NULL
)
RETURNS TABLE(
    email_exists BOOLEAN,
    username_exists BOOLEAN,
    user_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM profiles WHERE email = email_input) as email_exists,
        EXISTS(SELECT 1 FROM profiles WHERE username = username_input) as username_exists,
        (SELECT id FROM profiles WHERE email = email_input OR username = username_input LIMIT 1) as user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get resource statistics
CREATE OR REPLACE FUNCTION get_resource_stats()
RETURNS TABLE(
    total_resources BIGINT,
    published_resources BIGINT,
    premium_resources BIGINT,
    featured_resources BIGINT,
    by_type JSONB,
    by_difficulty JSONB,
    by_category JSONB,
    recent_views BIGINT,
    recent_likes BIGINT,
    recent_bookmarks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_resources,
        COUNT(*) FILTER (WHERE is_published = true) as published_resources,
        COUNT(*) FILTER (WHERE is_premium = true) as premium_resources,
        COUNT(*) FILTER (WHERE is_featured = true) as featured_resources,
        jsonb_object_agg(resource_type, type_count) as by_type,
        jsonb_object_agg(difficulty_level, difficulty_count) as by_difficulty,
        '{}' as by_category, -- Will be populated by separate query
        COALESCE((SELECT COUNT(*) FROM resource_views WHERE viewed_at > NOW() - INTERVAL '7 days'), 0) as recent_views,
        COALESCE((SELECT COUNT(*) FROM user_likes WHERE created_at > NOW() - INTERVAL '7 days'), 0) as recent_likes,
        COALESCE((SELECT COUNT(*) FROM user_bookmarks WHERE created_at > NOW() - INTERVAL '7 days'), 0) as recent_bookmarks
    FROM (
        SELECT 
            resource_type,
            difficulty_level,
            COUNT(*) as type_count,
            COUNT(*) as difficulty_count
        FROM resources 
        GROUP BY resource_type, difficulty_level
    ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_resources(
    search_query TEXT,
    resource_types TEXT[] DEFAULT NULL,
    difficulty_levels TEXT[] DEFAULT NULL,
    is_premium_filter BOOLEAN DEFAULT NULL,
    category_ids_filter UUID[] DEFAULT NULL,
    result_limit INTEGER DEFAULT 20
)
RETURNS SETOF resources AS $$
BEGIN
    RETURN QUERY
    SELECT r.*
    FROM resources r
    WHERE 
        r.is_published = true
        AND (
            search_query IS NULL OR
            r.title ILIKE '%' || search_query || '%' OR
            r.description ILIKE '%' || search_query || '%' OR
            r.content ILIKE '%' || search_query || '%'
        )
        AND (resource_types IS NULL OR r.resource_type = ANY(resource_types))
        AND (difficulty_levels IS NULL OR r.difficulty_level = ANY(difficulty_levels))
        AND (is_premium_filter IS NULL OR r.is_premium = is_premium_filter)
        AND (
            category_ids_filter IS NULL OR
            EXISTS (
                SELECT 1 FROM resource_categories rc 
                WHERE rc.resource_id = r.id 
                AND rc.category_id = ANY(category_ids_filter)
            )
        )
    ORDER BY 
        r.is_featured DESC,
        r.view_count DESC,
        r.created_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recommended resources
CREATE OR REPLACE FUNCTION get_recommended_resources(
    user_id UUID,
    result_limit INTEGER DEFAULT 10
)
RETURNS SETOF resources AS $$
BEGIN
    RETURN QUERY
    SELECT r.*
    FROM resources r
    WHERE 
        r.is_published = true
        AND r.id NOT IN (
            -- Exclude resources user has already viewed
            SELECT rv.resource_id 
            FROM resource_views rv 
            WHERE rv.user_id = get_recommended_resources.user_id
        )
        AND r.id NOT IN (
            -- Exclude resources user has bookmarked
            SELECT ub.resource_id 
            FROM user_bookmarks ub 
            WHERE ub.user_id = get_recommended_resources.user_id
        )
    ORDER BY 
        r.is_featured DESC,
        r.like_count DESC,
        r.view_count DESC,
        RANDOM()
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to admin (security function)
CREATE OR REPLACE FUNCTION promote_to_admin(
    target_user_id UUID,
    admin_user_id UUID,
    new_role TEXT DEFAULT 'admin'
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role TEXT;
BEGIN
    -- Check if the requesting user is a super admin
    SELECT role INTO admin_role
    FROM profiles 
    WHERE id = admin_user_id;
    
    IF admin_role != 'super_admin' THEN
        RAISE EXCEPTION 'Only super admins can promote users';
    END IF;
    
    -- Update the target user's role
    UPDATE profiles 
    SET 
        role = new_role,
        updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Log the promotion
    INSERT INTO auth_audit_log (user_id, action, details, success)
    VALUES (
        admin_user_id,
        'user_promoted',
        jsonb_build_object(
            'target_user_id', target_user_id,
            'new_role', new_role
        ),
        true
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update resource view counts
CREATE OR REPLACE FUNCTION update_resource_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'resource_views' THEN
        UPDATE resources 
        SET view_count = view_count + 1
        WHERE id = NEW.resource_id;
    ELSIF TG_TABLE_NAME = 'user_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE resources 
            SET like_count = like_count + 1
            WHERE id = NEW.resource_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE resources 
            SET like_count = like_count - 1
            WHERE id = OLD.resource_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'user_bookmarks' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE resources 
            SET bookmark_count = bookmark_count + 1
            WHERE id = NEW.resource_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE resources 
            SET bookmark_count = bookmark_count - 1
            WHERE id = OLD.resource_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_view_count ON resource_views;
CREATE TRIGGER trigger_update_view_count
    AFTER INSERT ON resource_views
    FOR EACH ROW EXECUTE FUNCTION update_resource_stats();

DROP TRIGGER IF EXISTS trigger_update_like_count ON user_likes;
CREATE TRIGGER trigger_update_like_count
    AFTER INSERT OR DELETE ON user_likes
    FOR EACH ROW EXECUTE FUNCTION update_resource_stats();

DROP TRIGGER IF EXISTS trigger_update_bookmark_count ON user_bookmarks;
CREATE TRIGGER trigger_update_bookmark_count
    AFTER INSERT OR DELETE ON user_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_resource_stats();

-- Trigger to automatically create user preferences
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_user_preferences ON profiles;
CREATE TRIGGER trigger_create_user_preferences
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_user_preferences();

-- =============================================
-- 11. VIEWS FOR COMMON QUERIES
-- =============================================

-- User dashboard statistics view
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    p.id as user_id,
    p.subscription_tier,
    p.subscription_status,
    COUNT(DISTINCT up.resource_id) as courses_started,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.resource_id END) as courses_completed,
    COUNT(DISTINCT ub.resource_id) as bookmarks_count,
    COALESCE(AVG(up.progress_percentage), 0) as overall_progress,
    COUNT(DISTINCT ua.achievement_id) as achievements_count
FROM profiles p
LEFT JOIN user_progress up ON p.id = up.user_id
LEFT JOIN user_bookmarks ub ON p.id = ub.user_id
LEFT JOIN user_achievements ua ON p.id = ua.user_id
GROUP BY p.id, p.subscription_tier, p.subscription_status;

-- Recent user activity view
CREATE OR REPLACE VIEW recent_user_activity AS
SELECT 
    'resource_view' as activity_type,
    rv.user_id,
    r.title as resource_title,
    rv.viewed_at as activity_time
FROM resource_views rv
JOIN resources r ON rv.resource_id = r.id
WHERE rv.viewed_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
    'bookmark_added' as activity_type,
    ub.user_id,
    r.title as resource_title,
    ub.created_at as activity_time
FROM user_bookmarks ub
JOIN resources r ON ub.resource_id = r.id
WHERE ub.created_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
    'achievement_earned' as activity_type,
    ua.user_id,
    a.name as resource_title,
    ua.earned_at as activity_time
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
WHERE ua.earned_at > NOW() - INTERVAL '30 days'

ORDER BY activity_time DESC;

-- User statistics view for admins
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
    COUNT(*) FILTER (WHERE role = 'super_admin') as super_admin_count,
    COUNT(*) FILTER (WHERE subscription_tier = 'free') as free_users,
    COUNT(*) FILTER (WHERE subscription_tier = 'premium') as premium_users,
    COUNT(*) FILTER (WHERE subscription_tier = 'enterprise') as enterprise_users,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_month
FROM profiles;

-- =============================================
-- 12. INITIAL DATA SETUP
-- =============================================

-- Insert default achievements
INSERT INTO achievements (name, description, icon, criteria, points) VALUES
('First Steps', 'Complete your first resource', '🎯', '{"type": "resource_completed", "count": 1}', 10),
('Knowledge Seeker', 'Bookmark 10 resources', '📚', '{"type": "bookmarks", "count": 10}', 25),
('Dedicated Learner', 'Complete 5 resources', '🏆', '{"type": "resource_completed", "count": 5}', 50),
('Cybersecurity Expert', 'Complete 25 resources', '🛡️', '{"type": "resource_completed", "count": 25}', 100),
('Community Member', 'Join the platform', '👋', '{"type": "registration", "count": 1}', 5)
ON CONFLICT DO NOTHING;

-- Insert default tags
INSERT INTO tags (name, slug, description) VALUES
('penetration-testing', 'penetration-testing', 'Ethical hacking and penetration testing resources'),
('malware-analysis', 'malware-analysis', 'Malware analysis and reverse engineering'),
('incident-response', 'incident-response', 'Incident response and forensics'),
('network-security', 'network-security', 'Network security and monitoring'),
('cloud-security', 'cloud-security', 'Cloud security and DevSecOps'),
('compliance', 'compliance', 'Security compliance and governance'),
('threat-intelligence', 'threat-intelligence', 'Threat intelligence and analysis'),
('social-engineering', 'social-engineering', 'Social engineering and awareness')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT SELECT ON user_dashboard_stats TO authenticated;
GRANT SELECT ON recent_user_activity TO authenticated;
GRANT SELECT ON user_stats TO authenticated;

-- Enable RLS on new tables
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

COMMIT;