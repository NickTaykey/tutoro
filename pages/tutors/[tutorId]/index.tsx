import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocument, UserDocumentObject } from '../../../models/User';

import { getReviewDocumentObject } from '../../../utils/casting-helpers';
import TutorPage from '../../../components/tutors/TutorPage';
import User from '../../../models/User';
import Review, { ReviewDocumentObject } from '../../../models/Review';

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
import mongoose from 'mongoose';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const [, session] = await Promise.all([
    connectDB(),
    getServerSession(context, authOptions),
  ]);
  try {
    const [user, userTutor] = await Promise.all([
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
    tutor.reviews = userTutor.reviews.map(getReviewDocumentObject);
    if (user) {
      const hasUserCreatedPost =
        new Set(...userTutor.posts, ...user.createdPosts).size !==
        userTutor.posts.length + user.createdPosts.length;
      const hasUserCreatedSession =
        new Set(...userTutor.requestedSessions, ...user.bookedSessions).size !==
        userTutor.requestedSessions.length + user.bookedSessions.length;
      const userCreatedReviews: string[] = user.createdReviews.map(
        (r: mongoose.ObjectId) => r.toString()
      );
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
