'use client';

import { Badge } from '@/components/ui';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const roleConfig: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'default'; label: string }> = {
    merchant_owner: { variant: 'success', label: 'Merchant Owner' },
    merchant_manager: { variant: 'info', label: 'Manager' },
    merchant_accountant: { variant: 'info', label: 'Accountant' },
    partner_owner: { variant: 'warning', label: 'Partner Owner' },
    partner_staff: { variant: 'default', label: 'Partner Staff' },
    super_admin: { variant: 'error', label: 'Super Admin' },
    admin: { variant: 'info', label: 'Admin' },
    viewer: { variant: 'default', label: 'Viewer' },
  };

  const config = roleConfig[role.toLowerCase()] || { variant: 'default' as const, label: role };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

