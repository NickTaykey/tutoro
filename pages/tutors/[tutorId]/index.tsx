import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocument } from '../../../types';

import TutorPage from '../../../components/TutorPage';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ApiHelper from '../../../utils/api-helper';

interface Props {
  userCreatedReviewsIds: string[];
}

const Page: NextPage<Props> = (props: Props) => {
  const router = useRouter();
  const [tutor, setTutor] = useState<UserDocument | null>();

  useEffect(() => {
    if (router.query.tutorId) {
      ApiHelper(`/api/tutors/${router.query.tutorId}`, {}, 'GET').then(
        features => setTutor(features)
      );
    }
  }, [router.query.tutorId]);

  let markup = <h1>Loading</h1>;
  if (tutor && !tutor.reviews) markup = <h1>404 Tutor not found!</h1>;
  if (tutor && tutor.reviews) {
    markup = (
      <TutorPage
        tutor={tutor}
        userCreatedReviewsIds={props.userCreatedReviewsIds}
      />
    );
  }

  return markup;
};

import User from '../../../models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]';
import mongoose from 'mongoose';
import connectDB from '../../../middleware/mongo-connect';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  await connectDB();
  const session = await getServerSession(context, authOptions);
  const user = await User.findOne({ email: session?.user?.email });
  if (user) {
    const userCreatedReviewsIds: string[] = user.createdReviews.map(
      (r: mongoose.ObjectId) => r.toString()
    );
    return {
      props: {
        userCreatedReviewsIds,
      },
    };
  }
  return { props: { userCreatedReviewsIds: [] } };
};

export default Page;
