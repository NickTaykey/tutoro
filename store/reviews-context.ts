import React from 'react';
import type { ReviewDocumentObject } from '../models/Review';

type ReviewFieldsArg = { stars: number; text?: string };
export type APIError = { errorMessage: string };
type ContextMethodReturnType = Promise<ReviewDocumentObject | APIError | any>;

interface ReviewContextObject {
  reviews: ReviewDocumentObject[];
  addReview(tutorId: string, review: ReviewFieldsArg): ContextMethodReturnType;
  updateReview(
    tutorId: string,
    review: ReviewDocumentObject
  ): ContextMethodReturnType;
  deleteReview(tutorId: string, reviewId: string): ContextMethodReturnType;
}

const ReviewContext = React.createContext<ReviewContextObject>({
  reviews: [],
  addReview(tutorId: string, review: ReviewFieldsArg) {
    return Promise.resolve({});
  },
  updateReview(tutorId: string, review: ReviewDocumentObject) {
    return Promise.resolve({});
  },
  deleteReview(tutorId: string, reviewId: string) {
    return Promise.resolve({});
  },
});

export default ReviewContext;
