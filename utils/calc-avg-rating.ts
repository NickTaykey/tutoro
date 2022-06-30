import type { TutorReviewObject } from '../types';

export default (reviews: TutorReviewObject[]) => {
  const totRating = reviews.reduce(
    (acm: number, r: TutorReviewObject) => (acm += r.stars),
    0
  );
  return Math.ceil(totRating / reviews.length);
};
