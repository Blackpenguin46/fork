'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SubscriptionPlan } from '@/lib/stripe/subscription-service';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  currentPlan?: string;
  loading?: boolean;
  onSelectPlan: (planId: string) => Promise<void>;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isPopular = false,
  currentPlan,
  loading = false,
  onSelectPlan
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const isCurrentPlan = currentPlan === plan.id;
  const isFreePlan = plan.price === 0;

  const handleSelectPlan = async () => {
    if (!user) {
      toast.error('Please log in to select a plan');
      router.push('/auth/login');
      return;
    }

    if (isCurrentPlan) {
      return;
    }

    if (isFreePlan) {
      toast.success('You are already on the free plan!');
      return;
    }

    setIsProcessing(true);
    try {
      await onSelectPlan(plan.id);
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to select plan. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isCurrentPlan) return 'Current Plan';
    if (isFreePlan) return 'Get Started';
    return 'Upgrade to Pro';
  };

  const getButtonClass = () => {
    const baseClass = 'w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    if (isCurrentPlan) {
      return `${baseClass} bg-gray-600 text-gray-300 cursor-not-allowed`;
    }
    
    if (isPopular) {
      return `${baseClass} bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105`;
    }
    
    return `${baseClass} bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-gray-500`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-gray-800/50 backdrop-blur-sm border rounded-2xl p-8 ${
        isPopular 
          ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20' 
          : 'border-gray-700'
      } ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Current Plan
          </div>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          {isFreePlan ? (
            <Zap className="w-8 h-8 text-gray-400" />
          ) : (
            <Crown className="w-8 h-8 text-yellow-400" />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-gray-400 mb-6">{plan.description}</p>
        
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-bold text-white">${plan.price}</span>
          <span className="text-gray-400 ml-2">/{plan.interval}</span>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              isPopular ? 'bg-cyan-500' : 'bg-gray-600'
            }`}>
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-300">{feature}</span>
          </motion.div>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={handleSelectPlan}
        disabled={isCurrentPlan || isProcessing || loading}
        className={getButtonClass()}
      >
        {getButtonText()}
      </button>

      {/* Additional Info */}
      {!isFreePlan && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PricingCard;