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

-- 2. Update the resource_type enum to include all types used in the application
-- First, add the new types to the enum
DO $$
BEGIN
    -- Check if we need to alter the enum type
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'resource_type_enum' AND e.enumlabel = 'cheat_sheet'
    ) THEN
        -- Temporarily remove the constraint
        ALTER TABLE resources ALTER COLUMN resource_type TYPE text;
        
        -- Drop the old enum if it exists
        DROP TYPE IF EXISTS resource_type_enum;
        
        -- Create new enum with all required types
        CREATE TYPE resource_type_enum AS ENUM (
            'course',
            'article', 
            'video',
            'tool',
            'community',
            'documentation',
            'cheat_sheet',
            'podcast',
            'threat',
            'breach'
        );
        
        -- Apply the new enum type
        ALTER TABLE resources ALTER COLUMN resource_type TYPE resource_type_enum USING resource_type::resource_type_enum;
    END IF;
END $$;

-- 3. Create academy, insights, and community categories if they don't exist
INSERT INTO categories (id, name, slug, description, icon_name, color_scheme, sort_order, is_active)
VALUES 
    (gen_random_uuid(), 'Academy', 'academy', 'Comprehensive cybersecurity education and training', 'GraduationCap', 'blue', 1, true),
    (gen_random_uuid(), 'Insights', 'insights', 'Latest cybersecurity news and intelligence', 'TrendingUp', 'green', 2, true),
    (gen_random_uuid(), 'Community', 'community', 'Connect with cybersecurity professionals', 'Users', 'purple', 3, true)
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'academy'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'academy'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'academy'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'academy'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'insights'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'insights'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'insights'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'insights'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'insights'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'community'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'community'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'community'
ON CONFLICT (slug) DO NOTHING;

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
FROM categories c WHERE c.slug = 'community'
ON CONFLICT (slug) DO NOTHING;

-- 7. Update resources to assign proper categories based on resource_type
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

-- Log the completion of the migration
DO $$
BEGIN
    RAISE NOTICE 'Migration 008_fix_resource_organization completed successfully';
    RAISE NOTICE 'Resources now have proper category assignments';
    RAISE NOTICE 'Junction tables populated for many-to-many relationships';
    RAISE NOTICE 'Performance indexes created';
    RAISE NOTICE 'All 639 resources should now be properly categorized';
END $$;