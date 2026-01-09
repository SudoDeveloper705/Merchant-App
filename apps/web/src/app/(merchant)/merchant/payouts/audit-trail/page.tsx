'use client';

import { useState, useEffect, useMemo } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button, Input, Select, Card, CardHeader, CardContent, Badge, Table, TableColumn, Pagination } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { AuditLog, AuditAction } from '@/types/payouts';

// Mock data generator
const generateMockAuditLogs = (merchantId: string): AuditLog[] => {
  const users = [
    { id: 'user-001', name: 'John Doe', email: 'john@merchant.com', role: 'merchant_owner' },
    { id: 'user-002', name: 'Jane Smith', email: 'jane@merchant.com', role: 'merchant_manager' },
    { id: 'user-003', name: 'Bob Johnson', email: 'bob@merchant.com', role: 'merchant_accountant' },
    { id: 'user-004', name: 'Alice Williams', email: 'alice@merchant.com', role: 'merchant_owner' },
  ];

  const entityTypes = ['SPLIT_RULE', 'PAYOUT', 'ADJUSTMENT', 'PARTNER_SHARE'];
  const actions: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'CANCEL'];

  const logs: AuditLog[] = [];

  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)] as AuditLog['entityType'];
    const action = actions[Math.floor(Math.random() * actions.length)];

    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 90));
    timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const entityId = `${entityType.toLowerCase()}-${Math.floor(Math.random() * 50) + 1}`;

    // Generate changes based on entity type
    const changes = [];
    if (action === 'UPDATE' || action === 'CREATE') {
      if (entityType === 'SPLIT_RULE') {
        changes.push(
          { field: 'percentage', oldValue: action === 'CREATE' ? null : 15, newValue: 20 },
          { field: 'isActive', oldValue: action === 'CREATE' ? null : false, newValue: true }
        );
      } else if (entityType === 'PAYOUT') {
        changes.push(
          { field: 'status', oldValue: action === 'CREATE' ? null : 'PENDING', newValue: 'PROCESSING' },
          { field: 'amountCents', oldValue: action === 'CREATE' ? null : 50000, newValue: 55000 }
        );
      } else if (entityType === 'ADJUSTMENT') {
        changes.push(
          { field: 'amountCents', oldValue: action === 'CREATE' ? null : 1000, newValue: 1500 },
          { field: 'status', oldValue: action === 'CREATE' ? null : 'PENDING', newValue: 'APPLIED' }
        );
      }
    }

    const descriptions = {
      CREATE: `Created new ${entityType.toLowerCase().replace('_', ' ')}`,
      UPDATE: `Updated ${entityType.toLowerCase().replace('_', ' ')}`,
      DELETE: `Deleted ${entityType.toLowerCase().replace('_', ' ')}`,
      APPROVE: `Approved ${entityType.toLowerCase().replace('_', ' ')}`,
      REJECT: `Rejected ${entityType.toLowerCase().replace('_', ' ')}`,
      CANCEL: `Cancelled ${entityType.toLowerCase().replace('_', ' ')}`,
    };

    logs.push({
      id: `audit-${i + 1}`,
      entityType,
      entityId,
      action,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      changes: changes.length > 0 ? changes : [],
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: timestamp.toISOString(),
      description: descriptions[action],
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function AuditTrailPage() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.merchantId) {
      loadAuditLogs();
    }
  }, [user?.merchantId]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = generateMockAuditLogs(user?.merchantId || 'merchant-001');
      setAuditLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadge = (action: AuditAction) => {
    const styles = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      APPROVE: 'bg-purple-100 text-purple-800',
      REJECT: 'bg-orange-100 text-orange-800',
      CANCEL: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={styles[action]}>
        {action}
      </Badge>
    );
  };

  const getEntityTypeBadge = (entityType: string) => {
    const styles = {
      SPLIT_RULE: 'bg-blue-100 text-blue-800',
      PAYOUT: 'bg-green-100 text-green-800',
      ADJUSTMENT: 'bg-yellow-100 text-yellow-800',
      PARTNER_SHARE: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={styles[entityType as keyof typeof styles] || 'bg-gray-100 text-gray-800'}>
        {entityType.replace('_', ' ')}
      </Badge>
    );
  };

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // Filtered data
  const filteredLogs = useMemo(() => {
    let filtered = [...auditLogs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.userName.toLowerCase().includes(query) ||
          log.userEmail.toLowerCase().includes(query) ||
          log.entityId.toLowerCase().includes(query) ||
          log.description.toLowerCase().includes(query)
      );
    }

    if (entityTypeFilter !== 'all') {
      filtered = filtered.filter(log => log.entityType === entityTypeFilter);
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.userEmail === userFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(dateRange.end));
    }

    return filtered;
  }, [auditLogs, searchQuery, entityTypeFilter, actionFilter, userFilter, dateRange]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredLogs.slice(start, end);
  }, [filteredLogs, page, limit]);

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Set(auditLogs.map(log => log.userEmail));
    return Array.from(users).map(email => {
      const log = auditLogs.find(l => l.userEmail === email);
      return { value: email, label: `${log?.userName} (${email})` };
    });
  }, [auditLogs]);

  const columns: TableColumn<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessor: (row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{formatDate(row.timestamp)}</div>
        </div>
      ),
    },
    {
      header: 'User',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.userName}</div>
          <div className="text-xs text-gray-500">{row.userEmail}</div>
          <div className="text-xs text-gray-400">{row.userRole.replace('_', ' ')}</div>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => getActionBadge(row.action),
    },
    {
      header: 'Entity',
      accessor: (row) => (
        <div>
          <div>{getEntityTypeBadge(row.entityType)}</div>
          <div className="text-xs text-gray-500 mt-1">{row.entityId}</div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: (row) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Changes',
      accessor: (row) => (
        <div>
          {row.changes.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleRowExpansion(row.id)}
            >
              {expandedRows.has(row.id) ? 'Hide' : 'Show'} ({row.changes.length})
            </Button>
          ) : (
            <span className="text-gray-400 text-sm">No changes</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
            <p className="mt-1 text-sm text-gray-500">Track who changed what and when</p>
          </div>
          <Button onClick={loadAuditLogs}>Refresh</Button>
        </div>

        {/* Summary Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Logs</div>
                <div className="text-2xl font-bold text-gray-900">{filteredLogs.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Unique Users</div>
                <div className="text-2xl font-bold text-gray-900">{uniqueUsers.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Last 7 Days</div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredLogs.filter(log => {
                    const logDate = new Date(log.timestamp);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return logDate >= weekAgo;
                  }).length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Last 30 Days</div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredLogs.filter(log => {
                    const logDate = new Date(log.timestamp);
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    return logDate >= monthAgo;
                  }).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search logs..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type
                </label>
                <Select
                  value={entityTypeFilter}
                  onChange={(e) => {
                    setEntityTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'SPLIT_RULE', label: 'Split Rule' },
                    { value: 'PAYOUT', label: 'Payout' },
                    { value: 'ADJUSTMENT', label: 'Adjustment' },
                    { value: 'PARTNER_SHARE', label: 'Partner Share' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <Select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Actions' },
                    { value: 'CREATE', label: 'Create' },
                    { value: 'UPDATE', label: 'Update' },
                    { value: 'DELETE', label: 'Delete' },
                    { value: 'APPROVE', label: 'Approve' },
                    { value: 'REJECT', label: 'Reject' },
                    { value: 'CANCEL', label: 'Cancel' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <Select
                  value={userFilter}
                  onChange={(e) => {
                    setUserFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Users' },
                    ...uniqueUsers,
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, start: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, end: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Audit Logs ({filteredLogs.length})
            </h2>
          </CardHeader>
          <CardContent>
            <Table
              data={paginatedData}
              columns={columns}
              loading={loading}
            />
            {!loading && filteredLogs.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(filteredLogs.length / limit)}
                  onPageChange={setPage}
                />
              </div>
            )}

            {/* Expanded rows showing changes */}
            {paginatedData.map((log) => {
              if (!expandedRows.has(log.id) || log.changes.length === 0) return null;

              return (
                <Card key={`expanded-${log.id}`} className="mt-4">
                  <CardHeader>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Changes for {log.entityType} {log.entityId}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Field
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Old Value
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              New Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {log.changes.map((change, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {change.field}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {formatValue(change.oldValue)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatValue(change.newValue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      <div>IP Address: {log.ipAddress}</div>
                      <div>User Agent: {log.userAgent}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}

