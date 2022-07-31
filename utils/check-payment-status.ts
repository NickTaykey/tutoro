import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27',
});

export default function checkPaymentStatus(sessionId: string) {
  return new Promise(async (resolve, reject) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') return resolve(null);
    reject();
  });
}
