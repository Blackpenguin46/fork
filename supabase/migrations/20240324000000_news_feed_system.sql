-- Migration: News Feed System
-- Description: Creates tables for RSS news aggregation system with categories, sources, articles and tags

-- News sources table
CREATE TABLE IF NOT EXISTS news_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    feed_url TEXT NOT NULL UNIQUE,
    website_url TEXT,
    description TEXT,
    category TEXT DEFAULT 'general',
    language TEXT DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    fetch_interval_minutes INTEGER DEFAULT 60,
    last_fetched_at TIMESTAMPTZ,
    last_successful_fetch_at TIMESTAMPTZ,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News categories table  
CREATE TABLE IF NOT EXISTS news_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon_name TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
    category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    excerpt TEXT,
    author TEXT,
    original_url TEXT NOT NULL,
    guid TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    image_url TEXT,
    thumbnail_url TEXT,
    keywords TEXT[],
    sentiment_score DECIMAL(3,2),
    read_time_minutes INTEGER,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    is_breaking BOOLEAN DEFAULT false,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, guid)
);

-- News article tags table
CREATE TABLE IF NOT EXISTS news_article_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, tag_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_sources_active ON news_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_news_sources_category ON news_sources(category);
CREATE INDEX IF NOT EXISTS idx_news_sources_last_fetched ON news_sources(last_fetched_at);

CREATE INDEX IF NOT EXISTS idx_news_categories_active ON news_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_news_categories_slug ON news_categories(slug);
CREATE INDEX IF NOT EXISTS idx_news_categories_sort_order ON news_categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_created ON news_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_moderation ON news_articles(moderation_status);
CREATE INDEX IF NOT EXISTS idx_news_articles_featured ON news_articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_articles_trending ON news_articles(is_trending);
CREATE INDEX IF NOT EXISTS idx_news_articles_breaking ON news_articles(is_breaking);
CREATE INDEX IF NOT EXISTS idx_news_articles_view_count ON news_articles(view_count DESC);

CREATE INDEX IF NOT EXISTS idx_news_article_tags_article ON news_article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_news_article_tags_tag ON news_article_tags(tag_name);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_sources_updated_at 
    BEFORE UPDATE ON news_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_categories_updated_at 
    BEFORE UPDATE ON news_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-categorization function
CREATE OR REPLACE FUNCTION auto_categorize_news_article()
RETURNS TRIGGER AS $$
DECLARE
    category_id_var UUID;
    article_text TEXT;
BEGIN
    -- Combine title and description for analysis
    article_text := LOWER(COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
    
    -- Auto-categorization logic based on keywords
    IF article_text ~ '.*(malware|ransomware|virus|trojan|spyware|adware).*' THEN
        SELECT id INTO category_id_var FROM news_categories WHERE slug = 'malware' AND is_active = true;
    ELSIF article_text ~ '.*(breach|hack|attack|intrusion|compromise).*' THEN
        SELECT id INTO category_id_var FROM news_categories WHERE slug = 'data-breaches' AND is_active = true;
    ELSIF article_text ~ '.*(vulnerability|cve|exploit|zero.day|patch).*' THEN
        SELECT id INTO category_id_var FROM news_categories WHERE slug = 'vulnerabilities' AND is_active = true;
    ELSIF article_text ~ '.*(threat|apt|campaign|intelligence).*' THEN
        SELECT id INTO category_id_var FROM news_categories WHERE slug = 'threat-intelligence' AND is_active = true;
    ELSIF article_text ~ '.*(privacy|gdpr|compliance|regulation).*' THEN
        SELECT id INTO category_id_var FROM news_categories WHERE slug = 'privacy-compliance' AND is_active = true;
    ELSIF article_text ~ '.*(cloud|aws|azure|gcp|saas).*' THEN
        SELECT id INTO category_id_var FROM news_categories WHERE slug = 'cloud-security' AND is_active = true;
    ELSE
        SELECT id INTO category_id_var FROM news_categories WHERE slug = 'general' AND is_active = true;
    END IF;
    
    -- Set the category if found
    IF category_id_var IS NOT NULL THEN
        NEW.category_id := category_id_var;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Auto slug generation for categories
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'));
        NEW.slug := REGEXP_REPLACE(NEW.slug, '\s+', '-', 'g');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-categorization and slug generation
CREATE TRIGGER auto_categorize_news_trigger 
    BEFORE INSERT ON news_articles 
    FOR EACH ROW EXECUTE FUNCTION auto_categorize_news_article();

CREATE TRIGGER generate_category_slug_trigger 
    BEFORE INSERT OR UPDATE ON news_categories 
    FOR EACH ROW EXECUTE FUNCTION generate_category_slug();

-- Insert default categories
INSERT INTO news_categories (name, slug, description, color, icon_name, sort_order) VALUES
('General', 'general', 'General cybersecurity news and updates', '#6B7280', 'newspaper', 0),
('Data Breaches', 'data-breaches', 'Data breach incidents and reports', '#EF4444', 'alert-triangle', 1),
('Malware', 'malware', 'Malware analysis and threats', '#DC2626', 'bug', 2),
('Vulnerabilities', 'vulnerabilities', 'Security vulnerabilities and patches', '#F59E0B', 'shield-alert', 3),
('Threat Intelligence', 'threat-intelligence', 'Threat research and intelligence reports', '#8B5CF6', 'target', 4),
('Privacy & Compliance', 'privacy-compliance', 'Privacy regulations and compliance news', '#059669', 'lock', 5),
('Cloud Security', 'cloud-security', 'Cloud platform security news', '#0EA5E9', 'cloud', 6),
('Incident Response', 'incident-response', 'Incident response and forensics', '#F97316', 'activity', 7),
('Industry News', 'industry-news', 'Cybersecurity industry developments', '#3B82F6', 'trending-up', 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert popular cybersecurity news sources
INSERT INTO news_sources (name, feed_url, website_url, description, category, language) VALUES
('Krebs on Security', 'https://krebsonsecurity.com/feed/', 'https://krebsonsecurity.com', 'In-depth security news and investigation', 'security-research', 'en'),
('Threatpost', 'https://threatpost.com/feed/', 'https://threatpost.com', 'Latest cybersecurity news and analysis', 'threat-intelligence', 'en'),
('Dark Reading', 'https://feeds.feedburner.com/darkreading', 'https://darkreading.com', 'Cybersecurity news for IT professionals', 'industry-news', 'en'),
('The Hacker News', 'https://feeds.feedburner.com/TheHackersNews', 'https://thehackernews.com', 'Latest cybersecurity news and updates', 'general', 'en'),
('Bleeping Computer', 'https://www.bleepingcomputer.com/feed/', 'https://bleepingcomputer.com', 'Computer security and technology news', 'general', 'en'),
('Security Week', 'https://feeds.feedburner.com/securityweek', 'https://securityweek.com', 'Information security news portal', 'industry-news', 'en'),
('InfoSec Handlers Diary', 'https://isc.sans.edu/rssfeed.xml', 'https://isc.sans.edu', 'SANS Internet Storm Center daily handlers diary', 'threat-intelligence', 'en'),
('CISA Cybersecurity Advisories', 'https://www.cisa.gov/cybersecurity-advisories/all.xml', 'https://cisa.gov', 'Official US government cybersecurity advisories', 'vulnerabilities', 'en'),
('Schneier on Security', 'https://schneier.com/feed/', 'https://schneier.com', 'Bruce Schneier security and privacy blog', 'security-research', 'en'),
('Recorded Future', 'https://www.recordedfuture.com/feed', 'https://recordedfuture.com', 'Threat intelligence and security research', 'threat-intelligence', 'en')
ON CONFLICT (feed_url) DO NOTHING;

-- Comments
COMMENT ON TABLE news_sources IS 'RSS feed sources for news aggregation';
COMMENT ON TABLE news_categories IS 'Categories for organizing news articles';
COMMENT ON TABLE news_articles IS 'Aggregated news articles from RSS feeds';
COMMENT ON TABLE news_article_tags IS 'Tags associated with news articles';