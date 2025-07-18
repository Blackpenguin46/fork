'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Shield, Zap, Users, Award, TrendingUp, BookOpen } from 'lucide-react';
import PricingCard from '@/components/pricing/PricingCard';
import { SUBSCRIPTION_PLANS, SubscriptionService } from '@/lib/stripe/subscription-service';

const PricingContent: React.FC = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  const subscriptionService = useMemo(() => new SubscriptionService(), []);

  const loadCurrentPlan = useCallback(async () => {
    try {
      if (!user) return;
      const { plan } = await subscriptionService.getUserSubscription(user.id);
      setCurrentPlan(plan.id);
    } catch (error) {
      console.error('Error loading current plan:', error);
    } finally {
      setLoading(false);
    }
  }, [user, subscriptionService]);

  useEffect(() => {
    // Check for success/cancel messages
    if (searchParams.get('success') === 'true') {
      toast.success('🎉 Welcome to Cybernex Academy Pro!');
    }
    if (searchParams.get('canceled') === 'true') {
      toast.error('Payment was canceled. You can try again anytime.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      loadCurrentPlan();
    } else {
      setLoading(false);
    }
  }, [user, loadCurrentPlan]);

  const handleSelectPlan = async (planId: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Expert-Curated Content',
      description: 'Access premium cybersecurity content reviewed by industry experts'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI-Powered Learning',
      description: 'Personalized recommendations and adaptive learning paths'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Exclusive Community',
      description: 'Connect with cybersecurity professionals and industry leaders'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Certification Prep',
      description: 'Comprehensive preparation for major cybersecurity certifications'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Progress Analytics',
      description: 'Detailed insights into your learning progress and skill development'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Unlimited Access',
      description: 'Full access to all learning paths, resources, and premium features'
    }
  ];

  return (
    <div className="min-h-screen bg-deep-space-blue">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              Choose Your Learning Path
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Accelerate your cybersecurity career with our comprehensive platform. 
              Start free and upgrade when you&apos;re ready for premium features.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isPopular={plan.id === 'pro'}
              currentPlan={currentPlan}
              loading={loading}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Cybernex Academy?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our platform is designed by cybersecurity professionals for cybersecurity professionals.
              Get the tools and knowledge you need to advance your career.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors"
              >
                <div className="text-cyan-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your Pro subscription at any time. You'll continue to have access to Pro features until the end of your current billing period."
              },
              {
                question: "What's included in the free plan?",
                answer: "The free plan includes access to our community resources, basic learning content, limited bookmarks, and basic progress tracking."
              },
              {
                question: "Do you offer student discounts?",
                answer: "Yes! We offer educational discounts for students and academic institutions. Contact us with your .edu email for more information."
              },
              {
                question: "Is there a money-back guarantee?",
                answer: "Absolutely! We offer a 30-day money-back guarantee for all Pro subscriptions. If you're not satisfied, we'll refund your payment."
              },
              {
                question: "How often is content updated?",
                answer: "We add new content weekly and update existing content regularly to ensure it stays current with the latest cybersecurity trends and threats."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-400">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Advance Your Cybersecurity Career?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of cybersecurity professionals who are already accelerating their careers with Cybernex Academy.
            </p>
            {!user ? (
              <a
                href="/auth/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Get Started Free
              </a>
            ) : currentPlan === 'free' ? (
              <button
                onClick={() => handleSelectPlan('pro')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Upgrade to Pro
              </button>
            ) : (
              <p className="text-cyan-400 font-semibold">
                You&apos;re already on the Pro plan! 🎉
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const PricingPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}

export default PricingPage;