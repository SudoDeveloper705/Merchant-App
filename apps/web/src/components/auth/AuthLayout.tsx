'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Merchant<span className="text-primary-600">App</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Sign In
              </Link>
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>

            {/* Form Content */}
            {children}

            {/* Footer */}
            {footer && (
              <div className="mt-6 text-center">
                {footer}
              </div>
            )}
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Merchant App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

