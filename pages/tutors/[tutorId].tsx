import type { NextPage } from 'next';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { TutorReviewObject, UserDocument } from '../../types';
import { useEffect, useState } from 'react';
import Review from '../../components/reviews/Review';
import ApiHelper from '../../utils/api-helper';
import ReviewsContextProvider from '../../store/ReviewsProvider';
import ReviewContext from '../../store/reviews-context';
import ReviewForm, {
  ReviewFormTypes,
} from '../../components/reviews/ReviewForm';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const TutorPage: React.FC<Props> = (props: Props) => {
  const router = useRouter();
  const [tutor, setTutor] = useState<UserDocument | null>();
  const { status } = useSession();

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
      <>
        <h1>{tutor.fullname}</h1>
        <ReviewsContextProvider
          reviews={tutor.reviews.map(r => ({
            ...r,
            ownerAuthenticated:
              props.userCreatedReviewsIds.indexOf(r._id) !== -1,
          }))}
        >
          <ReviewContext.Consumer>
            {reviewsCtx => (
              <>
                {status === 'authenticated' && (
                  <ReviewForm
                    type={ReviewFormTypes.Create}
                    tutorId={tutor._id}
                  />
                )}
                {status === 'unauthenticated' && (
                  <Link
                    href={`http://localhost:3000/api/auth/signin?callbackUrl=/tutors/${tutor._id}`}
                  >
                    Sign In
                  </Link>
                )}
                {reviewsCtx.reviews.map((r: TutorReviewObject) => (
                  <Review key={r._id} review={r} tutorId={tutor._id} />
                ))}
              </>
            )}
          </ReviewContext.Consumer>
        </ReviewsContextProvider>
      </>
    );
  }

  return markup;
};

import User from '../../models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import mongoose from 'mongoose';
import connectDB from '../../middleware/mongo-connect';

interface Props {
  userCreatedReviewsIds: string[];
}

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

export default TutorPage;
