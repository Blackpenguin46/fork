const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxxpwaloyrtwvpmatzpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg';

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  // Main Categories
  {
    name: 'Learning Paths',
    slug: 'learning-paths',
    description: 'Structured cybersecurity learning journeys from beginner to advanced',
    icon_name: 'GraduationCap',
    color_scheme: 'blue',
    sort_order: 1,
    seo_title: 'Cybersecurity Learning Paths | Cybernex Academy',
    seo_description: 'Follow structured learning paths to master cybersecurity skills from fundamental concepts to advanced techniques.'
  },
  {
    name: 'Courses & Training',
    slug: 'courses',
    description: 'Comprehensive cybersecurity courses and training programs',
    icon_name: 'BookOpen',
    color_scheme: 'green',
    sort_order: 2,
    seo_title: 'Cybersecurity Courses & Training | Cybernex Academy',
    seo_description: 'Access comprehensive cybersecurity courses and training programs designed by industry experts.'
  },
  {
    name: 'Tools & Resources',
    slug: 'tools',
    description: 'Essential cybersecurity tools, software, and resources',
    icon_name: 'Wrench',
    color_scheme: 'purple',
    sort_order: 3,
    seo_title: 'Cybersecurity Tools & Resources | Cybernex Academy',
    seo_description: 'Discover essential cybersecurity tools, software, and resources used by professionals in the field.'
  },
  {
    name: 'Community',
    slug: 'community',
    description: 'Connect with cybersecurity professionals and enthusiasts worldwide',
    icon_name: 'Users',
    color_scheme: 'cyan',
    sort_order: 4,
    seo_title: 'Cybersecurity Community | Cybernex Academy',
    seo_description: 'Join our vibrant cybersecurity community and connect with professionals worldwide.'
  },
  {
    name: 'News & Insights',
    slug: 'insights',
    description: 'Latest cybersecurity news, trends, and industry insights',
    icon_name: 'TrendingUp',
    color_scheme: 'orange',
    sort_order: 5,
    seo_title: 'Cybersecurity News & Insights | Cybernex Academy',
    seo_description: 'Stay updated with the latest cybersecurity news, trends, and industry insights.'
  },
  {
    name: 'Certifications',
    slug: 'certifications',
    description: 'Cybersecurity certification guides and preparation materials',
    icon_name: 'Award',
    color_scheme: 'yellow',
    sort_order: 6,
    seo_title: 'Cybersecurity Certifications | Cybernex Academy',
    seo_description: 'Comprehensive guides and preparation materials for cybersecurity certifications.'
  }
];

const subcategories = [
  // Learning Paths subcategories
  {
    name: 'Beginner Paths',
    slug: 'beginner-paths',
    description: 'Learning paths designed for cybersecurity beginners',
    icon_name: 'Play',
    color_scheme: 'green',
    sort_order: 1,
    parent_category_slug: 'learning-paths'
  },
  {
    name: 'Intermediate Paths',
    slug: 'intermediate-paths',
    description: 'Learning paths for those with some cybersecurity experience',
    icon_name: 'BarChart',
    color_scheme: 'blue',
    sort_order: 2,
    parent_category_slug: 'learning-paths'
  },
  {
    name: 'Advanced Paths',
    slug: 'advanced-paths',
    description: 'Advanced learning paths for experienced professionals',
    icon_name: 'Target',
    color_scheme: 'red',
    sort_order: 3,
    parent_category_slug: 'learning-paths'
  },

  // Courses subcategories
  {
    name: 'Ethical Hacking',
    slug: 'ethical-hacking',
    description: 'Penetration testing and ethical hacking courses',
    icon_name: 'Shield',
    color_scheme: 'red',
    sort_order: 1,
    parent_category_slug: 'courses'
  },
  {
    name: 'Network Security',
    slug: 'network-security',
    description: 'Network security and infrastructure protection courses',
    icon_name: 'Globe',
    color_scheme: 'blue',
    sort_order: 2,
    parent_category_slug: 'courses'
  },
  {
    name: 'Cloud Security',
    slug: 'cloud-security',
    description: 'Cloud platform security and architecture courses',
    icon_name: 'Cloud',
    color_scheme: 'cyan',
    sort_order: 3,
    parent_category_slug: 'courses'
  },
  {
    name: 'Incident Response',
    slug: 'incident-response',
    description: 'Incident response and digital forensics training',
    icon_name: 'AlertTriangle',
    color_scheme: 'orange',
    sort_order: 4,
    parent_category_slug: 'courses'
  },

  // Tools subcategories
  {
    name: 'Penetration Testing Tools',
    slug: 'pentest-tools',
    description: 'Tools for penetration testing and vulnerability assessment',
    icon_name: 'Search',
    color_scheme: 'red',
    sort_order: 1,
    parent_category_slug: 'tools'
  },
  {
    name: 'Security Monitoring',
    slug: 'monitoring-tools',
    description: 'Security monitoring and SIEM tools',
    icon_name: 'Monitor',
    color_scheme: 'blue',
    sort_order: 2,
    parent_category_slug: 'tools'
  },
  {
    name: 'Forensics Tools',
    slug: 'forensics-tools',
    description: 'Digital forensics and investigation tools',
    icon_name: 'Search',
    color_scheme: 'purple',
    sort_order: 3,
    parent_category_slug: 'tools'
  },

  // Community subcategories
  {
    name: 'Discord Servers',
    slug: 'discord-servers',
    description: 'Active cybersecurity Discord communities',
    icon_name: 'MessageSquare',
    color_scheme: 'blue',
    sort_order: 1,
    parent_category_slug: 'community'
  },
  {
    name: 'Reddit Communities',
    slug: 'reddit-communities',
    description: 'Cybersecurity subreddits and discussions',
    icon_name: 'MessageCircle',
    color_scheme: 'orange',
    sort_order: 2,
    parent_category_slug: 'community'
  },
  {
    name: 'Professional Forums',
    slug: 'forums',
    description: 'Professional cybersecurity forums and communities',
    icon_name: 'Users',
    color_scheme: 'green',
    sort_order: 3,
    parent_category_slug: 'community'
  },

  // News & Insights subcategories
  {
    name: 'Threat Intelligence',
    slug: 'threat-intelligence',
    description: 'Latest threat intelligence and security research',
    icon_name: 'Eye',
    color_scheme: 'red',
    sort_order: 1,
    parent_category_slug: 'insights'
  },
  {
    name: 'Data Breaches',
    slug: 'data-breaches',
    description: 'Recent data breaches and security incidents',
    icon_name: 'AlertCircle',
    color_scheme: 'orange',
    sort_order: 2,
    parent_category_slug: 'insights'
  },
  {
    name: 'Industry News',
    slug: 'industry-news',
    description: 'General cybersecurity industry news and updates',
    icon_name: 'Newspaper',
    color_scheme: 'blue',
    sort_order: 3,
    parent_category_slug: 'insights'
  },

  // Certifications subcategories
  {
    name: 'CompTIA',
    slug: 'comptia',
    description: 'CompTIA Security+, CySA+, and other certifications',
    icon_name: 'Award',
    color_scheme: 'blue',
    sort_order: 1,
    parent_category_slug: 'certifications'
  },
  {
    name: 'CISSP',
    slug: 'cissp',
    description: 'CISSP certification preparation and resources',
    icon_name: 'Shield',
    color_scheme: 'gold',
    sort_order: 2,
    parent_category_slug: 'certifications'
  },
  {
    name: 'Ethical Hacker (CEH)',
    slug: 'ceh',
    description: 'Certified Ethical Hacker certification resources',
    icon_name: 'Target',
    color_scheme: 'red',
    sort_order: 3,
    parent_category_slug: 'certifications'
  }
];

async function populateCategories() {
  try {
    console.log('🚀 Starting category population...\n');

    // First, insert main categories
    console.log('📂 Inserting main categories...');
    const { data: mainCategories, error: mainError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();

    if (mainError) {
      console.error('❌ Error inserting main categories:', mainError);
      return;
    }

    console.log(`✅ Successfully inserted ${mainCategories.length} main categories\n`);

    // Create a map of slug to ID for parent category lookup
    const categoryMap = {};
    mainCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Insert subcategories with parent references
    console.log('📁 Inserting subcategories...');
    const subcategoriesWithParents = subcategories.map(subcat => {
      const { parent_category_slug, ...subcatWithoutHelper } = subcat;
      return {
        ...subcatWithoutHelper,
        parent_category_id: categoryMap[parent_category_slug]
      };
    });

    const { data: subCategories, error: subError } = await supabase
      .from('categories')
      .upsert(subcategoriesWithParents, { onConflict: 'slug' })
      .select();

    if (subError) {
      console.error('❌ Error inserting subcategories:', subError);
      return;
    }

    console.log(`✅ Successfully inserted ${subCategories.length} subcategories\n`);

    // Display final structure
    console.log('🎉 Category structure created successfully!\n');
    
    console.log('📊 Final Category Structure:');
    console.log('=' .repeat(50));
    
    for (const mainCat of mainCategories) {
      console.log(`\n🔷 ${mainCat.name} (${mainCat.slug})`);
      
      const subs = subCategories.filter(sub => sub.parent_category_id === mainCat.id);
      subs.forEach(sub => {
        console.log(`   └── ${sub.name} (${sub.slug})`);
      });
    }

    console.log('\n✨ Category population completed successfully!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

populateCategories();