import type { NextPage } from 'next';
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

const TutorPage: NextPage = () => {
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
      <>
        <h1>{tutor.fullname}</h1>
        <ReviewsContextProvider reviews={tutor.reviews}>
          <ReviewContext.Consumer>
            {reviewsCtx => (
              <>
                <ReviewForm type={ReviewFormTypes.Create} tutorId={tutor._id} />
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
