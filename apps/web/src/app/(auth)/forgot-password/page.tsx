'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, Input, ErrorText } from '@/components/ui';
import { mockAuthService } from '@/services/mockAuth';
import { validators } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    
    const emailValidation = validators.email(email);
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.error });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await mockAuthService.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
      } else {
        setErrors({ general: response.error || 'Failed to send reset link. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent a password reset link to your email address."
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              If an account exists with <strong>{email}</strong>, you will receive password reset instructions.
            </p>
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              variant="outline"
              className="w-full"
            >
              Resend Email
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          disabled={loading}
        >
          Send Reset Link
        </Button>
      </form>
    </AuthLayout>
  );
}

