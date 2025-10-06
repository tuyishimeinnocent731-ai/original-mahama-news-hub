import React from 'react';
import { User } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../constants';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface SubscriptionSettingsProps {
    user: User;
    onUpgradeClick: () => void;
}

const SubscriptionSettings: React.FC<SubscriptionSettingsProps> = ({ user, onUpgradeClick }) => {
    const currentPlanDetails = SUBSCRIPTION_PLANS.find(p => p.id === user.subscription);
    
    if (!currentPlanDetails) {
        return <div>Could not load subscription details.</div>;
    }

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Subscription</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your subscription plan and billing details.</p>
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-lg font-semibold">Your Current Plan</h4>
                        <p className="text-3xl font-bold text-yellow-500 mt-1">{currentPlanDetails.name}</p>
                    </div>
                    <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900 rounded-full">
                        Active
                    </span>
                </div>
                <div className="mt-6">
                    <h5 className="font-semibold mb-3">Plan Features:</h5>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {currentPlanDetails.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <button 
                        onClick={onUpgradeClick}
                        className="w-full sm:w-auto px-6 py-2.5 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600"
                    >
                        {user.subscription === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionSettings;
