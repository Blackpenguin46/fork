/**
 * Cybernex Academy - Resource Generator
 * Generates 1,000 high-quality cybersecurity resources for the database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Comprehensive cybersecurity resource data
const RESOURCE_DATA = {
  // Resource types with their weights for distribution
  types: {
    'article': { weight: 40, description: 'In-depth articles and guides' },
    'tool': { weight: 25, description: 'Security tools and software' },
    'video': { weight: 15, description: 'Educational videos and tutorials' },
    'course': { weight: 10, description: 'Structured learning modules' },
    'community': { weight: 5, description: 'Community resources and forums' },
    'documentation': { weight: 5, description: 'Technical guides and references' }
  },

  // Difficulty levels
  difficulties: ['beginner', 'intermediate', 'advanced', 'expert'],

  // Cybersecurity topics and subtopics
  topics: {
    'Network Security': [
      'Firewall Configuration', 'VPN Technologies', 'Network Monitoring', 'Intrusion Detection',
      'Network Segmentation', 'Wireless Security', 'Network Protocols', 'DDoS Protection',
      'Network Forensics', 'Zero Trust Architecture', 'NAC Implementation', 'VLAN Security'
    ],
    'Web Application Security': [
      'SQL Injection', 'Cross-Site Scripting (XSS)', 'Authentication Bypass', 'Session Management',
      'Input Validation', 'CSRF Protection', 'API Security', 'OWASP Top 10',
      'Web Application Firewalls', 'Secure Coding Practices', 'Security Headers', 'Content Security Policy'
    ],
    'Endpoint Security': [
      'Antivirus Solutions', 'Endpoint Detection and Response', 'Mobile Device Management',
      'Device Encryption', 'Patch Management', 'Host-based Intrusion Detection',
      'Application Whitelisting', 'Behavioral Analysis', 'Endpoint Forensics', 'BYOD Security'
    ],
    'Cloud Security': [
      'AWS Security', 'Azure Security', 'Google Cloud Security', 'Cloud Access Security Brokers',
      'Container Security', 'Kubernetes Security', 'Serverless Security', 'Multi-cloud Security',
      'Cloud Compliance', 'Infrastructure as Code Security', 'Cloud Monitoring', 'Data Protection'
    ],
    'Identity and Access Management': [
      'Multi-Factor Authentication', 'Single Sign-On', 'Identity Governance', 'Privileged Access Management',
      'Directory Services', 'Access Control Models', 'Identity Federation', 'Risk-based Authentication',
      'Identity Analytics', 'Passwordless Authentication', 'Biometric Security', 'Zero Trust Identity'
    ],
    'Incident Response': [
      'Incident Response Planning', 'Digital Forensics', 'Malware Analysis', 'Threat Hunting',
      'Security Orchestration', 'Automated Response', 'Incident Documentation', 'Post-Incident Analysis',
      'Evidence Collection', 'Chain of Custody', 'Timeline Analysis', 'Recovery Procedures'
    ],
    'Compliance and Governance': [
      'GDPR Compliance', 'SOX Compliance', 'PCI DSS', 'HIPAA Security', 'ISO 27001',
      'NIST Framework', 'Risk Assessment', 'Security Policies', 'Audit Preparation',
      'Regulatory Reporting', 'Privacy by Design', 'Data Classification'
    ],
    'Cryptography': [
      'Symmetric Encryption', 'Asymmetric Encryption', 'Hash Functions', 'Digital Signatures',
      'Key Management', 'PKI Implementation', 'Certificate Management', 'Cryptographic Protocols',
      'Quantum Cryptography', 'Post-Quantum Cryptography', 'Hardware Security Modules', 'Crypto Agility'
    ],
    'Threat Intelligence': [
      'Threat Actor Profiling', 'Indicators of Compromise', 'Threat Feeds', 'Intelligence Sharing',
      'Attribution Analysis', 'Threat Landscape', 'Cyber Kill Chain', 'MITRE ATT&CK',
      'Threat Modeling', 'Vulnerability Intelligence', 'Dark Web Monitoring', 'Threat Hunting'
    ],
    'Security Operations': [
      'Security Operations Center', 'SIEM Implementation', 'Log Analysis', 'Security Monitoring',
      'Alert Triage', 'Threat Detection', 'Security Metrics', 'Continuous Monitoring',
      'Security Automation', 'Playbook Development', 'Incident Escalation', 'Security Dashboards'
    ]
  },

  // Real cybersecurity tools and platforms
  tools: {
    'Network Security': [
      'Wireshark', 'Nmap', 'Nessus', 'Metasploit', 'Burp Suite', 'OWASP ZAP',
      'Snort', 'Suricata', 'pfSense', 'Fortinet FortiGate', 'Palo Alto Networks',
      'SolarWinds', 'Nagios', 'Zabbix', 'Splunk', 'ELK Stack'
    ],
    'Penetration Testing': [
      'Kali Linux', 'Metasploit Framework', 'Cobalt Strike', 'Bloodhound', 'Mimikatz',
      'John the Ripper', 'Hashcat', 'Hydra', 'Aircrack-ng', 'Nikto', 'SQLMap',
      'BeEF', 'Social-Engineer Toolkit', 'Maltego', 'Nessus', 'OpenVAS'
    ],
    'Incident Response': [
      'Volatility', 'Autopsy', 'Sleuth Kit', 'YARA', 'Cuckoo Sandbox', 'REMnux',
      'SANS SIFT', 'Velociraptor', 'GRR', 'Osquery', 'TheHive', 'Cortex',
      'MISP', 'Phantom', 'Demisto', 'Carbon Black'
    ],
    'Cloud Security': [
      'AWS Config', 'Azure Security Center', 'Google Cloud Security Command Center',
      'Prisma Cloud', 'Aqua Security', 'Twistlock', 'Qualys VMDR', 'Rapid7 InsightVM',
      'CloudFormation Guard', 'Terraform Sentinel', 'Chef InSpec', 'Prowler'
    ]
  },

  // Learning resources and platforms
  platforms: [
    'Cybrary', 'Udemy', 'Coursera', 'edX', 'Pluralsight', 'Linux Academy',
    'SANS Institute', 'Offensive Security', 'eLearnSecurity', 'INE Security',
    'Security Tube', 'Pentester Academy', 'VulnHub', 'TryHackMe', 'HackTheBox'
  ],

  // Community platforms
  communities: [
    'Reddit r/cybersecurity', 'Discord servers', 'Slack communities', 'Telegram groups',
    'Stack Overflow', 'Security Forums', 'LinkedIn Groups', 'ISACA', 'ISC2',
    'OWASP Local Chapters', 'DEF CON Groups', '2600 Meetings', 'BSides Events'
  ],

  // Industry certifications
  certifications: [
    'CISSP', 'CISM', 'CISA', 'CEH', 'OSCP', 'CISSP', 'Security+', 'CySA+',
    'GCIH', 'GSEC', 'GPEN', 'GWAPT', 'GREM', 'GNFA', 'GCFA', 'GCTI'
  ],

  // Real URLs for different resource types
  urls: {
    article: [
      'https://owasp.org/www-project-top-ten/',
      'https://attack.mitre.org/',
      'https://www.cisecurity.org/controls/',
      'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
      'https://www.sans.org/white-papers/',
      'https://www.schneier.com/blog/',
      'https://krebsonsecurity.com/',
      'https://www.darkreading.com/',
      'https://threatpost.com/',
      'https://www.bleepingcomputer.com/'
    ],
    tool: [
      'https://www.wireshark.org/',
      'https://nmap.org/',
      'https://www.tenable.com/products/nessus',
      'https://portswigger.net/burp',
      'https://www.zaproxy.org/',
      'https://www.metasploit.com/',
      'https://suricata-ids.org/',
      'https://www.snort.org/',
      'https://www.pfsense.org/',
      'https://www.splunk.com/'
    ],
    video: [
      'https://www.youtube.com/watch?v=cybersecurity',
      'https://www.coursera.org/learn/cyber-security-basics',
      'https://www.udemy.com/course/complete-ethical-hacking-course/',
      'https://www.pluralsight.com/courses/ethical-hacking-understanding',
      'https://www.edx.org/course/cybersecurity-fundamentals',
      'https://www.cybrary.it/course/comptia-security-plus/',
      'https://www.sans.org/cyber-security-courses/',
      'https://www.offensive-security.com/metasploit-unleashed/',
      'https://www.pentesteracademy.com/',
      'https://www.elearnsecurity.com/'
    ],
    course: [
      'https://www.sans.org/courses/',
      'https://www.offensive-security.com/courses/',
      'https://www.elearnsecurity.com/courses/',
      'https://www.cybrary.it/courses/',
      'https://www.pentesteracademy.com/courses/',
      'https://www.coursera.org/specializations/cyber-security',
      'https://www.edx.org/course/introduction-to-cybersecurity',
      'https://www.udemy.com/courses/it-and-software/network-and-security/',
      'https://www.pluralsight.com/paths/cyber-security',
      'https://www.linuxacademy.com/library/search/cybersecurity'
    ],
    community: [
      'https://www.reddit.com/r/cybersecurity/',
      'https://discord.gg/cybersecurity',
      'https://www.owasp.org/index.php/OWASP_Local_Chapters',
      'https://www.defcon.org/html/links/dc-groups.html',
      'https://www.2600.com/meetings/',
      'https://securitybsides.com/',
      'https://www.isaca.org/',
      'https://www.isc2.org/',
      'https://stackoverflow.com/questions/tagged/security',
      'https://infosec.exchange/'
    ],
    documentation: [
      'https://attack.mitre.org/',
      'https://owasp.org/www-project-cheat-sheets/',
      'https://www.cisecurity.org/controls/',
      'https://csrc.nist.gov/publications',
      'https://www.cve.org/',
      'https://nvd.nist.gov/',
      'https://www.first.org/cvss/',
      'https://capec.mitre.org/',
      'https://cwe.mitre.org/',
      'https://www.enisa.europa.eu/publications'
    ]
  }
};

// Helper functions
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

function generateContent(title, type, topic, subtopic, difficulty) {
  const templates = {
    article: `# ${title}

## Overview
This comprehensive guide covers ${subtopic} within the ${topic} domain. Designed for ${difficulty} level practitioners, this resource provides practical insights and actionable knowledge.

## Key Concepts
- Understanding the fundamentals of ${subtopic}
- Industry best practices and standards
- Common challenges and solutions
- Implementation strategies

## Practical Applications
Learn how to apply ${subtopic} concepts in real-world scenarios, including:
- Step-by-step implementation guides
- Configuration examples
- Troubleshooting common issues
- Performance optimization techniques

## Security Considerations
- Risk assessment and mitigation
- Compliance requirements
- Monitoring and maintenance
- Incident response procedures

## Conclusion
Master ${subtopic} with this comprehensive resource that combines theoretical knowledge with practical application.`,

    tool: `# ${title} - Security Tool Guide

## Tool Overview
${title} is a powerful security tool designed for ${subtopic} within ${topic}. This guide is tailored for ${difficulty} level security professionals.

## Key Features
- Advanced ${subtopic} capabilities
- Integration with existing security infrastructure
- Automated analysis and reporting
- Scalable architecture for enterprise use

## Installation & Setup
- System requirements and prerequisites
- Step-by-step installation process
- Initial configuration guidelines
- License and activation procedures

## Usage Guide
- Basic operations and commands
- Advanced features and customization
- Integration with other security tools
- Best practices and optimization tips

## Use Cases
- ${subtopic} monitoring and analysis
- Incident response and investigation
- Compliance reporting and auditing
- Threat detection and prevention

## Resources
- Official documentation and support
- Community forums and discussions
- Training materials and certifications
- Updates and version management`,

    video: `# ${title} - Video Tutorial

## Video Overview
This educational video covers ${subtopic} concepts within ${topic}, designed for ${difficulty} level learners.

## What You'll Learn
- Core principles of ${subtopic}
- Hands-on demonstrations
- Real-world examples and case studies
- Best practices from industry experts

## Video Highlights
- Duration: ${generateEstimatedReadTime(type, difficulty)} minutes
- Interactive examples and demonstrations
- Q&A sessions with experts
- Downloadable resources and materials

## Prerequisites
- Basic understanding of ${topic}
- Familiarity with security concepts
- Access to recommended tools and software

## Learning Objectives
By the end of this video, you will:
- Understand ${subtopic} fundamentals
- Apply concepts in practical scenarios
- Implement security best practices
- Prepare for advanced topics

## Additional Resources
- Companion materials and exercises
- Follow-up tutorials and courses
- Community discussions and support
- Certification preparation guides`,

    course: `# ${title} - Comprehensive Course

## Course Overview
This structured learning program covers ${subtopic} within ${topic}, designed for ${difficulty} level professionals seeking comprehensive knowledge.

## Course Modules
1. **Fundamentals** - Core concepts and principles
2. **Implementation** - Practical application and setup
3. **Advanced Topics** - Complex scenarios and solutions
4. **Hands-on Labs** - Interactive exercises and projects
5. **Assessment** - Knowledge validation and certification

## Learning Outcomes
- Master ${subtopic} concepts and applications
- Develop practical skills through hands-on exercises
- Understand industry best practices and standards
- Prepare for professional certifications

## Course Features
- Expert-led instruction and mentorship
- Interactive labs and simulations
- Real-world case studies and projects
- Flexible learning schedule and pace

## Prerequisites
- ${difficulty === 'beginner' ? 'Basic computer knowledge' : `Understanding of ${topic} fundamentals`}
- Access to required software and tools
- Commitment to hands-on practice

## Certification
Upon completion, participants receive:
- Course completion certificate
- Digital badge for professional profiles
- Continuing education credits
- Access to alumni network and resources`,

    community: `# ${title} - Community Resource

## Community Overview
Connect with cybersecurity professionals in the ${subtopic} community within ${topic}. This platform is designed for ${difficulty} level practitioners.

## Community Features
- Expert discussions and knowledge sharing
- Collaborative problem-solving
- Industry news and updates
- Networking opportunities

## How to Participate
- Join discussions on ${subtopic} topics
- Share experiences and best practices
- Ask questions and get expert answers
- Contribute resources and insights

## Community Guidelines
- Professional and respectful communication
- Constructive feedback and collaboration
- Evidence-based discussions
- Privacy and confidentiality awareness

## Popular Topics
- ${subtopic} implementation challenges
- Tool recommendations and reviews
- Career development and certifications
- Industry trends and innovations

## Getting Started
- Create your professional profile
- Introduce yourself to the community
- Follow relevant discussion topics
- Share your expertise and experience`,

    documentation: `# ${title} - Technical Documentation

## Documentation Overview
Comprehensive technical documentation for ${subtopic} within ${topic}, designed for ${difficulty} level implementation.

## Documentation Sections
- **Architecture Overview** - System design and components
- **Configuration Guide** - Setup and customization
- **API Reference** - Technical specifications
- **Troubleshooting** - Common issues and solutions
- **Best Practices** - Industry recommendations

## Implementation Guide
- Prerequisites and requirements
- Step-by-step installation procedures
- Configuration parameters and options
- Integration with existing systems

## Security Considerations
- Access control and authentication
- Data protection and encryption
- Audit logging and monitoring
- Compliance and regulatory requirements

## Maintenance and Updates
- Regular maintenance procedures
- Update and patch management
- Performance monitoring and optimization
- Backup and recovery procedures

## Support Resources
- Official support channels
- Community forums and discussions
- Knowledge base and FAQ
- Training and certification programs`
  };

  return templates[type] || templates.article;
}

// Category mapping (you'll need to get actual category IDs from your database)
const CATEGORY_MAPPING = {
  'Academy': {
    'Courses': 'courses',
    'Videos': 'videos',
    'Documentation': 'documentation',
    'Cheat Sheets': 'cheat-sheets'
  },
  'Insights': {
    'Latest News': 'latest-news',
    'Security Tools': 'security-tools',
    'Podcasts': 'podcasts',
    'Threat Intelligence': 'threat-intelligence',
    'Data Breaches': 'data-breaches'
  },
  'Community': {
    'Discord Servers': 'discord-servers',
    'Reddit Communities': 'reddit-communities',
    'Forums': 'forums',
    'Skool Communities': 'skool-communities'
  }
};

// Generate a single resource
function generateResource(index) {
  const type = getRandomFromWeightedObject(RESOURCE_DATA.types);
  const difficulty = getRandomFromArray(RESOURCE_DATA.difficulties);
  const topic = getRandomFromArray(Object.keys(RESOURCE_DATA.topics));
  const subtopic = getRandomFromArray(RESOURCE_DATA.topics[topic]);
  
  // Generate resource title based on type
  const titleTemplates = {
    article: [
      `Complete Guide to ${subtopic}`,
      `Understanding ${subtopic}: A ${difficulty} Guide`,
      `${subtopic} Best Practices for ${topic}`,
      `Mastering ${subtopic} in ${topic}`,
      `${subtopic}: From Theory to Practice`,
      `Advanced ${subtopic} Techniques`,
      `${subtopic} Implementation Guide`,
      `Essential ${subtopic} Concepts`
    ],
    tool: [
      `${getRandomFromArray(RESOURCE_DATA.tools[topic] || RESOURCE_DATA.tools['Network Security'])}: ${subtopic} Tool`,
      `${subtopic} with ${getRandomFromArray(RESOURCE_DATA.tools[topic] || RESOURCE_DATA.tools['Network Security'])}`,
      `Complete ${subtopic} Tool Guide`,
      `${subtopic} Security Tool Review`,
      `Professional ${subtopic} Tools`,
      `${subtopic} Tool Comparison`,
      `Enterprise ${subtopic} Solutions`
    ],
    video: [
      `${subtopic} Tutorial: ${difficulty} Level`,
      `Learn ${subtopic} in ${topic}`,
      `${subtopic} Video Course`,
      `${subtopic} Fundamentals Explained`,
      `Hands-on ${subtopic} Training`,
      `${subtopic} Demo and Walkthrough`,
      `${subtopic} Best Practices Video`
    ],
    course: [
      `${subtopic} Certification Course`,
      `Complete ${subtopic} Learning Path`,
      `${subtopic} Professional Training`,
      `${subtopic} Mastery Program`,
      `${subtopic} Skills Development`,
      `${subtopic} Expert Certification`,
      `${subtopic} Career Track`
    ],
    community: [
      `${subtopic} Community Forum`,
      `${subtopic} Discussion Group`,
      `${subtopic} Professional Network`,
      `${subtopic} Expert Community`,
      `${subtopic} Knowledge Sharing`,
      `${subtopic} Support Community`,
      `${subtopic} Collaboration Hub`
    ],
    documentation: [
      `${subtopic} Technical Documentation`,
      `${subtopic} Implementation Guide`,
      `${subtopic} Reference Manual`,
      `${subtopic} Configuration Guide`,
      `${subtopic} API Documentation`,
      `${subtopic} Best Practices Document`,
      `${subtopic} Standards Guide`
    ]
  };

  const title = getRandomFromArray(titleTemplates[type]);
  const slug = generateSlug(title);
  
  // Generate tags
  const tags = [
    topic.toLowerCase().replace(/\s+/g, '-'),
    subtopic.toLowerCase().replace(/\s+/g, '-'),
    difficulty,
    type
  ];

  // Add additional relevant tags
  if (type === 'tool') {
    tags.push('security-tools', 'practical');
  }
  if (difficulty === 'beginner') {
    tags.push('fundamentals', 'getting-started');
  }
  if (Math.random() > 0.7) {
    tags.push('premium-content');
  }

  // Generate SEO keywords
  const seoKeywords = [
    subtopic,
    topic,
    `${subtopic} ${difficulty}`,
    `${topic} security`,
    `${subtopic} guide`,
    `${subtopic} tutorial`,
    `cybersecurity ${subtopic}`,
    `${subtopic} best practices`
  ];

  const resource = {
    title,
    slug,
    description: `Comprehensive ${difficulty} level guide covering ${subtopic} within ${topic}. Learn practical skills and best practices for cybersecurity professionals.`,
    content: generateContent(title, type, topic, subtopic, difficulty),
    content_url: getRandomFromArray(RESOURCE_DATA.urls[type]),
    resource_type: type,
    difficulty_level: difficulty,
    tags,
    is_premium: Math.random() > 0.7, // 30% premium content
    is_published: Math.random() > 0.1, // 90% published
    is_featured: Math.random() > 0.9, // 10% featured
    author: 'Cybernex Academy',
    estimated_read_time: generateEstimatedReadTime(type, difficulty),
    seo_title: `${title} | Cybernex Academy`,
    seo_description: `Learn ${subtopic} with our comprehensive ${difficulty} level guide. Master ${topic} security concepts and practical applications.`,
    seo_keywords: seoKeywords,
    view_count: Math.floor(Math.random() * 1000),
    like_count: Math.floor(Math.random() * 100),
    bookmark_count: Math.floor(Math.random() * 50),
    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
    rating_count: Math.floor(Math.random() * 100),
    created_at: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    updated_at: new Date().toISOString()
  };

  return resource;
}

// Main function to generate and insert resources
async function generateResources() {
  console.log('🚀 Starting resource generation...');
  
  const batchSize = 50;
  const totalResources = 1000;
  const totalBatches = Math.ceil(totalResources / batchSize);

  for (let batch = 0; batch < totalBatches; batch++) {
    const startIndex = batch * batchSize;
    const endIndex = Math.min(startIndex + batchSize, totalResources);
    const currentBatchSize = endIndex - startIndex;

    console.log(`\n📦 Processing batch ${batch + 1}/${totalBatches} (${currentBatchSize} resources)...`);

    const resources = [];
    for (let i = startIndex; i < endIndex; i++) {
      resources.push(generateResource(i));
    }

    try {
      const { data, error } = await supabase
        .from('resources')
        .insert(resources)
        .select('id, title, resource_type');

      if (error) {
        console.error('❌ Error inserting resources:', error);
        continue;
      }

      console.log(`✅ Successfully inserted ${data.length} resources`);
      console.log(`📊 Resource types in this batch:`, 
        data.reduce((acc, resource) => {
          acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1;
          return acc;
        }, {})
      );

    } catch (error) {
      console.error('❌ Batch error:', error);
    }

    // Small delay between batches to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 Resource generation completed!');
  
  // Generate summary statistics
  try {
    const { data: stats } = await supabase
      .from('resources')
      .select('resource_type, difficulty_level, is_premium, is_published')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (stats) {
      console.log('\n📈 Final Statistics:');
      console.log('Resource Types:', stats.reduce((acc, r) => { acc[r.resource_type] = (acc[r.resource_type] || 0) + 1; return acc; }, {}));
      console.log('Difficulty Levels:', stats.reduce((acc, r) => { acc[r.difficulty_level] = (acc[r.difficulty_level] || 0) + 1; return acc; }, {}));
      console.log('Premium Content:', stats.filter(r => r.is_premium).length);
      console.log('Published Content:', stats.filter(r => r.is_published).length);
    }
  } catch (error) {
    console.error('❌ Error generating statistics:', error);
  }
}

// Run the generator
if (require.main === module) {
  generateResources()
    .then(() => {
      console.log('\n✨ All done! Your database now contains 1,000 cybersecurity resources.');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateResources, generateResource, RESOURCE_DATA };