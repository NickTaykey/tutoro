import type { ReviewDocument, ReviewDocumentObject } from '../models/Review';

const calcAvgRating = (
  reviews: Array<ReviewDocument | ReviewDocumentObject>
) => {
  let ratingsTotal = 0;
  reviews.forEach((review: ReviewDocument | ReviewDocumentObject) => {
    ratingsTotal += review.stars;
  });
  return Math.round(ratingsTotal / reviews.length);
};

export default calcAvgRating;
