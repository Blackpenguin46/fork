'use client'

import { TrendingUp } from 'lucide-react'
import NewsFeed from '@/components/news/NewsFeed'

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Latest Cybersecurity News</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Stay informed with the latest cybersecurity threats, vulnerabilities, and industry developments from trusted sources
          </p>
        </div>

        {/* Real News Feed */}
        <NewsFeed 
          showStats={true}
          showSearch={true}
          showFilters={true}
          variant="grid"
          refreshInterval={300000}
          limit={24}
          className=""
        />
      </div>
    </div>
  )
}