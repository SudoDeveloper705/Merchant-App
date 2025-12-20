/**
 * Authentication types and constants
 */

import { MerchantRole, PartnerRole } from './roles';

export type UserType = 'merchant' | 'partner';

export type UserRole = MerchantRole | PartnerRole;

export interface JWTPayload {
  userType: UserType;
  userId: string;
  role: UserRole;
  merchantId?: string;
  partnerId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

