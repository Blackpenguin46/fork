/**
 * Offline Test Resource Generator
 * Generates sample resources without database connection
 */

// Mock the parts of generate-resources.js that don't need database
const RESOURCE_DATA = {
  types: {
    'article': { weight: 40, description: 'In-depth articles and guides' },
    'tool': { weight: 25, description: 'Security tools and software' },
    'video': { weight: 15, description: 'Educational videos and tutorials' },
    'course': { weight: 10, description: 'Structured learning modules' },
    'community': { weight: 5, description: 'Community resources and forums' },
    'documentation': { weight: 5, description: 'Technical guides and references' }
  },

  difficulties: ['beginner', 'intermediate', 'advanced', 'expert'],

  topics: {
    'Network Security': [
      'Firewall Configuration', 'VPN Technologies', 'Network Monitoring', 'Intrusion Detection',
      'Network Segmentation', 'Wireless Security', 'Network Protocols', 'DDoS Protection'
    ],
    'Web Application Security': [
      'SQL Injection', 'Cross-Site Scripting (XSS)', 'Authentication Bypass', 'Session Management',
      'Input Validation', 'CSRF Protection', 'API Security', 'OWASP Top 10'
    ],
    'Cloud Security': [
      'AWS Security', 'Azure Security', 'Container Security', 'Kubernetes Security',
      'Cloud Compliance', 'Infrastructure as Code Security', 'Cloud Monitoring'
    ]
  },

  urls: {
    article: ['https://owasp.org/www-project-top-ten/', 'https://attack.mitre.org/'],
    tool: ['https://www.wireshark.org/', 'https://nmap.org/'],
    video: ['https://www.youtube.com/watch?v=cybersecurity', 'https://www.coursera.org/learn/cyber-security-basics'],
    course: ['https://www.sans.org/courses/', 'https://www.offensive-security.com/courses/'],
    community: ['https://www.reddit.com/r/cybersecurity/', 'https://discord.gg/cybersecurity'],
    documentation: ['https://attack.mitre.org/', 'https://owasp.org/www-project-cheat-sheets/']
  }
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomFromWeightedObject(obj) {
  const keys = Object.keys(obj);
  const weights = keys.map(key => obj[key].weight);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const random = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (let i = 0; i < keys.length; i++) {
    currentWeight += weights[i];
    if (random <= currentWeight) {
      return keys[i];
    }
  }
  return keys[keys.length - 1];
}

function generateEstimatedReadTime(type, difficulty) {
  const baseTime = {
    article: 5,
    tool: 3,
    video: 10,
    course: 30,
    community: 2,
    documentation: 8
  };
  
  const difficultyMultiplier = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
    expert: 2.5
  };
  
  return Math.round(baseTime[type] * difficultyMultiplier[difficulty]);
}

function generateResource(index) {
  const type = getRandomFromWeightedObject(RESOURCE_DATA.types);
  const difficulty = getRandomFromArray(RESOURCE_DATA.difficulties);
  const topic = getRandomFromArray(Object.keys(RESOURCE_DATA.topics));
  const subtopic = getRandomFromArray(RESOURCE_DATA.topics[topic]);
  
  const titleTemplates = {
    article: [
      `Complete Guide to ${subtopic}`,
      `Understanding ${subtopic}: A ${difficulty} Guide`,
      `${subtopic} Best Practices for ${topic}`,
      `Mastering ${subtopic} in ${topic}`
    ],
    tool: [
      `${subtopic} Security Tool Review`,
      `Professional ${subtopic} Tools`,
      `${subtopic} Tool Comparison`,
      `Enterprise ${subtopic} Solutions`
    ],
    video: [
      `${subtopic} Tutorial: ${difficulty} Level`,
      `Learn ${subtopic} in ${topic}`,
      `${subtopic} Video Course`,
      `${subtopic} Fundamentals Explained`
    ],
    course: [
      `${subtopic} Certification Course`,
      `Complete ${subtopic} Learning Path`,
      `${subtopic} Professional Training`,
      `${subtopic} Mastery Program`
    ],
    community: [
      `${subtopic} Community Forum`,
      `${subtopic} Discussion Group`,
      `${subtopic} Professional Network`,
      `${subtopic} Expert Community`
    ],
    documentation: [
      `${subtopic} Technical Documentation`,
      `${subtopic} Implementation Guide`,
      `${subtopic} Reference Manual`,
      `${subtopic} Configuration Guide`
    ]
  };

  const title = getRandomFromArray(titleTemplates[type]);
  const slug = generateSlug(title);
  
  const tags = [
    topic.toLowerCase().replace(/\s+/g, '-'),
    subtopic.toLowerCase().replace(/\s+/g, '-'),
    difficulty,
    type
  ];

  const resource = {
    title,
    slug,
    description: `Comprehensive ${difficulty} level guide covering ${subtopic} within ${topic}. Learn practical skills and best practices for cybersecurity professionals.`,
    content: `# ${title}\n\nThis comprehensive guide covers ${subtopic} within the ${topic} domain...`,
    content_url: getRandomFromArray(RESOURCE_DATA.urls[type]),
    resource_type: type,
    difficulty_level: difficulty,
    tags,
    is_premium: Math.random() > 0.7,
    is_published: Math.random() > 0.1,
    is_featured: Math.random() > 0.9,
    author: 'Cybernex Academy',
    estimated_read_time: generateEstimatedReadTime(type, difficulty),
    seo_title: `${title} | Cybernex Academy`,
    seo_description: `Learn ${subtopic} with our comprehensive ${difficulty} level guide.`,
    view_count: Math.floor(Math.random() * 1000),
    like_count: Math.floor(Math.random() * 100),
    bookmark_count: Math.floor(Math.random() * 50),
    rating: (Math.random() * 2 + 3).toFixed(1),
    rating_count: Math.floor(Math.random() * 100)
  };

  return resource;
}

// Generate test resources
console.log('🧪 Testing resource generation (offline)...\n');

let typeCount = {};
let difficultyCount = {};
let premiumCount = 0;
let publishedCount = 0;

for (let i = 0; i < 10; i++) {
  const resource = generateResource(i);
  
  // Count statistics
  typeCount[resource.resource_type] = (typeCount[resource.resource_type] || 0) + 1;
  difficultyCount[resource.difficulty_level] = (difficultyCount[resource.difficulty_level] || 0) + 1;
  if (resource.is_premium) premiumCount++;
  if (resource.is_published) publishedCount++;
  
  console.log(`📄 Resource ${i + 1}:`);
  console.log(`   Title: ${resource.title}`);
  console.log(`   Type: ${resource.resource_type}`);
  console.log(`   Difficulty: ${resource.difficulty_level}`);
  console.log(`   Premium: ${resource.is_premium ? 'Yes' : 'No'}`);
  console.log(`   Published: ${resource.is_published ? 'Yes' : 'No'}`);
  console.log(`   Tags: ${resource.tags.join(', ')}`);
  console.log(`   Estimated Time: ${resource.estimated_read_time} min`);
  console.log(`   Content Length: ${resource.content.length} chars`);
  console.log(`   URL: ${resource.content_url}`);
  console.log('');
}

console.log('📊 Sample Statistics:');
console.log(`   Resource Types:`, typeCount);
console.log(`   Difficulty Levels:`, difficultyCount);
console.log(`   Premium Content: ${premiumCount}/10 (${(premiumCount/10*100).toFixed(1)}%)`);
console.log(`   Published Content: ${publishedCount}/10 (${(publishedCount/10*100).toFixed(1)}%)`);

console.log('\n✅ Test completed successfully!');
console.log('\nTo generate all 1,000 resources, run:');
console.log('npm run generate:resources');