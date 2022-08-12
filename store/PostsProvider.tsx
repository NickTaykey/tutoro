import { Answer, CloudFile, PostStatus, PostType } from '../utils/types';
import PostsContext, { APIError } from './posts-context';
import ApiHelper from '../utils/api-helper';
import React, { useReducer } from 'react';

import type { PostDocumentObject } from '../models/Post';
import type { UserDocumentObject } from '../models/User';

enum PostActionTypes {
  UPDATE_STATUS,
  ANSWER,
  ADD,
}

type AddPostAction = {
  type: PostActionTypes.ADD;
  payload: PostDocumentObject;
};

type UpdatePostStatusAction = {
  type: PostActionTypes.UPDATE_STATUS;
  payload: { postId: string; newStatus: PostStatus };
};

type AnswerPostAction = {
  type: PostActionTypes.ANSWER;
  payload: {
    postId: string;
    answer: string;
    answeredBy: UserDocumentObject;
    answerAttachments: CloudFile[];
  };
};

type PostAction = AddPostAction | UpdatePostStatusAction | AnswerPostAction;

function reducer(
  prevState: PostDocumentObject[],
  action: PostAction
): PostDocumentObject[] {
  switch (action.type) {
    case PostActionTypes.UPDATE_STATUS:
      return prevState.map(p =>
        p._id === action.payload.postId
          ? { ...p, status: action.payload.newStatus! }
          : p
      );
    case PostActionTypes.ADD:
      return [action.payload, ...prevState];
    case PostActionTypes.ANSWER:
      return prevState.map(p =>
        p._id === action.payload.postId
          ? {
              ...p,
              type: PostType.SPECIFIC,
              status: PostStatus.ANSWERED,
              answerAttachments: action.payload.answerAttachments,
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
        addPost(post: PostDocumentObject) {
          dispatchPostsAction({
            type: PostActionTypes.ADD,
            payload: post,
          });
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
          answer: Answer,
          tutorId: string = 'global'
        ): Promise<PostDocumentObject | APIError> {
          const apiResponse = await ApiHelper(
            `/api/tutors/${tutorId}/posts/${postId}`,
            answer,
            'PUT'
          );
          if (!apiResponse.errorMessage) {
            dispatchPostsAction({
              type: PostActionTypes.ANSWER,
              payload: {
                postId,
                answer: apiResponse.answer,
                answeredBy: apiResponse.answeredBy,
                answerAttachments: apiResponse.answerAttachments,
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
