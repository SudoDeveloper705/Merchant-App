'use client';

export function LandingFeatures() {
  const features = [
    {
      title: 'Revenue Split Engine',
      description: 'Automated revenue sharing with percentage-based and minimum guarantee agreements.',
      icon: '💰',
    },
    {
      title: 'Partner Management',
      description: 'Seamlessly manage multiple partners with role-based access control.',
      icon: '🤝',
    },
    {
      title: 'Stripe Integration',
      description: 'Connect your Stripe account and automatically sync transactions.',
      icon: '💳',
    },
    {
      title: 'Real-time Dashboard',
      description: 'Monitor your financial metrics with comprehensive dashboards and reports.',
      icon: '📊',
    },
    {
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with JWT authentication and encrypted data storage.',
      icon: '🔒',
    },
    {
      title: 'Export & Reporting',
      description: 'Export transactions, payouts, and settlement reports in CSV format.',
      icon: '📄',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to simplify your financial operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

