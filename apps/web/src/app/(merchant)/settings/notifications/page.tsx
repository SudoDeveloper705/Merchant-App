'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Toggle } from '@/components/settings/Toggle';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Select, Input } from '@/components/ui';
import { mockSettingsService, NotificationPreferences } from '@/services/mockSettings';

export default function NotificationPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const data = await mockSettingsService.getNotificationPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailToggle = async (key: keyof NotificationPreferences['email'], value: boolean) => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const updated = await mockSettingsService.updateNotificationPreferences({
        email: { ...preferences.email, [key]: value },
      });
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to update preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSMSToggle = async (key: keyof NotificationPreferences['sms'], value: boolean) => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const updated = await mockSettingsService.updateNotificationPreferences({
        sms: { ...preferences.sms, [key]: value },
      });
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to update preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async (key: keyof NotificationPreferences['push'], value: boolean) => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const updated = await mockSettingsService.updateNotificationPreferences({
        push: { ...preferences.push, [key]: value },
      });
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to update preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDigestChange = async (key: keyof NotificationPreferences['digest'], value: any) => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const updated = await mockSettingsService.updateNotificationPreferences({
        digest: { ...preferences.digest, [key]: value },
      });
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to update preference:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !preferences) {
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
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="mt-1 text-sm text-gray-500">Configure how and when you receive notifications</p>
        </div>

        {/* Email Notifications */}
        <FormSection title="Email Notifications">
          <div className="space-y-4">
            <Toggle
              label="Transactions"
              description="Receive email notifications for transaction events"
              checked={preferences.email.transactions}
              onChange={(checked) => handleEmailToggle('transactions', checked)}
              saving={saving}
            />
            <Toggle
              label="Payouts"
              description="Get notified when payouts are processed"
              checked={preferences.email.payouts}
              onChange={(checked) => handleEmailToggle('payouts', checked)}
              saving={saving}
            />
            <Toggle
              label="Invoices"
              description="Receive notifications for invoice updates"
              checked={preferences.email.invoices}
              onChange={(checked) => handleEmailToggle('invoices', checked)}
              saving={saving}
            />
            <Toggle
              label="Alerts"
              description="Critical alerts and security notifications"
              checked={preferences.email.alerts}
              onChange={(checked) => handleEmailToggle('alerts', checked)}
              saving={saving}
            />
            <Toggle
              label="Reports"
              description="Weekly and monthly report summaries"
              checked={preferences.email.reports}
              onChange={(checked) => handleEmailToggle('reports', checked)}
              saving={saving}
            />
            <Toggle
              label="Marketing"
              description="Product updates and promotional emails"
              checked={preferences.email.marketing}
              onChange={(checked) => handleEmailToggle('marketing', checked)}
              saving={saving}
            />
          </div>
        </FormSection>

        {/* SMS Notifications */}
        <FormSection title="SMS Notifications">
          <div className="space-y-4">
            <Toggle
              label="Transactions"
              description="Receive SMS for important transaction events"
              checked={preferences.sms.transactions}
              onChange={(checked) => handleSMSToggle('transactions', checked)}
              saving={saving}
            />
            <Toggle
              label="Payouts"
              description="SMS notifications for payout processing"
              checked={preferences.sms.payouts}
              onChange={(checked) => handleSMSToggle('payouts', checked)}
              saving={saving}
            />
            <Toggle
              label="Alerts"
              description="Critical alerts via SMS"
              checked={preferences.sms.alerts}
              onChange={(checked) => handleSMSToggle('alerts', checked)}
              saving={saving}
            />
          </div>
        </FormSection>

        {/* Push Notifications */}
        <FormSection title="Push Notifications">
          <div className="space-y-4">
            <Toggle
              label="Transactions"
              description="Browser push notifications for transactions"
              checked={preferences.push.transactions}
              onChange={(checked) => handlePushToggle('transactions', checked)}
              saving={saving}
            />
            <Toggle
              label="Payouts"
              description="Push notifications for payout updates"
              checked={preferences.push.payouts}
              onChange={(checked) => handlePushToggle('payouts', checked)}
              saving={saving}
            />
            <Toggle
              label="Alerts"
              description="Push notifications for alerts"
              checked={preferences.push.alerts}
              onChange={(checked) => handlePushToggle('alerts', checked)}
              saving={saving}
            />
          </div>
        </FormSection>

        {/* Digest Settings */}
        <FormSection title="Email Digest">
          <div className="space-y-4">
            <Toggle
              label="Enable Email Digest"
              description="Receive a summary of activities in a single email"
              checked={preferences.digest.enabled}
              onChange={(checked) => handleDigestChange('enabled', checked)}
              saving={saving}
            />
            {preferences.digest.enabled && (
              <div className="ml-6 space-y-4">
                <Select
                  label="Frequency"
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                  ]}
                  value={preferences.digest.frequency}
                  onChange={(e) => handleDigestChange('frequency', e.target.value)}
                />
                <Input
                  label="Time"
                  type="time"
                  value={preferences.digest.time}
                  onChange={(e) => handleDigestChange('time', e.target.value)}
                />
              </div>
            )}
          </div>
        </FormSection>
      </div>
    </DashboardLayout>
  );
}

