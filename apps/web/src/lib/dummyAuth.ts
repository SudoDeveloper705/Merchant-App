/**
 * Dummy Authentication for Testing
 * 
 * Provides mock login functionality for testing role-based dashboards
 * without requiring backend connection.
 */

export interface DummyUser {
  email: string;
  password: string;
  name: string;
  role: 'merchant_owner' | 'merchant_manager' | 'merchant_accountant' | 'partner_owner' | 'partner_staff';
  merchantId?: string;
  merchantName?: string;
  partnerId?: string;
  partnerName?: string;
  userType: 'merchant' | 'partner';
}

/**
 * Dummy user credentials for testing
 */
export const DUMMY_USERS: DummyUser[] = [
  // Merchant users
  {
    email: 'owner@merchant.com',
    password: 'owner123',
    name: 'John Owner',
    role: 'merchant_owner',
    merchantId: 'merchant-001',
    merchantName: 'Acme Corporation',
    userType: 'merchant',
  },
  {
    email: 'manager@merchant.com',
    password: 'manager123',
    name: 'Jane Manager',
    role: 'merchant_manager',
    merchantId: 'merchant-001',
    merchantName: 'Acme Corporation',
    userType: 'merchant',
  },
  {
    email: 'accountant@merchant.com',
    password: 'accountant123',
    name: 'Bob Accountant',
    role: 'merchant_accountant',
    merchantId: 'merchant-001',
    merchantName: 'Acme Corporation',
    userType: 'merchant',
  },
  // Partner users
  {
    email: 'owner@partner.com',
    password: 'owner123',
    name: 'Sarah Partner Owner',
    role: 'partner_owner',
    partnerId: 'partner-001',
    partnerName: 'Global Partners Inc',
    userType: 'partner',
  },
  {
    email: 'staff@partner.com',
    password: 'staff123',
    name: 'Mike Staff',
    role: 'partner_staff',
    partnerId: 'partner-001',
    partnerName: 'Global Partners Inc',
    userType: 'partner',
  },
];

/**
 * Check if credentials match a dummy user
 */
export function validateDummyCredentials(email: string, password: string): DummyUser | null {
  const user = DUMMY_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

/**
 * Get dummy user by email
 */
export function getDummyUserByEmail(email: string): DummyUser | null {
  return DUMMY_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Get dummy partner user by email
 */
export function getDummyPartnerUserByEmail(email: string): DummyUser | null {
  return DUMMY_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.userType === 'partner'
  ) || null;
}

