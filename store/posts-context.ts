import React from 'react';
import type { PostDocumentObject } from '../models/Post';

export type APIError = { errorMessage: string };
export type ContextMethodReturnType = Promise<
  PostDocumentObject | APIError | {}
>;

interface PostsContextObject {
  posts: PostDocumentObject[];
  addPost(post: PostDocumentObject): void;
  updatedPostStatus(postId: string, tutorId: string): ContextMethodReturnType;
  answerPost(
    postId: string,
    formData: FormData,
    tutorId: string
  ): ContextMethodReturnType;
}

const PostsContext = React.createContext<PostsContextObject>({
  posts: [],
  addPost(post: PostDocumentObject) {},
  updatedPostStatus(postId: string, tutorId: string = 'global') {
    return Promise.resolve({});
  },
  answerPost(postId: string, formData: FormData, tutorId: string = 'global') {
    return Promise.resolve({});
  },
});

export default PostsContext;
