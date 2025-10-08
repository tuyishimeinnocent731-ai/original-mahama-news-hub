import React from 'react';
import { User } from '../../types';
import { VisaIcon } from '../icons/VisaIcon';
import { PaypalIcon } from '../icons/PaypalIcon';
import { TrashIcon } from '../icons/TrashIcon';
import * as paymentService from '../../services/paymentService';
import { useToast } from '../../contexts/ToastContext';

interface BillingSettingsProps {
    user: User;
}

const BillingSettings: React.FC<BillingSettingsProps> = ({ user }) => {
    const { addToast } = useToast();

    const getStatusChip = (status: 'succeeded' | 'pending' | 'failed') => {
        const styles = {
            succeeded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
    }

    const handleManageSubscription = async () => {
        try {
            await paymentService.createCustomerPortalSession();
        } catch (error: any) {
            addToast(error.message || "Could not open subscription manager.", 'error');
        }
    };

    const hasActiveStripeSubscription = user.stripe_customer_id && user.subscription !== 'free';

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Billing & Payments</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">View your transaction history and manage payment methods.</p>
            
            <div className="space-y-8">
                {/* Payment Methods */}
                <div>
                    <h4 className="font-semibold text-lg mb-4">Manage Subscription</h4>
                    {hasActiveStripeSubscription ? (
                        <div className="p-4 border dark:border-gray-700 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-medium">Your subscription is managed by Stripe.</p>
                                <p className="text-xs text-gray-500">Click to update payment methods, view invoices, or cancel.</p>
                            </div>
                            <button onClick={handleManageSubscription} className="px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-md hover:bg-accent/90">
                                Manage Subscription
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 border dark:border-gray-700 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">You do not have an active subscription managed by Stripe.</p>
                        </div>
                    )}
                </div>

                {/* Payment History */}
                <div>
                    <h4 className="font-semibold text-lg mb-4">Local Payment History</h4>
                    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Details</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
                                {user.paymentHistory.length > 0 ? user.paymentHistory.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 text-sm">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <p className="font-medium capitalize">{p.plan} Plan</p>
                                            <p className="text-xs text-gray-500">{p.method}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{p.amount}</td>
                                        <td className="px-4 py-3 text-sm">{getStatusChip(p.status)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-sm text-gray-500">No payment history.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSettings;