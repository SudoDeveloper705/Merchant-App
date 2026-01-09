'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, Input, ErrorText } from '@/components/ui';
import { mockAuthService } from '@/services/mockAuth';
import { validators } from '@/lib/validation';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    companyName?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const nameValidation = validators.required(formData.name, 'Name');
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }
    
    const emailValidation = validators.email(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }
    
    const passwordValidation = validators.password(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }
    
    const confirmPasswordValidation = validators.match(
      formData.password,
      formData.confirmPassword,
      'Passwords'
    );
    if (!confirmPasswordValidation.isValid) {
      newErrors.confirmPassword = confirmPasswordValidation.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await mockAuthService.signUp({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name,
        companyName: formData.companyName || undefined,
      });
      
      if (response.success) {
        // Redirect to email verification
        router.push(`/email-verification?email=${encodeURIComponent(formData.email)}`);
      } else {
        setErrors({ general: response.error || 'Sign up failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Get started with your free account today."
      footer={
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
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
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            required
            autoComplete="name"
          />
        </div>

        <div>
          <Input
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <Input
            type="text"
            label="Company Name (Optional)"
            placeholder="Acme Corporation"
            value={formData.companyName}
            onChange={handleChange('companyName')}
            autoComplete="organization"
          />
        </div>

        <div>
          <Input
            type="password"
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            required
            autoComplete="new-password"
            helperText="Must be at least 8 characters with uppercase, lowercase, and number"
          />
        </div>

        <div>
          <Input
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          disabled={loading}
        >
          Create Account
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-primary-600 hover:text-primary-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
            Privacy Policy
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

