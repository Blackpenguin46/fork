'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Eye, EyeOff } from 'lucide-react';
import { getPasswordStrength } from '@/lib/auth/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showPassword: boolean;
  onTogglePassword: () => void;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showPassword,
  onTogglePassword
}) => {
  const strength = getPasswordStrength(password);
  
  const requirements = [
    {
      test: password.length >= 12,
      text: 'At least 12 characters'
    },
    {
      test: /(?=.*[a-z])/.test(password),
      text: 'One lowercase letter'
    },
    {
      test: /(?=.*[A-Z])/.test(password),
      text: 'One uppercase letter'
    },
    {
      test: /(?=.*\d)/.test(password),
      text: 'One number'
    },
    {
      test: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password),
      text: 'One special character'
    }
  ];

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Excellent';
      default:
        return 'None';
    }
  };

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
    >
      {/* Strength Meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Password Strength</span>
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-semibold ${
              strength.color === 'red' ? 'text-red-400' :
              strength.color === 'orange' ? 'text-orange-400' :
              strength.color === 'yellow' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {getStrengthText(strength.score)}
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getStrengthColor(strength.score)}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength.score / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-300 mb-2">Requirements:</p>
        {requirements.map((req, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2"
          >
            {req.test ? (
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span className={`text-sm ${req.test ? 'text-green-400' : 'text-gray-400'}`}>
              {req.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Additional Feedback */}
      {strength.feedback.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          {strength.feedback.map((feedback, index) => (
            <p key={index} className="text-xs text-gray-400">
              {feedback}
            </p>
          ))}
        </div>
      )}

      {/* Toggle Password Visibility */}
      <button
        type="button"
        onClick={onTogglePassword}
        className="mt-3 flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        {showPassword ? (
          <>
            <EyeOff className="w-3 h-3" />
            <span>Hide password</span>
          </>
        ) : (
          <>
            <Eye className="w-3 h-3" />
            <span>Show password</span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export default PasswordStrengthIndicator;