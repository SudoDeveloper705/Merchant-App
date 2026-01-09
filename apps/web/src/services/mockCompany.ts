/**
 * Mock Company Service
 * 
 * Provides mock data for company management screens.
 */

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CompanyProfile {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  industry: string;
  foundedYear: number;
  employeeCount: string;
  description: string;
}

export interface LinkedAccount {
  id: string;
  type: 'stripe' | 'quickbooks' | 'bank';
  name: string;
  accountId: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync: string | null;
  connectedAt: string;
  metadata?: {
    accountName?: string;
    accountType?: string;
    last4?: string;
  };
}

export interface PartnerCompany {
  id: string;
  name: string;
  legalName: string;
  email: string;
  phone: string;
  country: string;
  status: 'active' | 'inactive' | 'pending';
  agreementsCount: number;
  totalRevenue: number;
  joinedAt: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface ComplianceItem {
  id: string;
  type: 'terms' | 'privacy' | 'gdpr' | 'tax' | 'financial';
  title: string;
  description: string;
  accepted: boolean;
  acceptedAt: string | null;
  version: string;
  lastUpdated: string;
  required: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'transactions' | 'partners' | 'settings' | 'reports';
  granted: boolean;
}

export const mockCompanyService = {
  /**
   * Get Company Profile
   */
  async getCompanyProfile(): Promise<CompanyProfile> {
    await delay(400);
    
    return {
      id: 'company-001',
      name: 'Acme Corporation',
      legalName: 'Acme Corporation Inc.',
      taxId: '12-3456789',
      email: 'contact@acmecorp.com',
      phone: '+1 (555) 123-4567',
      website: 'https://acmecorp.com',
      address: {
        street: '123 Business Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
      },
      industry: 'Technology',
      foundedYear: 2015,
      employeeCount: '50-100',
      description: 'Leading technology solutions provider for enterprise clients.',
    };
  },

  /**
   * Update Company Profile
   */
  async updateCompanyProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    await delay(600);
    // In real app, this would update the backend
    return { ...await this.getCompanyProfile(), ...data };
  },

  /**
   * Get Linked Accounts
   */
  async getLinkedAccounts(): Promise<LinkedAccount[]> {
    await delay(400);
    
    return [
      {
        id: 'stripe-001',
        type: 'stripe',
        name: 'Stripe Account',
        accountId: 'acct_1234567890',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        connectedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          accountName: 'Acme Corporation',
          accountType: 'Standard',
        },
      },
      {
        id: 'quickbooks-001',
        type: 'quickbooks',
        name: 'QuickBooks Online',
        accountId: 'qb_9876543210',
        status: 'connected',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        connectedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          accountName: 'Acme Corp - Main',
          accountType: 'Business',
        },
      },
      {
        id: 'bank-001',
        type: 'bank',
        name: 'Chase Business Account',
        accountId: 'bank_111222333',
        status: 'disconnected',
        lastSync: null,
        connectedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          accountName: 'Acme Corporation',
          accountType: 'Checking',
          last4: '1234',
        },
      },
    ];
  },

  /**
   * Get Partner Companies
   */
  async getPartnerCompanies(page: number = 1, limit: number = 20): Promise<{
    data: PartnerCompany[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    await delay(500);
    
    const partners: PartnerCompany[] = [
      {
        id: 'partner-001',
        name: 'Tech Solutions Inc',
        legalName: 'Tech Solutions Incorporated',
        email: 'contact@techsolutions.com',
        phone: '+1 (555) 234-5678',
        country: 'United States',
        status: 'active',
        agreementsCount: 3,
        totalRevenue: 25000000, // $250,000
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        address: {
          street: '456 Tech Avenue',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
        },
      },
      {
        id: 'partner-002',
        name: 'Global Services Ltd',
        legalName: 'Global Services Limited',
        email: 'info@globalservices.com',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
        status: 'active',
        agreementsCount: 2,
        totalRevenue: 18000000, // $180,000
        joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        address: {
          street: '789 Global Street',
          city: 'London',
          state: '',
          zipCode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
      },
      {
        id: 'partner-003',
        name: 'Digital Marketing Pro',
        legalName: 'Digital Marketing Pro LLC',
        email: 'hello@digitalmarketing.com',
        phone: '+1 (555) 345-6789',
        country: 'United States',
        status: 'pending',
        agreementsCount: 0,
        totalRevenue: 0,
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        address: {
          street: '321 Digital Drive',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'United States',
        },
      },
    ];
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: partners.slice(start, end),
      pagination: {
        page,
        limit,
        total: partners.length,
        totalPages: Math.ceil(partners.length / limit),
      },
    };
  },

  /**
   * Get Partner Company Details
   */
  async getPartnerCompany(id: string): Promise<PartnerCompany | null> {
    await delay(300);
    const response = await this.getPartnerCompanies();
    return response.data.find(p => p.id === id) || null;
  },

  /**
   * Get Compliance Items
   */
  async getComplianceItems(): Promise<ComplianceItem[]> {
    await delay(400);
    
    return [
      {
        id: 'terms-001',
        type: 'terms',
        title: 'Terms of Service',
        description: 'You must accept our Terms of Service to use this platform.',
        accepted: true,
        acceptedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        version: '2.1',
        lastUpdated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        required: true,
      },
      {
        id: 'privacy-001',
        type: 'privacy',
        title: 'Privacy Policy',
        description: 'Our Privacy Policy explains how we collect and use your data.',
        accepted: true,
        acceptedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        version: '1.5',
        lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        required: true,
      },
      {
        id: 'gdpr-001',
        type: 'gdpr',
        title: 'GDPR Compliance',
        description: 'GDPR data processing agreement for EU-based operations.',
        accepted: false,
        acceptedAt: null,
        version: '1.0',
        lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        required: false,
      },
      {
        id: 'tax-001',
        type: 'tax',
        title: 'Tax Compliance Declaration',
        description: 'Declaration of tax compliance and reporting obligations.',
        accepted: true,
        acceptedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        version: '1.2',
        lastUpdated: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        required: true,
      },
    ];
  },

  /**
   * Accept Compliance Item
   */
  async acceptComplianceItem(id: string): Promise<void> {
    await delay(300);
    // In real app, this would update the backend
  },

  /**
   * Get Access & Permissions
   */
  async getPermissions(): Promise<Permission[]> {
    await delay(300);
    
    return [
      {
        id: 'perm-001',
        name: 'View Dashboard',
        description: 'Access to main dashboard and KPIs',
        category: 'dashboard',
        granted: true,
      },
      {
        id: 'perm-002',
        name: 'View Transactions',
        description: 'View all transaction history',
        category: 'transactions',
        granted: true,
      },
      {
        id: 'perm-003',
        name: 'Manage Partners',
        description: 'Add, edit, and remove partner companies',
        category: 'partners',
        granted: true,
      },
      {
        id: 'perm-004',
        name: 'Manage Agreements',
        description: 'Create and modify partner agreements',
        category: 'partners',
        granted: true,
      },
      {
        id: 'perm-005',
        name: 'View Reports',
        description: 'Access to financial reports and exports',
        category: 'reports',
        granted: true,
      },
      {
        id: 'perm-006',
        name: 'Company Settings',
        description: 'Modify company profile and settings',
        category: 'settings',
        granted: true,
      },
      {
        id: 'perm-007',
        name: 'User Management',
        description: 'Invite and manage team members',
        category: 'settings',
        granted: false,
      },
    ];
  },
};

