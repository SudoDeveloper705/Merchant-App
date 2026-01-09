'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button, Input, Select, ErrorText } from '@/components/ui';
import { mockUserService } from '@/services/mockUsers';
import { validators } from '@/lib/validation';

export default function InviteUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; role?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    // Validate
    const nameValidation = validators.required(formData.name, 'Name');
    const emailValidation = validators.email(formData.email);

    if (!nameValidation.isValid || !emailValidation.isValid) {
      setErrors({
        name: nameValidation.error,
        email: emailValidation.error,
      });
      return;
    }

    setLoading(true);
    try {
      await mockUserService.inviteUser(formData);
      setSuccess(true);
      // Reset form
      setFormData({ name: '', email: '', role: 'viewer' });
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/merchant/users');
      }, 2000);
    } catch (error: any) {
      setErrors({ email: error.message || 'Failed to invite user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/merchant/users')}
              className="mb-2"
            >
              ← Back to Users
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Invite User</h1>
            <p className="mt-1 text-sm text-gray-500">Send an invitation to join the platform</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">
                Invitation sent successfully! Redirecting to user list...
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <Card>
          <CardHeader
            title="User Information"
            subtitle="Enter the details for the user you want to invite"
          />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  error={errors.name}
                  required
                  autoFocus
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  error={errors.email}
                  required
                />
              </div>

              <Select
                label="Role"
                options={[
                  { value: 'merchant_owner', label: 'Merchant Owner' },
                  { value: 'merchant_manager', label: 'Manager' },
                  { value: 'merchant_accountant', label: 'Accountant' },
                  { value: 'viewer', label: 'Viewer' },
                ]}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />

              {/* Role Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Role Permissions:</strong>
                </p>
                <ul className="mt-2 text-sm text-blue-800 list-disc list-inside space-y-1">
                  {formData.role === 'merchant_owner' && (
                    <>
                      <li>Full access to all features</li>
                      <li>Can manage users and roles</li>
                      <li>Can modify company settings</li>
                    </>
                  )}
                  {formData.role === 'merchant_manager' && (
                    <>
                      <li>Can manage partners and agreements</li>
                      <li>Can view and create transactions</li>
                      <li>Can view reports</li>
                    </>
                  )}
                  {formData.role === 'merchant_accountant' && (
                    <>
                      <li>Can view transactions and payouts</li>
                      <li>Can export reports</li>
                      <li>Read-only access to most features</li>
                    </>
                  )}
                  {formData.role === 'viewer' && (
                    <>
                      <li>Read-only access to dashboard</li>
                      <li>Can view transactions and partners</li>
                      <li>Cannot make changes</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/merchant/users')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                  Send Invitation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}

