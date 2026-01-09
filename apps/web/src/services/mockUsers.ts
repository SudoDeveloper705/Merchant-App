/**
 * Mock User Service
 * 
 * Provides mock data for user and role management screens.
 */

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string | null;
  createdAt: string;
  invitedBy: string | null;
  merchantId?: string;
  partnerId?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'transactions' | 'partners' | 'settings' | 'reports' | 'users';
  granted: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'invite' | 'role_change';
  entity: string;
  entityId: string | null;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export const mockUserService = {
  /**
   * Get Users
   */
  async getUsers(page: number = 1, limit: number = 20): Promise<{
    data: User[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    await delay(500);
    
    const users: User[] = [
      {
        id: 'user-001',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'merchant_owner',
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        invitedBy: null,
        merchantId: 'merchant-001',
      },
      {
        id: 'user-002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'merchant_manager',
        status: 'active',
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        invitedBy: 'user-001',
        merchantId: 'merchant-001',
      },
      {
        id: 'user-003',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'merchant_accountant',
        status: 'active',
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        invitedBy: 'user-001',
        merchantId: 'merchant-001',
      },
      {
        id: 'user-004',
        name: 'Alice Williams',
        email: 'alice@example.com',
        role: 'viewer',
        status: 'pending',
        lastLogin: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        invitedBy: 'user-001',
        merchantId: 'merchant-001',
      },
      {
        id: 'user-005',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        role: 'partner_owner',
        status: 'active',
        lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        invitedBy: null,
        partnerId: 'partner-001',
      },
    ];
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: users.slice(start, end),
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit),
      },
    };
  },

  /**
   * Get User
   */
  async getUser(id: string): Promise<User | null> {
    await delay(300);
    const response = await this.getUsers();
    return response.data.find(u => u.id === id) || null;
  },

  /**
   * Invite User
   */
  async inviteUser(data: { name: string; email: string; role: string }): Promise<User> {
    await delay(800);
    
    return {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'pending',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      invitedBy: 'current-user',
      merchantId: 'merchant-001',
    };
  },

  /**
   * Update User Role
   */
  async updateUserRole(userId: string, role: string): Promise<User> {
    await delay(600);
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    return { ...user, role };
  },

  /**
   * Get Permissions for Role
   */
  async getPermissionsForRole(role: string): Promise<Permission[]> {
    await delay(300);
    
    const allPermissions: Permission[] = [
      { id: 'perm-001', name: 'View Dashboard', description: 'Access to main dashboard', category: 'dashboard', granted: true },
      { id: 'perm-002', name: 'View Transactions', description: 'View all transactions', category: 'transactions', granted: true },
      { id: 'perm-003', name: 'Create Transactions', description: 'Create new transactions', category: 'transactions', granted: false },
      { id: 'perm-004', name: 'Manage Partners', description: 'Add, edit, remove partners', category: 'partners', granted: false },
      { id: 'perm-005', name: 'View Partners', description: 'View partner list', category: 'partners', granted: true },
      { id: 'perm-006', name: 'Manage Agreements', description: 'Create and modify agreements', category: 'partners', granted: false },
      { id: 'perm-007', name: 'View Reports', description: 'Access to reports', category: 'reports', granted: true },
      { id: 'perm-008', name: 'Export Reports', description: 'Export reports to CSV', category: 'reports', granted: false },
      { id: 'perm-009', name: 'Company Settings', description: 'Modify company profile', category: 'settings', granted: false },
      { id: 'perm-010', name: 'User Management', description: 'Invite and manage users', category: 'users', granted: false },
    ];
    
    // Role-based permissions
    const rolePermissions: Record<string, string[]> = {
      merchant_owner: ['perm-001', 'perm-002', 'perm-003', 'perm-004', 'perm-005', 'perm-006', 'perm-007', 'perm-008', 'perm-009', 'perm-010'],
      merchant_manager: ['perm-001', 'perm-002', 'perm-003', 'perm-004', 'perm-005', 'perm-006', 'perm-007', 'perm-008'],
      merchant_accountant: ['perm-001', 'perm-002', 'perm-007', 'perm-008'],
      viewer: ['perm-001', 'perm-002', 'perm-005', 'perm-007'],
      partner_owner: ['perm-001', 'perm-007'],
      partner_staff: ['perm-001'],
    };
    
    const grantedIds = rolePermissions[role] || [];
    
    return allPermissions.map(p => ({
      ...p,
      granted: grantedIds.includes(p.id),
    }));
  },

  /**
   * Update Permissions
   */
  async updatePermissions(userId: string, permissions: Permission[]): Promise<void> {
    await delay(600);
    // In real app, this would update the backend
  },

  /**
   * Get Activity Logs
   */
  async getActivityLogs(
    userId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: ActivityLog[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    await delay(500);
    
    const logs: ActivityLog[] = [];
    const actions: ActivityLog['action'][] = ['login', 'logout', 'create', 'update', 'delete', 'invite', 'role_change'];
    const entities = ['User', 'Invoice', 'Payout', 'Partner', 'Agreement'];
    
    for (let i = 0; i < limit; i++) {
      const hoursAgo = i * 2;
      const action = actions[i % actions.length];
      
      logs.push({
        id: `log-${i + 1}`,
        userId: userId || `user-${(i % 5) + 1}`,
        userName: `User ${(i % 5) + 1}`,
        action,
        entity: entities[i % entities.length],
        entityId: `entity-${i + 1}`,
        details: `${action} ${entities[i % entities.length].toLowerCase()} ${i + 1}`,
        ipAddress: `192.168.1.${100 + i}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      });
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: logs.slice(start, end),
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: 5,
      },
    };
  },
};

