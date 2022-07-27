import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocument, UserDocumentObject } from '../../../models/User';

import { getReviewDocumentObject } from '../../../utils/casting-helpers';
import TutorPage from '../../../components/tutors/TutorPage';
import User from '../../../models/User';
import Review, {
  ReviewDocument,
  ReviewDocumentObject,
} from '../../../models/Review';

interface Props {
  isUserAllowedToReview: boolean;
  userCreatedReviews: string[];
  tutor?: UserDocumentObject;
}

const Page: NextPage<Props> = ({
  isUserAllowedToReview,
  userCreatedReviews,
  tutor,
}) => (
  <TutorPage
    tutor={tutor}
    isUserAllowedToReview={isUserAllowedToReview}
    userCreatedReviews={userCreatedReviews}
  />
);

import { getUserDocumentObject } from '../../../utils/casting-helpers';
import { authOptions } from '../../api/auth/[...nextauth]';
import connectDB from '../../../middleware/mongo-connect';
import { getServerSession } from 'next-auth';
import mongoose, { ObjectId } from 'mongoose';
import { PostDocument } from '../../../models/Post';
import Layout from '../../../components/global/Layout';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const [session] = await Promise.all([
    getServerSession(context, authOptions),
    connectDB(),
  ]);
  try {
    const [user, userTutor]: UserDocument[] = await Promise.all([
      User.findOne({ email: session?.user?.email }),
      User.findById(context.query.tutorId)
        .populate({
          path: 'reviews',
          options: {
            sort: { _id: -1 },
          },
          model: Review,
          populate: [
            { path: 'user', model: User },
            { path: 'tutor', model: User },
          ],
        })
        .exec(),
    ]);
    const tutor = getUserDocumentObject(userTutor as UserDocument);
    tutor.reviews = userTutor.reviews.map(r =>
      getReviewDocumentObject(r as ReviewDocument)
    );
    if (user) {
      const hasUserCreatedPost =
        new Set([
          ...userTutor.posts.map(id => (id as ObjectId).toString()),
          ...user.createdPosts.map(id => (id as ObjectId).toString()),
        ]).size !==
        userTutor.posts.length + user.createdPosts.length;
      const hasUserCreatedSession =
        new Set([
          ...userTutor.requestedSessions.map(id => (id as ObjectId).toString()),
          ...user.bookedSessions.map(id => (id as ObjectId).toString()),
        ]).size !==
        userTutor.requestedSessions.length + user.bookedSessions.length;
      const userCreatedReviews: string[] = user
        .toObject()
        .createdReviews.map((r: mongoose.ObjectId) => r.toString());
      tutor.reviews.sort((a: ReviewDocumentObject, b: ReviewDocumentObject) =>
        userCreatedReviews.includes(a._id) ? -1 : 1
      );
      return {
        props: {
          userCreatedReviews,
          tutor,
          isUserAllowedToReview: hasUserCreatedPost || hasUserCreatedSession,
        },
      };
    }
    return {
      props: {
        userCreatedReviews: [],
        tutor,
        isUserAllowedToReview: false,
      },
    };
  } catch (e) {
    return {
      props: {
        userCreatedReviews: [],
        isUserAllowedToReview: false,
      },
    };
  }
};

export default Page;
