/**
 * Setup Categories Script
 * Creates the proper category structure for Academy, Insights, and Community sections
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupCategories() {
  console.log('🔄 Setting up proper category structure...');
  
  // Delete existing categories that don't match our structure
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Create main sections
  const mainSections = [
    { name: 'Academy', slug: 'academy', description: 'Comprehensive cybersecurity education and training', icon: 'GraduationCap', color: 'blue' },
    { name: 'Insights', slug: 'insights', description: 'Latest cybersecurity news and intelligence', icon: 'TrendingUp', color: 'green' },
    { name: 'Community', slug: 'community', description: 'Connect with cybersecurity professionals', icon: 'Users', color: 'purple' }
  ];
  
  console.log('📁 Creating main sections...');
  const { data: sections, error: sectionsError } = await supabase
    .from('categories')
    .insert(mainSections)
    .select();
  
  if (sectionsError) {
    console.error('Error creating main sections:', sectionsError);
    return;
  }
  
  console.log('✅ Main sections created:', sections.map(s => s.name));
  
  // Find section IDs
  const academyId = sections.find(s => s.slug === 'academy')?.id;
  const insightsId = sections.find(s => s.slug === 'insights')?.id;
  const communityId = sections.find(s => s.slug === 'community')?.id;
  
  // Create Academy subsections
  const academySubsections = [
    { name: 'Courses', slug: 'courses', description: 'Structured cybersecurity learning paths', icon: 'BookOpen', color: 'blue', parent_id: academyId },
    { name: 'Videos', slug: 'videos', description: 'Educational videos and tutorials', icon: 'Video', color: 'red', parent_id: academyId },
    { name: 'Documentation', slug: 'documentation', description: 'Technical guides and reference materials', icon: 'FileText', color: 'cyan', parent_id: academyId },
    { name: 'Cheat Sheets', slug: 'cheatsheets', description: 'Quick reference guides', icon: 'FileText', color: 'yellow', parent_id: academyId }
  ];
  
  // Create Insights subsections
  const insightsSubsections = [
    { name: 'Latest News', slug: 'news', description: 'Breaking cybersecurity news', icon: 'TrendingUp', color: 'blue', parent_id: insightsId },
    { name: 'Security Tools', slug: 'tools', description: 'Essential cybersecurity tools', icon: 'Wrench', color: 'purple', parent_id: insightsId },
    { name: 'Podcasts', slug: 'podcasts', description: 'Cybersecurity podcasts', icon: 'Mic', color: 'green', parent_id: insightsId },
    { name: 'Threat Intelligence', slug: 'threats', description: 'Latest threat analysis', icon: 'Shield', color: 'red', parent_id: insightsId },
    { name: 'Data Breaches', slug: 'breaches', description: 'Breach analysis and reports', icon: 'Database', color: 'orange', parent_id: insightsId }
  ];
  
  // Create Community subsections  
  const communitySubsections = [
    { name: 'Discord Servers', slug: 'discord', description: 'Active Discord communities', icon: 'MessageSquare', color: 'indigo', parent_id: communityId },
    { name: 'Reddit Communities', slug: 'reddit', description: 'Cybersecurity subreddits', icon: 'Users', color: 'orange', parent_id: communityId },
    { name: 'Forums', slug: 'forums', description: 'Traditional discussion forums', icon: 'Users', color: 'blue', parent_id: communityId },
    { name: 'Skool Communities', slug: 'skool', description: 'Skool platform communities', icon: 'Users', color: 'purple', parent_id: communityId }
  ];
  
  console.log('📂 Creating subsections...');
  const allSubsections = [...academySubsections, ...insightsSubsections, ...communitySubsections];
  
  const { data: subsections, error: subsError } = await supabase
    .from('categories')
    .insert(allSubsections)
    .select();
  
  if (subsError) {
    console.error('Error creating subsections:', subsError);
    return;
  }
  
  console.log('✅ Subsections created:', subsections.length);
  
  // Get all categories to show structure
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
    .order('parent_id', { ascending: false });
  
  console.log('\n📊 Final category structure:');
  const mainCategories = allCategories.filter(c => !c.parent_id);
  mainCategories.forEach(main => {
    console.log(`📁 ${main.name} (${main.slug})`);
    const subs = allCategories.filter(c => c.parent_id === main.id);
    subs.forEach(sub => {
      console.log(`  📂 ${sub.name} (${sub.slug})`);
    });
  });
  
  return { sections, subsections };
}

// Run the script
if (require.main === module) {
  setupCategories()
    .then(() => {
      console.log('\n✅ Category setup completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error setting up categories:', error);
      process.exit(1);
    });
}

module.exports = { setupCategories };