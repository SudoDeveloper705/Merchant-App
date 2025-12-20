'use client';

import { useState, useEffect } from 'react';
import { getPartnerMerchants, setSelectedMerchantId, getSelectedMerchantId, type LinkedMerchant } from '@/lib/partnerApi';

interface MerchantSwitcherProps {
  onMerchantChange?: (merchantId: string) => void;
}

export function MerchantSwitcher({ onMerchantChange }: MerchantSwitcherProps) {
  const [merchants, setMerchants] = useState<LinkedMerchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      const data = await getPartnerMerchants();
      setMerchants(data);

      // Auto-select first merchant if none selected
      const storedMerchantId = getSelectedMerchantId();
      if (data.length > 0) {
        const merchantToSelect = storedMerchantId && data.find(m => m.merchantId === storedMerchantId)
          ? storedMerchantId
          : data[0].merchantId;
        
        setSelectedMerchantIdState(merchantToSelect);
        setSelectedMerchantId(merchantToSelect);
        onMerchantChange?.(merchantToSelect);
      }
    } catch (err: any) {
      console.error('Failed to load merchants:', err);
      
      // If it's a network error, use mock data for testing
      const isNetworkError = err.code === 'ECONNREFUSED' || 
                            err.message?.includes('Network Error') || 
                            err.message?.includes('Failed to fetch') ||
                            err.message?.includes('Cannot connect to API server');
      
      if (isNetworkError) {
        // Use mock merchants for testing when backend is not available
        const mockMerchants: LinkedMerchant[] = [
          {
            merchantId: 'merchant-001',
            merchantName: 'Acme Corporation',
            accessLevel: 'full',
            canViewClientNames: true,
          },
          {
            merchantId: 'merchant-002',
            merchantName: 'Tech Solutions Inc',
            accessLevel: 'full',
            canViewClientNames: false,
          },
          {
            merchantId: 'merchant-003',
            merchantName: 'Global Trading Co',
            accessLevel: 'full',
            canViewClientNames: true,
          },
        ];
        
        setMerchants(mockMerchants);
        setUsingMockData(true);
        setError(null); // Clear error since we're using mock data
        
        // Auto-select first mock merchant
        const storedMerchantId = getSelectedMerchantId();
        const merchantToSelect = storedMerchantId && mockMerchants.find(m => m.merchantId === storedMerchantId)
          ? storedMerchantId
          : mockMerchants[0].merchantId;
        
        setSelectedMerchantIdState(merchantToSelect);
        setSelectedMerchantId(merchantToSelect);
        onMerchantChange?.(merchantToSelect);
      } else {
        // For other errors, show error message
        const errorMessage = err.message || 'Failed to load merchants';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMerchantChange = (merchantId: string) => {
    setSelectedMerchantIdState(merchantId);
    setSelectedMerchantId(merchantId);
    onMerchantChange?.(merchantId);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm text-gray-600">Loading merchants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (merchants.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No merchants available
      </div>
    );
  }

  const selectedMerchant = merchants.find(m => m.merchantId === selectedMerchantId);

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="merchant-switcher" className="text-sm font-medium text-gray-700">
        Merchant:
      </label>
      <select
        id="merchant-switcher"
        value={selectedMerchantId || ''}
        onChange={(e) => handleMerchantChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[200px]"
      >
        {merchants.map((merchant) => (
          <option key={merchant.merchantId} value={merchant.merchantId}>
            {merchant.merchantName}
          </option>
        ))}
      </select>
      {selectedMerchant && (
        <span className="text-xs text-gray-500">
          {selectedMerchant.canViewClientNames ? '✓ Client names visible' : '✗ Client names hidden'}
        </span>
      )}
      {usingMockData && (
        <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded" title="Using mock data for testing">
          🧪 Test Mode
        </span>
      )}
    </div>
  );
}

