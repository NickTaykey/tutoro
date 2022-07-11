import React from 'react';
import type { PostDocumentObject } from '../models/Post';

export type APIError = { errorMessage: string };
type ContextMethodReturnType = Promise<PostDocumentObject | APIError | {}>;

interface PostsContextObject {
  posts: PostDocumentObject[];
  deletePost(postId: string, tutorId: string): ContextMethodReturnType;
  updatedPostStatus(postId: string, tutorId: string): ContextMethodReturnType;
  answerPost(
    postId: string,
    answer: string,
    tutorId: string
  ): ContextMethodReturnType;
}

const PostsContext = React.createContext<PostsContextObject>({
  posts: [],
  deletePost(postId: string, tutorId: string = 'global') {
    return Promise.resolve({});
  },
  updatedPostStatus(postId: string, tutorId: string = 'global') {
    return Promise.resolve({});
  },
  answerPost(postId: string, answer: string, tutorId: string = 'global') {
    return Promise.resolve({});
  },
});

export default PostsContext;
