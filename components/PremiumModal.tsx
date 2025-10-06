import React from 'react';
import Modal from './Modal';
import { SubscriptionPlan } from '../types';
import { SUBSCRIPTION_PLANS } from '../constants';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe: (plan: SubscriptionPlan) => void;
    currentPlan: SubscriptionPlan;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribe, currentPlan }) => {

    const CheckmarkIcon = () => (
      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Your Plan">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                    Become a Premium Member
                </h3>
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                    Unlock exclusive features and enjoy an ad-free experience.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map(plan => {
                    const isCurrent = currentPlan === plan.id;
                    const isRecommended = plan.id === 'standard';
                    return (
                        <div key={plan.id} className={`relative p-8 rounded-2xl shadow-lg flex flex-col ${isRecommended ? 'border-2 border-yellow-500' : 'bg-white dark:bg-gray-800'}`}>
                            {isRecommended && (
                                <div className="absolute top-0 right-6 -mt-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Best Value
                                </div>
                            )}
                            <h4 className="text-xl font-bold text-center mb-2">{plan.name}</h4>
                            <p className="text-4xl font-extrabold text-center mb-6">{plan.price}</p>
                            <ul className="space-y-3 mb-8 text-sm flex-grow">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start">
                                        <CheckmarkIcon />
                                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={() => onSubscribe(plan.id)}
                                disabled={isCurrent}
                                className={`w-full font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors duration-300 ${
                                    isCurrent 
                                    ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 cursor-not-allowed'
                                    : isRecommended
                                    ? 'text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300'
                                    : 'text-gray-900 bg-gray-200 hover:bg-gray-300 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600'
                                }`}
                            >
                                {isCurrent ? 'Current Plan' : 'Choose Plan'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
}

export default PremiumModal;