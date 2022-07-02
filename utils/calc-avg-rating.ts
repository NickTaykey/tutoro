import type { ReviewDocumentObject } from '../models/Review';

export default (reviews: ReviewDocumentObject[]) => {
  const totRating = reviews.reduce(
    (acm: number, r: ReviewDocumentObject) => (acm += r.stars),
    0
  );
  const avgRating = Math.ceil(totRating / reviews.length);
  return avgRating ? avgRating : 0;
};
