import React, { useReducer } from 'react';
import ReviewContext, { APIError } from './reviews-context';
import ApiHelper from '../utils/api-helper';
import type { ReviewDocumentObject } from '../models/Review';

type ReviewFieldsArg = { stars: number; text?: string };

enum ReviewActionTypes {
  ADD,
  DELETE,
  UPDATE,
}

interface ReviewAction {
  type: ReviewActionTypes;
  payload: {
    _id: string;
    stars: number;
    text?: string;
    ownerAuthenticated: boolean;
  };
}

function reducer(
  prevState: ReviewDocumentObject[],
  action: ReviewAction
): ReviewDocumentObject[] {
  switch (action.type) {
    case ReviewActionTypes.ADD:
      return [{ ...action.payload }, ...prevState] as ReviewDocumentObject[];
    case ReviewActionTypes.DELETE:
      return prevState.filter(r => r._id !== action.payload._id);
    case ReviewActionTypes.UPDATE:
      return prevState.map(r =>
        r._id === action.payload._id
          ? ({ ...action.payload } as ReviewDocumentObject)
          : r
      );
    default:
      return prevState;
  }
}

const ReviewsContextProvider: React.FC<{
  reviews: ReviewDocumentObject[];
  children: React.ReactNode[] | React.ReactNode;
}> = props => {
  const [reviews, dispatchReviewAction] = useReducer(reducer, props.reviews);
  return (
    <ReviewContext.Provider
      value={{
        reviews,
        async addReview(
          tutorId: string,
          review: ReviewFieldsArg
        ): Promise<ReviewDocumentObject | APIError | any> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${tutorId}/reviews`,
            review,
            'POST'
          );
          if (!apiResponse.errorMessage) {
            dispatchReviewAction({
              type: ReviewActionTypes.ADD,
              payload: { ...apiResponse, ownerAuthenticated: true },
            });
          }
          return apiResponse;
        },
        async updateReview(
          tutorId: string,
          review: ReviewDocumentObject
        ): Promise<ReviewDocumentObject | APIError | any> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${tutorId}/reviews/${review._id}`,
            review,
            'PUT'
          );
          if (!apiResponse.errorMessage) {
            dispatchReviewAction({
              type: ReviewActionTypes.UPDATE,
              payload: { ...apiResponse, ownerAuthenticated: true },
            });
          }
          return apiResponse;
        },
        async deleteReview(
          tutorId: string,
          reviewId: string
        ): Promise<ReviewDocumentObject | APIError | any> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${tutorId}/reviews/${reviewId}`,
            {},
            'DELETE'
          );
          if (!apiResponse.errorMessage) {
            dispatchReviewAction({
              type: ReviewActionTypes.DELETE,
              payload: apiResponse,
            });
          }
          return apiResponse;
        },
      }}
    >
      {props.children}
    </ReviewContext.Provider>
  );
};

export default ReviewsContextProvider;
