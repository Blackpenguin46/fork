-- News Feed System Migration
-- Creates tables for RSS feed aggregation and news article management

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS news_article_tags CASCADE;
DROP TABLE IF EXISTS news_articles CASCADE;
DROP TABLE IF EXISTS news_categories CASCADE;
DROP TABLE IF EXISTS news_sources CASCADE;

-- News Sources table - Configuration for RSS feeds
CREATE TABLE news_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    feed_url TEXT NOT NULL UNIQUE,
    website_url TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMPTZ,
    last_successful_fetch_at TIMESTAMPTZ,
    fetch_interval_minutes INTEGER DEFAULT 60,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Categories table - Categorization system
CREATE TABLE news_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    color_scheme VARCHAR(50) DEFAULT 'blue',
    keywords TEXT[], -- Array of keywords for auto-categorization
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles table - Aggregated articles from RSS feeds
CREATE TABLE news_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id UUID REFERENCES news_sources(id) ON DELETE CASCADE,
    category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    content TEXT,
    excerpt TEXT,
    author VARCHAR(255),
    original_url TEXT NOT NULL,
    guid VARCHAR(500), -- RSS GUID for deduplication
    published_at TIMESTAMPTZ,
    image_url TEXT,
    thumbnail_url TEXT,
    keywords TEXT[],
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0 for sentiment analysis
    read_time_minutes INTEGER,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    is_breaking BOOLEAN DEFAULT false,
    moderation_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    moderated_at TIMESTAMPTZ,
    moderated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure uniqueness per source
    UNIQUE(source_id, guid)
);

-- News Article Tags table - Many-to-many relationship for tagging
CREATE TABLE news_article_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 1.0, -- For auto-generated tags
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(article_id, tag_name)
);

-- Create indexes for performance
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_category_id ON news_articles(category_id);
CREATE INDEX idx_news_articles_source_id ON news_articles(source_id);
CREATE INDEX idx_news_articles_moderation_status ON news_articles(moderation_status);
CREATE INDEX idx_news_articles_is_featured ON news_articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_news_articles_is_trending ON news_articles(is_trending) WHERE is_trending = true;
CREATE INDEX idx_news_articles_is_breaking ON news_articles(is_breaking) WHERE is_breaking = true;
CREATE INDEX idx_news_articles_keywords ON news_articles USING GIN(keywords);
CREATE INDEX idx_news_articles_slug ON news_articles(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_news_sources_active ON news_sources(is_active) WHERE is_active = true;
CREATE INDEX idx_news_sources_category ON news_sources(category);
CREATE INDEX idx_news_categories_active ON news_categories(is_active) WHERE is_active = true;
CREATE INDEX idx_news_article_tags_tag_name ON news_article_tags(tag_name);

-- Insert default categories
INSERT INTO news_categories (name, slug, description, icon_name, color_scheme, keywords, sort_order) VALUES
('General News', 'general', 'General cybersecurity news and updates', 'Newspaper', 'blue', ARRAY['cybersecurity', 'infosec', 'security', 'news'], 1),
('Threat Intelligence', 'threats', 'Threat reports and intelligence updates', 'Shield', 'red', ARRAY['threat', 'malware', 'apt', 'intelligence', 'attack', 'vulnerability'], 2),
('Data Breaches', 'breaches', 'Data breach reports and incident news', 'AlertCircle', 'orange', ARRAY['breach', 'data breach', 'leak', 'incident', 'hack', 'compromise'], 3),
('Vulnerability Reports', 'vulnerabilities', 'Security vulnerability disclosures', 'Bug', 'yellow', ARRAY['vulnerability', 'cve', 'exploit', 'patch', 'zero-day'], 4),
('Policy & Compliance', 'compliance', 'Regulatory and compliance updates', 'FileCheck', 'green', ARRAY['compliance', 'regulation', 'gdpr', 'hipaa', 'policy', 'legal'], 5),
('Industry Analysis', 'analysis', 'Market analysis and industry insights', 'TrendingUp', 'purple', ARRAY['analysis', 'market', 'trends', 'research', 'survey', 'report'], 6),
('Technology', 'technology', 'New security technologies and tools', 'Cpu', 'cyan', ARRAY['technology', 'tools', 'software', 'hardware', 'innovation'], 7),
('Training & Education', 'education', 'Security training and educational content', 'GraduationCap', 'indigo', ARRAY['training', 'education', 'certification', 'learning', 'awareness'], 8);

-- Insert default RSS sources
INSERT INTO news_sources (name, description, feed_url, website_url, category, fetch_interval_minutes) VALUES
('Krebs on Security', 'In-depth security news and investigation', 'https://krebsonsecurity.com/feed/', 'https://krebsonsecurity.com', 'general', 60),
('Threatpost', 'Kaspersky''s cybersecurity news and analysis', 'https://threatpost.com/feed/', 'https://threatpost.com', 'threats', 30),
('Dark Reading', 'Cybersecurity news for IT professionals', 'https://www.darkreading.com/rss.xml', 'https://www.darkreading.com', 'general', 45),
('BleepingComputer', 'Technology news and troubleshooting', 'https://www.bleepingcomputer.com/feed/', 'https://www.bleepingcomputer.com', 'general', 30),
('Security Week', 'Information security news and analysis', 'https://www.securityweek.com/feed', 'https://www.securityweek.com', 'general', 60),
('The Hacker News', 'Cybersecurity news and updates', 'https://feeds.feedburner.com/TheHackersNews', 'https://thehackernews.com', 'general', 30),
('SANS Internet Storm Center', 'Daily security diary and threat analysis', 'https://isc.sans.edu/rssfeed_full.xml', 'https://isc.sans.edu', 'threats', 120),
('NIST Cybersecurity', 'Official NIST cybersecurity updates', 'https://www.nist.gov/news-events/cybersecurity/rss.xml', 'https://www.nist.gov/cybersecurity', 'compliance', 240),
('US-CERT Alerts', 'Official US-CERT security alerts', 'https://us-cert.cisa.gov/ncas/alerts.xml', 'https://us-cert.cisa.gov', 'threats', 60),
('Recorded Future', 'Threat intelligence and analysis', 'https://www.recordedfuture.com/feed', 'https://www.recordedfuture.com', 'threats', 120);

-- Create function to auto-generate slugs
CREATE OR REPLACE FUNCTION generate_news_article_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate base slug from title
    base_slug := lower(trim(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g')));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    -- Limit slug length
    IF length(base_slug) > 100 THEN
        base_slug := left(base_slug, 100);
        base_slug := trim(base_slug, '-');
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM news_articles WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slugs
CREATE TRIGGER news_article_slug_trigger
    BEFORE INSERT OR UPDATE ON news_articles
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION generate_news_article_slug();

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_news_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER news_sources_updated_at
    BEFORE UPDATE ON news_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_news_timestamp();

CREATE TRIGGER news_categories_updated_at
    BEFORE UPDATE ON news_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_news_timestamp();

CREATE TRIGGER news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_news_timestamp();

-- Create function for auto-categorizing articles based on keywords
CREATE OR REPLACE FUNCTION auto_categorize_article()
RETURNS TRIGGER AS $$
DECLARE
    category_record RECORD;
    max_score INTEGER := 0;
    best_category_id UUID;
    keyword_score INTEGER;
    article_text TEXT;
BEGIN
    -- Skip if category is already set
    IF NEW.category_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Combine title and description for keyword matching
    article_text := lower(COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
    
    -- Find best matching category
    FOR category_record IN 
        SELECT id, keywords 
        FROM news_categories 
        WHERE is_active = true AND keywords IS NOT NULL
    LOOP
        keyword_score := 0;
        
        -- Count keyword matches
        FOR i IN 1..array_length(category_record.keywords, 1) LOOP
            IF position(lower(category_record.keywords[i]) IN article_text) > 0 THEN
                keyword_score := keyword_score + 1;
            END IF;
        END LOOP;
        
        -- Update best match
        IF keyword_score > max_score THEN
            max_score := keyword_score;
            best_category_id := category_record.id;
        END IF;
    END LOOP;
    
    -- Set category if we found a good match
    IF max_score > 0 THEN
        NEW.category_id := best_category_id;
    ELSE
        -- Default to general category
        SELECT id INTO NEW.category_id 
        FROM news_categories 
        WHERE slug = 'general' 
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-categorization
CREATE TRIGGER news_article_auto_categorize
    BEFORE INSERT ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION auto_categorize_article();

-- Create RLS policies (if needed)
-- ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE news_article_tags ENABLE ROW LEVEL SECURITY;

-- Grant permissions for the application
-- GRANT ALL ON news_sources TO authenticated;
-- GRANT ALL ON news_categories TO authenticated;
-- GRANT ALL ON news_articles TO authenticated;
-- GRANT ALL ON news_article_tags TO authenticated;