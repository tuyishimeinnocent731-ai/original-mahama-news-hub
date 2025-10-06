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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Your Plan">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Unlock more features and enjoy an ad-free experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map(plan => (
                    <div key={plan.id} className={`p-6 rounded-lg border-2 ${currentPlan === plan.id ? 'border-yellow-500' : 'border-gray-200 dark:border-gray-700'}`}>
                        <h4 className="text-xl font-bold text-center mb-2">{plan.name}</h4>
                        <p className="text-3xl font-extrabold text-center mb-4">{plan.price}</p>
                        <ul className="space-y-3 mb-6 text-sm">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                </li>
                             ))}
                        </ul>
                         <button 
                            onClick={() => onSubscribe(plan.id)}
                            disabled={currentPlan === plan.id}
                            className={`w-full font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors ${
                                currentPlan === plan.id 
                                ? 'bg-gray-300 text-gray-500 dark:bg-gray-600 cursor-not-allowed'
                                : 'text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300'
                            }`}
                        >
                            {currentPlan === plan.id ? 'Current Plan' : 'Choose Plan'}
                        </button>
                    </div>
                ))}
            </div>
        </Modal>
    );
}

export default PremiumModal;
