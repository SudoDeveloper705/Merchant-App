'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { Button } from '@/components/dashboard/Button';

interface Partner {
  id: string;
  name: string;
  email: string;
  country: string;
  status: 'active' | 'inactive';
  agreementsCount: number;
  totalRevenue: number;
  createdAt: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    filterPartners();
  }, [partners, searchQuery]);

  const loadPartners = async () => {
    try {
      // Mock data for frontend development
      // When backend is ready, replace with:
      // const response = await api.partners.list({ search });
      // setPartners(response.data.data);
      
      const mockPartners: Partner[] = [
        {
          id: '1',
          name: 'Tech Solutions Inc',
          email: 'contact@techsolutions.com',
          country: 'US',
          status: 'active',
          agreementsCount: 3,
          totalRevenue: 250000,
          createdAt: '2023-12-01',
        },
        {
          id: '2',
          name: 'Global Services Ltd',
          email: 'info@globalservices.com',
          country: 'UK',
          status: 'active',
          agreementsCount: 2,
          totalRevenue: 180000,
          createdAt: '2023-11-15',
        },
        {
          id: '3',
          name: 'Digital Marketing Pro',
          email: 'hello@digitalmarketing.com',
          country: 'CA',
          status: 'active',
          agreementsCount: 1,
          totalRevenue: 95000,
          createdAt: '2024-01-05',
        },
        {
          id: '4',
          name: 'Creative Agency',
          email: 'team@creativeagency.com',
          country: 'US',
          status: 'inactive',
          agreementsCount: 0,
          totalRevenue: 0,
          createdAt: '2023-10-20',
        },
      ];
      
      setPartners(mockPartners);
    } catch (error) {
      console.error('Failed to load partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPartners = () => {
    let filtered = [...partners];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPartners(filtered);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      header: 'Partner Name',
      accessor: (row: Partner) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Country',
      accessor: (row: Partner) => row.country,
    },
    {
      header: 'Status',
      accessor: (row: Partner) => getStatusBadge(row.status),
    },
    {
      header: 'Agreements',
      accessor: (row: Partner) => (
        <span className="font-medium text-gray-900">{row.agreementsCount}</span>
      ),
    },
    {
      header: 'Total Revenue',
      accessor: (row: Partner) => formatCurrency(row.totalRevenue),
    },
    {
      header: 'Joined',
      accessor: (row: Partner) => formatDate(row.createdAt),
    },
    {
      header: 'Actions',
      accessor: (row: Partner) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit partner:', row.id);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('View details:', row.id);
            }}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            View
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
              <h1 className="text-3xl font-bold text-gray-900">Partners</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your business partners</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>Add Partner</Button>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search partners by name, email, or country..."
            />
          </div>

          {/* Partners Table */}
          <DataTable
            data={filteredPartners}
            columns={columns}
            loading={loading}
            emptyMessage="No partners found"
            onRowClick={(row) => console.log('View partner:', row.id)}
          />

          {/* Add Partner Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Partner</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log('Add partner form submitted');
                      setShowAddModal(false);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Partner Name</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Add Partner</Button>
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

