-- Enhanced Authentication System Migration
-- This migration enhances the authentication system with:
-- 1. Improved constraints and indexes
-- 2. Automatic profile creation triggers
-- 3. Admin role management
-- 4. Audit logging
-- 5. Enhanced security features

-- =====================================================
-- 1. UPDATE PROFILES TABLE CONSTRAINTS
-- =====================================================

-- Add unique constraint on email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx 
ON profiles (LOWER(email));

-- Add unique constraint on username (case-insensitive, excluding nulls)
DROP INDEX IF EXISTS profiles_username_unique_idx;
CREATE UNIQUE INDEX profiles_username_unique_idx 
ON profiles (LOWER(username)) 
WHERE username IS NOT NULL;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles (role);
CREATE INDEX IF NOT EXISTS profiles_subscription_tier_idx ON profiles (subscription_tier);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles (subscription_status);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles (created_at);

-- =====================================================
-- 2. ADD AUTHENTICATION AUDIT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS auth_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- login, logout, password_change, profile_update, role_change, etc.
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for audit log
CREATE INDEX auth_audit_log_user_id_idx ON auth_audit_log (user_id);
CREATE INDEX auth_audit_log_action_idx ON auth_audit_log (action);
CREATE INDEX auth_audit_log_created_at_idx ON auth_audit_log (created_at);
CREATE INDEX auth_audit_log_success_idx ON auth_audit_log (success);

-- =====================================================
-- 3. CREATE ADMIN ROLES AND PERMISSIONS
-- =====================================================

-- Create role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table role column to use enum
ALTER TABLE profiles 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- Set default role
ALTER TABLE profiles 
ALTER COLUMN role SET DEFAULT 'user';

-- =====================================================
-- 4. CREATE ADMIN MANAGEMENT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- promote_to_admin, demote_from_admin, suspend_user, etc.
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for admin actions
CREATE INDEX admin_actions_admin_user_id_idx ON admin_actions (admin_user_id);
CREATE INDEX admin_actions_target_user_id_idx ON admin_actions (target_user_id);
CREATE INDEX admin_actions_action_idx ON admin_actions (action);
CREATE INDEX admin_actions_created_at_idx ON admin_actions (created_at);

-- =====================================================
-- 5. CREATE USER SESSIONS TABLE FOR SECURITY
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for sessions
CREATE INDEX user_sessions_user_id_idx ON user_sessions (user_id);
CREATE INDEX user_sessions_session_token_idx ON user_sessions (session_token);
CREATE INDEX user_sessions_is_active_idx ON user_sessions (is_active);
CREATE INDEX user_sessions_expires_at_idx ON user_sessions (expires_at);

-- =====================================================
-- 6. CREATE AUTOMATIC PROFILE CREATION TRIGGER
-- =====================================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_username VARCHAR(50);
    username_counter INTEGER := 0;
    final_username VARCHAR(50);
BEGIN
    -- Generate a default username from email
    default_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
    
    -- Remove any non-alphanumeric characters except hyphens and underscores
    default_username := REGEXP_REPLACE(default_username, '[^a-z0-9_-]', '', 'g');
    
    -- Ensure username is at least 3 characters
    IF LENGTH(default_username) < 3 THEN
        default_username := 'user_' || SUBSTRING(NEW.id::text, 1, 8);
    END IF;
    
    -- Ensure unique username
    final_username := default_username;
    WHILE EXISTS (SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(final_username)) LOOP
        username_counter := username_counter + 1;
        final_username := default_username || '_' || username_counter;
    END LOOP;

    -- Insert profile with email confirmation awareness
    INSERT INTO profiles (
        id,
        email,
        username,
        full_name,
        role,
        subscription_tier,
        subscription_status,
        onboarding_completed,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        final_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        'user',
        'free',
        'active',
        false,
        NOW(),
        NOW()
    );

    -- Log the profile creation
    INSERT INTO auth_audit_log (
        user_id,
        action,
        details,
        success
    ) VALUES (
        NEW.id,
        'profile_created',
        jsonb_build_object(
            'email', NEW.email,
            'username', final_username,
            'email_confirmed', COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
        ),
        true
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        INSERT INTO auth_audit_log (
            user_id,
            action,
            details,
            success,
            error_message
        ) VALUES (
            NEW.id,
            'profile_creation_failed',
            jsonb_build_object('email', NEW.email),
            false,
            SQLERRM
        );
        
        -- Don't prevent user creation, just log the error
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 7. CREATE PROFILE UPDATE TRIGGER FOR AUDIT LOGGING
-- =====================================================

CREATE OR REPLACE FUNCTION handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the updated_at timestamp
    NEW.updated_at = NOW();
    
    -- Log significant profile changes
    IF OLD.role != NEW.role THEN
        INSERT INTO auth_audit_log (
            user_id,
            action,
            details,
            success
        ) VALUES (
            NEW.id,
            'role_changed',
            jsonb_build_object(
                'old_role', OLD.role,
                'new_role', NEW.role,
                'changed_at', NOW()
            ),
            true
        );
    END IF;
    
    IF OLD.subscription_tier != NEW.subscription_tier THEN
        INSERT INTO auth_audit_log (
            user_id,
            action,
            details,
            success
        ) VALUES (
            NEW.id,
            'subscription_tier_changed',
            jsonb_build_object(
                'old_tier', OLD.subscription_tier,
                'new_tier', NEW.subscription_tier,
                'changed_at', NOW()
            ),
            true
        );
    END IF;
    
    IF OLD.email != NEW.email THEN
        INSERT INTO auth_audit_log (
            user_id,
            action,
            details,
            success
        ) VALUES (
            NEW.id,
            'email_changed',
            jsonb_build_object(
                'old_email', OLD.email,
                'new_email', NEW.email,
                'changed_at', NOW()
            ),
            true
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_profile_update();

-- =====================================================
-- 8. CREATE ADMIN UTILITY FUNCTIONS
-- =====================================================

-- Function to promote user to admin (must be called by existing admin)
CREATE OR REPLACE FUNCTION promote_to_admin(
    target_user_id UUID,
    admin_user_id UUID,
    new_role user_role DEFAULT 'admin'
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_check user_role;
    target_current_role user_role;
BEGIN
    -- Check if the calling user is an admin
    SELECT role INTO admin_check 
    FROM profiles 
    WHERE id = admin_user_id;
    
    IF admin_check NOT IN ('admin', 'super_admin') THEN
        RAISE EXCEPTION 'Only admins can promote users';
    END IF;
    
    -- Get current role of target user
    SELECT role INTO target_current_role 
    FROM profiles 
    WHERE id = target_user_id;
    
    IF target_current_role IS NULL THEN
        RAISE EXCEPTION 'Target user not found';
    END IF;
    
    -- Update the user's role
    UPDATE profiles 
    SET role = new_role, updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Log the admin action
    INSERT INTO admin_actions (
        admin_user_id,
        target_user_id,
        action,
        details
    ) VALUES (
        admin_user_id,
        target_user_id,
        'promote_to_' || new_role::text,
        jsonb_build_object(
            'previous_role', target_current_role,
            'new_role', new_role,
            'promoted_at', NOW()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
        EXISTS(SELECT 1 FROM profiles WHERE LOWER(email) = LOWER(email_input)) as email_exists,
        EXISTS(SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(username_input)) as username_exists,
        (SELECT id FROM profiles WHERE LOWER(email) = LOWER(email_input) OR LOWER(username) = LOWER(username_input) LIMIT 1) as user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. CREATE INITIAL ADMIN USER (OPTIONAL)
-- =====================================================

-- Function to create initial admin user
CREATE OR REPLACE FUNCTION create_initial_admin(
    admin_email TEXT,
    admin_username TEXT DEFAULT 'admin',
    admin_full_name TEXT DEFAULT 'System Administrator'
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    auth_user_exists BOOLEAN := FALSE;
BEGIN
    -- Check if admin already exists
    IF EXISTS (SELECT 1 FROM profiles WHERE role IN ('admin', 'super_admin')) THEN
        RAISE EXCEPTION 'Admin user already exists';
    END IF;
    
    -- Check if auth user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = admin_email) INTO auth_user_exists;
    
    IF auth_user_exists THEN
        -- Get the existing user ID
        SELECT id INTO new_user_id FROM auth.users WHERE email = admin_email;
        
        -- Update their profile to admin
        UPDATE profiles 
        SET 
            role = 'super_admin',
            username = admin_username,
            full_name = admin_full_name,
            updated_at = NOW()
        WHERE id = new_user_id;
    ELSE
        RAISE EXCEPTION 'Auth user with email % does not exist. Please create the user through Supabase Auth first.', admin_email;
    END IF;
    
    -- Log the admin creation
    INSERT INTO auth_audit_log (
        user_id,
        action,
        details,
        success
    ) VALUES (
        new_user_id,
        'admin_created',
        jsonb_build_object(
            'email', admin_email,
            'username', admin_username,
            'role', 'super_admin'
        ),
        true
    );
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. CREATE RLS POLICIES FOR SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for auth_audit_log (users can view their own logs, admins can view all)
CREATE POLICY auth_audit_log_policy ON auth_audit_log
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Policy for admin_actions (only admins can view)
CREATE POLICY admin_actions_policy ON admin_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Policy for user_sessions (users can view their own sessions, admins can view all)
CREATE POLICY user_sessions_policy ON user_sessions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- 11. CREATE CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR last_activity < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audit logs (keep last 6 months)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth_audit_log 
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12. CREATE HELPFUL VIEWS FOR ADMIN DASHBOARD
-- =====================================================

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
    COUNT(*) FILTER (WHERE role = 'super_admin') as super_admin_count,
    COUNT(*) FILTER (WHERE subscription_tier = 'free') as free_users,
    COUNT(*) FILTER (WHERE subscription_tier = 'premium') as premium_users,
    COUNT(*) FILTER (WHERE subscription_tier = 'enterprise') as enterprise_users,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month
FROM profiles;

-- View for recent user activity
CREATE OR REPLACE VIEW recent_user_activity AS
SELECT 
    p.id,
    p.email,
    p.username,
    p.full_name,
    p.role,
    p.subscription_tier,
    p.created_at as joined_at,
    aal.action as last_action,
    aal.created_at as last_activity,
    aal.success as last_action_success
FROM profiles p
LEFT JOIN auth_audit_log aal ON p.id = aal.user_id
WHERE aal.id = (
    SELECT MAX(id) 
    FROM auth_audit_log 
    WHERE user_id = p.id
)
ORDER BY aal.created_at DESC NULLS LAST;

COMMENT ON MIGRATION IS 'Enhanced authentication system with automatic profile creation, admin roles, audit logging, and security improvements';