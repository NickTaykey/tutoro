import React from 'react';
import type { TutorReviewObject } from '../types';

type ReviewFieldsArg = { stars: number; text?: string };

interface ReviewContextObject {
  reviews: TutorReviewObject[];
  addReview(tutorId: string, review: ReviewFieldsArg): void;
  updateReview(tutorId: string, review: TutorReviewObject): void;
  deleteReview(tutorId: string, reviewId: string): void;
}

const ReviewContext = React.createContext<ReviewContextObject>({
  reviews: [],
  addReview(tutorId: string, review: ReviewFieldsArg) {},
  updateReview(tutorId: string, review: TutorReviewObject) {},
  deleteReview(tutorId: string, reviewId: string) {},
});

export default ReviewContext;
