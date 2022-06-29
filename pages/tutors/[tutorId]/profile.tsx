import Session from '../../../components/sessions/Session';
import Review from '../../../components/reviews/Review';
import SessionsContextProvider from '../../../store/SessionsProvider';

import {
  UserDocument,
  TutorReviewObject,
  SessionDocument,
} from '../../../types';
import type { GetServerSideProps, NextPage } from 'next';

interface Props {
  currentTutor: string | null;
}

const ProfilePage: NextPage<Props> = ({ currentTutor }) => {
  if (currentTutor) {
    const parsedCurrentTutor: UserDocument = JSON.parse(currentTutor);
    return (
      <>
        <h1>Hi, {parsedCurrentTutor.fullname}!</h1>
        {parsedCurrentTutor.reviews.map((r: TutorReviewObject) => (
          <Review key={r._id} tutorId={parsedCurrentTutor._id} review={r} />
        ))}
        <SessionsContextProvider
          sessions={parsedCurrentTutor.requestedSessions}
          tutorId={parsedCurrentTutor._id}
        >
          <SessionsContext.Consumer>
            {ctx => {
              return ctx.sessions.map((s: SessionDocument) => (
                <Session key={parsedCurrentTutor._id} session={s} />
              ));
            }}
          </SessionsContext.Consumer>
        </SessionsContextProvider>
      </>
    );
  }
  return <h1>For now only tutors can visit this page</h1>;
};

import User from '../../../models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]';
import connectDB from '../../../middleware/mongo-connect';
import ReviewModel from '../../../models/Review';
import mongoose from 'mongoose';
import SessionsContext from '../../../store/sessions-context';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  await connectDB();
  const session = await getServerSession(context, authOptions);
  const currentTutor: mongoose.Document = await User.findOne({
    isTutor: true,
    email: session?.user?.email,
  })
    .populate('requestedSessions')
    .populate({
      path: 'reviews',
      options: {
        sort: { _id: -1 },
      },
      model: ReviewModel,
    })
    .exec();
  if (currentTutor) {
    return {
      props: {
        currentTutor: JSON.stringify(currentTutor),
      },
    };
  }
  return { props: { currentTutor: null } };
};

export default ProfilePage;
