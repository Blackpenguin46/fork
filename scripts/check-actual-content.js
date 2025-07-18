/**
 * Check Actual Content Script
 * Verifies the real resource count and structure on the website
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkActualContent() {
  console.log('🔍 Checking actual resource count and structure...');
  
  // Get total resource count
  const { data: resources, error } = await supabase
    .from('resources')
    .select('id, title, resource_type, category_id, is_published')
    .eq('is_published', true);
  
  if (error) {
    console.error('Error fetching resources:', error);
    return;
  }
  
  console.log('📊 Actual published resource count:', resources.length);
  
  // Get all resources (including unpublished)
  const { data: allResources } = await supabase
    .from('resources')
    .select('id, title, resource_type, category_id, is_published');
  
  console.log('📊 Total resource count (including unpublished):', allResources.length);
  
  // Get resources by type
  const resourcesByType = {};
  resources.forEach(resource => {
    resourcesByType[resource.resource_type] = (resourcesByType[resource.resource_type] || 0) + 1;
  });
  
  console.log('\n📋 Published resources by type:', resourcesByType);
  
  // Get categories and their resource counts
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id');
  
  const resourcesByCategory = {};
  resources.forEach(resource => {
    if (resource.category_id) {
      const category = categories.find(c => c.id === resource.category_id);
      if (category) {
        resourcesByCategory[category.slug] = (resourcesByCategory[category.slug] || 0) + 1;
      }
    }
  });
  
  console.log('\n📂 Published resources by category:', resourcesByCategory);
  
  // Show category structure
  console.log('\n🏗️  Current category structure:');
  const mainCategories = categories.filter(c => !c.parent_id);
  mainCategories.forEach(main => {
    const count = resourcesByCategory[main.slug] || 0;
    console.log(`📁 ${main.name} (${main.slug}): ${count} resources`);
    const subs = categories.filter(c => c.parent_id === main.id);
    subs.forEach(sub => {
      const subCount = resourcesByCategory[sub.slug] || 0;
      console.log(`  📂 ${sub.name} (${sub.slug}): ${subCount} resources`);
    });
  });
  
  // Check for resources without categories
  const uncategorizedResources = resources.filter(r => !r.category_id);
  console.log('\n⚠️  Uncategorized resources:', uncategorizedResources.length);
  
  // Sample some resource titles to understand content
  console.log('\n📝 Sample resource titles:');
  resources.slice(0, 10).forEach((resource, index) => {
    console.log(`${index + 1}. ${resource.title} (${resource.resource_type})`);
  });
}

if (require.main === module) {
  checkActualContent()
    .then(() => {
      console.log('\n✅ Content analysis completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { checkActualContent };