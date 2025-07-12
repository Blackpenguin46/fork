#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const learningPaths = [
  {
    title: 'Cybersecurity Fundamentals',
    slug: 'cybersecurity-fundamentals',
    description: 'Master the essential concepts of cybersecurity including threat landscapes, risk management, and security frameworks. Perfect for beginners starting their cybersecurity journey.',
    difficulty_level: 'beginner',
    estimated_duration_hours: 40,
    is_premium: false,
    is_published: true
  },
  {
    title: 'Network Security Mastery',
    slug: 'network-security-mastery',
    description: 'Deep dive into network security protocols, firewalls, intrusion detection systems, and network monitoring. Learn to secure enterprise network infrastructure.',
    difficulty_level: 'intermediate',
    estimated_duration_hours: 65,
    is_premium: true,
    is_published: true
  },
  {
    title: 'Ethical Hacking & Penetration Testing',
    slug: 'ethical-hacking-penetration-testing',
    description: 'Comprehensive training in ethical hacking techniques, vulnerability assessment, and penetration testing methodologies. Includes hands-on labs and real-world scenarios.',
    difficulty_level: 'advanced',
    estimated_duration_hours: 120,
    is_premium: true,
    is_published: true
  },
  {
    title: 'Cloud Security Professional',
    slug: 'cloud-security-professional',
    description: 'Master cloud security across AWS, Azure, and GCP platforms. Cover container security, serverless security, DevSecOps, and cloud compliance frameworks.',
    difficulty_level: 'intermediate',
    estimated_duration_hours: 80,
    is_premium: true,
    is_published: true
  },
  {
    title: 'Incident Response & Digital Forensics',
    slug: 'incident-response-digital-forensics',
    description: 'Learn to respond to security incidents, conduct digital forensics investigations, and implement effective incident response procedures.',
    difficulty_level: 'advanced',
    estimated_duration_hours: 90,
    is_premium: true,
    is_published: true
  },
  {
    title: 'Security Compliance & Risk Management',
    slug: 'security-compliance-risk-management',
    description: 'Understand regulatory compliance requirements (GDPR, HIPAA, SOX), risk assessment methodologies, and security governance frameworks.',
    difficulty_level: 'intermediate',
    estimated_duration_hours: 55,
    is_premium: false,
    is_published: true
  },
  {
    title: 'Malware Analysis & Reverse Engineering',
    slug: 'malware-analysis-reverse-engineering',
    description: 'Advanced techniques for analyzing malware, reverse engineering malicious code, and understanding attack methodologies.',
    difficulty_level: 'advanced',
    estimated_duration_hours: 100,
    is_premium: true,
    is_published: true
  },
  {
    title: 'Web Application Security',
    slug: 'web-application-security',
    description: 'Comprehensive coverage of web application security testing, OWASP Top 10, secure coding practices, and application security assessment.',
    difficulty_level: 'intermediate',
    estimated_duration_hours: 70,
    is_premium: false,
    is_published: true
  },
  {
    title: 'Identity & Access Management (IAM)',
    slug: 'identity-access-management',
    description: 'Master identity and access management concepts, authentication protocols, authorization frameworks, and zero trust architecture.',
    difficulty_level: 'intermediate',
    estimated_duration_hours: 45,
    is_premium: true,
    is_published: true
  },
  {
    title: 'Security Operations Center (SOC) Analyst',
    slug: 'soc-analyst-training',
    description: 'Complete training for SOC analysts covering threat detection, security monitoring, SIEM tools, and incident analysis.',
    difficulty_level: 'beginner',
    estimated_duration_hours: 85,
    is_premium: false,
    is_published: true
  },
  {
    title: 'Cryptography & PKI',
    slug: 'cryptography-pki',
    description: 'Deep dive into cryptographic algorithms, digital certificates, public key infrastructure, and encryption implementation.',
    difficulty_level: 'advanced',
    estimated_duration_hours: 60,
    is_premium: true,
    is_published: true
  },
  {
    title: 'Mobile Security',
    slug: 'mobile-security',
    description: 'Comprehensive mobile security for iOS and Android platforms, including app security testing and mobile device management.',
    difficulty_level: 'intermediate',
    estimated_duration_hours: 50,
    is_premium: true,
    is_published: true
  },
  {
    title: 'IoT Security',
    slug: 'iot-security',
    description: 'Security challenges and solutions for Internet of Things devices, embedded systems security, and IoT network protection.',
    difficulty_level: 'advanced',
    estimated_duration_hours: 40,
    is_premium: true,
    is_published: true
  },
  {
    title: 'CISSP Certification Path',
    slug: 'cissp-certification-path',
    description: 'Complete preparation for the CISSP certification covering all 8 domains with practice exams and study materials.',
    difficulty_level: 'advanced',
    estimated_duration_hours: 150,
    is_premium: true,
    is_published: true
  },
  {
    title: 'Security Awareness Training',
    slug: 'security-awareness-training',
    description: 'Essential security awareness topics for all employees including phishing prevention, password security, and social engineering awareness.',
    difficulty_level: 'beginner',
    estimated_duration_hours: 20,
    is_premium: false,
    is_published: true
  }
];

async function populateLearningPaths() {
  try {
    console.log('Starting learning paths population...');

    // Check current learning paths count
    const { count: currentCount } = await supabase
      .from('learning_paths')
      .select('*', { count: 'exact', head: true });

    console.log(`Current learning paths in database: ${currentCount}`);

    // Insert learning paths
    console.log(`Inserting ${learningPaths.length} learning paths...`);

    const { data, error } = await supabase
      .from('learning_paths')
      .upsert(learningPaths, { 
        onConflict: 'slug',
        returning: 'minimal'
      });

    if (error) {
      console.error('Error inserting learning paths:', error);
      process.exit(1);
    }

    console.log('✅ Learning paths populated successfully!');

    // Verify insertion
    const { count: newCount } = await supabase
      .from('learning_paths')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    console.log(`Total published learning paths: ${newCount}`);

    // Show breakdown by difficulty
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    console.log('\nBreakdown by difficulty:');
    
    for (const difficulty of difficulties) {
      const { count } = await supabase
        .from('learning_paths')
        .select('*', { count: 'exact', head: true })
        .eq('difficulty_level', difficulty)
        .eq('is_published', true);
      
      console.log(`  ${difficulty}: ${count}`);
    }

    // Show premium vs free breakdown
    const { count: premiumCount } = await supabase
      .from('learning_paths')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)
      .eq('is_published', true);

    const { count: freeCount } = await supabase
      .from('learning_paths')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', false)
      .eq('is_published', true);

    console.log(`\nContent access:`);
    console.log(`  Premium: ${premiumCount}`);
    console.log(`  Free: ${freeCount}`);

    console.log('\n🎉 Learning paths population completed successfully!');

  } catch (error) {
    console.error('Population failed:', error);
    process.exit(1);
  }
}

populateLearningPaths();