'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';

export default function SettingsPage() {
  const router = useRouter();

  const settingsCategories = [
    {
      title: 'Application Settings',
      description: 'Configure application preferences, appearance, and behavior',
      route: '/settings/application',
      icon: '⚙️',
      features: ['Theme & Language', 'Localization', 'Notifications', 'Auto Refresh'],
    },
    {
      title: 'Notification Preferences',
      description: 'Manage how and when you receive notifications',
      route: '/settings/notifications',
      icon: '🔔',
      features: ['Email Notifications', 'SMS Alerts', 'Push Notifications', 'Email Digest'],
    },
    {
      title: 'Legal Terms & Disclaimers',
      description: 'Review and accept legal documents and disclaimers',
      route: '/settings/legal',
      icon: '📄',
      features: ['Terms of Service', 'Privacy Policy', 'Financial Disclaimers', 'Acceptance Tracking'],
    },
    {
      title: 'Data & Security Settings',
      description: 'Configure security and data protection settings',
      route: '/settings/security',
      icon: '🔒',
      features: ['Two-Factor Auth', 'Password Policies', 'Data Encryption', 'Backup Settings'],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your application settings and preferences</p>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCategories.map((category) => (
            <Card key={category.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(category.route)}>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="text-4xl flex-shrink-0">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    <ul className="space-y-1 mb-4">
                      {category.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-500 flex items-center">
                          <svg className="h-3 w-3 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => router.push(category.route)}>
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

