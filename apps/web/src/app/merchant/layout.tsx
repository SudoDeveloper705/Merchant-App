'use client';

/**
 * Merchant Layout
 * 
 * Layout for all merchant routes.
 * 
 * NOTE: Authentication protection is temporarily disabled for development.
 * To re-enable, wrap children with <ProtectedRoute>.
 * 
 * Routes:
 * - /merchant/dashboard
 * - /merchant/transactions
 * - /merchant/partners
 * - /merchant/agreements
 * - /merchant/payouts
 * - /merchant/reports
 */
export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily allow access without authentication
  return <>{children}</>;
}

