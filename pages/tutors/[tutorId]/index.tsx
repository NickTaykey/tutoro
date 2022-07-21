import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocument, UserDocumentObject } from '../../../models/User';

import { getReviewDocumentObject } from '../../../utils/casting-helpers';
import TutorPage from '../../../components/tutors/TutorPage';
import User from '../../../models/User';
import Review, { ReviewDocumentObject } from '../../../models/Review';

interface Props {
  host: string;
  userCreatedReviews: string[];
  tutor: UserDocumentObject | null;
}

const Page: NextPage<Props> = ({ tutor, userCreatedReviews, host }) => {
  let markup = <h1>404 Tutor not found!</h1>;
  if (tutor && tutor.reviews) {
    markup = (
      <TutorPage
        tutor={tutor}
        userCreatedReviews={userCreatedReviews}
        host={host}
      />
    );
  }
  return markup;
};

import { getUserDocumentObject } from '../../../utils/casting-helpers';
import { authOptions } from '../../api/auth/[...nextauth]';
import connectDB from '../../../middleware/mongo-connect';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const { host } = context.req.headers;
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
      const userCreatedReviews: string[] = user.createdReviews.map(
        (r: mongoose.ObjectId) => r.toString()
      );
      tutor.reviews.sort((a: ReviewDocumentObject, b: ReviewDocumentObject) =>
        userCreatedReviews.includes(a._id) ? -1 : 1
      );
      return {
        props: {
          userCreatedReviews,
          host: host!,
          tutor,
        },
      };
    }
    return {
      props: { userCreatedReviews: [], host: host!, tutor },
    };
  } catch (e) {
    return {
      props: { userCreatedReviews: [], host: host!, tutor: null },
    };
  }
};

export default Page;
