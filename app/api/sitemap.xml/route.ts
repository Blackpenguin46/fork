import { NextRequest, NextResponse } from 'next/server';
import { SEOService } from '@/lib/services/seo-service';

export async function GET(request: NextRequest) {
  try {
    const seoService = new SEOService();
    let sitemapEntries;
    
    try {
      sitemapEntries = await seoService.generateSitemap();
    } catch (error) {
      console.error('Error generating sitemap:', error);
      // Fallback to basic sitemap
      sitemapEntries = [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cybernexacademy.com'}/`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 1.0,
          images: []
        }
      ];
    }

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${sitemapEntries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
    ${entry.images?.map(image => `
    <image:image>
      <image:loc>${image.url}</image:loc>
      ${image.title ? `<image:title>${image.title}</image:title>` : ''}
      ${image.caption ? `<image:caption>${image.caption}</image:caption>` : ''}
    </image:image>`).join('') || ''}
  </url>`).join('')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}