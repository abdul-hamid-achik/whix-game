'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalText, CRTEffect } from '../effects/VisualEffects';
import { NeuraButton, NeuraInput } from '@/components/neura';
import { cn } from '@/lib/utils';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Check, 
  Clock,
  Shield,
  User
} from 'lucide-react';
import { useLoginContent } from '@/lib/hooks/useUIContent';

interface CorporateLoginScreenProps {
  onLogin: (credentials: { email: string; password: string; }) => void;
  onSkip?: () => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function CorporateLoginScreen({ 
  onLogin, 
  onSkip,
  isLoading = false,
  error,
  className 
}: CorporateLoginScreenProps) {
  const [credentials, setCredentials] = React.useState({ 
    email: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<'welcome' | 'login' | 'authenticating' | 'success'>('welcome');
  const [currentMessage, setCurrentMessage] = React.useState(0);
  
  // Load content from CMS
  const { branding, messages, isLoading: contentLoading } = useLoginContent();
  const securityMessages = messages.auth?.messages || [
    "Verifying employee credentials...",
    "Checking access permissions...",
    "Validating security clearance...",
    "Establishing secure session...",
    "Welcome to WHIX Systems."
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.email && credentials.password) {
      setCurrentStep('authenticating');
      onLogin(credentials);
    }
  };

  const handleSkipDemo = () => {
    setCredentials({ 
      email: 'demo.courier@whix.corp', 
      password: 'courier123' 
    });
    setCurrentStep('authenticating');
    // Simulate successful demo login
    setTimeout(() => {
      onLogin({ email: 'demo.courier@whix.corp', password: 'courier123' });
    }, 3000);
  };

  React.useEffect(() => {
    if (currentStep === 'authenticating') {
      const interval = setInterval(() => {
        setCurrentMessage(prev => {
          if (prev < securityMessages.length - 1) {
            return prev + 1;
          } else {
            setCurrentStep('success');
            return prev;
          }
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [currentStep, securityMessages.length]);

  return (
    <CRTEffect className={cn("min-h-screen w-full", className)}>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {currentStep === 'welcome' && (
              <WelcomeScreen onContinue={() => setCurrentStep('login')} />
            )}
            
            {currentStep === 'login' && (
              <LoginForm
                credentials={credentials}
                setCredentials={setCredentials}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                onSubmit={handleSubmit}
                onSkipDemo={handleSkipDemo}
                isLoading={isLoading}
                error={error}
              />
            )}
            
            {currentStep === 'authenticating' && (
              <AuthenticatingScreen message={securityMessages[currentMessage]} />
            )}
            
            {currentStep === 'success' && (
              <SuccessScreen />
            )}
          </AnimatePresence>
        </div>

        {/* Corporate Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950" />
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </div>
    </CRTEffect>
  );
}

// Welcome Screen Component
function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-8"
    >
      <div>
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl font-bold text-amber-500 font-mono mb-4"
        >
          ₩HIX
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-300 mb-2">
          WORKFORCE HYPEROPTIMIZATION INTERFACE X
        </h1>
        <p className="text-gray-500 text-sm">
          "Your efficiency is our profitability"
        </p>
      </div>

      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 text-amber-400">
          <Shield className="w-5 h-5" />
          <span className="font-mono text-sm">SECURE CORPORATE LOGIN</span>
        </div>
        
        <div className="text-left space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span>End-to-end encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span>Biometric verification</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span>24/7 employee monitoring</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 border-t border-gray-700 pt-4">
          <p>By logging in, you agree to WHIX's Employee Surveillance Policy and waive all privacy rights as outlined in Contract Section 47.3b.</p>
        </div>
      </div>

      <NeuraButton
        onClick={onContinue}
        className="w-full"
        size="lg"
      >
        <User className="w-4 h-4 mr-2" />
        Access Employee Portal
      </NeuraButton>

      <div className="text-xs text-gray-500">
        <p>WHIX Corp. All rights reserved. Employee ID required.</p>
      </div>
    </motion.div>
  );
}

// Login Form Component
export function LoginForm({
  credentials,
  setCredentials,
  showPassword,
  setShowPassword,
  onSubmit,
  onSkipDemo,
  isLoading,
  error
}: {
  credentials: { email: string; password: string; };
  setCredentials: (creds: { email: string; password: string; }) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSkipDemo: () => void;
  isLoading: boolean;
  error?: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">EMPLOYEE LOGIN</h2>
        <p className="text-gray-400 text-sm">Enter your corporate credentials</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-mono text-gray-400 mb-2">
            Employee Email
          </label>
          <NeuraInput
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            placeholder="firstname.lastname@whix.corp"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-gray-400 mb-2">
            Corporate Password
          </label>
          <div className="relative">
            <NeuraInput
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter secure password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 border border-red-500/50 rounded p-3 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}

        <NeuraButton
          type="submit"
          className="w-full"
          disabled={isLoading || !credentials.email || !credentials.password}
        >
          {isLoading ? 'Authenticating...' : 'Login to WHIX'}
        </NeuraButton>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-gray-950 px-2 text-gray-500">OR</span>
        </div>
      </div>

      <NeuraButton
        variant="outline"
        onClick={onSkipDemo}
        className="w-full"
        disabled={isLoading}
      >
        <Clock className="w-4 h-4 mr-2" />
        Demo Access (Skip Login)
      </NeuraButton>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Forgot password? Contact your supervisor.</p>
        <p>• All login attempts are monitored and recorded.</p>
        <p>• Unauthorized access will result in immediate termination.</p>
      </div>
    </motion.div>
  );
}

// Authenticating Screen Component
function AuthenticatingScreen({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-8"
    >
      <div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mb-6"
        />
        
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">AUTHENTICATING</h2>
        
        <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
          <TerminalText
            text={message}
            speed={30}
            className="text-cyan-400"
          />
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span>Secure connection established</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <span>Identity verified</span>
        </div>
      </div>
    </motion.div>
  );
}

// Success Screen Component
function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
      >
        <Check className="w-8 h-8 text-white" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">ACCESS GRANTED</h2>
        <p className="text-gray-400">Welcome to WHIX Courier Hub</p>
      </div>

      <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 space-y-3">
        <div className="text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Employee Status:</span>
            <span className="text-green-400">ACTIVE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Shift Status:</span>
            <span className="text-amber-400">ON DUTY</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Performance Rating:</span>
            <span className="text-blue-400">ACCEPTABLE</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p>Initializing courier interface...</p>
      </div>
    </motion.div>
  );
}