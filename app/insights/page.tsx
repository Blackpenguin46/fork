'use client'

import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  AlertCircle, 
  Newspaper, 
  Activity,
  Shield,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import NewsFeed from '@/components/news/NewsFeed'

export default function InsightsPage() {
  const { user } = useAuth()
  const subscriptionData = useSubscription()
  const { canAccessPremiumResources } = subscriptionData || { canAccessPremiumResources: false }

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">Cybersecurity Insights</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Stay updated with the latest cybersecurity news, threat intelligence, and industry insights from leading sources
          </p>
        </div>

        {/* RSS News Feed */}
        <NewsFeed 
          showStats={true}
          showSearch={true}
          showFilters={true}
          variant="grid"
          refreshInterval={300000}
          className=""
        />

        {/* Subscribe Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-cyan-500/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-white">Stay Informed</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Get the latest cybersecurity insights delivered to your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-gray-300 mb-4">
                    Join thousands of cybersecurity professionals who rely on our insights to stay ahead of emerging threats and industry trends.
                  </p>
                  <div className="flex space-x-2">
                    <Button asChild>
                      <Link href="/pricing">
                        Upgrade to Pro
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard">
                        View Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}