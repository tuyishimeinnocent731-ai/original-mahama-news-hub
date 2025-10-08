import React from 'react';
import Modal from './Modal';
import { SUBSCRIPTION_PLANS } from '../constants';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SubscriptionPlan } from '../types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribeClick: (plan: SubscriptionPlan) => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribeClick }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Your Plan">
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Unlock Exclusive Features</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mb-8">
                    Get the best news experience with our premium plans.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {SUBSCRIPTION_PLANS.map((plan) => (
                    <div 
                        key={plan.id} 
                        className={`bg-white dark:bg-gray-800 border rounded-lg p-6 flex flex-col shadow-lg transition-transform transform hover:scale-105 ${plan.id === 'standard' ? 'border-yellow-500 border-2' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                        {plan.id === 'standard' && (
                            <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full self-center mb-4 absolute -top-4">MOST POPULAR</span>
                        )}
                        <h3 className="text-xl font-semibold mb-2 text-center">{plan.name}</h3>
                        <p className="text-3xl font-bold mb-4 text-center">{plan.price}</p>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button 
                          onClick={() => onSubscribeClick(plan.id)}
                          className={`w-full py-2 rounded-lg font-semibold ${plan.id === 'standard' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                            Subscribe Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </Modal>
  );
};

export default PremiumModal;