/**
 * Role-based access control (RBAC) roles for Merchant App
 */

// Merchant user roles
export enum MerchantRole {
  MERCHANT_OWNER = 'merchant_owner',
  MERCHANT_MANAGER = 'merchant_manager',
  MERCHANT_ACCOUNTANT = 'merchant_accountant',
}

// Partner user roles
export enum PartnerRole {
  PARTNER_OWNER = 'partner_owner',
  PARTNER_STAFF = 'partner_staff',
}

// Legacy roles (for backward compatibility)
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MERCHANT = 'MERCHANT',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

// Union type for all roles
export type AppRole = MerchantRole | PartnerRole;

export interface RolePermissions {
  [key: string]: string[];
}

/**
 * Permissions for each role
 */
export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.SUPER_ADMIN]: [
    '*', // All permissions
  ],
  [UserRole.ADMIN]: [
    'users:read',
    'users:write',
    'merchants:read',
    'merchants:write',
    'transactions:read',
    'transactions:write',
    'reports:read',
    'settings:read',
    'settings:write',
  ],
  [UserRole.MERCHANT]: [
    'merchants:read:own',
    'merchants:write:own',
    'transactions:read:own',
    'transactions:write:own',
    'reports:read:own',
  ],
  [UserRole.STAFF]: [
    'transactions:read:own',
    'transactions:write:own',
  ],
  [UserRole.VIEWER]: [
    'transactions:read:own',
    'reports:read:own',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  // Super admin has all permissions
  if (permissions.includes('*')) {
    return true;
  }
  
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

