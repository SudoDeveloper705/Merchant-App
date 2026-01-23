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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['revenue-splits', 'user-role-management', 'settings-legal']));

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

    // Settings & Legal submenu
    const settingsSubmenu: NavItem[] = [
      { name: 'Application Settings', href: '/merchant/settings/application' },
      { name: 'Notification Preferences', href: '/merchant/settings/notifications' },
      { name: 'Legal Terms & Disclaimers', href: '/merchant/settings/legal' },
      { name: 'Data & Security Settings', href: '/merchant/settings/security' },
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
          { name: 'Settings & Legal', href: '/merchant/settings', subItems: settingsSubmenu },
        ];
      case 'merchant_manager':
        // Manager can manage partners and agreements, view reports
        return [
          ...baseNav,
          { name: 'Partners', href: '/merchant/partners' },
          { name: 'Agreements', href: '/merchant/agreements' },
          { name: 'Revenue Splits', href: '/merchant/payouts/split-configuration', subItems: revenueSplitsSubmenu },
          { name: 'Reports', href: '/merchant/reports' },
          { name: 'Settings & Legal', href: '/merchant/settings', subItems: settingsSubmenu },
        ];
      case 'merchant_accountant':
        // Accountant focuses on financials: transactions, payouts, reports
        return [
          ...baseNav,
          { name: 'Payouts', href: '/merchant/payouts' },
          { name: 'Revenue Splits', href: '/merchant/payouts/split-configuration', subItems: revenueSplitsSubmenu },
          { name: 'Reports', href: '/merchant/reports' },
          { name: 'Settings & Legal', href: '/merchant/settings', subItems: settingsSubmenu },
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
          { name: 'Settings & Legal', href: '/merchant/settings', subItems: settingsSubmenu },
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-all duration-300">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#1e293b] shadow-lg dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-r border-gray-200 dark:border-slate-700/50 backdrop-blur-sm">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-slate-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-900/50">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Merchant App
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {safeNavigation.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleSection(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isSectionActive(item)
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/20 dark:to-indigo-500/20 text-blue-700 dark:text-blue-300 shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-200/50 dark:border-blue-500/30'
                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:shadow-sm dark:hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]'
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
                            className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive(subItem.href)
                                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-500/30 dark:to-indigo-500/30 text-blue-800 dark:text-blue-200 font-medium shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.3)] border-l-2 border-blue-500 dark:border-blue-400'
                                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:translate-x-1'
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
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/20 dark:to-indigo-500/20 text-blue-700 dark:text-blue-300 shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-200/50 dark:border-blue-500/30'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:shadow-sm dark:hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Support button */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700/50 bg-gradient-to-t from-gray-50 to-transparent dark:from-slate-800/50 dark:to-transparent">
            <a
              href="mailto:support@merchantapp.com"
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-500/30 hover:border-blue-300 dark:hover:border-blue-400/50 hover:shadow-sm dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Support
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Header with user info and logout */}
        <header className="fixed top-0 right-0 left-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700/50 z-10 shadow-sm dark:shadow-dark">
          <div className="flex items-center justify-end px-6 h-16">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600/50">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all duration-200 border border-red-200 dark:border-red-500/30 hover:border-red-300 dark:hover:border-red-400/50 hover:shadow-sm dark:hover:shadow-glow"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-500/30 hover:border-blue-300 dark:hover:border-blue-400/50 hover:shadow-sm dark:hover:shadow-glow"
              >
                Login
              </Link>
            )}
          </div>
        </header>
        <main className="pt-[100px] p-8 dark:text-slate-100">{children}</main>
      </div>
    </div>
  );
}

