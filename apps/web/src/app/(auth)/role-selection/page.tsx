'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, Card, CardContent } from '@/components/ui';
import { mockAuthService, getDashboardRoute, UserRole } from '@/services/mockAuth';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

const roles: RoleOption[] = [
  {
    id: 'us_owner',
    title: 'US Owner',
    description: 'Full access to merchant dashboard, transactions, partners, and settings.',
    icon: '👔',
    features: [
      'Full dashboard access',
      'Manage transactions',
      'Partner management',
      'Agreement management',
      'Payout management',
      'Reports & exports',
    ],
  },
  {
    id: 'accountant',
    title: 'Accountant',
    description: 'Access to financial data, reports, and transaction history.',
    icon: '📊',
    features: [
      'View transactions',
      'Financial reports',
      'Export data',
      'Payout tracking',
      'Read-only access to agreements',
    ],
  },
  {
    id: 'offshore_partner',
    title: 'Offshore Partner',
    description: 'Access to partner dashboard with revenue sharing and payout information.',
    icon: '🌐',
    features: [
      'Partner dashboard',
      'Revenue tracking',
      'Payout history',
      'Invoice management',
      'Multi-merchant access',
    ],
  },
  {
    id: 'read_only',
    title: 'Read-Only',
    description: 'View-only access to dashboard and reports. No editing capabilities.',
    icon: '👁️',
    features: [
      'View dashboard',
      'View transactions',
      'View reports',
      'No editing access',
      'No management access',
    ],
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockAuthService.selectRole(selectedRole);
      
      if (response.success) {
        // Get dashboard route for selected role
        const dashboardRoute = getDashboardRoute(selectedRole);
        router.push(dashboardRoute);
      } else {
        setError(response.error || 'Failed to set role. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Select Your Role"
      subtitle="Choose the role that best describes your access needs."
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="cursor-pointer"
              onClick={() => handleRoleSelect(role.id)}
            >
              <Card
                className={`transition-all ${
                  selectedRole === role.id
                    ? 'ring-2 ring-primary-600 border-primary-600'
                    : 'hover:border-gray-300'
                }`}
              >
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{role.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {role.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                    <ul className="space-y-1">
                      {role.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-xs text-gray-500 flex items-center">
                          <svg
                            className="h-3 w-3 text-green-500 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                      {role.features.length > 3 && (
                        <li className="text-xs text-gray-400">
                          +{role.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === role.id
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedRole === role.id && (
                        <svg
                          className="h-3 w-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          className="w-full"
          isLoading={loading}
          disabled={loading || !selectedRole}
        >
          Continue to Dashboard
        </Button>

        <p className="text-xs text-gray-500 text-center">
          You can change your role later in settings.
        </p>
      </div>
    </AuthLayout>
  );
}

