"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface LoginFormProps {
  onToggleMode: () => void;
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Debug logging
  console.log('🔧 LoginForm: useAuth hook called');
  const authContext = useAuth();
  console.log('🔧 LoginForm: authContext received:', authContext);
  
  const { login, error, clearError } = authContext;
  const { handleError, handleSuccess } = useErrorHandler();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔧 LoginForm: Form submitted');
    console.log('🔧 LoginForm: login function type:', typeof login);
    
    if (!email || !password) {
      handleError("Please fill in all fields", {
        title: "Validation Error",
        description: "Both email and password are required."
      });
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      console.log('🔧 LoginForm: Calling login function');
      await login(email, password);
      console.log('🔧 LoginForm: Login successful');
      handleSuccess("Login successful! Welcome back.");
      router.push('/');
    } catch (error) {
      console.error('🔧 LoginForm: Login error:', error);
      // Error is handled by the auth context, but we can also show toast
      handleError(error, {
        title: "Login Failed",
        description: "Please check your credentials and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your BizTracker account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onToggleMode}
            className="w-full"
          >
            Don't have an account? Sign up
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 