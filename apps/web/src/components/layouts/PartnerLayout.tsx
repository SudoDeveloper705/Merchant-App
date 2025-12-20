'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePartnerAuth } from '@/contexts/PartnerAuthContext';
import { MerchantSwitcher } from '@/components/partner/MerchantSwitcher';
import { isPartnerOwner } from '@/utils/partnerRoles';

interface PartnerLayoutProps {
  children: ReactNode;
  onMerchantChange?: (merchantId: string) => void;
}

export function PartnerLayout({ children, onMerchantChange }: PartnerLayoutProps) {
  const { user, logout } = usePartnerAuth();
  const pathname = usePathname();

  // Base navigation available to all partner users
  const baseNavigation = [
    { name: 'Dashboard', href: '/partner/dashboard' },
    { name: 'Invoices', href: '/partner/invoices' },
    { name: 'Payouts', href: '/partner/payouts' },
    { name: 'Reports', href: '/partner/reports' },
  ];

  // Owner-only navigation items
  const ownerNavigation = [
    { name: 'Team', href: '/partner/team' },
  ];

  // Combine navigation based on role
  const navigation = [
    ...baseNavigation,
    ...(isPartnerOwner(user?.role) ? ownerNavigation : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Merchant App</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            {user ? (
              <>
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
                    {user.role?.toLowerCase() === 'partner_staff' && (
                      <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Read-only
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-500">Not logged in</p>
                <Link
                  href="/login"
                  className="mt-2 block w-full text-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Header with Merchant Switcher */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <MerchantSwitcher onMerchantChange={onMerchantChange} />
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

