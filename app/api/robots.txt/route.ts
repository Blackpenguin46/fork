import { NextRequest, NextResponse } from 'next/server';
import { SEOService } from '@/lib/services/seo-service';

export async function GET(request: NextRequest) {
  try {
    const seoService = new SEOService();
    const robotsTxt = await seoService.generateRobotsTxt();

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}