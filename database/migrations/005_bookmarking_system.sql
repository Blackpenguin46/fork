-- Enhanced Content Bookmarking and Saving System
-- Migration: 005_bookmarking_system.sql

-- Bookmark collections for organizing saved content
CREATE TABLE bookmark_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT 'blue', -- For UI theming
    icon TEXT DEFAULT 'bookmark', -- For UI icons
    is_default BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_collection_name UNIQUE(user_id, name)
);

-- Enhanced bookmarking system with collections and metadata
CREATE TABLE user_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES bookmark_collections(id) ON DELETE SET NULL,
    
    -- Bookmark metadata
    title TEXT, -- Custom title override
    notes TEXT, -- Personal notes about the bookmark
    tags TEXT[], -- Personal tags for organization
    
    -- Reading progress
    reading_progress DECIMAL(5,2) DEFAULT 0, -- 0-100 percentage
    reading_time_seconds INTEGER DEFAULT 0,
    last_read_at TIMESTAMPTZ,
    
    -- Priority and organization
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5), -- 1=highest, 5=lowest
    is_archived BOOLEAN DEFAULT FALSE,
    reminder_date TIMESTAMPTZ,
    
    -- Social features
    is_public BOOLEAN DEFAULT FALSE,
    shared_with UUID[], -- Array of user IDs
    
    -- Metadata
    bookmarked_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, resource_id)
);

-- Content annotations and highlights
CREATE TABLE content_annotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    bookmark_id UUID REFERENCES user_bookmarks(id) ON DELETE CASCADE,
    
    -- Annotation details
    annotation_type TEXT CHECK (annotation_type IN ('highlight', 'note', 'question', 'important')) DEFAULT 'note',
    content TEXT NOT NULL,
    context TEXT, -- Surrounding text or location reference
    
    -- Position information (for highlighting specific sections)
    section_reference TEXT, -- Chapter, section, timestamp, etc.
    start_position INTEGER,
    end_position INTEGER,
    
    -- Visual styling
    color TEXT DEFAULT 'yellow',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared bookmark collections
CREATE TABLE shared_bookmark_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES bookmark_collections(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE,
    permission_level TEXT CHECK (permission_level IN ('view', 'edit', 'admin')) DEFAULT 'view',
    shared_at TIMESTAMPTZ DEFAULT NOW(),
    accessed_at TIMESTAMPTZ,
    UNIQUE(collection_id, shared_with)
);

-- Reading lists for curated learning paths
CREATE TABLE reading_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- List properties
    is_sequential BOOLEAN DEFAULT FALSE, -- Must be read in order
    estimated_duration_hours DECIMAL(5,2),
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    
    -- Progress tracking
    current_position INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Organization
    category TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items within reading lists
CREATE TABLE reading_list_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reading_list_id UUID REFERENCES reading_lists(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    
    -- Item-specific properties
    notes TEXT,
    estimated_duration_minutes INTEGER,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    
    -- Prerequisites
    required_items UUID[], -- Must complete these items first
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reading_list_id, position)
);

-- Content recommendations based on bookmarks
CREATE TABLE bookmark_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recommended_resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    
    -- Recommendation source
    based_on_bookmark_id UUID REFERENCES user_bookmarks(id) ON DELETE CASCADE,
    recommendation_type TEXT CHECK (recommendation_type IN ('similar_content', 'next_level', 'related_topic', 'trending', 'ai_generated')),
    
    -- Scoring
    relevance_score DECIMAL(5,2), -- 0-100
    confidence_score DECIMAL(5,2), -- 0-100
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'viewed', 'bookmarked', 'dismissed')) DEFAULT 'pending',
    viewed_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- Indexes for performance
CREATE INDEX idx_bookmark_collections_user_id ON bookmark_collections(user_id);
CREATE INDEX idx_bookmark_collections_default ON bookmark_collections(user_id, is_default) WHERE is_default = TRUE;

CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_collection ON user_bookmarks(collection_id);
CREATE INDEX idx_user_bookmarks_resource ON user_bookmarks(resource_id);
CREATE INDEX idx_user_bookmarks_priority ON user_bookmarks(user_id, priority);
CREATE INDEX idx_user_bookmarks_archived ON user_bookmarks(user_id, is_archived);
CREATE INDEX idx_user_bookmarks_tags ON user_bookmarks USING GIN(tags);
CREATE INDEX idx_user_bookmarks_reminder ON user_bookmarks(reminder_date) WHERE reminder_date IS NOT NULL;

CREATE INDEX idx_content_annotations_user_resource ON content_annotations(user_id, resource_id);
CREATE INDEX idx_content_annotations_bookmark ON content_annotations(bookmark_id);
CREATE INDEX idx_content_annotations_type ON content_annotations(annotation_type);

CREATE INDEX idx_reading_lists_user_id ON reading_lists(user_id);
CREATE INDEX idx_reading_lists_category ON reading_lists(category);
CREATE INDEX idx_reading_lists_public ON reading_lists(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_reading_lists_tags ON reading_lists USING GIN(tags);

CREATE INDEX idx_reading_list_items_list ON reading_list_items(reading_list_id, position);
CREATE INDEX idx_reading_list_items_resource ON reading_list_items(resource_id);
CREATE INDEX idx_reading_list_items_completed ON reading_list_items(reading_list_id, is_completed);

CREATE INDEX idx_bookmark_recommendations_user ON bookmark_recommendations(user_id, status);
CREATE INDEX idx_bookmark_recommendations_expires ON bookmark_recommendations(expires_at);

-- RLS Policies
ALTER TABLE bookmark_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_bookmark_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own bookmark collections
CREATE POLICY "Users can manage own bookmark collections" ON bookmark_collections
    FOR ALL USING (auth.uid() = user_id);

-- Users can view shared collections
CREATE POLICY "Users can view shared collections" ON bookmark_collections
    FOR SELECT USING (
        auth.uid() = user_id OR 
        id IN (
            SELECT collection_id FROM shared_bookmark_collections 
            WHERE shared_with = auth.uid()
        )
    );

-- Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON user_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Users can view public bookmarks
CREATE POLICY "Users can view public bookmarks" ON user_bookmarks
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (is_public = TRUE) OR
        (auth.uid() = ANY(shared_with))
    );

-- Users can manage their own annotations
CREATE POLICY "Users can manage own annotations" ON content_annotations
    FOR ALL USING (auth.uid() = user_id);

-- Shared collection permissions
CREATE POLICY "Users can view shared collections they have access to" ON shared_bookmark_collections
    FOR SELECT USING (
        auth.uid() = shared_by OR 
        auth.uid() = shared_with
    );

CREATE POLICY "Users can manage collections they own" ON shared_bookmark_collections
    FOR ALL USING (auth.uid() = shared_by);

-- Reading lists policies
CREATE POLICY "Users can manage own reading lists" ON reading_lists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public reading lists" ON reading_lists
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can manage reading list items for their lists" ON reading_list_items
    FOR ALL USING (
        reading_list_id IN (
            SELECT id FROM reading_lists WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view reading list items for accessible lists" ON reading_list_items
    FOR SELECT USING (
        reading_list_id IN (
            SELECT id FROM reading_lists 
            WHERE user_id = auth.uid() OR is_public = TRUE
        )
    );

-- Recommendation policies
CREATE POLICY "Users can view own recommendations" ON bookmark_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendation status" ON bookmark_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions for bookmark management
CREATE OR REPLACE FUNCTION create_default_bookmark_collection()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO bookmark_collections (user_id, name, description, is_default)
    VALUES (NEW.id, 'Saved Items', 'Default collection for bookmarked content', TRUE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default collection for new users
CREATE TRIGGER trigger_create_default_bookmark_collection
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_bookmark_collection();

-- Function to update reading list progress
CREATE OR REPLACE FUNCTION update_reading_list_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_items INTEGER;
    completed_items INTEGER;
    new_percentage DECIMAL(5,2);
    next_position INTEGER;
BEGIN
    -- Get total and completed items for the reading list
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN is_completed THEN 1 END)
    INTO total_items, completed_items
    FROM reading_list_items
    WHERE reading_list_id = COALESCE(NEW.reading_list_id, OLD.reading_list_id);

    -- Calculate completion percentage
    IF total_items > 0 THEN
        new_percentage := (completed_items::DECIMAL / total_items) * 100;
    ELSE
        new_percentage := 0;
    END IF;

    -- Find next incomplete item position
    SELECT MIN(position) INTO next_position
    FROM reading_list_items
    WHERE reading_list_id = COALESCE(NEW.reading_list_id, OLD.reading_list_id)
    AND is_completed = FALSE;

    -- Update the reading list
    UPDATE reading_lists
    SET 
        completion_percentage = new_percentage,
        current_position = COALESCE(next_position, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.reading_list_id, OLD.reading_list_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update reading list progress
CREATE TRIGGER trigger_update_reading_list_progress
    AFTER INSERT OR UPDATE OR DELETE ON reading_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_reading_list_progress();

-- Function to generate bookmark recommendations
CREATE OR REPLACE FUNCTION generate_bookmark_recommendations(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    resource_id UUID,
    recommendation_type TEXT,
    relevance_score DECIMAL,
    based_on_resource_title TEXT
) AS $$
BEGIN
    -- This is a simplified recommendation engine
    -- In production, this would use more sophisticated ML algorithms
    
    RETURN QUERY
    WITH user_bookmark_categories AS (
        SELECT r.category, COUNT(*) as bookmark_count
        FROM user_bookmarks ub
        JOIN resources r ON ub.resource_id = r.id
        WHERE ub.user_id = p_user_id
        GROUP BY r.category
        ORDER BY bookmark_count DESC
        LIMIT 3
    ),
    recommended_resources AS (
        SELECT DISTINCT
            r.id as resource_id,
            'similar_content'::TEXT as recommendation_type,
            85.0::DECIMAL as relevance_score,
            'Based on your interest in ' || r.category as based_on_resource_title
        FROM resources r
        JOIN user_bookmark_categories ubc ON r.category = ubc.category
        WHERE r.id NOT IN (
            SELECT resource_id FROM user_bookmarks WHERE user_id = p_user_id
        )
        AND r.is_published = TRUE
        ORDER BY r.created_at DESC
        LIMIT p_limit
    )
    SELECT * FROM recommended_resources;
END;
$$ LANGUAGE plpgsql;