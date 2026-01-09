'use client';

import { useState, FormEvent } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button, Input, Select, ErrorText } from '@/components/ui';
import { validators } from '@/lib/validation';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: { name: string; email: string; role: string }) => Promise<void>;
}

export function InviteUserModal({ isOpen, onClose, onInvite }: InviteUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; role?: string }>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

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
      await onInvite(formData);
      // Reset form
      setFormData({ name: '', email: '', role: 'viewer' });
      onClose();
    } catch (error: any) {
      setErrors({ email: error.message || 'Failed to invite user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <Card>
          <CardHeader
            title="Invite User"
            subtitle="Send an invitation to join the platform"
          />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
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
    </div>
  );
}

