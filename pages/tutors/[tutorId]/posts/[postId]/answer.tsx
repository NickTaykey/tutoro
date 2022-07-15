import type { NextPage, GetServerSideProps } from 'next';
import { AnswerFormFields, PostType } from '../../../../../types';
import type {
  PostDocument,
  PostDocumentObject,
} from '../../../../../models/Post';

import Post from '../../../../../models/Post';
import User, { UserDocumentObject } from '../../../../../models/User';
import { authOptions } from '../../../../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { getPostDocumentObject } from '../../../../../utils/user-casting-helpers';

import { useForm } from 'react-hook-form';
import ApiHelper from '../../../../../utils/api-helper';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface Props {
  post: PostDocumentObject | null;
}

const AnswerPage: NextPage<Props> = props => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AnswerFormFields>({
    defaultValues: {
      text: props.post?.answer,
    },
  });
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>(null);
  const formSubmitHanlder = (data: AnswerFormFields) => {
    const post = props.post as PostDocumentObject;
    let url = `/api/tutors/${
      post.type === PostType.SPECIFIC
        ? (post.answeredBy as UserDocumentObject)._id
        : 'global'
    }/posts/${post._id}`;
    ApiHelper(url, { text: data.text }, 'PUT').then(res => {
      if (res.errorMessage) return setValidationError(res.errorMessage);
      setValidationError(null);
      router.replace('/users');
    });
  };
  return (
    <>
      {!props.post && <h1>404 Post not found</h1>}
      {props.post && (
        <>
          <header>
            <div>{props.post.subject}</div>
            <p>{props.post.description}</p>
            <div>{props.post.status}</div>
          </header>
          {validationError && <div>{validationError}</div>}
          {!!Object.keys(errors).length && (
            <div>Provide your {Object.keys(errors)[0]}</div>
          )}
          <form onSubmit={handleSubmit(formSubmitHanlder)}>
            <fieldset>
              <label htmlFor="answer-text">Answer text</label>
              <textarea
                id="answer-text"
                {...register('text', { minLength: 10, required: true })}
              />
            </fieldset>
            <button type="submit">Answer</button>
          </form>
        </>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const [post, userSession] = await Promise.all([
    Post.findById(context.query.postId)
      .populate({ path: 'creator', model: User })
      .populate({ path: 'answeredBy', model: User })
      .exec(),
    getServerSession(context, authOptions),
  ]);
  if (userSession) {
    return {
      props: {
        post: post ? getPostDocumentObject(post as PostDocument) : null,
      },
    };
  }
  return {
    props: {},
    redirect: {
      permanent: false,
      destination: `http://${context.req.headers.host}/api/auth/signin?callbackUrl=/users`,
    },
  };
};

export default AnswerPage;
