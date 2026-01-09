/**
 * Mock Authentication Service
 * 
 * Simulates authentication flows without backend calls.
 * This service will be replaced with real API calls later.
 */

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  companyName?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  token?: string;
}

export interface VerificationData {
  email: string;
  code: string;
}

export type UserRole = 'us_owner' | 'accountant' | 'offshore_partner' | 'read_only';

export const mockAuthService = {
  /**
   * Login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);
    
    // Mock validation
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: 'Email and password are required',
      };
    }
    
    // Mock successful login
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: 'user-123',
        email: credentials.email,
        name: 'John Doe',
      },
      token: 'mock-jwt-token',
    };
  },

  /**
   * Sign Up
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    await delay(1000);
    
    // Mock validation
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
      };
    }
    
    // Mock successful signup
    return {
      success: true,
      message: 'Account created successfully. Please verify your email.',
      user: {
        id: 'user-456',
        email: data.email,
        name: data.name,
      },
    };
  },

  /**
   * Forgot Password
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    await delay(600);
    
    if (!email) {
      return {
        success: false,
        error: 'Email is required',
      };
    }
    
    return {
      success: true,
      message: 'Password reset link has been sent to your email',
    };
  },

  /**
   * Reset Password
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<AuthResponse> {
    await delay(800);
    
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
      };
    }
    
    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  },

  /**
   * Verify Email
   */
  async verifyEmail(data: VerificationData): Promise<AuthResponse> {
    await delay(700);
    
    // Mock verification code (in real app, this would be validated against backend)
    const validCodes = ['123456', '000000', '111111'];
    
    if (!validCodes.includes(data.code)) {
      return {
        success: false,
        error: 'Invalid verification code',
      };
    }
    
    return {
      success: true,
      message: 'Email verified successfully',
      user: {
        id: 'user-789',
        email: data.email,
        name: 'User Name',
      },
    };
  },

  /**
   * Resend Verification Code
   */
  async resendVerificationCode(email: string): Promise<AuthResponse> {
    await delay(500);
    
    return {
      success: true,
      message: 'Verification code has been resent to your email',
    };
  },

  /**
   * Select Role
   */
  async selectRole(role: UserRole): Promise<AuthResponse> {
    await delay(400);
    
    const roleNames: Record<UserRole, string> = {
      us_owner: 'US Owner',
      accountant: 'Accountant',
      offshore_partner: 'Offshore Partner',
      read_only: 'Read-Only',
    };
    
    return {
      success: true,
      message: `Role set to ${roleNames[role]}`,
      user: {
        id: 'user-role',
        email: 'user@example.com',
        name: 'User',
        role,
      },
    };
  },
};

/**
 * Get dashboard route for role
 */
export function getDashboardRoute(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    us_owner: '/merchant/dashboard',
    accountant: '/merchant/dashboard',
    offshore_partner: '/partner/dashboard',
    read_only: '/merchant/dashboard',
  };
  
  return routes[role] || '/merchant/dashboard';
}

