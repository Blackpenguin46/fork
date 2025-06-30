-- Enhanced User Progress Tracking System
-- Migration: 004_enhanced_progress_tracking.sql

-- Enhanced user progress tracking with detailed analytics
CREATE TABLE user_progress_detailed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_seconds INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Learning analytics
    session_count INTEGER DEFAULT 1,
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    notes TEXT,
    
    -- Milestone tracking
    milestones_completed JSONB DEFAULT '[]',
    quiz_scores JSONB DEFAULT '{}',
    practical_exercises_completed INTEGER DEFAULT 0,
    
    -- Engagement metrics
    bookmark_added_at TIMESTAMPTZ,
    shared_count INTEGER DEFAULT 0,
    help_requests INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

-- Learning streaks and habits
CREATE TABLE user_learning_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    streak_type TEXT NOT NULL CHECK (streak_type IN ('daily', 'weekly', 'monthly')),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    streak_start_date DATE DEFAULT CURRENT_DATE,
    total_learning_time_hours DECIMAL(10,2) DEFAULT 0,
    activities_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- Skill assessments and competency tracking
CREATE TABLE user_skill_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_category TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 100),
    assessment_date TIMESTAMPTZ DEFAULT NOW(),
    assessment_type TEXT CHECK (assessment_type IN ('self', 'quiz', 'practical', 'peer', 'expert')),
    assessment_score DECIMAL(5,2),
    certification_aligned TEXT,
    improvement_areas JSONB,
    next_recommended_content UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning goals and objectives
CREATE TABLE user_learning_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    goal_title TEXT NOT NULL,
    goal_description TEXT,
    goal_type TEXT CHECK (goal_type IN ('certification', 'skill', 'career', 'project')),
    target_completion_date DATE,
    current_progress DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    related_learning_paths UUID[],
    related_resources UUID[],
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning session tracking
CREATE TABLE user_learning_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    duration_seconds INTEGER,
    activities_completed INTEGER DEFAULT 0,
    notes_taken INTEGER DEFAULT 0,
    bookmarks_added INTEGER DEFAULT 0,
    difficulty_encountered BOOLEAN DEFAULT FALSE,
    help_requested BOOLEAN DEFAULT FALSE,
    session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning achievements and badges
CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    criteria_met JSONB,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    badge_image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    points_awarded INTEGER DEFAULT 0
);

-- Indexes for performance optimization
CREATE INDEX idx_user_progress_detailed_user_id ON user_progress_detailed(user_id);
CREATE INDEX idx_user_progress_detailed_resource_id ON user_progress_detailed(resource_id);
CREATE INDEX idx_user_progress_detailed_learning_path ON user_progress_detailed(learning_path_id);
CREATE INDEX idx_user_progress_detailed_last_accessed ON user_progress_detailed(last_accessed_at);
CREATE INDEX idx_user_progress_detailed_completed ON user_progress_detailed(completed_at) WHERE completed_at IS NOT NULL;

CREATE INDEX idx_user_learning_streaks_user_id ON user_learning_streaks(user_id);
CREATE INDEX idx_user_learning_streaks_last_activity ON user_learning_streaks(last_activity_date);

CREATE INDEX idx_user_skill_assessments_user_id ON user_skill_assessments(user_id);
CREATE INDEX idx_user_skill_assessments_skill ON user_skill_assessments(skill_category, skill_name);

CREATE INDEX idx_user_learning_goals_user_id ON user_learning_goals(user_id);
CREATE INDEX idx_user_learning_goals_status ON user_learning_goals(status);

CREATE INDEX idx_user_learning_sessions_user_id ON user_learning_sessions(user_id);
CREATE INDEX idx_user_learning_sessions_date ON user_learning_sessions(session_start);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);

-- RLS Policies for security
ALTER TABLE user_progress_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can only access their own progress data
CREATE POLICY "Users can view own progress" ON user_progress_detailed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress_detailed
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streaks" ON user_learning_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON user_learning_streaks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assessments" ON user_skill_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments" ON user_skill_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON user_learning_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON user_learning_goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON user_learning_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON user_learning_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for automated streak calculation
CREATE OR REPLACE FUNCTION update_learning_streak()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily streak
    INSERT INTO user_learning_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, 'daily', 1, 1, CURRENT_DATE)
    ON CONFLICT (user_id, streak_type)
    DO UPDATE SET
        current_streak = CASE
            WHEN user_learning_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
                user_learning_streaks.current_streak + 1
            WHEN user_learning_streaks.last_activity_date = CURRENT_DATE THEN
                user_learning_streaks.current_streak
            ELSE 1
        END,
        longest_streak = GREATEST(
            user_learning_streaks.longest_streak,
            CASE
                WHEN user_learning_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
                    user_learning_streaks.current_streak + 1
                WHEN user_learning_streaks.last_activity_date = CURRENT_DATE THEN
                    user_learning_streaks.current_streak
                ELSE 1
            END
        ),
        last_activity_date = CURRENT_DATE,
        total_learning_time_hours = user_learning_streaks.total_learning_time_hours + (COALESCE(NEW.time_spent_seconds, 0) / 3600.0),
        activities_completed = user_learning_streaks.activities_completed + 1,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update streaks
CREATE TRIGGER trigger_update_learning_streak
    AFTER INSERT OR UPDATE ON user_progress_detailed
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_streak();

-- Function to calculate skill proficiency based on completed content
CREATE OR REPLACE FUNCTION calculate_skill_proficiency(p_user_id UUID, p_skill_category TEXT)
RETURNS INTEGER AS $$
DECLARE
    total_content INTEGER;
    completed_content INTEGER;
    avg_score DECIMAL;
    proficiency INTEGER;
BEGIN
    -- Count total and completed content for skill category
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN upd.progress_percentage = 100 THEN 1 END),
        AVG(CASE WHEN upd.progress_percentage = 100 THEN upd.user_rating END)
    INTO total_content, completed_content, avg_score
    FROM user_progress_detailed upd
    JOIN resources r ON upd.resource_id = r.id
    WHERE upd.user_id = p_user_id
    AND r.category = p_skill_category;

    -- Calculate proficiency (0-100)
    IF total_content = 0 THEN
        proficiency := 0;
    ELSE
        proficiency := LEAST(100, 
            (completed_content * 100 / total_content) * 
            COALESCE(avg_score / 5.0, 0.8)
        );
    END IF;

    RETURN proficiency;
END;
$$ LANGUAGE plpgsql;