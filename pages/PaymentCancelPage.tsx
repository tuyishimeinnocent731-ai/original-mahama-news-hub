import React from 'react';
import { ShieldExclamationIcon } from '../components/icons/ShieldExclamationIcon';

interface PaymentCancelPageProps {
    onBack: () => void;
    onTryAgain: () => void;
}

const PaymentCancelPage: React.FC<PaymentCancelPageProps> = ({ onBack, onTryAgain }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <ShieldExclamationIcon className="w-24 h-24 text-destructive mb-6" />
            <h1 className="text-4xl font-extrabold tracking-tight">Payment Cancelled</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
                Your subscription process was cancelled. You have not been charged.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onTryAgain}
                    className="px-8 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold"
                >
                    Try Again
                </button>
                <button
                    onClick={onBack}
                    className="px-8 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-muted font-semibold"
                >
                    Back to Homepage
                </button>
            </div>
        </div>
    );
};

export default PaymentCancelPage;
