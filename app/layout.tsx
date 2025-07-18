import type { Metadata } from 'next'
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cybernexacademy.com'),
  title: {
    default: 'Cybernex Academy - Premier Cybersecurity Learning Platform & Community',
    template: '%s | Cybernex Academy'
  },
  description: 'Master cybersecurity with Cybernex Academy. Access premium learning paths, expert communities, latest threat intelligence, and comprehensive resources. Join 50,000+ cybersecurity professionals.',
  keywords: [
    'cybersecurity training',
    'ethical hacking',
    'penetration testing',
    'cybersecurity certification',
    'information security',
    'cyber threat intelligence',
    'security operations',
    'incident response',
    'malware analysis',
    'network security',
    'cloud security',
    'cybersecurity community',
    'CISSP training',
    'CEH certification',
    'Security+ preparation',
    'cybersecurity learning',
    'infosec training',
    'cybersecurity bootcamp',
    'security awareness training',
    'cyber defense'
  ],
  authors: [{ name: 'Cybernex Academy Team' }],
  creator: 'Cybernex Academy',
  publisher: 'Cybernex Academy',
  category: 'Education',
  classification: 'Cybersecurity Education Platform',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cybernexacademy.com',
    siteName: 'Cybernex Academy',
    title: 'Cybernex Academy - Premier Cybersecurity Learning Platform',
    description: 'Master cybersecurity with expert-led courses, hands-on labs, and a thriving community of 50,000+ professionals. Start your cybersecurity journey today.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cybernex Academy - Cybersecurity Training Platform',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cybernexacademy',
    creator: '@cybernexacademy',
    title: 'Cybernex Academy - Master Cybersecurity Skills',
    description: 'Join 50,000+ cybersecurity professionals. Premium courses, expert communities, and latest threat intelligence.',
    images: ['/twitter-image.png']
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://cybernexacademy.com',
    languages: {
      'en-US': 'https://cybernexacademy.com',
    }
  },
  other: {
    'msapplication-TileColor': '#0A192F',
    'theme-color': '#00FFFF',
  }
}

// Enhanced Structured Data for AI Search Optimization
const structuredData = [
  // Primary Organization Schema
  {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': 'https://cybernexacademy.com/#organization',
    name: 'Cybernex Academy',
    alternateName: 'CyberNex Academy',
    description: 'Premier cybersecurity learning platform offering comprehensive training, certification preparation, and expert community with 1000+ resources for cybersecurity professionals.',
    url: 'https://cybernexacademy.com',
    mainEntityOfPage: 'https://cybernexacademy.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://cybernexacademy.com/logo.png',
      width: 512,
      height: 512
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://cybernexacademy.com/og-image.png',
      width: 1200,
      height: 630
    },
    sameAs: [
      'https://twitter.com/cybernexacademy',
      'https://linkedin.com/company/cybernex-academy',
      'https://github.com/cybernexacademy'
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US'
    },
    courseMode: ['online', 'self-paced', 'instructor-led'],
    educationalCredentialAwarded: 'Certificate',
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Cybersecurity Certification'
    },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: ['student', 'professional', 'beginner', 'expert']
    },
    provider: {
      '@type': 'Organization',
      name: 'Cybernex Academy'
    },
    areaServed: 'Worldwide',
    knowsAbout: [
      'Cybersecurity',
      'Ethical Hacking',
      'Penetration Testing',
      'Network Security',
      'Cloud Security',
      'Incident Response',
      'Malware Analysis',
      'Digital Forensics',
      'Security Operations',
      'Threat Intelligence',
      'Risk Management',
      'Compliance',
      'CISSP',
      'CEH',
      'Security+',
      'OSCP',
      'SANS',
      'Information Security'
    ],
    offers: [
      {
        '@type': 'Offer',
        category: 'Educational Services',
        name: 'Premium Cybersecurity Training',
        description: 'Comprehensive cybersecurity education with expert-led courses, hands-on labs, and certification preparation.'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '50000',
      bestRating: '5',
      worstRating: '1'
    },
    slogan: 'Master Cybersecurity. Secure the Future.',
    foundingDate: '2023',
    numberOfEmployees: '50-100',
    industry: 'Education Technology',
    specialty: 'Cybersecurity Education and Training'
  },
  // Website Schema
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://cybernexacademy.com/#website',
    url: 'https://cybernexacademy.com',
    name: 'Cybernex Academy',
    description: 'Premier cybersecurity learning platform with 1000+ resources, expert communities, and comprehensive training programs.',
    publisher: {
      '@id': 'https://cybernexacademy.com/#organization'
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://cybernexacademy.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    ],
    inLanguage: 'en-US',
    copyrightYear: '2024',
    genre: ['Education', 'Technology', 'Cybersecurity'],
    keywords: 'cybersecurity training, ethical hacking, penetration testing, certification, CISSP, CEH, Security+, network security, cloud security'
  },
  // Educational Course Catalog
  {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': 'https://cybernexacademy.com/#courses',
    name: 'Cybersecurity Professional Training Program',
    description: 'Comprehensive cybersecurity training covering ethical hacking, penetration testing, incident response, and security operations.',
    provider: {
      '@id': 'https://cybernexacademy.com/#organization'
    },
    courseMode: 'online',
    educationalLevel: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    about: [
      'Cybersecurity Fundamentals',
      'Ethical Hacking Techniques',
      'Penetration Testing Methodologies',
      'Network Security Implementation',
      'Cloud Security Best Practices',
      'Incident Response Procedures',
      'Digital Forensics Analysis',
      'Threat Intelligence Analysis',
      'Security Operations Center (SOC)',
      'Compliance and Risk Management'
    ],
    teaches: [
      'How to identify and exploit security vulnerabilities',
      'Network penetration testing techniques',
      'Incident response and forensics procedures',
      'Cloud security implementation',
      'Security tool usage and configuration',
      'Threat hunting methodologies',
      'Compliance framework implementation'
    ],
    timeRequired: 'P6M',
    totalTime: 'PT200H',
    numberOfCredits: 20,
    competencyRequired: 'Basic computer networking knowledge',
    educationalCredentialAwarded: 'Cybersecurity Professional Certificate',
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        instructor: {
          '@type': 'Person',
          name: 'Cybersecurity Experts',
          description: 'Industry-leading cybersecurity professionals with 10+ years experience'
        }
      }
    ]
  },
  // FAQ Schema for AI Understanding
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://cybernexacademy.com/#faq',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Cybernex Academy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cybernex Academy is a premier cybersecurity learning platform offering comprehensive training, certification preparation, and expert community access. We provide 1000+ resources covering ethical hacking, penetration testing, network security, cloud security, incident response, and more. Our platform serves over 50,000 cybersecurity professionals worldwide with expert-led courses, hands-on labs, and industry-recognized certifications.'
        }
      },
      {
        '@type': 'Question',
        name: 'What cybersecurity certifications can I prepare for at Cybernex Academy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cybernex Academy offers comprehensive preparation for major cybersecurity certifications including CISSP, CEH (Certified Ethical Hacker), Security+, OSCP, GCIH, GSEC, GPEN, GWAPT, and many other industry-recognized credentials. Our courses are designed by certified professionals and include hands-on labs, practice exams, and expert mentorship.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does Cybernex Academy offer hands-on cybersecurity training?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Cybernex Academy specializes in hands-on cybersecurity training. Our platform includes virtual labs for penetration testing, network security, incident response, malware analysis, and digital forensics. Students get practical experience with real-world scenarios, industry-standard tools like Metasploit, Wireshark, Nmap, Burp Suite, and access to capture-the-flag (CTF) challenges.'
        }
      },
      {
        '@type': 'Question',
        name: 'What makes Cybernex Academy different from other cybersecurity training platforms?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cybernex Academy stands out with our comprehensive approach combining expert-led instruction, hands-on labs, active community support, and real-world application. We offer 1000+ curated resources, personalized learning paths, industry mentorship, job placement assistance, and continuous updates on emerging threats and technologies. Our platform serves both beginners and experienced professionals with tailored content for all skill levels.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can beginners learn cybersecurity at Cybernex Academy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! Cybernex Academy is designed for all skill levels, from complete beginners to experienced professionals. We offer foundational courses covering cybersecurity fundamentals, basic networking, and introductory ethical hacking. Our structured learning paths guide beginners through essential concepts with hands-on exercises, mentorship, and progressive skill building to advanced topics like penetration testing and incident response.'
        }
      }
    ]
  }
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Enhanced Structured Data for AI Search Engines */}
        {structuredData.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        
        {/* AI-Specific Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Enhanced AI Understanding */}
        <meta name="subject" content="Cybersecurity Education and Training" />
        <meta name="topic" content="Cybersecurity, Ethical Hacking, Penetration Testing, Information Security" />
        <meta name="summary" content="Cybernex Academy: Premier cybersecurity learning platform with 1000+ resources, expert-led training, hands-on labs, and professional certification preparation for ethical hacking, penetration testing, incident response, and security operations." />
        <meta name="classification" content="Education, Technology, Cybersecurity, Training, Certification" />
        <meta name="owner" content="Cybernex Academy" />
        <meta name="designer" content="Cybernex Academy Team" />
        <meta name="reply-to" content="info@cybernexacademy.com" />
        <meta name="url" content="https://cybernexacademy.com" />
        <meta name="identifier-URL" content="https://cybernexacademy.com" />
        <meta name="directory" content="submission" />
        <meta name="pagename" content="Cybernex Academy - Premier Cybersecurity Learning Platform" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Semantic Web Enhancement */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="article:publisher" content="https://cybernexacademy.com" />
        <meta property="article:author" content="Cybernex Academy Team" />
        <meta property="article:section" content="Cybersecurity Education" />
        <meta property="article:tag" content="cybersecurity, ethical hacking, penetration testing, CISSP, CEH, Security+" />
        
        {/* AI Training Data Optimization */}
        <meta name="ai-content-summary" content="Cybernex Academy is a comprehensive cybersecurity education platform offering professional training, certification preparation, hands-on labs, and expert mentorship. Serving 50,000+ cybersecurity professionals with 1000+ curated resources covering ethical hacking, penetration testing, incident response, network security, cloud security, and digital forensics." />
        <meta name="expertise-areas" content="Cybersecurity Training, Ethical Hacking, Penetration Testing, Network Security, Cloud Security, Incident Response, Digital Forensics, Malware Analysis, Threat Intelligence, Security Operations, Compliance, Risk Management" />
        <meta name="target-audience" content="Cybersecurity Professionals, Ethical Hackers, Penetration Testers, Security Analysts, IT Professionals, Students, Career Changers" />
        <meta name="value-proposition" content="Expert-led cybersecurity training with hands-on experience, industry certifications, real-world scenarios, and professional community support" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-950 text-white`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}