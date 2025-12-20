'use client';

import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { useAuth } from '@/contexts/AuthContext';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import { AccountantDashboard } from '@/components/dashboard/AccountantDashboard';

export default function MerchantDashboardPage() {
  const { user, loading } = useAuth();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <MerchantLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </MerchantLayout>
    );
  }

  // Determine which dashboard to show based on user role
  const renderDashboard = () => {
    if (!user) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">Please login to view your dashboard</p>
        </div>
      );
    }

    const role = user.role?.toLowerCase();

    switch (role) {
      case 'merchant_owner':
        return <OwnerDashboard user={user} />;
      case 'merchant_manager':
        return <ManagerDashboard user={user} />;
      case 'merchant_accountant':
        return <AccountantDashboard user={user} />;
      default:
        // Default to owner dashboard if role is unknown
        return <OwnerDashboard user={user} />;
    }
  };

  return <MerchantLayout>{renderDashboard()}</MerchantLayout>;
}

