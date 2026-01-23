'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Toggle } from '@/components/settings/Toggle';
import { SecurityWarning } from '@/components/settings/SecurityWarning';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Input, Select } from '@/components/ui';
import { mockSettingsService, SecuritySettings } from '@/services/mockSettings';

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await mockSettingsService.getSecuritySettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof SecuritySettings, value: boolean) => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const updated = await mockSettingsService.updateSecuritySettings({ [key]: value });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNumberChange = async (key: keyof SecuritySettings, value: number) => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const updated = await mockSettingsService.updateSecuritySettings({ [key]: value });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectChange = async (key: keyof SecuritySettings, value: string) => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const updated = await mockSettingsService.updateSecuritySettings({ [key]: value });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <MerchantLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data & Security Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure security and data protection settings</p>
        </div>

        {/* Security Warning */}
        <SecurityWarning
          title="Security Notice"
          message="Changes to security settings may affect your account access. Please review all changes carefully before saving."
          severity="warning"
        />

        {/* Authentication */}
        <FormSection title="Authentication">
          <div className="space-y-4">
            <Toggle
              label="Two-Factor Authentication"
              description="Require a second authentication factor for login"
              checked={settings.twoFactorAuth}
              onChange={(checked) => handleToggle('twoFactorAuth', checked)}
              saving={saving}
            />
            {!settings.twoFactorAuth && (
              <SecurityWarning
                title="Two-Factor Authentication Recommended"
                message="Enabling two-factor authentication significantly improves account security. We strongly recommend enabling this feature."
                severity="warning"
                className="mt-4"
              />
            )}
            <div className="ml-6 space-y-4">
              <Input
                label="Session Timeout (minutes)"
                type="number"
                min="5"
                max="480"
                value={settings.sessionTimeout}
                onChange={(e) => handleNumberChange('sessionTimeout', parseInt(e.target.value) || 30)}
              />
              <Input
                label="Password Expiry (days)"
                type="number"
                min="30"
                max="365"
                value={settings.passwordExpiry}
                onChange={(e) => handleNumberChange('passwordExpiry', parseInt(e.target.value) || 90)}
              />
              <Toggle
                label="Require Strong Password"
                description="Enforce password complexity requirements"
                checked={settings.requireStrongPassword}
                onChange={(checked) => handleToggle('requireStrongPassword', checked)}
                saving={saving}
              />
            </div>
          </div>
        </FormSection>

        {/* Alerts & Monitoring */}
        <FormSection title="Alerts & Monitoring">
          <div className="space-y-4">
            <Toggle
              label="Login Alerts"
              description="Receive notifications for new login attempts"
              checked={settings.loginAlerts}
              onChange={(checked) => handleToggle('loginAlerts', checked)}
              saving={saving}
            />
            <Input
              label="Audit Log Retention (days)"
              type="number"
              min="30"
              max="1095"
              value={settings.auditLogRetention}
              onChange={(e) => handleNumberChange('auditLogRetention', parseInt(e.target.value) || 365)}
            />
          </div>
        </FormSection>

        {/* API Security */}
        <FormSection title="API Security">
          <div className="space-y-4">
            <Input
              label="API Key Rotation (days)"
              type="number"
              min="30"
              max="365"
              value={settings.apiKeyRotation}
              onChange={(e) => handleNumberChange('apiKeyRotation', parseInt(e.target.value) || 90)}
            />
            <SecurityWarning
              title="API Key Security"
              message="Regular API key rotation helps prevent unauthorized access. Rotate keys at least every 90 days."
              severity="info"
            />
          </div>
        </FormSection>

        {/* Data Protection */}
        <FormSection title="Data Protection">
          <div className="space-y-4">
            <Toggle
              label="Data Encryption"
              description="Encrypt sensitive data at rest and in transit"
              checked={settings.dataEncryption}
              onChange={(checked) => handleToggle('dataEncryption', checked)}
              saving={saving}
            />
            {!settings.dataEncryption && (
              <SecurityWarning
                title="Encryption Disabled"
                message="Data encryption is critical for protecting sensitive information. We strongly recommend keeping this enabled."
                severity="error"
                className="mt-4"
              />
            )}
            <Toggle
              label="Backup Enabled"
              description="Automatically backup data on a regular schedule"
              checked={settings.backupEnabled}
              onChange={(checked) => handleToggle('backupEnabled', checked)}
              saving={saving}
            />
            {settings.backupEnabled && (
              <div className="ml-6">
                <Select
                  label="Backup Frequency"
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                  ]}
                  value={settings.backupFrequency}
                  onChange={(e) => handleSelectChange('backupFrequency', e.target.value)}
                />
              </div>
            )}
          </div>
        </FormSection>

        {/* IP Whitelist */}
        <FormSection title="IP Access Control">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>IP Whitelist:</strong> Currently {settings.ipWhitelist.length} IP address(es) whitelisted.
                {settings.ipWhitelist.length === 0 && (
                  <span className="block mt-2">No IP restrictions are currently active. All IP addresses are allowed.</span>
                )}
              </p>
            </div>
            <SecurityWarning
              title="IP Whitelist Notice"
              message="IP whitelisting restricts access to specific IP addresses. Ensure you have alternative access methods before enabling."
              severity="warning"
            />
          </div>
        </FormSection>
      </div>
    </MerchantLayout>
  );
}

