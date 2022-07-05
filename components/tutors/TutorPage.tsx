import ReviewForm, { ReviewFormTypes } from '../reviews/ReviewForm';
import ReviewsContextProvider from '../../store/ReviewsProvider';
import ReviewContext from '../../store/reviews-context';
import calcAvgRating from '../../utils/calc-avg-rating';
import { useSession } from 'next-auth/react';
import Review from '../reviews/Review';
import Link from 'next/link';

import type { ReviewDocumentObject } from '../../models/Review';
import type { UserDocument, UserDocumentObject } from '../../models/User';
import { useRouter } from 'next/router';

interface Props {
  host: String;
  tutor: UserDocumentObject;
  userCreatedReviews: string[];
}

const TutorPage: React.FC<Props> = ({
  tutor,
  userCreatedReviews,
  host,
}: Props) => {
  const { status, data } = useSession();
  let markup = <h1>404 Tutor not found!</h1>;
  const { query } = useRouter();
  if (tutor && tutor.reviews) {
    markup = (
      <>
        <h1>{tutor.fullname}</h1>
        <ReviewsContextProvider
          reviews={tutor.reviews.map(r => ({
            ...r,
            ownerAuthenticated: userCreatedReviews.indexOf(r._id) !== -1,
          }))}
        >
          <ReviewContext.Consumer>
            {reviewsCtx => (
              <>
                <div>Average rating: {calcAvgRating(reviewsCtx.reviews)}</div>
                {status === 'authenticated' &&
                  query.tutorId !==
                    (data.user as UserDocument)._id.toString() && (
                    <ReviewForm
                      type={ReviewFormTypes.Create}
                      tutorId={tutor._id}
                    />
                  )}
                {status === 'unauthenticated' && (
                  <Link
                    href={`http://${host}/api/auth/signin?callbackUrl=/tutors/${tutor._id}`}
                  >
                    Sign In
                  </Link>
                )}
                {reviewsCtx.reviews.map((r: ReviewDocumentObject) => (
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
