'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/layouts/MerchantLayout';
import { Button, Input, Card, CardHeader, CardContent, Select } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { InvoicePlatform } from '../page';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export default function CreateInvoicePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<InvoicePlatform>('MANUAL');
  const [platformInvoiceLink, setPlatformInvoiceLink] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPriceCents: 0,
      totalCents: 0,
    },
  ]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateLineItemTotal = (item: InvoiceLineItem) => {
    return item.quantity * item.unitPriceCents;
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLineItems(items => {
      if (!items || !Array.isArray(items)) return items || [];
      return items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPriceCents') {
            updated.totalCents = calculateLineItemTotal(updated);
          }
          return updated;
        }
        return item;
      });
    });
  };

  const addLineItem = () => {
    setLineItems(items => {
      const currentItems = Array.isArray(items) ? items : [];
      return [
        ...currentItems,
        {
          id: Date.now().toString(),
          description: '',
          quantity: 1,
          unitPriceCents: 0,
          totalCents: 0,
        },
      ];
    });
  };

  const removeLineItem = (id: string) => {
    if (Array.isArray(lineItems) && lineItems.length > 1) {
      setLineItems(items => {
        const currentItems = Array.isArray(items) ? items : [];
        return currentItems.filter(item => item.id !== id);
      });
    }
  };

  const subtotalCents = Array.isArray(lineItems) 
    ? lineItems.reduce((sum, item) => sum + (item.totalCents || 0), 0)
    : 0;
  const taxCents = Math.floor(subtotalCents * 0.1); // 10% tax
  const totalCents = subtotalCents + taxCents;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!clientEmail.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      newErrors.clientEmail = 'Invalid email address';
    }

    if (!issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (new Date(dueDate) < new Date(issueDate)) {
      newErrors.dueDate = 'Due date must be after issue date';
    }

    if (Array.isArray(lineItems)) {
      lineItems.forEach((item, index) => {
        if (!item.description.trim()) {
          newErrors[`lineItem-${index}-description`] = 'Description is required';
        }
        if (item.quantity <= 0) {
          newErrors[`lineItem-${index}-quantity`] = 'Quantity must be greater than 0';
        }
        if (item.unitPriceCents < 0) {
          newErrors[`lineItem-${index}-unitPrice`] = 'Unit price cannot be negative';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual API call
      // const response = await api.invoices.create({
      //   clientName,
      //   clientEmail,
      //   issueDate,
      //   dueDate,
      //   description,
      //   lineItems: lineItems.map(item => ({
      //     description: item.description,
      //     quantity: item.quantity,
      //     unitPriceCents: item.unitPriceCents,
      //   })),
      // });

      // For now, just redirect to invoices list
      alert('Invoice created successfully! (This is a mock action)');
      router.push('/merchant/invoices');
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to create invoice' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/merchant/invoices')}
              variant="outline"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create a new invoice for your client
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client name"
                      className={errors.clientName ? 'border-red-500' : ''}
                    />
                    {errors.clientName && (
                      <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className={errors.clientEmail ? 'border-red-500' : ''}
                    />
                    {errors.clientEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Dates */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Invoice Dates</h2>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className={errors.issueDate ? 'border-red-500' : ''}
                    />
                    {errors.issueDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={errors.dueDate ? 'border-red-500' : ''}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter invoice description (optional)"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </CardContent>
              </Card>

              {/* Platform Selection */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Invoice Platform</h2>
                  <p className="text-sm text-gray-500 mt-1">Select the platform where this invoice was generated</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <Select
                      value={platform || 'MANUAL'}
                      onChange={(e) => setPlatform(e.target.value as InvoicePlatform)}
                      options={[
                        { value: 'MANUAL', label: 'Manual (Created in this system)' },
                        { value: 'STRIPE', label: 'Stripe' },
                        { value: 'QUICKBOOKS', label: 'QuickBooks' },
                        { value: 'AUTHORIZE_NET', label: 'Authorize.net' },
                        { value: 'PAYPAL', label: 'PayPal' },
                        { value: 'SQUARE', label: 'Square' },
                      ]}
                      className="w-full"
                    />
                  </div>
                  {platform && platform !== 'MANUAL' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Platform Invoice Link <span className="text-gray-500">(Optional)</span>
                      </label>
                      <Input
                        type="url"
                        value={platformInvoiceLink}
                        onChange={(e) => setPlatformInvoiceLink(e.target.value)}
                        placeholder="https://platform.example.com/invoice/123"
                        className="w-full"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Link to view the invoice on the platform's website
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
                    <Button
                      type="button"
                      onClick={addLineItem}
                      variant="outline"
                      className="text-sm"
                    >
                      + Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lineItems && lineItems.length > 0 ? (
                      lineItems.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-start p-4 border border-gray-200 rounded-lg">
                          <div className="col-span-5">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Description <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              placeholder="Item description"
                              className={errors[`lineItem-${index}-description`] ? 'border-red-500' : ''}
                            />
                            {errors[`lineItem-${index}-description`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`lineItem-${index}-description`]}</p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className={errors[`lineItem-${index}-quantity`] ? 'border-red-500' : ''}
                            />
                            {errors[`lineItem-${index}-quantity`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`lineItem-${index}-quantity`]}</p>
                            )}
                          </div>
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Unit Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-gray-500">$</span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={(item.unitPriceCents / 100).toFixed(2)}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  updateLineItem(item.id, 'unitPriceCents', Math.round(value * 100));
                                }}
                                className={`pl-7 ${errors[`lineItem-${index}-unitPrice`] ? 'border-red-500' : ''}`}
                              />
                            </div>
                            {errors[`lineItem-${index}-unitPrice`] && (
                              <p className="mt-1 text-xs text-red-600">{errors[`lineItem-${index}-unitPrice`]}</p>
                            )}
                          </div>
                          <div className="col-span-1 flex items-end">
                            <div className="w-full">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Total
                              </label>
                              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-900">
                                {formatCurrency(item.totalCents)}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-1 flex items-end">
                            {lineItems.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeLineItem(item.id)}
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No line items. Click "Add Item" to add your first item.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(taxCents)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(totalCents)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">USD</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="space-y-3 pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Creating...' : 'Create Invoice'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.push('/merchant/invoices')}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </MerchantLayout>
  );
}

