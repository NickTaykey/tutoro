import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { TutorObjectGeoJSON, TutorReviewObject } from '../../types';
import { useEffect, useState } from 'react';
import Review from '../../components/reviews/Review';

const TutorPage: NextPage = () => {
  const router = useRouter();
  const [tutor, setTutor] = useState<TutorObjectGeoJSON | null>();

  useEffect(() => {
    if (router.query.tutorId) {
      fetch(`/api/tutors/${router.query.tutorId}`)
        .then(res => res.json())
        .then(features => setTutor(features));
    }
  }, [router.query.tutorId]);

  let markup = <h1>Loading</h1>;
  if (tutor && !tutor.properties) markup = <h1>404 Tutor not found!</h1>;
  if (tutor && tutor.properties) {
    markup = (
      <>
        <h1>{tutor.properties.username}</h1>
        <h2>{tutor.properties.name}</h2>
        {tutor.properties.reviews.map((r: TutorReviewObject) => (
          <Review key={r.id} review={r} />
        ))}
      </>
    );
  }

  return markup;
};
export default TutorPage;
