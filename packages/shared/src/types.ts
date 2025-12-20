/**
 * Shared types for Merchant App
 */

import { LegacyUserRole } from './roles';

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: LegacyUserRole;
  merchantId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: LegacyUserRole;
  merchantId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: LegacyUserRole;
  merchantId?: string;
  isActive?: boolean;
}

// Merchant Types
export interface Merchant {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMerchantDto {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateMerchantDto {
  name?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

// Transaction Types
export interface Transaction {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  CHARGEBACK = 'CHARGEBACK',
}

export interface CreateTransactionDto {
  merchantId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTransactionDto {
  status?: TransactionStatus;
  description?: string;
  metadata?: Record<string, any>;
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

