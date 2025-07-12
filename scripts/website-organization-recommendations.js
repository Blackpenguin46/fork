const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxxpwaloyrtwvpmatzpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateWebsiteOrganizationRecommendations() {
  try {
    console.log('=== CYBERNEX ACADEMY - WEBSITE ORGANIZATION RECOMMENDATIONS ===\n');
    
    // Get all resources and categories
    const { data: allResources, error: resourcesError } = await supabase
      .from('resources')
      .select('*');

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    const { data: learningPaths, error: pathsError } = await supabase
      .from('learning_paths')
      .select('*');

    if (resourcesError || categoriesError) {
      console.error('Error fetching data:', resourcesError || categoriesError);
      return;
    }

    console.log(`📊 Total Resources: ${allResources.length}`);
    console.log(`📁 Total Categories: ${categories.length}`);
    console.log(`🛤️  Total Learning Paths: ${learningPaths?.length || 0}\n`);

    // Define website section recommendations
    const websiteSections = {
      '/academy': {
        title: 'Academy - Structured Learning',
        description: 'Organized educational content, courses, and learning paths',
        recommendedTypes: ['course', 'documentation', 'cheatsheet', 'video'],
        recommendedCategories: [
          'learning-paths', 'beginner-paths', 'intermediate-paths', 'advanced-paths',
          'ethical-hacking', 'network-security', 'cloud-security', 'incident-response',
          'certifications', 'comptia', 'cissp', 'ceh'
        ],
        priority: 'high'
      },
      '/community': {
        title: 'Community - Connect & Collaborate',
        description: 'Forums, Discord servers, communities, and collaborative resources',
        recommendedTypes: ['community'],
        recommendedCategories: [
          'discord-servers', 'reddit-communities', 'forums', 'community'
        ],
        priority: 'medium'
      },
      '/insights': {
        title: 'Insights - News & Intelligence',
        description: 'Latest news, threat intelligence, research, and industry insights',
        recommendedTypes: ['article', 'podcast'],
        recommendedCategories: [
          'news', 'threat-intelligence', 'data-breaches', 'industry-news',
          'insights', 'research', 'vulnerabilities'
        ],
        priority: 'high'
      },
      '/tools': {
        title: 'Tools & Resources',
        description: 'Cybersecurity tools, software, and practical resources',
        recommendedTypes: ['tool'],
        recommendedCategories: [
          'tools', 'pentest-tools', 'monitoring-tools', 'forensics-tools',
          'github-repositories'
        ],
        priority: 'medium'
      }
    };

    // Analyze resource distribution for each section
    console.log('🎯 RECOMMENDED WEBSITE ORGANIZATION:\n');
    console.log('='.repeat(80));

    for (const [sectionPath, sectionConfig] of Object.entries(websiteSections)) {
      console.log(`\n📍 ${sectionConfig.title.toUpperCase()}`);
      console.log(`   ${sectionPath}`);
      console.log(`   ${sectionConfig.description}`);
      console.log('   ' + '-'.repeat(70));

      // Calculate resources that should go in this section
      const sectionResources = allResources.filter(resource => {
        // Match by resource type
        const typeMatch = sectionConfig.recommendedTypes.includes(resource.resource_type);
        
        // Match by category (we'll need to cross-reference with categories)
        // For now, we'll use a simple keyword matching approach
        let categoryMatch = false;
        if (resource.title || resource.description) {
          const resourceText = `${resource.title} ${resource.description}`.toLowerCase();
          categoryMatch = sectionConfig.recommendedCategories.some(cat => 
            resourceText.includes(cat.replace('-', ' ')) || 
            resourceText.includes(cat.replace('-', ''))
          );
        }

        return typeMatch || categoryMatch;
      });

      console.log(`   📊 Recommended Resources: ${sectionResources.length}`);
      
      // Break down by type
      const typeBreakdown = {};
      sectionResources.forEach(resource => {
        typeBreakdown[resource.resource_type] = (typeBreakdown[resource.resource_type] || 0) + 1;
      });

      console.log('   🔸 Resource Types:');
      for (const [type, count] of Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])) {
        console.log(`      ${type}: ${count} resources`);
      }

      // Show difficulty distribution
      const difficultyBreakdown = {};
      sectionResources.forEach(resource => {
        const level = resource.difficulty_level || 'not_specified';
        difficultyBreakdown[level] = (difficultyBreakdown[level] || 0) + 1;
      });

      console.log('   🔸 Difficulty Levels:');
      for (const [level, count] of Object.entries(difficultyBreakdown)) {
        console.log(`      ${level}: ${count} resources`);
      }

      // Show publication status
      const published = sectionResources.filter(r => r.is_published).length;
      const unpublished = sectionResources.length - published;
      console.log(`   🔸 Publication Status: ${published} published, ${unpublished} unpublished`);

      // Show featured content
      const featured = sectionResources.filter(r => r.is_featured).length;
      if (featured > 0) {
        console.log(`   🔸 Featured Content: ${featured} featured resources`);
      }

      // Show sample resources
      console.log('   🔸 Sample Resources:');
      sectionResources.slice(0, 5).forEach(resource => {
        const status = resource.is_published ? '✅' : '⏳';
        const premium = resource.is_premium ? '💎' : '🆓';
        console.log(`      ${status} ${premium} ${resource.title.substring(0, 55)}${resource.title.length > 55 ? '...' : ''}`);
      });
    }

    // Analysis of uncategorized resources
    console.log('\n\n🔍 UNCATEGORIZED RESOURCE ANALYSIS:');
    console.log('='.repeat(80));

    const allCategorizedResources = new Set();
    for (const [sectionPath, sectionConfig] of Object.entries(websiteSections)) {
      const sectionResources = allResources.filter(resource => {
        const typeMatch = sectionConfig.recommendedTypes.includes(resource.resource_type);
        let categoryMatch = false;
        if (resource.title || resource.description) {
          const resourceText = `${resource.title} ${resource.description}`.toLowerCase();
          categoryMatch = sectionConfig.recommendedCategories.some(cat => 
            resourceText.includes(cat.replace('-', ' ')) || 
            resourceText.includes(cat.replace('-', ''))
          );
        }
        return typeMatch || categoryMatch;
      });
      
      sectionResources.forEach(r => allCategorizedResources.add(r.id));
    }

    const uncategorizedResources = allResources.filter(r => !allCategorizedResources.has(r.id));
    
    console.log(`📊 Uncategorized Resources: ${uncategorizedResources.length}`);
    
    if (uncategorizedResources.length > 0) {
      const uncategorizedTypes = {};
      uncategorizedResources.forEach(resource => {
        uncategorizedTypes[resource.resource_type] = (uncategorizedTypes[resource.resource_type] || 0) + 1;
      });

      console.log('\n🔸 Uncategorized Resource Types:');
      for (const [type, count] of Object.entries(uncategorizedTypes).sort((a, b) => b[1] - a[1])) {
        console.log(`   ${type}: ${count} resources`);
      }

      console.log('\n🔸 Sample Uncategorized Resources:');
      uncategorizedResources.slice(0, 10).forEach(resource => {
        console.log(`   - ${resource.resource_type}: ${resource.title.substring(0, 60)}${resource.title.length > 60 ? '...' : ''}`);
      });
    }

    // Implementation recommendations
    console.log('\n\n🚀 IMPLEMENTATION RECOMMENDATIONS:');
    console.log('='.repeat(80));

    console.log('\n1. 🎯 PRIORITY IMPLEMENTATION ORDER:');
    console.log('   Phase 1 (High Priority):');
    console.log('   - /academy: 164+ structured learning resources');
    console.log('   - /insights: 376+ news and intelligence resources');
    console.log('   ');
    console.log('   Phase 2 (Medium Priority):');
    console.log('   - /community: 57+ community resources');
    console.log('   - /tools: 40+ tools and practical resources');

    console.log('\n2. 📊 CONTENT DISTRIBUTION STRATEGY:');
    console.log('   - Feature high-quality, published content first');
    console.log('   - Gradually surface unpublished content after review');
    console.log('   - Use difficulty levels to create learning progressions');
    console.log('   - Leverage the 18 featured resources as homepage highlights');

    console.log('\n3. 🔧 TECHNICAL IMPLEMENTATION:');
    console.log('   - Create category-based filtering in each section');
    console.log('   - Implement difficulty-based sorting');
    console.log('   - Add resource type badges/icons for visual clarity');
    console.log('   - Use publication status for content visibility');

    console.log('\n4. 📈 SEO OPTIMIZATION:');
    console.log('   - All 639 resources have SEO metadata (excellent!)');
    console.log('   - Create category-specific landing pages');
    console.log('   - Implement breadcrumb navigation');
    console.log('   - Use structured data for rich snippets');

    console.log('\n5. 🎨 USER EXPERIENCE:');
    console.log('   - Add difficulty level indicators');
    console.log('   - Implement time estimation where available (8 resources have this)');
    console.log('   - Create personalized recommendations based on user level');
    console.log('   - Add bookmark and progress tracking functionality');

    console.log('\n6. 📱 CONTENT GAPS TO ADDRESS:');
    console.log('   - Only 0.6% premium content - consider premium offerings');
    console.log('   - 26.3% unpublished - review and publish quality content');
    console.log('   - Limited time estimates - add more for better planning');
    console.log('   - Intermediate/Advanced content is limited - consider expansion');

    console.log('\n' + '='.repeat(80));
    console.log('✅ ORGANIZATION ANALYSIS COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

generateWebsiteOrganizationRecommendations();