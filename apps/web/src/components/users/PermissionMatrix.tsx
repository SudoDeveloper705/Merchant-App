'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  granted: boolean;
}

interface PermissionMatrixProps {
  permissions: Permission[];
  onPermissionChange?: (permissionId: string, granted: boolean) => void;
  readOnly?: boolean;
  className?: string;
}

export function PermissionMatrix({
  permissions,
  onPermissionChange,
  readOnly = false,
  className = '',
}: PermissionMatrixProps) {
  const [localPermissions, setLocalPermissions] = useState<Permission[]>(permissions);

  const categories = Array.from(new Set(permissions.map(p => p.category)));

  const handleToggle = (permissionId: string) => {
    if (readOnly) return;
    
    const updated = localPermissions.map(p =>
      p.id === permissionId ? { ...p, granted: !p.granted } : p
    );
    setLocalPermissions(updated);
    onPermissionChange?.(permissionId, updated.find(p => p.id === permissionId)?.granted || false);
  };

  return (
    <div className={className}>
      {categories.map((category) => {
        const categoryPermissions = localPermissions.filter(p => p.category === category);
        const grantedCount = categoryPermissions.filter(p => p.granted).length;
        
        return (
          <Card key={category} className="mb-4" padding="none">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                <span className="text-sm font-normal text-gray-500">
                  {grantedCount} / {categoryPermissions.length} granted
                </span>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                {categoryPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className={`flex items-start justify-between p-3 rounded-lg border ${
                      permission.granted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{permission.name}</h4>
                        {permission.granted && (
                          <span className="inline-flex items-center">
                            <Badge variant="success">Granted</Badge>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{permission.description}</p>
                    </div>
                    {!readOnly && (
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={permission.granted}
                          onChange={() => handleToggle(permission.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

