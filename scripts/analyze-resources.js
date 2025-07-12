const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxxpwaloyrtwvpmatzpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeResources() {
  try {
    console.log('=== CYBERNEX ACADEMY - 606 RESOURCES ANALYSIS ===\n');
    
    // Get all resources
    const { data: allResources, error: resourcesError } = await supabase
      .from('resources')
      .select('*');

    if (resourcesError) {
      console.error('Error fetching resources:', resourcesError);
      return;
    }

    console.log(`📊 TOTAL RESOURCES: ${allResources.length}\n`);

    // 1. Resource Type Analysis
    console.log('🔷 RESOURCE TYPE BREAKDOWN:');
    console.log('=' .repeat(50));
    const typeBreakdown = {};
    allResources.forEach(resource => {
      typeBreakdown[resource.resource_type] = (typeBreakdown[resource.resource_type] || 0) + 1;
    });
    
    for (const [type, count] of Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])) {
      const percentage = ((count / allResources.length) * 100).toFixed(1);
      console.log(`  ${type.padEnd(15)}: ${count.toString().padStart(3)} resources (${percentage}%)`);
    }

    // 2. Get categories and analyze distribution
    console.log('\n🔷 CATEGORY ANALYSIS:');
    console.log('=' .repeat(50));
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (!categoriesError && categories) {
      console.log(`Total categories: ${categories.length}\n`);
      categories.forEach(category => {
        console.log(`  ${category.name} (${category.slug})`);
        console.log(`    Description: ${category.description || 'No description'}`);
        console.log(`    Active: ${category.is_active ? 'Yes' : 'No'}`);
        console.log(`    Sort Order: ${category.sort_order}`);
        console.log('');
      });
    }

    // 3. Difficulty Level Analysis
    console.log('🔷 DIFFICULTY LEVEL BREAKDOWN:');
    console.log('=' .repeat(50));
    const difficultyBreakdown = {};
    allResources.forEach(resource => {
      const level = resource.difficulty_level || 'not_specified';
      difficultyBreakdown[level] = (difficultyBreakdown[level] || 0) + 1;
    });
    
    for (const [level, count] of Object.entries(difficultyBreakdown).sort((a, b) => b[1] - a[1])) {
      const percentage = ((count / allResources.length) * 100).toFixed(1);
      console.log(`  ${level.padEnd(15)}: ${count.toString().padStart(3)} resources (${percentage}%)`);
    }

    // 4. Premium vs Free Content
    console.log('\n🔷 PREMIUM VS FREE CONTENT:');
    console.log('=' .repeat(50));
    const premiumCount = allResources.filter(r => r.is_premium).length;
    const freeCount = allResources.length - premiumCount;
    const premiumPercentage = ((premiumCount / allResources.length) * 100).toFixed(1);
    const freePercentage = ((freeCount / allResources.length) * 100).toFixed(1);
    
    console.log(`  Free Content    : ${freeCount.toString().padStart(3)} resources (${freePercentage}%)`);
    console.log(`  Premium Content : ${premiumCount.toString().padStart(3)} resources (${premiumPercentage}%)`);

    // 5. Published vs Unpublished Status
    console.log('\n🔷 PUBLICATION STATUS:');
    console.log('=' .repeat(50));
    const publishedCount = allResources.filter(r => r.is_published).length;
    const unpublishedCount = allResources.length - publishedCount;
    const publishedPercentage = ((publishedCount / allResources.length) * 100).toFixed(1);
    const unpublishedPercentage = ((unpublishedCount / allResources.length) * 100).toFixed(1);
    
    console.log(`  Published       : ${publishedCount.toString().padStart(3)} resources (${publishedPercentage}%)`);
    console.log(`  Unpublished     : ${unpublishedCount.toString().padStart(3)} resources (${unpublishedPercentage}%)`);

    // 6. Featured Content Analysis
    console.log('\n🔷 FEATURED CONTENT:');
    console.log('=' .repeat(50));
    const featuredCount = allResources.filter(r => r.is_featured).length;
    const featuredPercentage = ((featuredCount / allResources.length) * 100).toFixed(1);
    console.log(`  Featured Resources: ${featuredCount} (${featuredPercentage}%)`);

    // 7. Detailed Resource Type + Category Cross Analysis
    console.log('\n🔷 RESOURCE TYPE DETAILS:');
    console.log('=' .repeat(80));
    
    for (const [type, count] of Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])) {
      console.log(`\n📂 ${type.toUpperCase()} (${count} resources):`);
      
      const resourcesOfType = allResources.filter(r => r.resource_type === type);
      
      // Show difficulty breakdown for this type
      const typeDifficulty = {};
      resourcesOfType.forEach(resource => {
        const level = resource.difficulty_level || 'not_specified';
        typeDifficulty[level] = (typeDifficulty[level] || 0) + 1;
      });
      
      console.log('  Difficulty distribution:');
      for (const [level, levelCount] of Object.entries(typeDifficulty)) {
        console.log(`    ${level}: ${levelCount}`);
      }
      
      // Show premium/free for this type
      const typePremium = resourcesOfType.filter(r => r.is_premium).length;
      const typeFree = count - typePremium;
      console.log(`  Premium/Free: ${typePremium} premium, ${typeFree} free`);
      
      // Show published status for this type
      const typePublished = resourcesOfType.filter(r => r.is_published).length;
      console.log(`  Publication: ${typePublished} published, ${count - typePublished} unpublished`);
      
      // Show some example titles
      console.log('  Sample resources:');
      resourcesOfType.slice(0, 3).forEach(resource => {
        console.log(`    - ${resource.title.substring(0, 60)}${resource.title.length > 60 ? '...' : ''}`);
      });
    }

    // 8. URL Analysis - External vs Internal Content
    console.log('\n\n🔷 CONTENT SOURCE ANALYSIS:');
    console.log('=' .repeat(50));
    const externalResources = allResources.filter(r => r.url && r.url.startsWith('http')).length;
    const internalResources = allResources.filter(r => !r.url || !r.url.startsWith('http')).length;
    
    console.log(`  External Links  : ${externalResources} resources`);
    console.log(`  Internal Content: ${internalResources} resources`);

    // 9. Time Estimation Analysis
    console.log('\n🔷 TIME ESTIMATION ANALYSIS:');
    console.log('=' .repeat(50));
    const withTimeEstimate = allResources.filter(r => r.estimated_time_minutes).length;
    const withoutTimeEstimate = allResources.length - withTimeEstimate;
    
    console.log(`  With time estimates   : ${withTimeEstimate} resources`);
    console.log(`  Without time estimates: ${withoutTimeEstimate} resources`);
    
    if (withTimeEstimate > 0) {
      const timeEstimates = allResources
        .filter(r => r.estimated_time_minutes)
        .map(r => r.estimated_time_minutes);
      
      const avgTime = timeEstimates.reduce((a, b) => a + b, 0) / timeEstimates.length;
      const maxTime = Math.max(...timeEstimates);
      const minTime = Math.min(...timeEstimates);
      
      console.log(`  Average time estimate : ${Math.round(avgTime)} minutes`);
      console.log(`  Min time estimate     : ${minTime} minutes`);
      console.log(`  Max time estimate     : ${maxTime} minutes`);
    }

    // 10. SEO Analysis
    console.log('\n🔷 SEO READINESS:');
    console.log('=' .repeat(50));
    const withSeoTitle = allResources.filter(r => r.seo_title).length;
    const withSeoDescription = allResources.filter(r => r.seo_description).length;
    const withSeoKeywords = allResources.filter(r => r.seo_keywords && r.seo_keywords.length > 0).length;
    
    console.log(`  Resources with SEO title      : ${withSeoTitle} (${((withSeoTitle/allResources.length)*100).toFixed(1)}%)`);
    console.log(`  Resources with SEO description: ${withSeoDescription} (${((withSeoDescription/allResources.length)*100).toFixed(1)}%)`);
    console.log(`  Resources with SEO keywords   : ${withSeoKeywords} (${((withSeoKeywords/allResources.length)*100).toFixed(1)}%)`);

    console.log('\n' + '='.repeat(80));
    console.log('📋 ANALYSIS COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

analyzeResources();