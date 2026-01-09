'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { InvoiceFormSteps } from '@/components/invoices/InvoiceFormSteps';
import { RevenueSplitPreview } from '@/components/invoices/RevenueSplitPreview';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { mockInvoiceService, Invoice, InvoiceLineItem } from '@/services/mockInvoices';
import { formatCurrency } from '@/lib/format';

const steps = [
  { id: 'client', label: 'Client Info', description: 'Client details' },
  { id: 'items', label: 'Line Items', description: 'Invoice items' },
  { id: 'partners', label: 'Partners', description: 'Revenue splits' },
  { id: 'review', label: 'Review', description: 'Final review' },
];

export default function CreateInvoicePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    description: '',
    dueDate: '',
    lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, amount: 0 }] as InvoiceLineItem[],
    partnerSplits: [] as Array<{ partnerId: string; partnerName: string; percentage: number }>,
    salesTaxRate: 8,
  });

  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const salesTax = Math.floor(subtotal * (formData.salesTaxRate / 100));
  const total = subtotal + salesTax;

  const handleLineItemChange = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, amount: 0 },
      ],
    }));
  };

  const removeLineItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const invoice = await mockInvoiceService.createInvoice({
        ...formData,
        subtotal,
        salesTax,
        total,
        currency: 'USD',
      });
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Failed to create invoice:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Input
              label="Client Name"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
            />
            <Input
              label="Client Email"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            {formData.lineItems.map((item, index) => (
              <Card key={item.id}>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <Input
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      required
                    />
                    <Input
                      label="Unit Price"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Amount: {formatCurrency(item.amount)}
                    </span>
                    {formData.lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addLineItem}>
              + Add Line Item
            </Button>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Sales Tax ({formData.salesTaxRate}%):</span>
                <span className="font-semibold text-gray-900">{formatCurrency(salesTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select partners to share revenue with (optional)
            </p>
            <Select
              label="Add Partner"
              options={[
                { value: '', label: 'Select a partner...' },
                { value: 'partner-001', label: 'Tech Solutions Inc (30%)' },
                { value: 'partner-002', label: 'Global Services Ltd (25%)' },
              ]}
              onChange={(e) => {
                if (e.target.value) {
                  const partner = e.target.value === 'partner-001'
                    ? { partnerId: 'partner-001', partnerName: 'Tech Solutions Inc', percentage: 30 }
                    : { partnerId: 'partner-002', partnerName: 'Global Services Ltd', percentage: 25 };
                  setFormData(prev => ({
                    ...prev,
                    partnerSplits: [...prev.partnerSplits, partner],
                  }));
                }
              }}
            />
            {formData.partnerSplits.length > 0 && (
              <div className="space-y-2">
                {formData.partnerSplits.map((partner, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{partner.partnerName}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{partner.percentage}%</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            partnerSplits: prev.partnerSplits.filter((_, i) => i !== index),
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <RevenueSplitPreview
              subtotal={subtotal}
              salesTax={salesTax}
              fees={Math.floor(subtotal * 0.03)}
              partnerSplits={formData.partnerSplits.map(partner => ({
                name: partner.partnerName,
                percentage: partner.percentage,
              }))}
            />
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Invoice Summary" />
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-medium">{formData.clientName}</p>
                    <p className="text-sm text-gray-500">{formData.clientEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-medium">{new Date(formData.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Line Items</p>
                    <p className="font-medium">{formData.lineItems.length} item(s)</p>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <RevenueSplitPreview
              subtotal={subtotal}
              salesTax={salesTax}
              fees={Math.floor(subtotal * 0.03)}
              partnerSplits={formData.partnerSplits.map(partner => ({
                name: partner.partnerName,
                percentage: partner.percentage,
              }))}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">Create a new invoice with revenue splits</p>
        </div>

        {/* Steps */}
        <Card>
          <CardContent>
            <InvoiceFormSteps steps={steps} currentStep={currentStep} />
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={currentStep === steps.length ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          <Card>
            <CardHeader title={steps[currentStep - 1].label} />
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            {currentStep < steps.length ? (
              <Button type="submit">
                Next
              </Button>
            ) : (
              <Button type="submit" isLoading={saving}>
                Create Invoice
              </Button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

