/**
 * Mock Settings Service
 * 
 * Provides mock data for settings and legal screens.
 */

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface ApplicationSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  enableNotifications: boolean;
  enableEmailAlerts: boolean;
  enableSMSAlerts: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  showTutorials: boolean;
  compactMode: boolean;
}

export interface NotificationPreferences {
  email: {
    transactions: boolean;
    payouts: boolean;
    invoices: boolean;
    alerts: boolean;
    reports: boolean;
    marketing: boolean;
  };
  sms: {
    transactions: boolean;
    payouts: boolean;
    alerts: boolean;
  };
  push: {
    transactions: boolean;
    payouts: boolean;
    alerts: boolean;
  };
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
}

export interface LegalDocument {
  id: string;
  title: string;
  type: 'terms' | 'privacy' | 'disclaimer' | 'policy';
  content: string;
  lastUpdated: string;
  version: string;
  accepted: boolean;
  acceptedAt: string | null;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  requireStrongPassword: boolean;
  loginAlerts: boolean;
  ipWhitelist: string[];
  apiKeyRotation: number;
  auditLogRetention: number;
  dataEncryption: boolean;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export const mockSettingsService = {
  /**
   * Get Application Settings
   */
  async getApplicationSettings(): Promise<ApplicationSettings> {
    await delay(300);
    
    return {
      theme: 'light',
      language: 'en-US',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      enableNotifications: true,
      enableEmailAlerts: true,
      enableSMSAlerts: false,
      autoRefresh: true,
      refreshInterval: 30,
      showTutorials: true,
      compactMode: false,
    };
  },

  /**
   * Update Application Settings
   */
  async updateApplicationSettings(settings: Partial<ApplicationSettings>): Promise<ApplicationSettings> {
    await delay(500);
    const current = await this.getApplicationSettings();
    return { ...current, ...settings };
  },

  /**
   * Get Notification Preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    await delay(300);
    
    return {
      email: {
        transactions: true,
        payouts: true,
        invoices: true,
        alerts: true,
        reports: false,
        marketing: false,
      },
      sms: {
        transactions: false,
        payouts: true,
        alerts: true,
      },
      push: {
        transactions: true,
        payouts: true,
        alerts: true,
      },
      digest: {
        enabled: true,
        frequency: 'daily',
        time: '09:00',
      },
    };
  },

  /**
   * Update Notification Preferences
   */
  async updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    await delay(500);
    const current = await this.getNotificationPreferences();
    return { ...current, ...preferences };
  },

  /**
   * Get Legal Documents
   */
  async getLegalDocuments(): Promise<LegalDocument[]> {
    await delay(400);
    
    return [
      {
        id: 'terms-001',
        title: 'Terms of Service',
        type: 'terms',
        content: `TERMS OF SERVICE

Last Updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

2. USE LICENSE
Permission is granted to temporarily access the materials on this service for personal, non-commercial transitory viewing only.

3. DISCLAIMER
The materials on this service are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties.

4. LIMITATIONS
In no event shall we or our suppliers be liable for any damages arising out of the use or inability to use the materials on this service.

5. ACCURACY OF MATERIALS
The materials appearing on this service could include technical, typographical, or photographic errors.

6. LINKS
We have not reviewed all of the sites linked to our service and are not responsible for the contents of any such linked site.

7. MODIFICATIONS
We may revise these terms of service at any time without notice.

8. GOVERNING LAW
These terms and conditions are governed by and construed in accordance with the laws.`,
        lastUpdated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        version: '2.1',
        accepted: true,
        acceptedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'privacy-001',
        title: 'Privacy Policy',
        type: 'privacy',
        content: `PRIVACY POLICY

Last Updated: ${new Date().toLocaleDateString()}

1. INFORMATION WE COLLECT
We collect information that you provide directly to us, including name, email address, and payment information.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to provide, maintain, and improve our services, process transactions, and send you technical notices.

3. INFORMATION SHARING
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

4. DATA SECURITY
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. COOKIES
We use cookies to enhance your experience, gather general visitor information, and track visits to our website.

6. YOUR RIGHTS
You have the right to access, update, or delete your personal information at any time.

7. CHILDREN'S PRIVACY
Our service is not intended for children under 13 years of age.

8. CHANGES TO THIS POLICY
We may update this privacy policy from time to time.`,
        lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        version: '1.5',
        accepted: true,
        acceptedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'disclaimer-001',
        title: 'Financial Disclaimer',
        type: 'disclaimer',
        content: `FINANCIAL DISCLAIMER

Last Updated: ${new Date().toLocaleDateString()}

IMPORTANT NOTICE

The information provided on this platform is for general informational purposes only and should not be considered as financial, legal, or professional advice.

1. NO FINANCIAL ADVICE
We do not provide financial advice. All financial decisions should be made in consultation with qualified financial advisors.

2. RISK DISCLOSURE
All financial transactions carry inherent risks. Past performance does not guarantee future results.

3. ACCURACY
While we strive to provide accurate information, we make no representations or warranties regarding the accuracy, completeness, or reliability of any information.

4. LIABILITY
We shall not be liable for any losses or damages arising from the use of this service or reliance on any information provided.

5. REGULATORY COMPLIANCE
Users are responsible for ensuring compliance with all applicable laws and regulations in their jurisdiction.

6. THIRD-PARTY SERVICES
This service may integrate with third-party payment processors and financial institutions. We are not responsible for their services or policies.`,
        lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        version: '1.0',
        accepted: false,
        acceptedAt: null,
      },
    ];
  },

  /**
   * Accept Legal Document
   */
  async acceptLegalDocument(documentId: string): Promise<void> {
    await delay(500);
    // In real app, this would update the backend
    console.log('Accepted legal document:', documentId);
  },

  /**
   * Get Security Settings
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    await delay(300);
    
    return {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      requireStrongPassword: true,
      loginAlerts: true,
      ipWhitelist: [],
      apiKeyRotation: 90,
      auditLogRetention: 365,
      dataEncryption: true,
      backupEnabled: true,
      backupFrequency: 'daily',
    };
  },

  /**
   * Update Security Settings
   */
  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    await delay(500);
    const current = await this.getSecuritySettings();
    return { ...current, ...settings };
  },
};

