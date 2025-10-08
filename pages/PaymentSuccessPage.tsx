import React, { useEffect } from 'react';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';

interface PaymentSuccessPageProps {
    onContinue: () => void;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ onContinue }) => {

    useEffect(() => {
        // Automatically redirect after a few seconds
        const timer = setTimeout(() => {
            onContinue();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onContinue]);


    return (
        <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
            <h1 className="text-4xl font-extrabold tracking-tight">Thank You!</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
                Your subscription has been successfully activated. Your account details will be updated shortly.
            </p>
            <button
                onClick={onContinue}
                className="mt-8 px-8 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold"
            >
                Continue to Homepage
            </button>
        </div>
    );
};

export default PaymentSuccessPage;
