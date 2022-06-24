import React from 'react';
import type { TutorReviewObject } from '../types';

type ReviewFieldsArg = { stars: number; text?: string };
export type APIError = { errorMessage: string };
type ContextMethodReturnType = Promise<TutorReviewObject | APIError | any>;

interface ReviewContextObject {
  reviews: TutorReviewObject[];
  addReview(tutorId: string, review: ReviewFieldsArg): ContextMethodReturnType;
  updateReview(
    tutorId: string,
    review: TutorReviewObject
  ): ContextMethodReturnType;
  deleteReview(tutorId: string, reviewId: string): ContextMethodReturnType;
}

const ReviewContext = React.createContext<ReviewContextObject>({
  reviews: [],
  addReview(tutorId: string, review: ReviewFieldsArg) {
    return Promise.resolve({});
  },
  updateReview(tutorId: string, review: TutorReviewObject) {
    return Promise.resolve({});
  },
  deleteReview(tutorId: string, reviewId: string) {
    return Promise.resolve({});
  },
});

export default ReviewContext;
