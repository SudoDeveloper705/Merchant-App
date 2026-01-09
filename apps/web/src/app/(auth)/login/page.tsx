'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, Input, ErrorText } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { validateDummyCredentials } from '@/lib/dummyAuth';
import { validators } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const emailValidation = validators.email(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }
    
    const passwordValidation = validators.required(password, 'Password');
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Check for dummy credentials first
      const dummyUser = validateDummyCredentials(email, password);
      
      if (dummyUser) {
        // Use AuthContext login which handles dummy credentials
        await login({ email, password });
        // Redirect is handled by AuthContext
        return;
      }
      
      // Try real API login via AuthContext
      await login({ email, password });
      // Redirect is handled by AuthContext
    } catch (error: any) {
      setErrors({ general: error.message || 'Login failed. Please check your credentials.' });
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back! Please sign in to your account."
      footer={
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-700">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dummy Credentials Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Test Credentials</h3>
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Merchant Owner:</strong> owner@merchant.com / owner123</p>
            <p><strong>Merchant Manager:</strong> manager@merchant.com / manager123</p>
            <p><strong>Merchant Accountant:</strong> accountant@merchant.com / accountant123</p>
            <p className="mt-2 pt-2 border-t border-blue-300"><strong>Partner Owner:</strong> owner@partner.com / owner123</p>
            <p><strong>Partner Staff:</strong> staff@partner.com / staff123</p>
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ErrorText>{errors.general}</ErrorText>
          </div>
        )}

        <div>
          <Input
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            required
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          disabled={loading}
        >
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
}

