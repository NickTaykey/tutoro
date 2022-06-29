import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { GetServerSideProps, NextPage } from 'next';
import Review from '../../../components/reviews/Review';

import * as types from '../../../types';

interface Props {
  currentTutor: string | null;
}

const ProfilePage: NextPage<Props> = ({ currentTutor }) => {
  if (currentTutor) {
    const parsedCurrentTutor: UserDocument = JSON.parse(currentTutor);
    return (
      <>
        <h1>Hi, {parsedCurrentTutor.fullname}!</h1>
        {parsedCurrentTutor.reviews.map((r: types.TutorReviewObject) => (
          <Review key={r._id} tutorId={parsedCurrentTutor._id} review={r} />
        ))}
        {parsedCurrentTutor.requestedSessions.map((s: types.Session) => {
          const date = new Date(s.date);
          return (
            <article key={s._id} style={{ border: '1px solid black' }}>
              <div>Subject: {s.topic}</div>
              <div>
                <strong>{s.hours} hours</strong>
              </div>
              <p>{s.topic}</p>
              <time dateTime={date.toDateString()}>{date.toDateString()}</time>
              <div>
                <strong>Not accepted yet!</strong>
                <br />
                <button>Accept session</button>
              </div>
            </article>
          );
        })}
      </>
    );
  }
  return <h1>For now only tutors can visit this page</h1>;
};

import User from '../../../models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]';
import connectDB from '../../../middleware/mongo-connect';
import type { UserDocument } from '../../../types';
import ReviewModel from '../../../models/Review';
import mongoose from 'mongoose';
import ApiHelper from '../../../utils/api-helper';

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
