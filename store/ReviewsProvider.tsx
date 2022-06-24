import React, { useReducer } from 'react';
import ReviewContext from './reviews-context';
import ApiHelper from '../utils/api-helper';
import type { TutorReviewObject } from '../types';

type ReviewFieldsArg = { stars: number; text?: string };

enum ReviewActionTypes {
  ADD,
  DELETE,
  UPDATE,
}

interface ReviewAction {
  type: ReviewActionTypes;
  payload: { _id: string; stars: number; text?: string };
}

function reducer(
  prevState: TutorReviewObject[],
  action: ReviewAction
): TutorReviewObject[] {
  switch (action.type) {
    case ReviewActionTypes.ADD:
      console.log(action);
      return [...prevState, { ...action.payload }] as TutorReviewObject[];
    case ReviewActionTypes.DELETE:
      return prevState.filter(r => r._id !== action.payload._id);
    case ReviewActionTypes.UPDATE:
      return prevState.map(r =>
        r._id === action.payload._id ? { ...action.payload } : r
      );
    default:
      return prevState;
  }
}

const ReviewsContextProvider: React.FC<{
  reviews: TutorReviewObject[];
  children: React.ReactNode[] | React.ReactNode;
}> = props => {
  const [reviews, dispatchReviewAction] = useReducer(reducer, props.reviews);
  return (
    <ReviewContext.Provider
      value={{
        reviews,
        async addReview(tutorId: string, review: ReviewFieldsArg) {
          const createdReview = await ApiHelper(
            `/api/tutors/${tutorId}/reviews`,
            review,
            'POST'
          );
          dispatchReviewAction({
            type: ReviewActionTypes.ADD,
            payload: createdReview,
          });
        },
        async updateReview(tutorId: string, review: TutorReviewObject) {
          const updatedReview = await ApiHelper(
            `/api/tutors/${tutorId}/reviews/${review._id}`,
            review,
            'PUT'
          );
          dispatchReviewAction({
            type: ReviewActionTypes.UPDATE,
            payload: updatedReview,
          });
        },
        async deleteReview(tutorId: string, reviewId: string) {
          const deletedReview = await ApiHelper(
            `/api/tutors/${tutorId}/reviews/${reviewId}`,
            {},
            'DELETE'
          );
          dispatchReviewAction({
            type: ReviewActionTypes.DELETE,
            payload: deletedReview,
          });
        },
      }}
    >
      {props.children}
    </ReviewContext.Provider>
  );
};

export default ReviewsContextProvider;
