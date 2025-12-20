'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PartnerLayout } from '@/components/layouts/PartnerLayout';
import { usePartnerAuth } from '@/contexts/PartnerAuthContext';
import { isPartnerOwner, isReadOnly } from '@/utils/partnerRoles';
import Link from 'next/link';

export default function PartnerTeamPage() {
  const { user, loading: authLoading } = usePartnerAuth();
  const router = useRouter();

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </PartnerLayout>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please login to view team</p>
        </div>
      </PartnerLayout>
    );
  }

  // Check if user is partner owner - only owners can access team page
  if (!isPartnerOwner(user.role)) {
    return (
      <PartnerLayout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700">
              Only partner owners can access the team page.
            </p>
            <button
              onClick={() => router.push('/partner/dashboard')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your partner team members</p>
          </div>
          <Link
            href="/partner/staff/invite"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Invite Staff
          </Link>
        </div>

        {/* Team members list */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
          <div className="space-y-4">
            {/* Owner */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{user.name || user.email}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Owner
                </span>
              </div>
            </div>

            {/* Placeholder for staff members */}
            <div className="text-center py-8 text-gray-500">
              <p>No staff members yet.</p>
              <p className="text-sm mt-2">Invite staff members to get started.</p>
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}

