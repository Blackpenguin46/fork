const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxxpwaloyrtwvpmatzpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg';

const supabase = createClient(supabaseUrl, supabaseKey);

const tags = [
  {
    name: 'penetration-testing',
    slug: 'penetration-testing',
    description: 'Penetration testing and ethical hacking techniques',
    usage_count: 15
  },
  {
    name: 'network-security',
    slug: 'network-security',
    description: 'Network security concepts and practices',
    usage_count: 12
  },
  {
    name: 'cloud-security',
    slug: 'cloud-security',
    description: 'Cloud platform security and best practices',
    usage_count: 10
  },
  {
    name: 'malware-analysis',
    slug: 'malware-analysis',
    description: 'Malware detection and analysis techniques',
    usage_count: 8
  },
  {
    name: 'incident-response',
    slug: 'incident-response',
    description: 'Incident response and digital forensics',
    usage_count: 7
  },
  {
    name: 'osint',
    slug: 'osint',
    description: 'Open Source Intelligence gathering',
    usage_count: 6
  },
  {
    name: 'web-security',
    slug: 'web-security',
    description: 'Web application security testing',
    usage_count: 9
  },
  {
    name: 'cryptography',
    slug: 'cryptography',
    description: 'Cryptography and encryption techniques',
    usage_count: 5
  }
];

const resources = [
  // Penetration Testing Tools
  {
    title: 'Metasploit Framework',
    slug: 'metasploit-framework',
    description: 'The world\'s most used penetration testing framework. Learn how to use Metasploit for vulnerability assessment and exploitation.',
    content: 'Comprehensive guide to using Metasploit for penetration testing...',
    resource_type: 'tool',
    url: 'https://www.metasploit.com/',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 45,
    is_premium: false,
    is_featured: true,
    is_published: true,
    view_count: 1250,
    like_count: 89,
    bookmark_count: 234,
    seo_title: 'Metasploit Framework Tutorial | Cybernex Academy',
    seo_description: 'Learn how to use Metasploit framework for penetration testing and vulnerability assessment.',
    seo_keywords: ['metasploit', 'penetration-testing', 'vulnerability-assessment', 'exploitation']
  },
  {
    title: 'Nmap Network Discovery',
    slug: 'nmap-network-discovery',
    description: 'Master network discovery and port scanning with Nmap, the essential network security scanner.',
    content: 'Complete Nmap tutorial covering all scanning techniques...',
    resource_type: 'tool',
    url: 'https://nmap.org/',
    difficulty_level: 'beginner',
    estimated_time_minutes: 30,
    is_premium: false,
    is_featured: true,
    is_published: true,
    view_count: 2100,
    like_count: 156,
    bookmark_count: 445,
    seo_title: 'Nmap Network Discovery Tutorial | Cybernex Academy',
    seo_description: 'Complete guide to network discovery and port scanning using Nmap.',
    seo_keywords: ['nmap', 'network-security', 'port-scanning', 'network-discovery']
  },
  {
    title: 'Wireshark Packet Analysis',
    slug: 'wireshark-packet-analysis',
    description: 'Learn network packet analysis and protocol troubleshooting with Wireshark.',
    content: 'In-depth Wireshark tutorial for network analysis...',
    resource_type: 'tool',
    url: 'https://www.wireshark.org/',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 60,
    is_premium: false,
    is_featured: false,
    is_published: true,
    view_count: 890,
    like_count: 67,
    bookmark_count: 123,
    seo_title: 'Wireshark Packet Analysis Guide | Cybernex Academy',
    seo_description: 'Learn network packet analysis and protocol troubleshooting with Wireshark.',
    seo_keywords: ['wireshark', 'packet-analysis', 'network-security', 'protocol-analysis']
  },

  // Courses
  {
    title: 'Complete Ethical Hacking Course',
    slug: 'complete-ethical-hacking-course',
    description: 'Comprehensive ethical hacking course covering penetration testing, vulnerability assessment, and security testing methodologies.',
    content: 'Full curriculum for ethical hacking certification...',
    resource_type: 'course',
    url: 'https://example.com/ethical-hacking-course',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 720,
    is_premium: true,
    is_featured: true,
    is_published: true,
    view_count: 3200,
    like_count: 245,
    bookmark_count: 567,
    seo_title: 'Complete Ethical Hacking Course | Cybernex Academy',
    seo_description: 'Master ethical hacking with our comprehensive course covering penetration testing and security assessment.',
    seo_keywords: ['ethical-hacking', 'penetration-testing', 'cybersecurity-course', 'security-testing']
  },
  {
    title: 'Cloud Security Fundamentals',
    slug: 'cloud-security-fundamentals',
    description: 'Learn the fundamentals of cloud security across AWS, Azure, and Google Cloud platforms.',
    content: 'Introduction to cloud security principles and best practices...',
    resource_type: 'course',
    difficulty_level: 'beginner',
    estimated_time_minutes: 180,
    is_premium: false,
    is_featured: true,
    is_published: true,
    view_count: 1890,
    like_count: 134,
    bookmark_count: 298,
    seo_title: 'Cloud Security Fundamentals Course | Cybernex Academy',
    seo_description: 'Learn cloud security fundamentals across major cloud platforms.',
    seo_keywords: ['cloud-security', 'aws-security', 'azure-security', 'gcp-security']
  },

  // Articles
  {
    title: 'OWASP Top 10 Security Risks Explained',
    slug: 'owasp-top-10-explained',
    description: 'Detailed explanation of the OWASP Top 10 web application security risks and how to prevent them.',
    content: 'Comprehensive breakdown of each OWASP Top 10 vulnerability...',
    resource_type: 'article',
    difficulty_level: 'beginner',
    estimated_time_minutes: 25,
    is_premium: false,
    is_featured: true,
    is_published: true,
    view_count: 4500,
    like_count: 312,
    bookmark_count: 789,
    seo_title: 'OWASP Top 10 Security Risks Explained | Cybernex Academy',
    seo_description: 'Learn about the OWASP Top 10 web application security risks and prevention techniques.',
    seo_keywords: ['owasp', 'web-security', 'application-security', 'vulnerability-assessment']
  },
  {
    title: 'Introduction to Cryptography',
    slug: 'introduction-to-cryptography',
    description: 'Understand the basics of cryptography, encryption algorithms, and their applications in cybersecurity.',
    content: 'Fundamentals of cryptography and encryption techniques...',
    resource_type: 'article',
    difficulty_level: 'beginner',
    estimated_time_minutes: 35,
    is_premium: false,
    is_featured: false,
    is_published: true,
    view_count: 2300,
    like_count: 187,
    bookmark_count: 456,
    seo_title: 'Introduction to Cryptography | Cybernex Academy',
    seo_description: 'Learn the fundamentals of cryptography and encryption in cybersecurity.',
    seo_keywords: ['cryptography', 'encryption', 'security-algorithms', 'data-protection']
  },

  // Community Resources
  {
    title: 'r/netsec - Network Security Subreddit',
    slug: 'reddit-netsec-community',
    description: 'Active Reddit community focused on network security research, news, and discussions.',
    content: 'Community guidelines and popular discussions...',
    resource_type: 'community',
    url: 'https://reddit.com/r/netsec',
    difficulty_level: 'intermediate',
    is_premium: false,
    is_featured: true,
    is_published: true,
    view_count: 890,
    like_count: 67,
    bookmark_count: 123,
    seo_title: 'r/netsec Network Security Community | Cybernex Academy',
    seo_description: 'Join the active network security community on Reddit for research and discussions.',
    seo_keywords: ['network-security', 'reddit', 'cybersecurity-community', 'security-research']
  },

  // Premium Resources
  {
    title: 'Advanced Malware Analysis Techniques',
    slug: 'advanced-malware-analysis',
    description: 'Professional-grade malware analysis techniques using static and dynamic analysis methods.',
    content: 'Advanced malware reverse engineering and analysis...',
    resource_type: 'course',
    difficulty_level: 'advanced',
    estimated_time_minutes: 480,
    is_premium: true,
    is_featured: true,
    is_published: true,
    view_count: 1200,
    like_count: 95,
    bookmark_count: 278,
    seo_title: 'Advanced Malware Analysis Course | Cybernex Academy',
    seo_description: 'Master advanced malware analysis techniques with professional-grade tools and methods.',
    seo_keywords: ['malware-analysis', 'reverse-engineering', 'static-analysis', 'dynamic-analysis']
  }
];

async function populateResourcesAndTags() {
  try {
    console.log('🚀 Starting resources and tags population...\n');

    // First, insert tags
    console.log('🏷️  Inserting tags...');
    const { data: insertedTags, error: tagsError } = await supabase
      .from('tags')
      .upsert(tags, { onConflict: 'slug' })
      .select();

    if (tagsError) {
      console.error('❌ Error inserting tags:', tagsError);
      return;
    }

    console.log(`✅ Successfully inserted ${insertedTags.length} tags\n`);

    // Insert resources
    console.log('📚 Inserting resources...');
    const { data: insertedResources, error: resourcesError } = await supabase
      .from('resources')
      .upsert(resources, { onConflict: 'slug' })
      .select();

    if (resourcesError) {
      console.error('❌ Error inserting resources:', resourcesError);
      return;
    }

    console.log(`✅ Successfully inserted ${insertedResources.length} resources\n`);

    // Display summary
    console.log('📊 Content Summary:');
    console.log('=' .repeat(50));
    
    console.log('\n🏷️  Tags:');
    insertedTags.forEach(tag => {
      console.log(`   • ${tag.name} (usage: ${tag.usage_count})`);
    });

    console.log('\n📚 Resources by Type:');
    const resourcesByType = insertedResources.reduce((acc, resource) => {
      acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(resourcesByType).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count} resources`);
    });

    console.log('\n🌟 Featured Resources:');
    const featuredResources = insertedResources.filter(r => r.is_featured);
    featuredResources.forEach(resource => {
      const premium = resource.is_premium ? ' [PREMIUM]' : '';
      console.log(`   • ${resource.title}${premium}`);
    });

    console.log('\n💎 Premium Content:');
    const premiumResources = insertedResources.filter(r => r.is_premium);
    console.log(`   • ${premiumResources.length} premium resources available`);

    console.log('\n✨ Content population completed successfully!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

populateResourcesAndTags();