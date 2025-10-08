import { api } from './apiService';
import { SubscriptionPlan } from '../types';

declare const Stripe: any;

const stripePromise = (async () => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
        console.error("Stripe publishable key not found. Please set it in your environment variables.");
        return null;
    }
    return Stripe(publishableKey);
})();


export const createCheckoutSession = async (plan: SubscriptionPlan) => {
    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe.js has not loaded yet.");

    const { sessionId } = await api.post<{ sessionId: string }>('/api/payments/create-checkout-session', { plan });

    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
        console.error("Stripe checkout error:", error);
        throw new Error(error.message);
    }
};

export const createCustomerPortalSession = async () => {
    const { url } = await api.post<{ url: string }>('/api/payments/customer-portal', {});
    window.location.href = url;
};
