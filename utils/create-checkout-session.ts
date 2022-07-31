import type { SessionDocumentObject } from '../models/Session';
import type { NextApiResponse, NextApiRequest } from 'next';
import type { PostDocumentObject } from '../models/Post';
import Stripe from 'stripe';
import { UserDocumentObject } from '../models/User';
import { PostType } from '../types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27',
});

export default async function createCheckoutSession(
  product: SessionDocumentObject | PostDocumentObject,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = product as SessionDocumentObject;
  const post = product as PostDocumentObject;
  const isSession = Boolean(session.hours);
  const tutor = isSession
    ? (session.tutor as UserDocumentObject)
    : post.type === PostType.SPECIFIC
    ? (post.answeredBy as UserDocumentObject)
    : null;
  const price = isSession
    ? tutor!.sessionPricePerHour * session.hours
    : post.type === PostType.SPECIFIC
    ? tutor!.pricePerPost
    : 20;

  const sessionUrl =
    isSession &&
    `/${tutor!._id}/sessions/${
      session._id
    }/complete-session-checkout/{CHECKOUT_SESSION_ID}`;
  const specificPostUrl =
    post.type === PostType.SPECIFIC &&
    `/${tutor!._id}/posts/${
      post._id
    }/complete-post-checkout/{CHECKOUT_SESSION_ID}`;
  const globalPostUrl =
    post.type === PostType.GLOBAL &&
    `/global/posts/${post._id}/complete-post-checkout/{CHECKOUT_SESSION_ID}`;

  const stripeSession = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: isSession
              ? `Tutoring session with ${
                  (session.tutor as UserDocumentObject).fullname
                }`
              : post.type === PostType.SPECIFIC
              ? `Post to ${(post.answeredBy as UserDocumentObject).fullname}`
              : 'Global Post',
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.headers.origin}/api/tutors${
      sessionUrl || specificPostUrl || globalPostUrl
    }`,
    cancel_url: `${req.headers.origin}/tutors/${
      isSession
        ? tutor!._id + '/sessions/new'
        : post.type === PostType.GLOBAL
        ? 'global/posts/new'
        : `/${tutor!._id}/posts/new`
    }`,
  });
  res.json({ redirectUrl: stripeSession.url! });
}
