import Link from 'next/link'
import { Shield, Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Community', href: '/community' },
        { name: 'Insights', href: '/insights' },
        { name: 'Academy', href: '/academy' },
        { name: 'Dashboard', href: '/dashboard' },
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Discord Servers', href: '/community/discord' },
        { name: 'Reddit Communities', href: '/community/reddit' },
        { name: 'Forums', href: '/community/forums' },
        { name: 'Skool Communities', href: '/community/skool' },
      ]
    },
    {
      title: 'Learning',
      links: [
        { name: 'Learning Paths', href: '/academy/learning-paths' },
        { name: 'Courses', href: '/academy/courses' },
        { name: 'Videos', href: '/academy/videos' },
        { name: 'Documentation', href: '/academy/documentation' },
        { name: 'Cheat Sheets', href: '/academy/cheatsheets' },
      ]
    },
    {
      title: 'Insights',
      links: [
        { name: 'Latest News', href: '/insights/news' },
        { name: 'Data Breaches', href: '/insights/breaches' },
        { name: 'Threat Intelligence', href: '/insights/threats' },
        { name: 'Security Tools', href: '/insights/tools' },
        { name: 'Podcasts', href: '/insights/podcasts' },
        { name: 'Pricing', href: '/pricing' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ]
    }
  ]

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/cybernexacademy',
      icon: Github
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/cybernexacademy',
      icon: Twitter
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/cybernex-academy',
      icon: Linkedin
    },
    {
      name: 'Email',
      href: 'mailto:hello@cybernexacademy.com',
      icon: Mail
    }
  ]

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-cyber-cyan" />
              <div className="flex flex-col">
                <span className="font-cyber text-xl font-bold text-white">
                  Cybernex
                </span>
                <span className="font-cyber text-sm text-slate-400 -mt-1">
                  Academy
                </span>
              </div>
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm">
              Master cybersecurity with expert-led courses, hands-on labs, and a thriving community of 50,000+ professionals.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-cyber-cyan transition-colors duration-300 hover:bg-slate-800/50 rounded-lg"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-cyber-cyan transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="max-w-md">
            <h3 className="font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Get the latest cybersecurity insights, threats, and learning resources delivered to your inbox.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan focus:outline-none transition-colors"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-cyber-cyan to-cyber-magenta text-black font-medium rounded-lg hover:shadow-lg hover:shadow-cyber-cyan/25 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} Cybernex Academy. All rights reserved.
            </div>
            
            {/* Additional Links */}
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/sitemap.xml" 
                className="text-slate-400 hover:text-cyber-cyan transition-colors duration-300 flex items-center space-x-1"
                target="_blank"
              >
                <span>Sitemap</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link 
                href="/rss.xml" 
                className="text-slate-400 hover:text-cyber-cyan transition-colors duration-300 flex items-center space-x-1"
                target="_blank"
              >
                <span>RSS Feed</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <div className="text-slate-500">
                Built with ❤️ for the cybersecurity community
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cyber Grid Background Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="cyber-grid w-full h-full"></div>
      </div>
    </footer>
  )
}