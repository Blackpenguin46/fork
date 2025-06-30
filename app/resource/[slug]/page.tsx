import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SEOService } from '@/lib/services/seo-service';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface ResourcePageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const seoService = new SEOService();
  const resourceData = await seoService.getResourceBySlug(params.slug);
  
  if (!resourceData) {
    return {
      title: 'Resource Not Found | Cybernex Academy',
      description: 'The requested resource could not be found.'
    };
  }

  // Get resource details for metadata
  const supabase = createServerComponentClient({ cookies });
  const { data: resource } = await supabase
    .from('resources')
    .select(`
      *,
      category:categories(name),
      content_slug:content_slugs(*)
    `)
    .eq('id', resourceData.resourceId)
    .single();

  if (!resource) {
    return {
      title: 'Resource Not Found | Cybernex Academy',
      description: 'The requested resource could not be found.'
    };
  }

  const slugData = resource.content_slug?.[0];
  const seoMetadata = await seoService.generateSEOMetadata(resource.id, {
    title: resource.title,
    description: resource.description,
    category: resource.category?.name || 'Cybersecurity',
    difficulty: resource.difficulty || 'Intermediate',
    tags: resource.tags || []
  });

  return {
    title: slugData?.meta_title || seoMetadata.title,
    description: slugData?.meta_description || seoMetadata.description,
    keywords: slugData?.meta_keywords || seoMetadata.keywords,
    openGraph: {
      title: slugData?.og_title || seoMetadata.ogTitle || resource.title,
      description: slugData?.og_description || seoMetadata.ogDescription || resource.description,
      url: seoMetadata.canonicalUrl,
      type: 'article',
      images: [
        {
          url: slugData?.og_image || seoMetadata.ogImage || '/default-og.png',
          width: 1200,
          height: 630,
          alt: resource.title
        }
      ],
      siteName: 'Cybernex Academy'
    },
    twitter: {
      card: 'summary_large_image',
      title: resource.title,
      description: resource.description,
      images: [slugData?.og_image || seoMetadata.ogImage || '/default-og.png']
    },
    alternates: {
      canonical: seoMetadata.canonicalUrl
    },
    other: {
      'article:author': resource.author_name || 'Cybernex Academy',
      'article:published_time': resource.created_at,
      'article:modified_time': resource.updated_at,
      'article:section': resource.category?.name || 'Cybersecurity',
      'article:tag': resource.tags?.join(',') || ''
    }
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const seoService = new SEOService();
  const resourceData = await seoService.getResourceBySlug(params.slug);

  // Handle redirects
  if (resourceData?.redirect) {
    redirect(`/resource/${resourceData.redirect}`);
  }

  if (!resourceData) {
    notFound();
  }

  // Track page view
  await seoService.trackPageView(params.slug);

  // Get full resource data
  const supabase = createServerComponentClient({ cookies });
  const { data: resource, error } = await supabase
    .from('resources')
    .select(`
      *,
      category:categories(name, icon),
      author:profiles(username, full_name, avatar_url),
      content_slug:content_slugs(*),
      schema_markup:schema_markup(*)
    `)
    .eq('id', resourceData.resourceId)
    .eq('is_published', true)
    .single();

  if (error || !resource) {
    notFound();
  }

  // Generate structured data
  const structuredData = await seoService.generateStructuredData(
    resource.id,
    resource.type === 'course' ? 'Course' : 
    resource.type === 'video' ? 'VideoObject' : 'Article'
  );

  return (
    <>
      {/* Inject structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      <div className="min-h-screen bg-deep-space-blue">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-400">
              <li>
                <a href="/" className="hover:text-cyan-400 transition-colors">
                  Home
                </a>
              </li>
              <li className="text-gray-600">/</li>
              {resource.category && (
                <>
                  <li>
                    <a 
                      href={`/category/${resource.category.name.toLowerCase()}`}
                      className="hover:text-cyan-400 transition-colors"
                    >
                      {resource.category.name}
                    </a>
                  </li>
                  <li className="text-gray-600">/</li>
                </>
              )}
              <li className="text-gray-300">{resource.title}</li>
            </ol>
          </nav>

          {/* Resource Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              {resource.category?.icon && (
                <span className="text-2xl">{resource.category.icon}</span>
              )}
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                {resource.category?.name}
              </span>
              <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                {resource.difficulty}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              {resource.title}
            </h1>

            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              {resource.description}
            </p>

            {/* Meta Information */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              {resource.author && (
                <div className="flex items-center space-x-2">
                  {resource.author.avatar_url && (
                    <img
                      src={resource.author.avatar_url}
                      alt={resource.author.full_name || resource.author.username}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span>
                    By {resource.author.full_name || resource.author.username}
                  </span>
                </div>
              )}
              
              <div>
                Published: {new Date(resource.created_at).toLocaleDateString()}
              </div>
              
              {resource.estimated_duration && (
                <div>
                  Duration: {resource.estimated_duration} minutes
                </div>
              )}

              {resource.view_count && (
                <div>
                  {resource.view_count.toLocaleString()} views
                </div>
              )}
            </div>
          </header>

          {/* Resource Content */}
          <main className="prose prose-invert prose-cyan max-w-none">
            {resource.content && (
              <div
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: resource.content }}
              />
            )}

            {resource.url && (
              <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  External Resource
                </h3>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Visit Resource
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
          </main>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Resources */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Related Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Related resources would be loaded here */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <p className="text-gray-400 text-center">
                  Related resources will be displayed here
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}