import React, { useReducer } from 'react';
import PostsContext, { APIError } from './posts-context';
import ApiHelper from '../utils/api-helper';
import { SessionStatus } from '../types';
import type { PostDocumentObject } from '../models/Post';

enum PostActionTypes {
  DELETE,
}

interface PostAction {
  type: PostActionTypes;
  payload: {
    postId: string;
  };
}

function reducer(
  prevState: PostDocumentObject[],
  action: PostAction
): PostDocumentObject[] {
  switch (action.type) {
    case PostActionTypes.DELETE:
      return prevState.filter(p => p._id !== action.payload.postId);
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
          postId: string
        ): Promise<PostDocumentObject | APIError> {
          const apiResponse = await ApiHelper(
            `/api/posts/${postId}`,
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
      }}
    >
      {props.children}
    </PostsContext.Provider>
  );
};

export default PostsContextProvider;
