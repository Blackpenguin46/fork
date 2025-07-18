/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.cybernexacademy.com',
  generateRobotsTxt: false, // We have a custom robots.txt for AI optimization
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 1.0,
  
  // Enhanced sitemap for AI search engines
  additionalPaths: async (config) => [
    await config.transform(config, '/ai-search-data'),
    await config.transform(config, '/academy'),
    await config.transform(config, '/insights'),
    await config.transform(config, '/community'),
    await config.transform(config, '/pricing'),
    await config.transform(config, '/resources'),
  ],
  
  // Transform function to add metadata for AI understanding
  transform: async (config, path) => {
    // Default transformation
    const defaultTransform = {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }

    // Enhanced metadata for key pages
    if (path === '/') {
      return {
        ...defaultTransform,
        priority: 1.0,
        changefreq: 'daily',
        // Additional metadata for AI search engines
        alternateRefs: [
          {
            href: 'https://www.cybernexacademy.com',
            hreflang: 'en',
          },
        ],
      }
    }

    if (path.startsWith('/academy')) {
      return {
        ...defaultTransform,
        priority: 0.9,
        changefreq: 'weekly',
      }
    }

    if (path.startsWith('/insights')) {
      return {
        ...defaultTransform,
        priority: 0.8,
        changefreq: 'daily',
      }
    }

    if (path.startsWith('/community')) {
      return {
        ...defaultTransform,
        priority: 0.7,
        changefreq: 'weekly',
      }
    }

    return defaultTransform
  },
  
  // Exclude admin and debug pages from AI indexing
  exclude: [
    '/admin/*',
    '/auth/debug',
    '/debug/*',
    '/api/*',
  ],
  
  // Additional robots.txt configuration for AI bots
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'YouBot',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/admin/', '/api/admin/', '/auth/debug', '/debug/'],
      },
    ],
    additionalSitemaps: [
      'https://www.cybernexacademy.com/sitemap.xml',
      'https://www.cybernexacademy.com/sitemap-0.xml',
    ],
  },
};
