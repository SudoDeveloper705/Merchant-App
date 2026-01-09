'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterDropdown } from '@/components/dashboard/FilterDropdown';
import { Button } from '@/components/dashboard/Button';

interface Agreement {
  id: string;
  partnerName: string;
  type: 'percentage' | 'minimum_guarantee' | 'hybrid';
  rate?: number;
  minimumGuarantee?: number;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [filteredAgreements, setFilteredAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAgreements();
  }, []);

  useEffect(() => {
    filterAgreements();
  }, [agreements, searchQuery, statusFilter, typeFilter]);

  const loadAgreements = async () => {
    try {
      // Mock data for frontend development
      // When backend is ready, replace with:
      // const response = await api.agreements.list({ search, status, type });
      // setAgreements(response.data.data);
      
      const mockAgreements: Agreement[] = [
        {
          id: '1',
          partnerName: 'Tech Solutions Inc',
          type: 'percentage',
          rate: 0.15,
          status: 'active',
          startDate: '2024-01-01',
          priority: 'high',
        },
        {
          id: '2',
          partnerName: 'Global Services Ltd',
          type: 'hybrid',
          rate: 0.12,
          minimumGuarantee: 50000,
          status: 'active',
          startDate: '2023-12-01',
          priority: 'medium',
        },
        {
          id: '3',
          partnerName: 'Digital Marketing Pro',
          type: 'minimum_guarantee',
          minimumGuarantee: 100000,
          status: 'active',
          startDate: '2024-01-05',
          endDate: '2024-12-31',
          priority: 'low',
        },
        {
          id: '4',
          partnerName: 'Creative Agency',
          type: 'percentage',
          rate: 0.20,
          status: 'inactive',
          startDate: '2023-10-01',
          endDate: '2023-12-31',
          priority: 'low',
        },
      ];
      
      setAgreements(mockAgreements);
    } catch (error) {
      console.error('Failed to load agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAgreements = () => {
    let filtered = [...agreements];

    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    setFilteredAgreements(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const formatAgreementType = (agreement: Agreement) => {
    if (agreement.type === 'percentage') {
      return `${(agreement.rate! * 100).toFixed(1)}%`;
    } else if (agreement.type === 'minimum_guarantee') {
      return `Min: ${formatCurrency(agreement.minimumGuarantee!)}`;
    } else {
      return `${(agreement.rate! * 100).toFixed(1)}% + Min: ${formatCurrency(agreement.minimumGuarantee!)}`;
    }
  };

  const columns = [
    {
      header: 'Partner',
      accessor: (row: Agreement) => row.partnerName,
    },
    {
      header: 'Type',
      accessor: (row: Agreement) => (
        <span className="capitalize text-gray-700">{row.type.replace('_', ' ')}</span>
      ),
    },
    {
      header: 'Terms',
      accessor: (row: Agreement) => formatAgreementType(row),
    },
    {
      header: 'Status',
      accessor: (row: Agreement) => getStatusBadge(row.status),
    },
    {
      header: 'Priority',
      accessor: (row: Agreement) => getPriorityBadge(row.priority),
    },
    {
      header: 'Start Date',
      accessor: (row: Agreement) => formatDate(row.startDate),
    },
    {
      header: 'End Date',
      accessor: (row: Agreement) => row.endDate ? formatDate(row.endDate) : 'Ongoing',
    },
    {
      header: 'Actions',
      accessor: (row: Agreement) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit agreement:', row.id);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
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
              <h1 className="text-3xl font-bold text-gray-900">Agreements</h1>
              <p className="mt-1 text-sm text-gray-500">Manage partnership agreements</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>Create Agreement</Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by partner name..."
              />
            </div>
            <FilterDropdown
              label="Status"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'expired', label: 'Expired' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-48"
            />
            <FilterDropdown
              label="Type"
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'percentage', label: 'Percentage' },
                { value: 'minimum_guarantee', label: 'Minimum Guarantee' },
                { value: 'hybrid', label: 'Hybrid' },
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-full sm:w-48"
            />
          </div>

          {/* Agreements Table */}
          <DataTable
            data={filteredAgreements}
            columns={columns}
            loading={loading}
            emptyMessage="No agreements found"
            onRowClick={(row) => console.log('View agreement:', row.id)}
          />

          {/* Create Agreement Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Agreement</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log('Create agreement form submitted');
                      setShowCreateModal(false);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Partner</label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select a partner</option>
                        <option value="1">Tech Solutions Inc</option>
                        <option value="2">Global Services Ltd</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Agreement Type</label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="minimum_guarantee">Minimum Guarantee</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Agreement</Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </MerchantLayout>
  );
}

