import ReviewForm, { ReviewFormTypes } from '../reviews/ReviewForm';
import ReviewsContextProvider from '../../store/ReviewsProvider';
import ReviewContext from '../../store/reviews-context';
import { useSession } from 'next-auth/react';
import Review from '../reviews/Review';
import Link from 'next/link';

import type { ReviewDocumentObject } from '../../models/Review';
import type { UserDocumentObject } from '../../models/User';

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
                <div>Average rating: {tutor.avgRating}</div>
                {status === 'authenticated' &&
                  data?.user?.email !== tutor.email && (
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
                  <Review key={r._id} review={r} viewAsTutor={false} />
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
