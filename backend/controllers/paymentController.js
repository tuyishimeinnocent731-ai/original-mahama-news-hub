const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

const YOUR_DOMAIN = process.env.CLIENT_URL || 'http://localhost:3000';

const PLAN_TO_PRICE_ID = {
    standard: process.env.STRIPE_STANDARD_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
};

const createCheckoutSession = async (req, res, next) => {
    const { plan } = req.body;
    const { id: userId, email, stripe_customer_id } = req.user;

    const priceId = PLAN_TO_PRICE_ID[plan];
    if (!priceId) {
        return res.status(400).json({ message: 'Invalid subscription plan.' });
    }

    try {
        let customerId = stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email,
                metadata: {
                    userId,
                },
            });
            customerId = customer.id;
            await pool.query('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, userId]);
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${YOUR_DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/payment/cancel`,
            metadata: {
                userId,
                plan,
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        next(error);
    }
};

const createPortalSession = async (req, res, next) => {
    const { stripe_customer_id } = req.user;

    if (!stripe_customer_id) {
        return res.status(400).json({ message: "User doesn't have a Stripe customer ID." });
    }

    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripe_customer_id,
            return_url: `${YOUR_DOMAIN}/settings`,
        });
        res.json({ url: portalSession.url });
    } catch (error) {
        next(error);
    }
};

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { userId, plan } = session.metadata;
                
                await connection.query('UPDATE users SET stripe_subscription_id = ?, stripe_subscription_status = ? WHERE id = ?', 
                    [session.subscription, 'active', userId]
                );
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
                const plan = Object.keys(PLAN_TO_PRICE_ID).find(p => PLAN_TO_PRICE_ID[p] === subscription.items.data[0].price.id);
                
                await connection.query(
                    'UPDATE users SET subscription = ?, stripe_subscription_status = ? WHERE stripe_customer_id = ?',
                    [plan, 'active', invoice.customer]
                );
                 await connection.query(
                    `INSERT INTO payment_history (id, user_id, date, plan, amount, method, status)
                     SELECT ?, u.id, FROM_UNIXTIME(?), ?, ?, 'Stripe', 'succeeded'
                     FROM users u WHERE u.stripe_customer_id = ?`,
                     [`pay-stripe-${invoice.id}`, invoice.created, plan, (invoice.amount_paid / 100).toFixed(2), invoice.customer]
                 );
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const newPlan = subscription.status === 'canceled' ? 'free' : 
                    Object.keys(PLAN_TO_PRICE_ID).find(p => PLAN_TO_PRICE_ID[p] === subscription.items.data[0].price.id) || 'free';
                
                await connection.query(
                    'UPDATE users SET subscription = ?, stripe_subscription_status = ? WHERE stripe_subscription_id = ?',
                    [newPlan, subscription.status, subscription.id]
                );
                break;
            }
        }
        
        await connection.commit();
        res.json({ received: true });
    } catch (error) {
        await connection.rollback();
        console.error("Webhook handler error:", error);
        res.status(500).json({ message: "Internal server error in webhook handler." });
    } finally {
        connection.release();
    }
};

module.exports = { createCheckoutSession, createPortalSession, handleWebhook };
