'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Lock, Mail, Zap, AlertCircle, 
  Loader2, ArrowRight 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGuestLogin = async () => {
    setError(null);
    setIsGuestLoading(true);
    
    try {
      const result = await signIn('guest', {
        redirect: false,
      });
      
      if (result?.error) {
        setError('Failed to create guest session');
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsGuestLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-800/80 backdrop-blur-lg border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Welcome Back, Courier
            </CardTitle>
            <CardDescription>
              Sign in to continue your deliveries in Polanco
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="courier@whix.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-800 px-2 text-gray-400">Or</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGuestLogin}
              disabled={isGuestLoading}
            >
              {isGuestLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating guest session...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Continue as Guest
                </>
              )}
            </Button>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-red-400 hover:text-red-300">
                  Sign up
                </Link>
              </p>
              
              <p className="text-xs text-gray-500">
                Guest users can play Chapter 1. Sign up to save progress!
              </p>
            </div>
          </CardContent>
        </Card>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-amber-900/20 border border-amber-900/50 rounded-lg"
        >
          <p className="text-sm text-amber-400 text-center">
            <strong>Tip:</strong> Guest progress is saved for 30 days. 
            Convert to a full account anytime to keep your couriers!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}