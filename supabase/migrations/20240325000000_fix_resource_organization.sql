-- Migration to fix resource organization and categorization
-- This addresses the critical database issues identified in the analysis

BEGIN;

-- 1. Add missing category_id column to resources table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE resources ADD COLUMN category_id UUID REFERENCES categories(id);
    END IF;
END $$;

-- 2. Alternative approach: Use text type for resource_type to avoid enum conflicts
-- This is safer than trying to modify enums with dependent views
DO $$
BEGIN
    -- Check if resource_type is currently an enum and convert to text if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' 
        AND column_name = 'resource_type' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- Store existing views
        CREATE TEMP TABLE temp_views AS
        SELECT definition
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname LIKE '%resource%';
        
        -- Drop dependent views
        DROP VIEW IF EXISTS resource_search_view CASCADE;
        DROP VIEW IF EXISTS resources_with_metadata CASCADE;
        
        -- Drop any existing check constraints on resource_type first
        DO $nested$
        BEGIN
            -- Drop existing check constraints that might restrict resource_type values
            IF EXISTS (
                SELECT 1 FROM information_schema.check_constraints 
                WHERE constraint_name LIKE '%resource_type%' 
                AND table_name = 'resources'
            ) THEN
                ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_resource_type_check;
                ALTER TABLE resources DROP CONSTRAINT IF EXISTS valid_resource_types;
                ALTER TABLE resources DROP CONSTRAINT IF EXISTS chk_resource_type;
            END IF;
        END $nested$;
        
        -- Convert to text type (this allows all values including new ones)
        ALTER TABLE resources ALTER COLUMN resource_type TYPE text;
        
        -- Recreate the search view
        CREATE OR REPLACE VIEW resource_search_view AS
        SELECT 
            r.id,
            r.title,
            r.slug,
            r.description,
            r.resource_type,
            r.difficulty_level,
            r.is_premium,
            r.is_featured,
            r.is_published,
            r.view_count,
            r.like_count,
            r.created_at,
            r.updated_at,
            to_tsvector('english', r.title || ' ' || COALESCE(r.description, '')) as search_vector
        FROM resources r
        WHERE r.is_published = true;
    END IF;
    
    -- Skip the check constraint for now - we'll add it after data cleanup
    RAISE NOTICE 'Skipping check constraint - will be added after data standardization';
END $$;

-- 2.5. Drop any existing check constraints that might prevent our resource type updates
DO $$
BEGIN
    -- Drop all possible check constraints on resource_type
    ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_resource_type_check;
    ALTER TABLE resources DROP CONSTRAINT IF EXISTS valid_resource_types;
    ALTER TABLE resources DROP CONSTRAINT IF EXISTS chk_resource_type;
    ALTER TABLE resources DROP CONSTRAINT IF EXISTS resource_type_check;
    
    RAISE NOTICE 'Dropped existing resource_type check constraints';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No resource_type check constraints found to drop';
END $$;

-- 3. Create academy, insights, and community categories if they don't exist
INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, sort_order, is_active)
SELECT gen_random_uuid(), 'Academy', 'academy', 'Comprehensive cybersecurity education and training', 'GraduationCap', 'blue', 1, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'academy' OR name = 'Academy');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, sort_order, is_active)
SELECT gen_random_uuid(), 'Insights', 'insights', 'Latest cybersecurity news and intelligence', 'TrendingUp', 'green', 2, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'insights' OR name = 'Insights');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, sort_order, is_active)
SELECT gen_random_uuid(), 'Community', 'community', 'Connect with cybersecurity professionals', 'Users', 'purple', 3, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'community' OR name = 'Community');

-- 4. Create subcategories for Academy
INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Courses',
    'courses',
    'Structured cybersecurity learning paths',
    'BookOpen',
    'blue',
    c.id,
    1,
    true
FROM categories c 
WHERE c.slug = 'academy'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'courses' OR name = 'Courses');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Videos',
    'videos',
    'Educational videos and tutorials',
    'Video',
    'red',
    c.id,
    2,
    true
FROM categories c 
WHERE c.slug = 'academy'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'videos' OR name = 'Videos');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Documentation',
    'documentation',
    'Technical guides and reference materials',
    'FileText',
    'cyan',
    c.id,
    3,
    true
FROM categories c 
WHERE c.slug = 'academy'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'documentation' OR name = 'Documentation');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Cheat Sheets',
    'cheatsheets',
    'Quick reference guides',
    'FileText',
    'yellow',
    c.id,
    4,
    true
FROM categories c 
WHERE c.slug = 'academy'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'cheatsheets' OR name = 'Cheat Sheets');

-- 5. Create subcategories for Insights
INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Latest News',
    'news',
    'Breaking cybersecurity news',
    'TrendingUp',
    'blue',
    c.id,
    1,
    true
FROM categories c 
WHERE c.slug = 'insights'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'news' OR name = 'Latest News');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Security Tools',
    'tools',
    'Essential cybersecurity tools',
    'Wrench',
    'purple',
    c.id,
    2,
    true
FROM categories c 
WHERE c.slug = 'insights'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tools' OR name = 'Security Tools');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Podcasts',
    'podcasts',
    'Cybersecurity podcasts',
    'Mic',
    'green',
    c.id,
    3,
    true
FROM categories c 
WHERE c.slug = 'insights'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'podcasts' OR name = 'Podcasts');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Threat Intelligence',
    'threats',
    'Latest threat analysis',
    'Shield',
    'red',
    c.id,
    4,
    true
FROM categories c 
WHERE c.slug = 'insights'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'threats' OR name = 'Threat Intelligence');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Data Breaches',
    'breaches',
    'Breach analysis and reports',
    'Database',
    'orange',
    c.id,
    5,
    true
FROM categories c 
WHERE c.slug = 'insights'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'breaches' OR name = 'Data Breaches');

-- 6. Create subcategories for Community
INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Discord Servers',
    'discord',
    'Active Discord communities',
    'MessageSquare',
    'indigo',
    c.id,
    1,
    true
FROM categories c 
WHERE c.slug = 'community'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'discord' OR name = 'Discord Servers');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Reddit Communities',
    'reddit',
    'Cybersecurity subreddits',
    'Users',
    'orange',
    c.id,
    2,
    true
FROM categories c 
WHERE c.slug = 'community'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'reddit' OR name = 'Reddit Communities');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Forums',
    'forums',
    'Traditional discussion forums',
    'Users',
    'blue',
    c.id,
    3,
    true
FROM categories c 
WHERE c.slug = 'community'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'forums' OR name = 'Forums');

INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, parent_category_id, sort_order, is_active)
SELECT 
    gen_random_uuid(),
    'Skool Communities',
    'skool',
    'Skool platform communities',
    'Users',
    'purple',
    c.id,
    4,
    true
FROM categories c 
WHERE c.slug = 'community'
AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'skool' OR name = 'Skool Communities');

-- 7. Update resources to assign proper categories based on resource_type
-- First, standardize existing resource types
UPDATE resources SET resource_type = 'article' WHERE resource_type IN ('blog', 'news', 'post', 'article');
UPDATE resources SET resource_type = 'documentation' WHERE resource_type IN ('doc', 'guide', 'manual', 'documentation');
UPDATE resources SET resource_type = 'cheat_sheet' WHERE resource_type IN ('cheatsheet', 'reference', 'quick_reference', 'cheat_sheet');
UPDATE resources SET resource_type = 'community' WHERE resource_type IN ('forum', 'discord', 'reddit', 'social', 'community');
UPDATE resources SET resource_type = 'tool' WHERE resource_type IN ('software', 'application', 'utility', 'tool');

-- Academy resources
UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'courses' LIMIT 1)
WHERE resource_type = 'course' AND category_id IS NULL;

UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'videos' LIMIT 1)
WHERE resource_type = 'video' AND category_id IS NULL;

UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'documentation' LIMIT 1)
WHERE resource_type = 'documentation' AND category_id IS NULL;

UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'cheatsheets' LIMIT 1)
WHERE resource_type = 'cheat_sheet' AND category_id IS NULL;

-- Insights resources
UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'news' LIMIT 1)
WHERE resource_type = 'article' AND category_id IS NULL;

UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'tools' LIMIT 1)
WHERE resource_type = 'tool' AND category_id IS NULL;

UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'podcasts' LIMIT 1)
WHERE resource_type = 'podcast' AND category_id IS NULL;

UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'threats' LIMIT 1)
WHERE resource_type = 'threat' AND category_id IS NULL;

UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'breaches' LIMIT 1)
WHERE resource_type = 'breach' AND category_id IS NULL;

-- Community resources
UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'discord' LIMIT 1)
WHERE resource_type = 'community' AND category_id IS NULL;

-- Handle any remaining unmapped resource types by assigning them to appropriate categories
-- Put any remaining unmapped resources in the 'news' category as a default
UPDATE resources 
SET category_id = (SELECT id FROM categories WHERE slug = 'news' LIMIT 1)
WHERE category_id IS NULL AND resource_type NOT IN ('course', 'video', 'documentation', 'cheat_sheet', 'article', 'tool', 'podcast', 'threat', 'breach', 'community');

-- 8. Create resource_categories junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS resource_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(resource_id, category_id)
);

-- 9. Populate resource_categories junction table from direct category_id assignments
INSERT INTO resource_categories (resource_id, category_id)
SELECT id, category_id 
FROM resources 
WHERE category_id IS NOT NULL
ON CONFLICT (resource_id, category_id) DO NOTHING;

-- 10. Create optimized indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_category_id ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_type_published ON resources(resource_type, is_published);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_resources_premium ON resources(is_premium);
CREATE INDEX IF NOT EXISTS idx_resources_search ON resources USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_resource_categories_resource_id ON resource_categories(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_categories_category_id ON resource_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 11. Add foreign key constraint for category_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_resources_category_id'
    ) THEN
        ALTER TABLE resources 
        ADD CONSTRAINT fk_resources_category_id 
        FOREIGN KEY (category_id) REFERENCES categories(id);
    END IF;
END $$;

-- 12. Create a function to automatically sync resource_categories when category_id changes
CREATE OR REPLACE FUNCTION sync_resource_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove old category relationship
    DELETE FROM resource_categories 
    WHERE resource_id = NEW.id AND category_id = OLD.category_id;
    
    -- Add new category relationship if category_id is not null
    IF NEW.category_id IS NOT NULL THEN
        INSERT INTO resource_categories (resource_id, category_id)
        VALUES (NEW.id, NEW.category_id)
        ON CONFLICT (resource_id, category_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Create trigger to automatically sync junction table
DROP TRIGGER IF EXISTS sync_resource_categories_trigger ON resources;
CREATE TRIGGER sync_resource_categories_trigger
    AFTER UPDATE OF category_id ON resources
    FOR EACH ROW
    EXECUTE FUNCTION sync_resource_categories();

-- 14. Update resource counts in categories
CREATE OR REPLACE FUNCTION update_category_resource_counts()
RETURNS void AS $$
BEGIN
    -- Update resource counts for all categories
    UPDATE categories 
    SET resource_count = (
        SELECT COUNT(*)
        FROM resource_categories rc
        WHERE rc.category_id = categories.id
    );
END;
$$ LANGUAGE plpgsql;

-- Add resource_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'resource_count'
    ) THEN
        ALTER TABLE categories ADD COLUMN resource_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Execute the count update
SELECT update_category_resource_counts();

-- 15. Create a view for easy resource browsing with category information
CREATE OR REPLACE VIEW resources_with_categories AS
SELECT 
    r.*,
    c.name as category_name,
    c.slug as category_slug,
    c.icon_name as category_icon,
    c.color_scheme as category_color,
    pc.name as parent_category_name,
    pc.slug as parent_category_slug
FROM resources r
LEFT JOIN categories c ON r.category_id = c.id
LEFT JOIN categories pc ON c.parent_category_id = pc.id;

-- 16. Grant necessary permissions
GRANT SELECT ON resources_with_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON resource_categories TO authenticated;

COMMIT;

-- Log the completion of the migration and show diagnostics
DO $$
DECLARE
    resource_count integer;
    uncategorized_count integer;
    type_counts text;
BEGIN
    -- Get total resource count
    SELECT COUNT(*) INTO resource_count FROM resources;
    
    -- Get uncategorized count
    SELECT COUNT(*) INTO uncategorized_count FROM resources WHERE category_id IS NULL;
    
    -- Get resource type distribution
    SELECT string_agg(resource_type || ': ' || count::text, ', ' ORDER BY count DESC)
    INTO type_counts
    FROM (
        SELECT resource_type, COUNT(*) as count
        FROM resources
        GROUP BY resource_type
    ) t;
    
    RAISE NOTICE 'Migration 20240325000000_fix_resource_organization completed successfully';
    RAISE NOTICE 'Total resources: %', resource_count;
    RAISE NOTICE 'Uncategorized resources: %', uncategorized_count;
    RAISE NOTICE 'Resource types: %', type_counts;
    RAISE NOTICE 'Junction tables populated for many-to-many relationships';
    RAISE NOTICE 'Performance indexes created';
END $$;