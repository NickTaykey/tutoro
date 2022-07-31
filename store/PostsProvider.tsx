import React, { useReducer } from 'react';
import PostsContext, { APIError } from './posts-context';
import ApiHelper from '../utils/api-helper';
import { PostStatus, PostType } from '../types';
import type { PostDocumentObject } from '../models/Post';
import { UserDocumentObject } from '../models/User';

enum PostActionTypes {
  DELETE,
  UPDATE_STATUS,
  ANSWER,
}

interface PostAction {
  type: PostActionTypes;
  payload: {
    postId: string;
    newStatus?: PostStatus;
    answer?: string;
    answeredBy?: UserDocumentObject;
  };
}

function reducer(
  prevState: PostDocumentObject[],
  action: PostAction
): PostDocumentObject[] {
  switch (action.type) {
    case PostActionTypes.DELETE:
      return prevState.filter(p => p._id !== action.payload.postId);
    case PostActionTypes.UPDATE_STATUS:
      return prevState.map(p =>
        p._id === action.payload.postId
          ? { ...p, status: action.payload.newStatus! }
          : p
      );
    case PostActionTypes.ANSWER:
      return prevState.map(p =>
        p._id === action.payload.postId
          ? {
              ...p,
              type: PostType.SPECIFIC,
              status: PostStatus.ANSWERED,
              answer: action.payload.answer!,
              answeredBy: action.payload.answeredBy!,
            }
          : p
      );
    default:
      return prevState;
  }
}

const PostsContextProvider: React.FC<{
  posts: PostDocumentObject[];
  children: React.ReactNode[] | React.ReactNode;
}> = props => {
  const [posts, dispatchPostsAction] = useReducer(reducer, props.posts);
  return (
    <PostsContext.Provider
      value={{
        posts,
        async deletePost(
          postId: string,
          tutorId: string = 'global'
        ): Promise<PostDocumentObject | APIError> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${tutorId}/posts/${postId}`,
            null,
            'DELETE'
          );
          if (!apiResponse.errorMessage) {
            dispatchPostsAction({
              type: PostActionTypes.DELETE,
              payload: { postId },
            });
          }
          return apiResponse;
        },
        async updatedPostStatus(
          postId: string,
          tutorId: string = 'global'
        ): Promise<PostDocumentObject | APIError> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${tutorId}/posts/${postId}/status`,
            null,
            'PUT'
          );
          if (!apiResponse.errorMessage) {
            dispatchPostsAction({
              type: PostActionTypes.UPDATE_STATUS,
              payload: { postId, newStatus: apiResponse.status },
            });
          }
          return apiResponse;
        },
        async answerPost(
          postId: string,
          formData: FormData,
          tutorId: string = 'global'
        ): Promise<PostDocumentObject | APIError> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${tutorId}/posts/${postId}`,
            formData,
            'PUT',
            false
          );
          if (!apiResponse.errorMessage) {
            dispatchPostsAction({
              type: PostActionTypes.ANSWER,
              payload: {
                postId,
                answer: apiResponse.answer,
                answeredBy: apiResponse.answeredBy,
              },
            });
          }
          return apiResponse;
        },
      }}
    >
      {props.children}
    </PostsContext.Provider>
  );
};

export default PostsContextProvider;
