import React from 'react';
import { SUBSCRIPTION_PLANS } from '../constants';

const PremiumPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
                Unlock exclusive features and get the best news experience with our premium plans.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
                <div 
                    key={plan.id} 
                    className={`bg-white dark:bg-gray-800 border rounded-lg p-8 flex flex-col shadow-lg transition-transform transform hover:scale-105 ${plan.id === 'standard' ? 'border-yellow-500 border-2' : 'border-gray-200 dark:border-gray-700'}`}
                >
                    {plan.id === 'standard' && (
                        <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full self-center mb-4 absolute -top-4">MOST POPULAR</span>
                    )}
                    <h3 className="text-2xl font-semibold mb-3 text-center">{plan.name}</h3>
                    <p className="text-4xl font-bold mb-6 text-center">{plan.price}<span className="text-base font-normal text-gray-500">/mo</span></p>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-8 flex-grow">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <button className={`w-full py-3 rounded-lg font-semibold text-lg ${plan.id === 'standard' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        {plan.id === 'free' ? 'Your Current Plan' : 'Subscribe Now'}
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default PremiumPage;
