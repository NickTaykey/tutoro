import Review from './reviews/Review';
import ReviewsContextProvider from '../store/ReviewsProvider';
import ReviewContext from '../store/reviews-context';
import ReviewForm, { ReviewFormTypes } from './reviews/ReviewForm';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import type { UserDocument, TutorReviewObject } from '../types';

interface Props {
  tutor: UserDocument;
  userCreatedReviewsIds: string[];
}

const TutorPage: React.FC<Props> = ({
  tutor,
  userCreatedReviewsIds,
}: Props) => {
  const { status } = useSession();
  const calcAvgRating = (reviews: TutorReviewObject[]) => {
    const totRating = reviews.reduce(
      (acm: number, r: TutorReviewObject) => (acm += r.stars),
      0
    );
    return Math.ceil(totRating / reviews.length);
  };

  let markup = <h1>Loading</h1>;
  if (tutor && !tutor.reviews) markup = <h1>404 Tutor not found!</h1>;
  if (tutor && tutor.reviews) {
    markup = (
      <>
        <h1>{tutor.fullname}</h1>
        <ReviewsContextProvider
          reviews={tutor.reviews.map(r => ({
            ...r,
            ownerAuthenticated: userCreatedReviewsIds.indexOf(r._id) !== -1,
          }))}
        >
          <ReviewContext.Consumer>
            {reviewsCtx => (
              <>
                <div>Average rating: {calcAvgRating(reviewsCtx.reviews)}</div>
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

export default TutorPage;
