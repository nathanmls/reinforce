'use client';

const plans = [
  {
    name: 'Basic',
    price: '$9.99',
    period: 'month',
    features: [
      'Access to Elementary School Mentor',
      '10 hours of chat per month',
      'Basic progress tracking',
      'Email support'
    ],
    recommended: false
  },
  {
    name: 'Standard',
    price: '$19.99',
    period: 'month',
    features: [
      'Access to all School Mentors',
      'Unlimited chat hours',
      'Detailed progress tracking',
      'Priority email support',
      'Personalized learning paths'
    ],
    recommended: true
  },
  {
    name: 'Premium',
    price: '$29.99',
    period: 'month',
    features: [
      'Access to all Mentors including College Prep',
      'Unlimited chat hours',
      'Advanced analytics and reporting',
      '24/7 priority support',
      'Personalized learning paths',
      'Parent/Teacher dashboard access'
    ],
    recommended: false
  }
];

export default function PlanPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Subscription Plans</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-lg shadow-lg overflow-hidden ${
              plan.recommended ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {plan.recommended && (
              <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                Recommended
              </div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{plan.name}</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  plan.recommended
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } transition-colors`}
              >
                {plan.recommended ? 'Start Free Trial' : 'Choose Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Can I switch plans anytime?
            </h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-gray-600">
              Yes, we offer a 7-day free trial for all new users on any plan.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600">
              We accept all major credit cards, PayPal, and bank transfers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
