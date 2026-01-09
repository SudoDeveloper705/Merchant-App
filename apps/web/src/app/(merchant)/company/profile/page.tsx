'use client';

import { useState, useEffect, FormEvent } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FormSection, FormField } from '@/components/company';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { mockCompanyService, CompanyProfile } from '@/services/mockCompany';

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CompanyProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await mockCompanyService.getCompanyProfile();
      setFormData(data);
    } catch (error) {
      console.error('Failed to load company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CompanyProfile) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (field === 'address') {
      const addressField = e.target.name.split('.')[1] as keyof CompanyProfile['address'];
      setFormData(prev => prev ? {
        ...prev,
        address: {
          ...prev.address,
          [addressField]: e.target.value,
        },
      } : null);
    } else {
      setFormData(prev => prev ? {
        ...prev,
        [field]: e.target.value,
      } : null);
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (formData) {
        await mockCompanyService.updateCompanyProfile(formData);
        setIsEditing(false);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your company information</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <FormSection
            title="Basic Information"
            subtitle="Company name and contact details"
            readOnly={!isEditing}
            action={isEditing && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  loadProfile();
                }}
              >
                Cancel
              </Button>
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Company Name" required readOnly={!isEditing}>
                <Input
                  value={formData.name}
                  onChange={handleChange('name')}
                  disabled={!isEditing}
                  required
                />
              </FormField>

              <FormField label="Legal Name" required readOnly={!isEditing}>
                <Input
                  value={formData.legalName}
                  onChange={handleChange('legalName')}
                  disabled={!isEditing}
                  required
                />
              </FormField>

              <FormField label="Tax ID / EIN" required readOnly={!isEditing}>
                <Input
                  value={formData.taxId}
                  onChange={handleChange('taxId')}
                  disabled={!isEditing}
                  required
                />
              </FormField>

              <FormField label="Email" required readOnly={!isEditing}>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={!isEditing}
                  required
                />
              </FormField>

              <FormField label="Phone" readOnly={!isEditing}>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  disabled={!isEditing}
                />
              </FormField>

              <FormField label="Website" readOnly={!isEditing}>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={handleChange('website')}
                  disabled={!isEditing}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Address */}
          <FormSection
            title="Business Address"
            subtitle="Company headquarters address"
            readOnly={!isEditing}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Street Address" required readOnly={!isEditing}>
                <Input
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange('address')}
                  disabled={!isEditing}
                  required
                />
              </FormField>

              <FormField label="City" required readOnly={!isEditing}>
                <Input
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange('address')}
                  disabled={!isEditing}
                  required
                />
              </FormField>

              <FormField label="State / Province" required readOnly={!isEditing}>
                <Input
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange('address')}
                  disabled={!isEditing}
                  required
                />
              </FormField>

              <FormField label="ZIP / Postal Code" required readOnly={!isEditing}>
                <Input
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange('address')}
                  disabled={!isEditing}
                  required
                />
              </FormField>

              <FormField label="Country" required readOnly={!isEditing}>
                <Input
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange('address')}
                  disabled={!isEditing}
                  required
                />
              </FormField>
            </div>
          </FormSection>

          {/* Company Details */}
          <FormSection
            title="Company Details"
            subtitle="Additional company information"
            readOnly={!isEditing}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Industry" readOnly={!isEditing}>
                <Select
                  options={[
                    { value: 'Technology', label: 'Technology' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Healthcare', label: 'Healthcare' },
                    { value: 'Retail', label: 'Retail' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, industry: e.target.value } : null)}
                  disabled={!isEditing}
                />
              </FormField>

              <FormField label="Founded Year" readOnly={!isEditing}>
                <Input
                  type="number"
                  value={formData.foundedYear}
                  onChange={handleChange('foundedYear')}
                  disabled={!isEditing}
                />
              </FormField>

              <FormField label="Employee Count" readOnly={!isEditing}>
                <Select
                  options={[
                    { value: '1-10', label: '1-10' },
                    { value: '11-50', label: '11-50' },
                    { value: '50-100', label: '50-100' },
                    { value: '100-500', label: '100-500' },
                    { value: '500+', label: '500+' },
                  ]}
                  value={formData.employeeCount}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, employeeCount: e.target.value } : null)}
                  disabled={!isEditing}
                />
              </FormField>
            </div>

            <div className="mt-6">
              <FormField label="Description" readOnly={!isEditing}>
                <Textarea
                  value={formData.description}
                  onChange={handleChange('description')}
                  disabled={!isEditing}
                  rows={4}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Submit Button */}
          {isEditing && (
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  loadProfile();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}

