import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type Client = ReturnType<typeof createClientComponentClient<Database>>;

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

export interface SlugData {
  id: string;
  slug: string;
  resourceId: string;
  isPrimary: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  viewCount: number;
  clickThroughRate: number;
  redirectFrom: string[];
  redirectTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: Array<{
    url: string;
    caption?: string;
    title?: string;
  }>;
}

export interface SEOAnalytics {
  slug: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export class SEOService {
  private supabase: Client;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  // Slug Management
  async generateSlug(title: string, resourceId: string): Promise<string> {
    try {
      // Basic slug generation
      let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');

      // Ensure uniqueness
      let finalSlug = baseSlug;
      let counter = 0;

      while (await this.slugExists(finalSlug)) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }

      // Create slug record
      const { error } = await this.supabase
        .from('content_slugs')
        .insert({
          resource_id: resourceId,
          slug: finalSlug,
          is_primary: true
        });

      if (error) throw error;

      return finalSlug;
    } catch (error) {
      console.error('Error generating slug:', error);
      throw new Error('Failed to generate slug');
    }
  }

  async getSlugByResource(resourceId: string): Promise<SlugData | null> {
    try {
      const { data, error } = await this.supabase
        .from('content_slugs')
        .select('*')
        .eq('resource_id', resourceId)
        .eq('is_primary', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      return {
        id: data.id,
        slug: data.slug,
        resourceId: data.resource_id,
        isPrimary: data.is_primary,
        metaTitle: data.meta_title,
        metaDescription: data.meta_description,
        metaKeywords: data.meta_keywords || [],
        viewCount: data.view_count,
        clickThroughRate: data.click_through_rate,
        redirectFrom: data.redirect_from || [],
        redirectTo: data.redirect_to,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error getting slug:', error);
      return null;
    }
  }

  async getResourceBySlug(slug: string): Promise<{ resourceId: string; redirect?: string } | null> {
    try {
      const { data, error } = await this.supabase
        .from('content_slugs')
        .select('resource_id, redirect_to')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Check if this slug is in redirect_from array
        const { data: redirectData } = await this.supabase
          .from('content_slugs')
          .select('resource_id, slug')
          .contains('redirect_from', [slug])
          .single();

        if (redirectData) {
          return {
            resourceId: redirectData.resource_id,
            redirect: redirectData.slug
          };
        }

        return null;
      }

      return {
        resourceId: data.resource_id,
        redirect: data.redirect_to || undefined
      };
    } catch (error) {
      console.error('Error getting resource by slug:', error);
      return null;
    }
  }

  async updateSlugSEO(
    resourceId: string,
    seoData: {
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string[];
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      canonicalUrl?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('content_slugs')
        .update({
          meta_title: seoData.metaTitle,
          meta_description: seoData.metaDescription,
          meta_keywords: seoData.metaKeywords,
          og_title: seoData.ogTitle,
          og_description: seoData.ogDescription,
          og_image: seoData.ogImage,
          canonical_url: seoData.canonicalUrl,
          updated_at: new Date().toISOString()
        })
        .eq('resource_id', resourceId)
        .eq('is_primary', true);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating slug SEO:', error);
      throw new Error('Failed to update SEO metadata');
    }
  }

  private async slugExists(slug: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('content_slugs')
        .select('id')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      return false;
    }
  }

  // SEO Metadata Generation
  async generateSEOMetadata(
    resourceId: string,
    content: {
      title: string;
      description: string;
      category: string;
      difficulty: string;
      tags?: string[];
    }
  ): Promise<SEOMetadata> {
    const slug = await this.getSlugByResource(resourceId);
    
    // Generate optimized title (60 chars max)
    const titleSuffix = ' | Cybernex Academy';
    const maxTitleLength = 60 - titleSuffix.length;
    let optimizedTitle = content.title;
    
    if (optimizedTitle.length > maxTitleLength) {
      optimizedTitle = optimizedTitle.substring(0, maxTitleLength - 3) + '...';
    }
    optimizedTitle += titleSuffix;

    // Generate optimized description (160 chars max)
    let optimizedDescription = content.description;
    if (optimizedDescription.length > 160) {
      optimizedDescription = optimizedDescription.substring(0, 157) + '...';
    }

    // Generate keywords
    const keywords = [
      'cybersecurity',
      'security training',
      'ethical hacking',
      content.category.toLowerCase(),
      content.difficulty.toLowerCase(),
      ...(content.tags || [])
    ];

    // Generate canonical URL
    const canonicalUrl = slug ? 
      `https://cybernexacademy.com/resource/${slug.slug}` : 
      `https://cybernexacademy.com/resource/${resourceId}`;

    return {
      title: optimizedTitle,
      description: optimizedDescription,
      keywords: [...new Set(keywords)], // Remove duplicates
      ogTitle: content.title,
      ogDescription: content.description,
      ogImage: `https://cybernexacademy.com/api/og?title=${encodeURIComponent(content.title)}`,
      canonicalUrl
    };
  }

  // Structured Data Generation
  async generateStructuredData(
    resourceId: string,
    type: 'Course' | 'Article' | 'VideoObject'
  ): Promise<Record<string, any>> {
    try {
      // Get resource data
      const { data: resource, error } = await this.supabase
        .from('resources')
        .select(`
          *,
          category:categories(name),
          author:profiles(username, full_name)
        `)
        .eq('id', resourceId)
        .single();

      if (error) throw error;

      const slug = await this.getSlugByResource(resourceId);
      const url = slug ? 
        `https://cybernexacademy.com/resource/${slug.slug}` : 
        `https://cybernexacademy.com/resource/${resourceId}`;

      const baseSchema = {
        '@context': 'https://schema.org',
        '@type': type,
        name: resource.title,
        description: resource.description,
        url: url,
        datePublished: resource.created_at,
        dateModified: resource.updated_at,
        author: {
          '@type': 'Person',
          name: resource.author?.full_name || resource.author?.username || 'Cybernex Academy'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Cybernex Academy',
          url: 'https://cybernexacademy.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://cybernexacademy.com/logo.png'
          }
        }
      };

      // Add type-specific properties
      switch (type) {
        case 'Course':
          return {
            ...baseSchema,
            provider: {
              '@type': 'Organization',
              name: 'Cybernex Academy'
            },
            courseCode: resourceId,
            educationalLevel: resource.difficulty,
            teaches: resource.category?.name,
            timeRequired: resource.estimated_duration ? `PT${resource.estimated_duration}M` : undefined,
            inLanguage: 'en'
          };

        case 'Article':
          return {
            ...baseSchema,
            articleSection: resource.category?.name,
            wordCount: resource.content?.length || 0,
            mainEntityOfPage: url
          };

        case 'VideoObject':
          return {
            ...baseSchema,
            uploadDate: resource.created_at,
            duration: resource.estimated_duration ? `PT${resource.estimated_duration}M` : undefined,
            thumbnailUrl: resource.thumbnail_url
          };

        default:
          return baseSchema;
      }
    } catch (error) {
      console.error('Error generating structured data:', error);
      throw new Error('Failed to generate structured data');
    }
  }

  // Sitemap Generation
  async generateSitemap(): Promise<SitemapEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('sitemap_entries')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;

      return data.map(entry => ({
        url: `https://cybernexacademy.com${entry.url}`,
        lastModified: entry.last_modified,
        changeFrequency: entry.change_frequency as any,
        priority: entry.priority,
        images: entry.images as any
      }));
    } catch (error) {
      console.error('Error generating sitemap:', error);
      throw new Error('Failed to generate sitemap');
    }
  }

  // URL Redirects
  async createRedirect(
    fromPath: string,
    toPath: string,
    type: 301 | 302 = 301,
    reason?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('url_redirects')
        .insert({
          from_path: fromPath,
          to_path: toPath,
          redirect_type: type,
          reason: reason,
          is_active: true
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating redirect:', error);
      throw new Error('Failed to create redirect');
    }
  }

  async getRedirect(path: string): Promise<{ to: string; type: number } | null> {
    try {
      const { data, error } = await this.supabase
        .from('url_redirects')
        .select('to_path, redirect_type')
        .eq('from_path', path)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      return {
        to: data.to_path,
        type: data.redirect_type
      };
    } catch (error) {
      console.error('Error getting redirect:', error);
      return null;
    }
  }

  // Analytics and Performance
  async trackPageView(slug: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('content_slugs')
        .update({
          view_count: this.supabase.rpc('increment_view_count', { slug_value: slug })
        })
        .eq('slug', slug);

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  async updateSEOMetrics(
    slug: string,
    metrics: {
      impressions?: number;
      clicks?: number;
      ctr?: number;
      averagePosition?: number;
    }
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('content_slugs')
        .update({
          click_through_rate: metrics.ctr,
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug);

      if (error) throw error;

      // Update keyword rankings if provided
      if (metrics.averagePosition !== undefined) {
        await this.supabase
          .from('seo_keywords')
          .update({
            current_ranking: Math.round(metrics.averagePosition),
            clicks: metrics.clicks || 0,
            impressions: metrics.impressions || 0,
            ctr: metrics.ctr || 0
          })
          .eq('resource_id', (await this.getResourceBySlug(slug))?.resourceId);
      }
    } catch (error) {
      console.error('Error updating SEO metrics:', error);
    }
  }

  async getSEOAnalytics(slug: string): Promise<SEOAnalytics | null> {
    try {
      const slugData = await this.getSlugByResource(
        (await this.getResourceBySlug(slug))?.resourceId || ''
      );

      if (!slugData) return null;

      const { data: keywords } = await this.supabase
        .from('seo_keywords')
        .select('*')
        .eq('resource_id', slugData.resourceId)
        .order('clicks', { ascending: false })
        .limit(10);

      return {
        slug,
        impressions: keywords?.reduce((sum, k) => sum + k.impressions, 0) || 0,
        clicks: keywords?.reduce((sum, k) => sum + k.clicks, 0) || 0,
        ctr: slugData.clickThroughRate,
        averagePosition: keywords?.length ? 
          keywords.reduce((sum, k) => sum + (k.current_ranking || 0), 0) / keywords.length : 0,
        topQueries: keywords?.map(k => ({
          query: k.keyword,
          clicks: k.clicks,
          impressions: k.impressions,
          ctr: k.ctr,
          position: k.current_ranking || 0
        })) || []
      };
    } catch (error) {
      console.error('Error getting SEO analytics:', error);
      return null;
    }
  }

  // Category and Learning Path Slugs
  async createCategorySlug(
    categoryId: string,
    name: string,
    parentSlugId?: string
  ): Promise<string> {
    try {
      const baseSlug = this.generateSlugFromText(name);
      
      // Build full path
      let fullPath = baseSlug;
      if (parentSlugId) {
        const { data: parentSlug } = await this.supabase
          .from('category_slugs')
          .select('full_path')
          .eq('id', parentSlugId)
          .single();

        if (parentSlug) {
          fullPath = `${parentSlug.full_path}/${baseSlug}`;
        }
      }

      const { data, error } = await this.supabase
        .from('category_slugs')
        .insert({
          category_id: categoryId,
          slug: baseSlug,
          parent_slug_id: parentSlugId,
          full_path: fullPath
        })
        .select('slug')
        .single();

      if (error) throw error;
      return data.slug;
    } catch (error) {
      console.error('Error creating category slug:', error);
      throw new Error('Failed to create category slug');
    }
  }

  async createLearningPathSlug(
    learningPathId: string,
    title: string
  ): Promise<string> {
    try {
      const slug = this.generateSlugFromText(title);

      const { error } = await this.supabase
        .from('learning_path_slugs')
        .insert({
          learning_path_id: learningPathId,
          slug
        });

      if (error) throw error;
      return slug;
    } catch (error) {
      console.error('Error creating learning path slug:', error);
      throw new Error('Failed to create learning path slug');
    }
  }

  private generateSlugFromText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  }

  // Bulk Operations
  async bulkUpdateSEOMetadata(updates: Array<{
    resourceId: string;
    seoData: Partial<SEOMetadata>;
  }>): Promise<void> {
    try {
      const promises = updates.map(update =>
        this.updateSlugSEO(update.resourceId, update.seoData)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error in bulk SEO update:', error);
      throw new Error('Failed to update SEO metadata in bulk');
    }
  }

  async generateRobotsTxt(): Promise<string> {
    const sitemapUrl = 'https://cybernexacademy.com/sitemap.xml';
    
    return `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/settings/
Disallow: /_next/

# Allow important directories
Allow: /api/og/

# Sitemap
Sitemap: ${sitemapUrl}

# Crawl-delay for respectful crawling
Crawl-delay: 1`;
  }
}