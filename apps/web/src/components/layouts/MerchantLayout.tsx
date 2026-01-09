'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface MerchantLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  subItems?: NavItem[];
}

export function MerchantLayout({ children }: MerchantLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['revenue-splits', 'user-role-management']));

  // Role-based navigation
  const getCurrentRole = (): string => {
    if (user?.role) {
      return user.role.toLowerCase();
    }
    return 'merchant_owner'; // Default
  };

  const getNavigation = (): NavItem[] => {
    const role = getCurrentRole();

    // Revenue Splits submenu
    const revenueSplitsSubmenu: NavItem[] = [
      { name: 'Split Configuration', href: '/merchant/payouts/split-configuration' },
      { name: 'Partner Share Breakdown', href: '/merchant/payouts/partner-share' },
      { name: 'Historical Payouts', href: '/merchant/payouts/history' },
      { name: 'Pending Payouts', href: '/merchant/payouts/pending' },
      { name: 'Adjustments & Overrides', href: '/merchant/payouts/adjustments' },
      { name: 'Audit Trail', href: '/merchant/payouts/audit-trail' },
    ];

    // User & Role Management submenu
    const userManagementSubmenu: NavItem[] = [
      { name: 'User List', href: '/merchant/users' },
      { name: 'Invite User', href: '/merchant/users/invite' },
    ];

    // Base navigation items available to all roles
    const baseNav: NavItem[] = [
      { name: 'Dashboard', href: '/merchant/dashboard' },
      { name: 'Transactions', href: '/merchant/transactions' },
      { name: 'Invoices', href: '/merchant/invoices' },
    ];

    switch (role) {
      case 'merchant_owner':
        // Owner has access to everything
        return [
          ...baseNav,
          { name: 'Partners', href: '/merchant/partners' },
          { name: 'Agreements', href: '/merchant/agreements' },
          { name: 'Payouts', href: '/merchant/payouts' },
          { name: 'Revenue Splits', href: '/merchant/payouts/split-configuration', subItems: revenueSplitsSubmenu },
          { name: 'User & Role Management', href: '/merchant/users', subItems: userManagementSubmenu },
          { name: 'Reports', href: '/merchant/reports' },
        ];
      case 'merchant_manager':
        // Manager can manage partners and agreements, view reports
        return [
          ...baseNav,
          { name: 'Partners', href: '/merchant/partners' },
          { name: 'Agreements', href: '/merchant/agreements' },
          { name: 'Revenue Splits', href: '/merchant/payouts/split-configuration', subItems: revenueSplitsSubmenu },
          { name: 'Reports', href: '/merchant/reports' },
        ];
      case 'merchant_accountant':
        // Accountant focuses on financials: transactions, payouts, reports
        return [
          ...baseNav,
          { name: 'Payouts', href: '/merchant/payouts' },
          { name: 'Revenue Splits', href: '/merchant/payouts/split-configuration', subItems: revenueSplitsSubmenu },
          { name: 'Reports', href: '/merchant/reports' },
        ];
      default:
        // Default to owner navigation
        return [
          ...baseNav,
          { name: 'Partners', href: '/merchant/partners' },
          { name: 'Agreements', href: '/merchant/agreements' },
          { name: 'Payouts', href: '/merchant/payouts' },
          { name: 'Revenue Splits', href: '/merchant/payouts/split-configuration', subItems: revenueSplitsSubmenu },
          { name: 'User & Role Management', href: '/merchant/users', subItems: userManagementSubmenu },
          { name: 'Reports', href: '/merchant/reports' },
        ];
    }
  };

  const navigation = getNavigation();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');
  const isSectionActive = (item: NavItem) => {
    if (item.subItems) {
      return item.subItems.some(subItem => isActive(subItem.href));
    }
    return isActive(item.href);
  };

  const toggleSection = (itemName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedSections(newExpanded);
  };

  // Ensure navigation is always an array
  const safeNavigation = Array.isArray(navigation) ? navigation : [];

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
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {safeNavigation.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleSection(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSectionActive(item)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className={`transform transition-transform ${expandedSections.has(item.name) ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                    </button>
                    {expandedSections.has(item.name) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                              isActive(subItem.href)
                                ? 'bg-blue-100 text-blue-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            {user ? (
              <>
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
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
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

