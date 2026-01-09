'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Toggle } from '@/components/settings/Toggle';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Select, Input } from '@/components/ui';
import { mockSettingsService, ApplicationSettings } from '@/services/mockSettings';

export default function ApplicationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ApplicationSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await mockSettingsService.getApplicationSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof ApplicationSettings, value: boolean) => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const updated = await mockSettingsService.updateApplicationSettings({ [key]: value });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectChange = async (key: keyof ApplicationSettings, value: string | number) => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const updated = await mockSettingsService.updateApplicationSettings({ [key]: value });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure application preferences and behavior</p>
        </div>

        {/* Appearance */}
        <FormSection title="Appearance">
          <div className="space-y-4">
            <Select
              label="Theme"
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto (System)' },
              ]}
              value={settings.theme}
              onChange={(e) => handleSelectChange('theme', e.target.value)}
            />
            <Select
              label="Language"
              options={[
                { value: 'en-US', label: 'English (US)' },
                { value: 'en-GB', label: 'English (UK)' },
                { value: 'es-ES', label: 'Spanish' },
                { value: 'fr-FR', label: 'French' },
              ]}
              value={settings.language}
              onChange={(e) => handleSelectChange('language', e.target.value)}
            />
            <Toggle
              label="Compact Mode"
              description="Use a more compact layout to display more information"
              checked={settings.compactMode}
              onChange={(checked) => handleToggle('compactMode', checked)}
              saving={saving}
            />
          </div>
        </FormSection>

        {/* Localization */}
        <FormSection title="Localization">
          <div className="space-y-4">
            <Select
              label="Timezone"
              options={[
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'UTC', label: 'UTC' },
              ]}
              value={settings.timezone}
              onChange={(e) => handleSelectChange('timezone', e.target.value)}
            />
            <Select
              label="Date Format"
              options={[
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
              ]}
              value={settings.dateFormat}
              onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
            />
            <Select
              label="Currency"
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'JPY', label: 'JPY (¥)' },
              ]}
              value={settings.currency}
              onChange={(e) => handleSelectChange('currency', e.target.value)}
            />
          </div>
        </FormSection>

        {/* Notifications */}
        <FormSection title="Notifications">
          <div className="space-y-4">
            <Toggle
              label="Enable Notifications"
              description="Receive notifications for important events"
              checked={settings.enableNotifications}
              onChange={(checked) => handleToggle('enableNotifications', checked)}
              saving={saving}
            />
            <Toggle
              label="Email Alerts"
              description="Send email notifications for alerts and updates"
              checked={settings.enableEmailAlerts}
              onChange={(checked) => handleToggle('enableEmailAlerts', checked)}
              saving={saving}
            />
            <Toggle
              label="SMS Alerts"
              description="Send SMS notifications for critical alerts"
              checked={settings.enableSMSAlerts}
              onChange={(checked) => handleToggle('enableSMSAlerts', checked)}
              saving={saving}
            />
          </div>
        </FormSection>

        {/* Data & Refresh */}
        <FormSection title="Data & Refresh">
          <div className="space-y-4">
            <Toggle
              label="Auto Refresh"
              description="Automatically refresh data at regular intervals"
              checked={settings.autoRefresh}
              onChange={(checked) => handleToggle('autoRefresh', checked)}
              saving={saving}
            />
            {settings.autoRefresh && (
              <div className="ml-6">
                <Input
                  label="Refresh Interval (seconds)"
                  type="number"
                  min="10"
                  max="300"
                  value={settings.refreshInterval}
                  onChange={(e) => handleSelectChange('refreshInterval', parseInt(e.target.value) || 30)}
                />
              </div>
            )}
          </div>
        </FormSection>

        {/* User Experience */}
        <FormSection title="User Experience">
          <div className="space-y-4">
            <Toggle
              label="Show Tutorials"
              description="Display helpful tutorials and tips"
              checked={settings.showTutorials}
              onChange={(checked) => handleToggle('showTutorials', checked)}
              saving={saving}
            />
          </div>
        </FormSection>
      </div>
    </DashboardLayout>
  );
}

