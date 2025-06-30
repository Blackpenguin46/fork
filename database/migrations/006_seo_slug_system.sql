-- SEO-Optimized URL Slug System
-- Migration: 006_seo_slug_system.sql

-- Content slugs with history and SEO optimization
CREATE TABLE content_slugs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    
    -- SEO metadata
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    
    -- Analytics and performance
    view_count INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,4) DEFAULT 0,
    bounce_rate DECIMAL(5,4) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    
    -- Search engine data
    search_rankings JSONB DEFAULT '{}', -- Store rankings for different keywords
    indexed_at TIMESTAMPTZ,
    last_crawled_at TIMESTAMPTZ,
    
    -- Slug management
    redirect_from TEXT[], -- Previous slugs that should redirect here
    redirect_to TEXT, -- If this slug should redirect elsewhere
    redirect_type INTEGER DEFAULT 301, -- 301 (permanent) or 302 (temporary)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(slug),
    UNIQUE(resource_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- Category slugs for hierarchical URLs
CREATE TABLE category_slugs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    parent_slug_id UUID REFERENCES category_slugs(id) ON DELETE SET NULL,
    full_path TEXT NOT NULL, -- Complete URL path including parent categories
    
    -- SEO metadata
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Hierarchy management
    level INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(slug),
    UNIQUE(full_path)
);

-- Learning path slugs
CREATE TABLE learning_path_slugs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    
    -- SEO metadata
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Progress tracking for SEO
    completion_rate DECIMAL(5,4) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(slug),
    UNIQUE(learning_path_id)
);

-- User profile slugs for public profiles
CREATE TABLE user_profile_slugs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Public profile SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Profile customization
    custom_domain TEXT,
    theme_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(slug),
    UNIQUE(user_id)
);

-- URL redirect history for SEO management
CREATE TABLE url_redirects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_path TEXT NOT NULL,
    to_path TEXT NOT NULL,
    redirect_type INTEGER DEFAULT 301,
    
    -- Tracking
    hit_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ,
    
    -- Metadata
    reason TEXT, -- Why this redirect was created
    created_by UUID REFERENCES profiles(id),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(from_path)
);

-- SEO keyword tracking
CREATE TABLE seo_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    
    -- Keyword metrics
    search_volume INTEGER DEFAULT 0,
    difficulty_score INTEGER DEFAULT 0, -- 1-100
    current_ranking INTEGER,
    target_ranking INTEGER DEFAULT 1,
    
    -- Competition analysis
    competitor_rankings JSONB DEFAULT '{}',
    
    -- Performance tracking
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(keyword, resource_id)
);

-- Sitemap generation data
CREATE TABLE sitemap_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'resource', 'category', 'learning_path', 'user_profile'
    content_id UUID NOT NULL,
    
    -- Sitemap properties
    priority DECIMAL(2,1) DEFAULT 0.5 CHECK (priority >= 0.0 AND priority <= 1.0),
    change_frequency TEXT DEFAULT 'weekly' CHECK (
        change_frequency IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')
    ),
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    
    -- SEO metadata
    images JSONB DEFAULT '[]', -- Array of image URLs for image sitemap
    videos JSONB DEFAULT '[]', -- Array of video metadata for video sitemap
    
    -- Management
    is_active BOOLEAN DEFAULT TRUE,
    index_status TEXT DEFAULT 'pending' CHECK (
        index_status IN ('pending', 'indexed', 'excluded', 'error')
    ),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(url)
);

-- Schema markup data for structured data
CREATE TABLE schema_markup (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    schema_type TEXT NOT NULL, -- 'Course', 'Article', 'Person', 'Organization', etc.
    markup_json JSONB NOT NULL,
    
    -- Validation
    is_valid BOOLEAN DEFAULT TRUE,
    validation_errors JSONB DEFAULT '[]',
    last_validated TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(resource_id, schema_type)
);

-- Indexes for performance
CREATE INDEX idx_content_slugs_slug ON content_slugs(slug);
CREATE INDEX idx_content_slugs_resource ON content_slugs(resource_id);
CREATE INDEX idx_content_slugs_primary ON content_slugs(resource_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_content_slugs_redirect ON content_slugs USING GIN(redirect_from) WHERE redirect_from IS NOT NULL;

CREATE INDEX idx_category_slugs_slug ON category_slugs(slug);
CREATE INDEX idx_category_slugs_path ON category_slugs(full_path);
CREATE INDEX idx_category_slugs_parent ON category_slugs(parent_slug_id);
CREATE INDEX idx_category_slugs_hierarchy ON category_slugs(level, sort_order);

CREATE INDEX idx_learning_path_slugs_slug ON learning_path_slugs(slug);
CREATE INDEX idx_learning_path_slugs_path_id ON learning_path_slugs(learning_path_id);

CREATE INDEX idx_user_profile_slugs_slug ON user_profile_slugs(slug);
CREATE INDEX idx_user_profile_slugs_public ON user_profile_slugs(is_public) WHERE is_public = TRUE;

CREATE INDEX idx_url_redirects_from ON url_redirects(from_path);
CREATE INDEX idx_url_redirects_to ON url_redirects(to_path);
CREATE INDEX idx_url_redirects_active ON url_redirects(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_seo_keywords_keyword ON seo_keywords(keyword);
CREATE INDEX idx_seo_keywords_resource ON seo_keywords(resource_id);
CREATE INDEX idx_seo_keywords_ranking ON seo_keywords(current_ranking) WHERE current_ranking IS NOT NULL;

CREATE INDEX idx_sitemap_entries_url ON sitemap_entries(url);
CREATE INDEX idx_sitemap_entries_type ON sitemap_entries(content_type, content_id);
CREATE INDEX idx_sitemap_entries_active ON sitemap_entries(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sitemap_entries_modified ON sitemap_entries(last_modified);

CREATE INDEX idx_schema_markup_resource ON schema_markup(resource_id);
CREATE INDEX idx_schema_markup_type ON schema_markup(schema_type);

-- RLS Policies
ALTER TABLE content_slugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_slugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_slugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_slugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitemap_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_markup ENABLE ROW LEVEL SECURITY;

-- Content slugs are publicly readable
CREATE POLICY "Content slugs are publicly readable" ON content_slugs
    FOR SELECT USING (TRUE);

-- Only admins can manage content slugs
CREATE POLICY "Admins can manage content slugs" ON content_slugs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Category slugs are publicly readable
CREATE POLICY "Category slugs are publicly readable" ON category_slugs
    FOR SELECT USING (TRUE);

-- Learning path slugs are publicly readable
CREATE POLICY "Learning path slugs are publicly readable" ON learning_path_slugs
    FOR SELECT USING (TRUE);

-- Users can manage their own profile slugs
CREATE POLICY "Users can manage own profile slugs" ON user_profile_slugs
    FOR ALL USING (auth.uid() = user_id);

-- Public profile slugs are readable by everyone
CREATE POLICY "Public profile slugs are readable" ON user_profile_slugs
    FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

-- URL redirects are publicly readable
CREATE POLICY "URL redirects are publicly readable" ON url_redirects
    FOR SELECT USING (is_active = TRUE);

-- Sitemap entries are publicly readable
CREATE POLICY "Sitemap entries are publicly readable" ON sitemap_entries
    FOR SELECT USING (is_active = TRUE);

-- Schema markup is publicly readable
CREATE POLICY "Schema markup is publicly readable" ON schema_markup
    FOR SELECT USING (TRUE);

-- Functions for slug management
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Convert to lowercase and replace spaces/special chars with hyphens
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(input_text),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION ensure_unique_slug(base_slug TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
    counter INTEGER := 0;
    test_slug TEXT := base_slug;
    slug_exists BOOLEAN;
BEGIN
    LOOP
        -- Check if slug exists
        EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name)
        USING test_slug
        INTO slug_exists;
        
        IF NOT slug_exists THEN
            RETURN test_slug;
        END IF;
        
        counter := counter + 1;
        test_slug := base_slug || '-' || counter;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_generate_content_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
BEGIN
    -- Generate base slug from title
    base_slug := generate_slug(NEW.title);
    
    -- Ensure uniqueness
    final_slug := ensure_unique_slug(base_slug, 'content_slugs');
    
    -- Insert slug record
    INSERT INTO content_slugs (
        resource_id,
        slug,
        meta_title,
        meta_description,
        is_primary
    ) VALUES (
        NEW.id,
        final_slug,
        NEW.title,
        LEFT(NEW.description, 160), -- Meta description limit
        TRUE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slugs for new resources
CREATE TRIGGER trigger_auto_generate_content_slug
    AFTER INSERT ON resources
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_content_slug();

CREATE OR REPLACE FUNCTION update_sitemap_entry()
RETURNS TRIGGER AS $$
DECLARE
    entry_url TEXT;
    entry_priority DECIMAL(2,1);
BEGIN
    -- Determine URL based on content type
    IF TG_TABLE_NAME = 'content_slugs' THEN
        entry_url := '/resource/' || NEW.slug;
        entry_priority := 0.8;
    ELSIF TG_TABLE_NAME = 'category_slugs' THEN
        entry_url := '/category/' || NEW.full_path;
        entry_priority := 0.6;
    ELSIF TG_TABLE_NAME = 'learning_path_slugs' THEN
        entry_url := '/learning-path/' || NEW.slug;
        entry_priority := 0.9;
    ELSIF TG_TABLE_NAME = 'user_profile_slugs' AND NEW.is_public THEN
        entry_url := '/profile/' || NEW.slug;
        entry_priority := 0.3;
    ELSE
        RETURN NEW;
    END IF;
    
    -- Upsert sitemap entry
    INSERT INTO sitemap_entries (
        url,
        content_type,
        content_id,
        priority,
        last_modified
    ) VALUES (
        entry_url,
        CASE 
            WHEN TG_TABLE_NAME = 'content_slugs' THEN 'resource'
            WHEN TG_TABLE_NAME = 'category_slugs' THEN 'category'
            WHEN TG_TABLE_NAME = 'learning_path_slugs' THEN 'learning_path'
            WHEN TG_TABLE_NAME = 'user_profile_slugs' THEN 'user_profile'
        END,
        CASE 
            WHEN TG_TABLE_NAME = 'content_slugs' THEN NEW.resource_id
            WHEN TG_TABLE_NAME = 'category_slugs' THEN NEW.category_id
            WHEN TG_TABLE_NAME = 'learning_path_slugs' THEN NEW.learning_path_id
            WHEN TG_TABLE_NAME = 'user_profile_slugs' THEN NEW.user_id
        END,
        entry_priority,
        NOW()
    ) ON CONFLICT (url) DO UPDATE SET
        last_modified = NOW(),
        is_active = TRUE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update sitemap entries
CREATE TRIGGER trigger_update_sitemap_content
    AFTER INSERT OR UPDATE ON content_slugs
    FOR EACH ROW
    EXECUTE FUNCTION update_sitemap_entry();

CREATE TRIGGER trigger_update_sitemap_category
    AFTER INSERT OR UPDATE ON category_slugs
    FOR EACH ROW
    EXECUTE FUNCTION update_sitemap_entry();

CREATE TRIGGER trigger_update_sitemap_path
    AFTER INSERT OR UPDATE ON learning_path_slugs
    FOR EACH ROW
    EXECUTE FUNCTION update_sitemap_entry();

CREATE TRIGGER trigger_update_sitemap_profile
    AFTER INSERT OR UPDATE ON user_profile_slugs
    FOR EACH ROW
    EXECUTE FUNCTION update_sitemap_entry();

-- Function to generate schema markup
CREATE OR REPLACE FUNCTION generate_course_schema(learning_path_id UUID)
RETURNS JSONB AS $$
DECLARE
    path_data RECORD;
    schema_json JSONB;
BEGIN
    -- Get learning path data
    SELECT lp.*, lps.slug, AVG(r.rating) as avg_rating, COUNT(upe.user_id) as enrollment_count
    FROM learning_paths lp
    LEFT JOIN learning_path_slugs lps ON lp.id = lps.learning_path_id
    LEFT JOIN reviews r ON lp.id = r.learning_path_id
    LEFT JOIN user_progress_extended upe ON lp.id = upe.learning_path_id
    WHERE lp.id = learning_path_id
    GROUP BY lp.id, lps.slug
    INTO path_data;
    
    -- Generate Course schema markup
    schema_json := jsonb_build_object(
        '@context', 'https://schema.org',
        '@type', 'Course',
        'name', path_data.title,
        'description', path_data.description,
        'url', format('https://cybernexacademy.com/learning-path/%s', path_data.slug),
        'provider', jsonb_build_object(
            '@type', 'Organization',
            'name', 'Cybernex Academy',
            'url', 'https://cybernexacademy.com'
        ),
        'courseCode', path_data.id,
        'educationalLevel', path_data.difficulty_level,
        'timeRequired', format('PT%sH', COALESCE(path_data.estimated_duration_hours, 0)),
        'inLanguage', 'en',
        'aggregateRating', CASE 
            WHEN path_data.avg_rating IS NOT NULL THEN
                jsonb_build_object(
                    '@type', 'AggregateRating',
                    'ratingValue', path_data.avg_rating,
                    'ratingCount', path_data.enrollment_count,
                    'bestRating', 5,
                    'worstRating', 1
                )
            ELSE NULL
        END,
        'offers', jsonb_build_object(
            '@type', 'Offer',
            'price', '20.00',
            'priceCurrency', 'USD',
            'availability', 'https://schema.org/InStock'
        )
    );
    
    RETURN schema_json;
END;
$$ LANGUAGE plpgsql;