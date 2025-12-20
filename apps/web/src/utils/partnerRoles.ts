/**
 * Partner Role Utilities
 * 
 * Helper functions for checking partner user roles and permissions
 */

export type PartnerRole = 'partner_owner' | 'partner_staff';

/**
 * Check if user is partner owner
 */
export function isPartnerOwner(role: string | null | undefined): boolean {
  return role?.toLowerCase() === 'partner_owner';
}

/**
 * Check if user is partner staff
 */
export function isPartnerStaff(role: string | null | undefined): boolean {
  return role?.toLowerCase() === 'partner_staff';
}

/**
 * Check if user can perform management actions
 * Only partner_owner can perform management actions
 */
export function canManagePartner(role: string | null | undefined): boolean {
  return isPartnerOwner(role);
}

/**
 * Check if user is read-only
 * partner_staff is always read-only
 */
export function isReadOnly(role: string | null | undefined): boolean {
  return isPartnerStaff(role);
}

