/**
 * Mock Dashboard Service
 * 
 * Provides mock data for dashboard screens without backend calls.
 */

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface KPIData {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
}

export interface Balance {
  label: string;
  amount: number;
  currency: string;
  type: 'available' | 'pending' | 'reserved';
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface RevenueSource {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'transaction' | 'payout' | 'alert' | 'system';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  status?: string;
}

export const mockDashboardService = {
  /**
   * Get Overview Dashboard Data
   */
  async getOverview(dateRange?: { start: Date; end: Date }) {
    await delay(600);
    
    return {
      kpis: [
        {
          title: 'Total Revenue',
          value: '$125,450.00',
          subtitle: 'This month',
          trend: { value: 12.5, isPositive: true, label: 'vs last month' },
        },
        {
          title: 'Active Transactions',
          value: '1,234',
          subtitle: 'Last 30 days',
          trend: { value: 8.2, isPositive: true, label: 'vs last month' },
        },
        {
          title: 'Pending Payouts',
          value: '$45,230.00',
          subtitle: 'Scheduled',
          trend: { value: 3.1, isPositive: false, label: 'vs last month' },
        },
        {
          title: 'Partner Share',
          value: '$37,635.00',
          subtitle: 'This month',
          trend: { value: 15.3, isPositive: true, label: 'vs last month' },
        },
      ] as KPIData[],
      
      balances: [
        { label: 'Available Balance', amount: 12545000, currency: 'USD', type: 'available' },
        { label: 'Pending Balance', amount: 4523000, currency: 'USD', type: 'pending' },
        { label: 'Reserved Balance', amount: 1250000, currency: 'USD', type: 'reserved' },
      ] as Balance[],
      
      alerts: [
        {
          id: '1',
          title: 'High Transaction Volume',
          message: 'Transaction volume is 25% higher than average',
          severity: 'info',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
        },
        {
          id: '2',
          title: 'Payment Failed',
          message: 'Payment for invoice #1234 failed. Retry required.',
          severity: 'error',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/transactions/1234',
        },
        {
          id: '3',
          title: 'Payout Scheduled',
          message: 'Payout of $5,000 scheduled for tomorrow',
          severity: 'success',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
        },
      ] as Alert[],
      
      recentActivity: [
        {
          id: '1',
          type: 'transaction',
          title: 'Payment Received',
          description: 'Payment of $1,250.00 from Acme Corp',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          amount: 125000,
          status: 'completed',
        },
        {
          id: '2',
          type: 'payout',
          title: 'Payout Processed',
          description: 'Payout of $5,000 to Partner A',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          amount: 500000,
          status: 'completed',
        },
        {
          id: '3',
          type: 'alert',
          title: 'System Alert',
          description: 'Stripe webhook received successfully',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
      ] as ActivityItem[],
    };
  },

  /**
   * Get Revenue Breakdown
   */
  async getRevenueBreakdown(dateRange?: { start: Date; end: Date }) {
    await delay(500);
    
    return {
      total: 12545000, // $125,450.00
      sources: [
        { name: 'Stripe', amount: 8750000, percentage: 69.8, color: '#635BFF' },
        { name: 'QuickBooks', amount: 2500000, percentage: 19.9, color: '#00A86B' },
        { name: 'Internal', amount: 1295000, percentage: 10.3, color: '#3B82F6' },
      ] as RevenueSource[],
      
      chartData: [
        { label: 'Jan', value: 9500000, color: '#3b82f6' },
        { label: 'Feb', value: 11000000, color: '#3b82f6' },
        { label: 'Mar', value: 12500000, color: '#3b82f6' },
        { label: 'Apr', value: 11800000, color: '#3b82f6' },
        { label: 'May', value: 13200000, color: '#3b82f6' },
        { label: 'Jun', value: 12545000, color: '#3b82f6' },
      ],
    };
  },

  /**
   * Get Activity Feed
   */
  async getActivityFeed(page: number = 1, limit: number = 20) {
    await delay(400);
    
    const activities: ActivityItem[] = [];
    const types: ActivityItem['type'][] = ['transaction', 'payout', 'alert', 'system'];
    const statuses = ['completed', 'pending', 'failed'];
    
    for (let i = 0; i < limit; i++) {
      const type = types[i % types.length];
      const hoursAgo = i * 2;
      
      activities.push({
        id: `activity-${(page - 1) * limit + i + 1}`,
        type,
        title: type === 'transaction' ? 'Payment Received' :
              type === 'payout' ? 'Payout Processed' :
              type === 'alert' ? 'System Alert' : 'Transaction Updated',
        description: type === 'transaction' ? `Payment of $${(1000 + i * 100).toLocaleString()}.00 from Client ${i + 1}` :
                      type === 'payout' ? `Payout of $${(5000 + i * 500).toLocaleString()}.00 processed` :
                      type === 'alert' ? 'System notification' : 'Transaction status updated',
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
        amount: type === 'transaction' || type === 'payout' ? (100000 + i * 10000) : undefined,
        status: type !== 'system' ? statuses[i % statuses.length] : undefined,
      });
    }
    
    return {
      data: activities,
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: 5,
      },
    };
  },

  /**
   * Get Notifications
   */
  async getNotifications(page: number = 1, limit: number = 20) {
    await delay(400);
    
    const notifications: Alert[] = [];
    const severities: Alert['severity'][] = ['info', 'warning', 'error', 'success'];
    
    for (let i = 0; i < limit; i++) {
      const severity = severities[i % severities.length];
      const hoursAgo = i * 3;
      
      notifications.push({
        id: `notif-${(page - 1) * limit + i + 1}`,
        title: severity === 'error' ? 'Payment Failed' :
               severity === 'warning' ? 'Low Balance Alert' :
               severity === 'success' ? 'Payout Completed' : 'System Update',
        message: severity === 'error' ? `Payment for invoice #${1000 + i} failed. Retry required.` :
                 severity === 'warning' ? `Available balance is below $10,000 threshold.` :
                 severity === 'success' ? `Payout of $${(5000 + i * 500).toLocaleString()}.00 completed successfully.` :
                 'System maintenance scheduled for tonight.',
        severity,
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
        read: i > 5, // First 5 are unread
        actionUrl: severity === 'error' ? `/transactions/${1000 + i}` : undefined,
      });
    }
    
    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total: 50,
        totalPages: 3,
      },
      unreadCount: notifications.filter(n => !n.read).length,
    };
  },
};

