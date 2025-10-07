import React, { useState } from 'react';
import Modal from './Modal';
import { VisaIcon } from './icons/VisaIcon';
import { MastercardIcon } from './icons/MastercardIcon';
import { PaypalIcon } from './icons/PaypalIcon';
import { MtnIcon } from './icons/MtnIcon';
import { LockIcon } from './icons/LockIcon';
import { BankIcon } from './icons/BankIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { PaymentRecord } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  onPaymentSuccess: (method: PaymentRecord['method']) => void;
}

type PaymentStep = 'method' | 'details' | 'confirm' | 'success';
type PaymentMethod = 'Credit Card' | 'PayPal' | 'MTN Mobile Money';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planName, price, onPaymentSuccess }) => {
    const [step, setStep] = useState<PaymentStep>('method');
    const [method, setMethod] = useState<PaymentMethod | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectMethod = (selectedMethod: PaymentMethod) => {
        setMethod(selectedMethod);
        setStep('details');
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('confirm');
    };

    const handleConfirmPayment = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
        }, 2000);
    };

    const handleFinish = () => {
        if (method) {
            onPaymentSuccess(method);
        }
    };
    
    const handleBack = (toStep: PaymentStep) => {
        setStep(toStep);
    }
    
    const renderCardForm = () => (
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div>
                <label htmlFor="card-number" className="block text-sm font-medium">Card Number</label>
                <input type="text" id="card-number" placeholder="•••• •••• •••• ••••" required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label htmlFor="expiry" className="block text-sm font-medium">Expiry</label>
                    <input type="text" id="expiry" placeholder="MM / YY" required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="flex-1">
                    <label htmlFor="cvc" className="block text-sm font-medium">CVC</label>
                    <input type="text" id="cvc" placeholder="•••" required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
            </div>
            <button type="submit" className="w-full mt-4 p-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600">
                Continue
            </button>
        </form>
    );
    
    const renderSimpleForm = (title: string, inputLabel: string, inputType: string, placeholder: string) => (
         <form onSubmit={handleDetailsSubmit} className="space-y-4">
             <div>
                <label htmlFor="payment-info" className="block text-sm font-medium text-left">{inputLabel}</label>
                <input type={inputType} id="payment-info" placeholder={placeholder} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button type="submit" className="w-full mt-4 p-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600">
                {`Continue to ${title}`}
            </button>
        </form>
    )

    const renderStepContent = () => {
        switch (step) {
            case 'method':
                return (
                    <div className="space-y-4">
                         <button onClick={() => handleSelectMethod('Credit Card')} className="w-full flex items-center justify-between p-4 border-2 dark:border-gray-600 rounded-lg hover:border-yellow-500">
                            <div className="flex items-center space-x-3"><BankIcon /> <span>Bank Card</span></div>
                            <div className="flex space-x-1"><VisaIcon /><MastercardIcon /></div>
                        </button>
                        <button onClick={() => handleSelectMethod('PayPal')} className="w-full flex items-center justify-between p-4 border-2 dark:border-gray-600 rounded-lg hover:border-yellow-500">
                           <div className="flex items-center space-x-3"><PaypalIcon /></div>
                        </button>
                         <button onClick={() => handleSelectMethod('MTN Mobile Money')} className="w-full flex items-center justify-between p-4 border-2 dark:border-gray-600 rounded-lg hover:border-yellow-500">
                            <div className="flex items-center space-x-3"><MtnIcon /><span>MTN Mobile Money</span></div>
                        </button>
                    </div>
                );
            case 'details':
                return (
                    <div>
                        <button onClick={() => handleBack('method')} className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4">
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                        {method === 'Credit Card' && renderCardForm()}
                        {method === 'PayPal' && renderSimpleForm('PayPal', 'PayPal Email', 'email', 'user@example.com')}
                        {method === 'MTN Mobile Money' && renderSimpleForm('MTN', 'Phone Number', 'tel', '024 123 4567')}
                    </div>
                );
            case 'confirm':
                return (
                    <div>
                         <button onClick={() => handleBack('details')} className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4">
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                        <div className="text-center p-4 bg-secondary rounded-lg">
                            <p className="text-muted-foreground">You are about to subscribe to the</p>
                            <p className="text-2xl font-bold text-accent">{planName} Plan</p>
                            <p className="text-lg font-semibold">for {price}.</p>
                        </div>
                         <button onClick={handleConfirmPayment} disabled={isLoading} className="w-full mt-6 p-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300">
                            {isLoading ? 'Processing...' : `Confirm & Pay ${price}`}
                        </button>
                    </div>
                );
            case 'success':
                 return (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                           <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold mt-4">Payment Successful!</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                           You have successfully subscribed to the {planName} plan. Welcome aboard!
                        </p>
                        <button onClick={handleFinish} className="w-full mt-6 p-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600">
                            Start Reading
                        </button>
                    </div>
                );
        }
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col md:flex-row">
                 {/* Left Panel */}
                <div className="w-full md:w-2/5 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-l-lg">
                    <h3 className="text-xl font-bold">Order Summary</h3>
                    <div className="mt-4 space-y-2 text-sm border-t border-b py-4 dark:border-gray-700">
                        <div className="flex justify-between"><span>{planName} Plan</span><span>{price}</span></div>
                        <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Taxes</span><span>$0.00</span></div>
                    </div>
                    <div className="flex justify-between font-bold mt-4">
                        <span>Total</span>
                        <span>{price}</span>
                    </div>
                    <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 flex items-start space-x-2">
                        <LockIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>Payments are secure and encrypted. You can cancel your subscription at any time.</span>
                    </div>
                </div>
                 {/* Right Panel */}
                <div className="w-full md:w-3/5 p-8">
                     <h3 className="text-xl font-bold mb-4">
                        {step === 'method' && 'Choose Payment Method'}
                        {step === 'details' && `Pay with ${method}`}
                        {step === 'confirm' && 'Confirm Your Purchase'}
                        {step === 'success' && 'Welcome!'}
                     </h3>
                     {renderStepContent()}
                </div>
            </div>
        </Modal>
    )
}

export default PaymentModal;