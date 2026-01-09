'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, Input, ErrorText } from '@/components/ui';
import { mockAuthService } from '@/services/mockAuth';

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<{ code?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setErrors({});
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      setErrors({ code: 'Please enter the complete 6-digit code' });
      return;
    }
    
    if (!email) {
      setErrors({ general: 'Email address is required' });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await mockAuthService.verifyEmail({
        email,
        code: codeString,
      });
      
      if (response.success) {
        // Redirect to role selection
        router.push('/role-selection');
      } else {
        setErrors({ general: response.error || 'Invalid verification code. Please try again.' });
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    setResending(true);
    setResendSuccess(false);
    
    try {
      const response = await mockAuthService.resendVerificationCode(email);
      if (response.success) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (error) {
      // Handle error silently or show message
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a verification code to ${email || 'your email'}`}
      footer={
        <p className="text-sm text-gray-600">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
          {resendSuccess && (
            <span className="ml-2 text-green-600">✓ Code sent!</span>
          )}
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
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter verification code
          </label>
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`
                  w-12 h-14 text-center text-2xl font-semibold
                  border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${errors.code && index === 0 ? 'border-red-500' : 'border-gray-300'}
                `}
                required
                autoFocus={index === 0}
              />
            ))}
          </div>
          {errors.code && (
            <ErrorText className="text-center mt-2">{errors.code}</ErrorText>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          disabled={loading}
        >
          Verify Email
        </Button>

        <div className="text-center">
          <Link href="/login">
            <Button variant="ghost" type="button">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

