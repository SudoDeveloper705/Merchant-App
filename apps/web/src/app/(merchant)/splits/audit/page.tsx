'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AuditTimeline } from '@/components/splits/AuditTimeline';
import { FormSection } from '@/components/company';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Select, Input } from '@/components/ui';
import { mockSettlementService, AuditEvent } from '@/services/mockSettlement';

export default function AuditTrailPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    loadAuditTrail();
  }, [entityTypeFilter, actionFilter]);

  const loadAuditTrail = async () => {
    setLoading(true);
    try {
      const data = await mockSettlementService.getAuditTrail();
      let filtered = data;
      
      if (entityTypeFilter !== 'all') {
        filtered = filtered.filter(e => e.entity.toLowerCase() === entityTypeFilter.toLowerCase());
      }
      
      if (actionFilter !== 'all') {
        filtered = filtered.filter(e => e.action === actionFilter);
      }
      
      setEvents(filtered);
    } catch (error) {
      console.error('Failed to load audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueEntities = Array.from(new Set(events.map(e => e.entity)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
          <p className="mt-1 text-sm text-gray-500">Complete history of all changes to splits and payouts (Read-only)</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Entity Type"
                options={[
                  { value: 'all', label: 'All Entities' },
                  ...uniqueEntities.map(e => ({ value: e.toLowerCase(), label: e })),
                ]}
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
              />
              <Select
                label="Action Type"
                options={[
                  { value: 'all', label: 'All Actions' },
                  { value: 'created', label: 'Created' },
                  { value: 'updated', label: 'Updated' },
                  { value: 'deleted', label: 'Deleted' },
                  { value: 'adjusted', label: 'Adjusted' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Adjustments</p>
                <p className="text-3xl font-bold text-orange-600">
                  {events.filter(e => e.action === 'adjusted').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Updates</p>
                <p className="text-3xl font-bold text-blue-600">
                  {events.filter(e => e.action === 'updated').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Approvals</p>
                <p className="text-3xl font-bold text-green-600">
                  {events.filter(e => e.action === 'approved').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Timeline */}
        <FormSection title="Audit Events" readOnly={true}>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No audit events found</p>
            </div>
          ) : (
            <AuditTimeline events={events} />
          )}
        </FormSection>
      </div>
    </DashboardLayout>
  );
}

