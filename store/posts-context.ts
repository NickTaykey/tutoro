import React from 'react';
import type { PostDocumentObject } from '../models/Post';

export type APIError = { errorMessage: string };
type ContextMethodReturnType = Promise<PostDocumentObject | APIError | {}>;

interface PostsContextObject {
  posts: PostDocumentObject[];
  deletePost(postId: string): ContextMethodReturnType;
}

const PostsContext = React.createContext<PostsContextObject>({
  posts: [],
  deletePost(postId: string) {
    return Promise.resolve({});
  },
});

export default PostsContext;
