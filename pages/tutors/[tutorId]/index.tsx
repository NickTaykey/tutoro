import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocument, UserDocumentObject } from '../../../models/User';

import TutorPage from '../../../components/tutors/TutorPage';
import User from '../../../models/User';
import Review from '../../../models/Review';

interface Props {
  userCreatedReviews: string[];
  tutor: UserDocumentObject | null;
}

const Page: NextPage<Props> = ({ tutor, userCreatedReviews }) => {
  let markup = <h1>404 Tutor not found!</h1>;
  if (tutor && tutor.reviews) {
    markup = (
      <TutorPage tutor={tutor} userCreatedReviews={userCreatedReviews} />
    );
  }
  return markup;
};

import {
  getPopulateReviews,
  getUserDocumentObject,
} from '../../../utils/user-casting-helpers';
import { authOptions } from '../../api/auth/[...nextauth]';
import connectDB from '../../../middleware/mongo-connect';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const [, session] = await Promise.all([
    connectDB(),
    getServerSession(context, authOptions),
  ]);
  const [user, userTutor] = await Promise.all([
    User.findOne({ email: session?.user?.email }),
    User.findById(context.query.tutorId)
      .populate({
        path: 'reviews',
        options: {
          sort: { _id: -1 },
        },
        model: Review,
      })
      .exec(),
  ]);
  const tutor = getUserDocumentObject(userTutor as UserDocument);
  tutor.reviews = getPopulateReviews(userTutor.reviews);
  if (user) {
    const userCreatedReviews: string[] = user.createdReviews.map(
      (r: mongoose.ObjectId) => r.toString()
    );
    return {
      props: {
        userCreatedReviews,
        tutor,
      },
    };
  }
  return { props: { userCreatedReviews: [], tutor } };
};

export default Page;
