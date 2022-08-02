import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocument, UserDocumentObject } from '../../../models/User';
import type { ReviewDocument } from '../../../models/Review';
import type { ObjectId } from 'mongoose';

import { getReviewDocumentObject } from '../../../utils/casting-helpers';
import TutorPage from '../../../components/tutors/TutorPage';

interface Props {
  isUserAllowedToReview: boolean;
  tutor?: UserDocumentObject;
}

const Page: NextPage<Props> = ({ isUserAllowedToReview, tutor }) => (
  <TutorPage tutor={tutor} isUserAllowedToReview={isUserAllowedToReview} />
);

import { getUserDocumentObject } from '../../../utils/casting-helpers';
import { authOptions } from '../../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import connectionPromise from '../../../middleware/mongo-connect';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const [session, { models }] = await Promise.all([
    getServerSession(context, authOptions),
    connectionPromise,
  ]);
  try {
    const [user, userTutor]: UserDocument[] = await Promise.all([
      models.User.findOne({ email: session?.user?.email }),
      models.User.findById(context.query.tutorId)
        .populate({
          path: 'reviews',
          options: {
            sort: { _id: -1 },
          },
          model: models.Review,
          populate: [
            { path: 'user', model: models.User },
            { path: 'tutor', model: models.User },
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
      return {
        props: {
          tutor,
          isUserAllowedToReview: hasUserCreatedPost || hasUserCreatedSession,
        },
      };
    }

    return {
      props: {
        tutor,
        isUserAllowedToReview: false,
      },
    };
  } catch (e) {
    return {
      props: {
        isUserAllowedToReview: false,
      },
    };
  }
};

export default Page;
