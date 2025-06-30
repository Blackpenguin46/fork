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

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Cybernex Academy',
  description: 'Premier cybersecurity learning platform offering comprehensive training, certification preparation, and expert community.',
  url: 'https://cybernexacademy.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://cybernexacademy.com/logo.png'
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
  courseMode: ['online'],
  educationalCredentialAwarded: 'Certificate',
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Cybersecurity Certification'
  },
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student'
  },
  provider: {
    '@type': 'Organization',
    name: 'Cybernex Academy'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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