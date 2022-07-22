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
import { getPostDocumentObject } from '../../../../../utils/casting-helpers';

import { useForm } from 'react-hook-form';
import ApiHelper from '../../../../../utils/api-helper';
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Flex,
  Heading,
  Alert,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Text,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import Layout from '../../../../../components/global/Layout';

interface Props {
  post: PostDocumentObject | null;
}

const AnswerPage: NextPage<Props> = props => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnswerFormFields>({
    defaultValues: {
      text: props.post?.answer,
    },
  });
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>(null);
  const formSubmitHandler = (data: AnswerFormFields) => {
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
    <Layout>
      <Grid
        templateColumns="repeat(2, 1fr)"
        templateRows="repeat(2, 1fr)"
        width="80%"
        gap="4"
        mx="auto"
      >
        <GridItem colSpan={[2, 2, 1, 1, 1]} rowSpan={[1, 1, 2, 2, 2]}>
          <Flex
            direction="column"
            shadow="md"
            borderWidth="1px"
            p="6"
            width="100%"
            borderRadius="md"
          >
            <Heading as="h2" size="lg">
              Post content
            </Heading>
            <Heading as="h3" size="md" my="4">
              Description
            </Heading>
            <Text>{props.post?.description}</Text>
          </Flex>
        </GridItem>
        <GridItem colSpan={[2, 2, 1, 1, 1]} rowSpan={[1, 1, 2, 2, 2]}>
          <Heading as="h1" size="lg">
            Your answer
          </Heading>
          {validationError && <Alert status="error">{validationError}</Alert>}
          {!!Object.keys(errors).length && (
            <Alert status="error">Provide your {Object.keys(errors)[0]}</Alert>
          )}
          <form
            onSubmit={handleSubmit(formSubmitHandler)}
            style={{ width: '100%' }}
          >
            <FormControl mb="4">
              <FormLabel htmlFor="answer-text" fontWeight="bold" my="3">
                Answer description
              </FormLabel>
              <Textarea
                id="answer-text"
                {...register('text', { minLength: 10, required: true })}
              />
            </FormControl>
            <Flex
              width={['100%', '100%', '50%']}
              direction={['column', 'column', 'row', null, null]}
            >
              <Button
                colorScheme="blue"
                type="submit"
                w="100%"
                mt={[3, 3, 0, 0, 0]}
                mr={[0, 0, 3, 3, 3]}
              >
                Submit
              </Button>
              <Button
                colorScheme="red"
                type="reset"
                w="100%"
                mt={[3, 3, 0, 0, 0]}
                mr={[0, 0, 3, 3, 3]}
              >
                Reset
              </Button>
            </Flex>
          </form>
        </GridItem>
      </Grid>
    </Layout>
  );
  /* return props.post ? (
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
  ) : (
    <h1>404 Post not found</h1>
  ); */
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
