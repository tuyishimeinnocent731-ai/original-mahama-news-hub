import React, { useState } from 'react';
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

    const handleSubscribeClick = (planId: SubscriptionPlan) => {
        if (isProcessing) return;
        
        setSelectedPlan(planId);
        setIsProcessing(true);

        // Simulate API call for payment
        setTimeout(() => {
            onSubscribe(planId);
            setIsProcessing(false);
            setSelectedPlan(null);
        }, 2000);
    };

    const plansToDisplay = [{
        id: 'free',
        name: 'Free Plan',
        price: '$0/mo',
        features: ['Access to standard news', 'Ad-supported', 'Limited article summaries'],
    }, ...SUBSCRIPTION_PLANS];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Choose Your Plan">
            <div className="p-6">
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                    Unlock exclusive features and get the best news experience.
                </p>
                <div className={`grid grid-cols-1 md:grid-cols-${plansToDisplay.length} gap-6`}>
                    {plansToDisplay.map((plan) => {
                        const isCurrent = currentPlan === plan.id;
                        const isThisPlanProcessing = isProcessing && selectedPlan === plan.id;

                        return (
                            <div 
                                key={plan.id} 
                                className={`border rounded-lg p-6 flex flex-col ${plan.id === 'premium' ? 'border-yellow-500' : 'border-gray-200 dark:border-gray-700'}`}
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
                                    onClick={() => handleSubscribeClick(plan.id as SubscriptionPlan)}
                                    disabled={isCurrent || isProcessing}
                                    className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center transition-colors ${
                                        isCurrent 
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                                        : isThisPlanProcessing
                                        ? 'bg-yellow-400 text-white cursor-wait'
                                        : plan.id === 'premium' 
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {isThisPlanProcessing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : isCurrent ? 'Current Plan' : 'Choose Plan'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Modal>
    );
};

export default PremiumModal;