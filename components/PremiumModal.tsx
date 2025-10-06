import React from 'react';
import Modal from './Modal';
import { SUBSCRIPTION_PLANS } from '../constants';
import { SubscriptionPlan } from '../types';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe: (plan: SubscriptionPlan) => void;
    currentPlan: SubscriptionPlan;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribe, currentPlan }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade to Premium">
        <div className="p-6">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                Unlock exclusive features and get the best news experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map((plan) => (
                    <div 
                        key={plan.id} 
                        className={`border rounded-lg p-6 flex flex-col ${plan.id === 'standard' ? 'border-yellow-500' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                        <p className="text-3xl font-bold mb-4">{plan.price}</p>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <svg className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => onSubscribe(plan.id)}
                            disabled={currentPlan === plan.id}
                            className={`w-full py-2 rounded-lg font-semibold ${
                                currentPlan === plan.id 
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                                : plan.id === 'standard' 
                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {currentPlan === plan.id ? 'Current Plan' : 'Choose Plan'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </Modal>
  );
};

export default PremiumModal;