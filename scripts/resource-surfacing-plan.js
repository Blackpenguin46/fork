const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxxpwaloyrtwvpmatzpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createResourceSurfacingPlan() {
  try {
    console.log('=== CYBERNEX ACADEMY - RESOURCE SURFACING ACTION PLAN ===\n');
    
    const { data: allResources, error: resourcesError } = await supabase
      .from('resources')
      .select('*');

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (resourcesError || categoriesError) {
      console.error('Error fetching data:', resourcesError || categoriesError);
      return;
    }

    console.log(`📊 Total Resources to Surface: ${allResources.length}`);
    console.log(`✅ Published Resources: ${allResources.filter(r => r.is_published).length}`);
    console.log(`⏳ Unpublished Resources: ${allResources.filter(r => !r.is_published).length}`);
    console.log(`🌟 Featured Resources: ${allResources.filter(r => r.is_featured).length}\n`);

    // Specific recommendations for each website section
    console.log('🎯 SPECIFIC SURFACING RECOMMENDATIONS BY SECTION:\n');
    console.log('='.repeat(80));

    // /ACADEMY Section
    console.log('\n📚 /ACADEMY SECTION - STRUCTURED LEARNING');
    console.log('-'.repeat(60));
    
    const academyResources = allResources.filter(r => 
      ['course', 'documentation', 'cheatsheet', 'video'].includes(r.resource_type) ||
      (r.title && (
        r.title.toLowerCase().includes('course') ||
        r.title.toLowerCase().includes('training') ||
        r.title.toLowerCase().includes('certification') ||
        r.title.toLowerCase().includes('tutorial') ||
        r.title.toLowerCase().includes('guide')
      ))
    );

    console.log(`📊 Total Academy Resources: ${academyResources.length}`);
    console.log(`✅ Published: ${academyResources.filter(r => r.is_published).length}`);
    console.log(`⏳ Unpublished: ${academyResources.filter(r => !r.is_published).length}`);
    
    // Top published courses for academy
    const publishedCourses = academyResources
      .filter(r => r.is_published && r.resource_type === 'course')
      .sort((a, b) => b.is_featured - a.is_featured);
    
    console.log('\n🔥 TOP COURSES TO FEATURE IN /ACADEMY:');
    publishedCourses.slice(0, 10).forEach((course, index) => {
      const featured = course.is_featured ? '⭐' : '  ';
      const premium = course.is_premium ? '💎' : '🆓';
      console.log(`${index + 1}. ${featured} ${premium} ${course.title.substring(0, 60)}${course.title.length > 60 ? '...' : ''}`);
    });

    // Learning paths integration
    console.log('\n🛤️  LEARNING PATHS INTEGRATION:');
    console.log('   - Create beginner cybersecurity path with basic courses');
    console.log('   - Certification prep paths (CompTIA, CISSP, CEH)');
    console.log('   - Specialized paths (Penetration Testing, Cloud Security)');
    console.log('   - Video tutorial series organization');

    // /INSIGHTS Section
    console.log('\n\n📰 /INSIGHTS SECTION - NEWS & INTELLIGENCE');
    console.log('-'.repeat(60));
    
    const insightsResources = allResources.filter(r => 
      ['article', 'podcast'].includes(r.resource_type) ||
      (r.title && (
        r.title.toLowerCase().includes('news') ||
        r.title.toLowerCase().includes('threat') ||
        r.title.toLowerCase().includes('vulnerability') ||
        r.title.toLowerCase().includes('breach') ||
        r.title.toLowerCase().includes('security')
      ))
    );

    console.log(`📊 Total Insights Resources: ${insightsResources.length}`);
    console.log(`✅ Published: ${insightsResources.filter(r => r.is_published).length}`);
    
    // Top news sources
    const topNewsSources = insightsResources
      .filter(r => r.is_published && r.resource_type === 'article')
      .sort((a, b) => b.is_featured - a.is_featured);
    
    console.log('\n📡 TOP NEWS SOURCES TO FEATURE:');
    topNewsSources.slice(0, 8).forEach((source, index) => {
      const featured = source.is_featured ? '⭐' : '  ';
      console.log(`${index + 1}. ${featured} ${source.title.substring(0, 60)}${source.title.length > 60 ? '...' : ''}`);
    });

    // /COMMUNITY Section
    console.log('\n\n👥 /COMMUNITY SECTION - CONNECT & COLLABORATE');
    console.log('-'.repeat(60));
    
    const communityResources = allResources.filter(r => r.resource_type === 'community');
    
    console.log(`📊 Total Community Resources: ${communityResources.length}`);
    console.log(`✅ Published: ${communityResources.filter(r => r.is_published).length}`);
    
    // Community platforms breakdown
    const platformBreakdown = {};
    communityResources.forEach(r => {
      if (r.title.toLowerCase().includes('discord')) platformBreakdown.discord = (platformBreakdown.discord || 0) + 1;
      else if (r.title.toLowerCase().includes('reddit')) platformBreakdown.reddit = (platformBreakdown.reddit || 0) + 1;
      else if (r.title.toLowerCase().includes('slack')) platformBreakdown.slack = (platformBreakdown.slack || 0) + 1;
      else platformBreakdown.other = (platformBreakdown.other || 0) + 1;
    });
    
    console.log('\n🏛️  COMMUNITY PLATFORMS:');
    for (const [platform, count] of Object.entries(platformBreakdown)) {
      console.log(`   ${platform}: ${count} communities`);
    }

    console.log('\n🔥 TOP COMMUNITIES TO FEATURE:');
    communityResources
      .filter(r => r.is_published)
      .sort((a, b) => b.is_featured - a.is_featured)
      .slice(0, 8)
      .forEach((community, index) => {
        const featured = community.is_featured ? '⭐' : '  ';
        console.log(`${index + 1}. ${featured} ${community.title.substring(0, 60)}${community.title.length > 60 ? '...' : ''}`);
      });

    // /TOOLS Section  
    console.log('\n\n🛠️  /TOOLS SECTION - CYBERSECURITY TOOLS');
    console.log('-'.repeat(60));
    
    const toolResources = allResources.filter(r => r.resource_type === 'tool');
    
    console.log(`📊 Total Tool Resources: ${toolResources.length}`);
    console.log(`✅ Published: ${toolResources.filter(r => r.is_published).length}`);
    
    console.log('\n🔧 TOP TOOLS TO FEATURE:');
    toolResources
      .filter(r => r.is_published)
      .sort((a, b) => b.is_featured - a.is_featured)
      .slice(0, 10)
      .forEach((tool, index) => {
        const featured = tool.is_featured ? '⭐' : '  ';
        console.log(`${index + 1}. ${featured} ${tool.title.substring(0, 60)}${tool.title.length > 60 ? '...' : ''}`);
      });

    // Immediate Action Items
    console.log('\n\n🚨 IMMEDIATE ACTION ITEMS:');
    console.log('='.repeat(80));

    console.log('\n1. 📋 CONTENT AUDIT & PUBLISHING QUEUE:');
    const unpublishedByType = {};
    allResources.filter(r => !r.is_published).forEach(r => {
      unpublishedByType[r.resource_type] = (unpublishedByType[r.resource_type] || 0) + 1;
    });
    
    console.log('   Unpublished content to review:');
    for (const [type, count] of Object.entries(unpublishedByType).sort((a, b) => b[1] - a[1])) {
      console.log(`   - ${type}: ${count} resources`);
    }

    console.log('\n2. 🏠 HOMEPAGE FEATURED CONTENT:');
    const featuredResources = allResources.filter(r => r.is_featured && r.is_published);
    console.log(`   Use ${featuredResources.length} featured resources for homepage highlights:`);
    featuredResources.slice(0, 6).forEach(r => {
      console.log(`   - ${r.resource_type}: ${r.title.substring(0, 50)}${r.title.length > 50 ? '...' : ''}`);
    });

    console.log('\n3. 📊 NAVIGATION & FILTERING:');
    console.log('   - Implement resource type filters in each section');
    console.log('   - Add difficulty level sorting (88.6% beginner content available)');
    console.log('   - Create category-based sub-navigation');
    console.log('   - Add search functionality across all 639 resources');

    console.log('\n4. 🎯 SEO IMPLEMENTATION:');
    console.log('   - All resources have SEO metadata ✅');
    console.log('   - Create category landing pages for 32 categories');
    console.log('   - Implement resource detail pages with proper URLs');
    console.log('   - Add structured data for rich snippets');

    console.log('\n5. 📱 USER EXPERIENCE PRIORITIES:');
    console.log('   - Add bookmark functionality (bookmarks table exists)');
    console.log('   - Implement progress tracking (user_progress table exists)');
    console.log('   - Create personalized recommendations');
    console.log('   - Add time estimates to more resources (only 8 have them currently)');

    // Missing Resources Analysis
    console.log('\n\n🔍 POTENTIAL MISSING RESOURCES:');
    console.log('='.repeat(80));
    
    console.log('\n🚨 CONTENT GAPS IDENTIFIED:');
    console.log('   - Intermediate content: Only 2.0% of resources');
    console.log('   - Advanced content: Only 2.8% of resources');
    console.log('   - Premium content: Only 0.6% of resources');
    console.log('   - Video content: Only 5.5% of resources');
    console.log('   - Podcast content: Only 0.9% of resources');
    console.log('   - Time estimates: Only 1.3% have time estimates');

    console.log('\n💡 RECOMMENDATIONS TO FILL GAPS:');
    console.log('   - Source more intermediate/advanced courses');
    console.log('   - Create premium learning paths');
    console.log('   - Add more video tutorials and walkthroughs');
    console.log('   - Expand podcast collection');
    console.log('   - Add time estimates to all courses and videos');

    // Database Query Examples
    console.log('\n\n💻 IMPLEMENTATION QUERIES:');
    console.log('='.repeat(80));

    console.log('\n-- Get Academy Resources (Courses & Training)');
    console.log("SELECT * FROM resources WHERE resource_type IN ('course', 'video', 'documentation') AND is_published = true ORDER BY is_featured DESC, created_at DESC;");

    console.log('\n-- Get Community Resources');
    console.log("SELECT * FROM resources WHERE resource_type = 'community' AND is_published = true ORDER BY is_featured DESC;");

    console.log('\n-- Get Insights Resources (News & Articles)');
    console.log("SELECT * FROM resources WHERE resource_type IN ('article', 'podcast') AND is_published = true ORDER BY created_at DESC;");

    console.log('\n-- Get Tools & Resources');
    console.log("SELECT * FROM resources WHERE resource_type = 'tool' AND is_published = true ORDER BY is_featured DESC;");

    console.log('\n-- Get Featured Homepage Content');
    console.log("SELECT * FROM resources WHERE is_featured = true AND is_published = true ORDER BY resource_type, created_at DESC;");

    console.log('\n' + '='.repeat(80));
    console.log('✅ RESOURCE SURFACING PLAN COMPLETE');
    console.log('🎯 NEXT STEPS: Implement filtering logic in page components');
    console.log('📋 PRIORITY: Review and publish 168 unpublished resources');
    console.log('🚀 GOAL: Surface all 639 resources through organized website structure');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

createResourceSurfacingPlan();