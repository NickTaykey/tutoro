import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { TutorReviewObject, UserDocument } from '../../types';
import { useEffect, useState } from 'react';
import Review from '../../components/reviews/Review';
import ApiHelper from '../../utils/api-helper';

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
        {tutor.reviews.map((r: TutorReviewObject) => (
          <Review key={r._id} review={r} />
        ))}
      </>
    );
  }

  return markup;
};
export default TutorPage;
