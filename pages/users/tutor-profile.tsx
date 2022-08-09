import { QueryObject, PostType, PostStatus } from '../../utils/types';
import SessionsContextProvider from '../../store/SessionsProvider';
import { Box, Heading, Alert, AlertIcon } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { PostDocument, PostDocumentObject } from '../../models/Post';
import type { UserDocumentObject } from '../../models/User';
import type { GetServerSideProps, NextPage } from 'next';

const TutorProfileView = dynamic(
  () => import('../../components/tutors/TutorProfileView'),
  { ssr: false }
);

interface Props {
  currentUser: UserDocumentObject;
  pertinentGlobalPosts: PostDocumentObject[];
}

const ProfilePage: NextPage<Props> = ({
  currentUser,
  pertinentGlobalPosts,
}) => {
  const { query } = useRouter();
  const [successAlert, setSuccessAlert] = useState<string | null>(
    query.successAlert ? query.successAlert.toString() : null
  );
  const [errorAlert, setErrorAlert] = useState<string | null>(
    query.errorAlert ? query.errorAlert.toString() : null
  );

  return (
    <Box width={['100%', null, '80%']} mx="auto">
      <Heading as="h1" size="xl" textAlign="center" my={[2, 2, 10]} mx="auto">
        Hello, {currentUser.fullname}!
      </Heading>
      {successAlert && (
        <Alert
          mb="5"
          status="success"
          mx="auto"
          fontWeight="bold"
          width={['90%', null, '100%']}
        >
          <AlertIcon />
          {successAlert}
        </Alert>
      )}
      {errorAlert && (
        <Alert
          mb="5"
          status="error"
          mx="auto"
          fontWeight="bold"
          width={['90%', null, '100%']}
        >
          <AlertIcon />
          {errorAlert}
        </Alert>
      )}
      {currentUser.isTutor && (
        <PostsContextProvider
          posts={
            currentUser.globalPostsEnabled
              ? [...pertinentGlobalPosts, ...currentUser.posts]
              : currentUser.posts
          }
        >
          <SessionsContextProvider sessions={currentUser.requestedSessions}>
            <TutorProfileView
              setSuccessAlert={setSuccessAlert}
              setErrorAlert={setErrorAlert}
              errorAlert={errorAlert}
              successAlert={successAlert}
              currentUser={currentUser}
            />
          </SessionsContextProvider>{' '}
        </PostsContextProvider>
      )}
    </Box>
  );
};

import {
  getUserDocumentObject,
  getReviewDocumentObject,
  getSessionDocumentObject,
  getPostDocumentObject,
} from '../../utils/casting-helpers';
import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import * as models from '../../models';
import PostsContextProvider from '../../store/PostsProvider';
import { SessionDocumentObject } from '../../models/Session';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const session = await getServerSession(context, authOptions);

  let query: QueryObject = {};
  if (session?.user?.email) query = { email: session.user.email };

  const user = await models.User.findOne(query);

  if (user?.isTutor) {
    const currentUser = getUserDocumentObject(user);
    let [pertinentGlobalPosts] = await Promise.all([
      user.globalPostsEnabled
        ? models.Post.find({
            type: PostType.GLOBAL,
            status: { $ne: PostStatus.ANSWERED },
            subject: { $in: user.subjects },
            creator: { $ne: currentUser._id },
          })
            .sort({ _id: -1 })
            .populate({ path: 'creator', model: models.User })
            .populate({ path: 'answeredBy', model: models.User })
            .exec()
        : null,
      user.populate({
        path: 'reviews',
        model: models.Review,
        populate: [
          { path: 'user', model: models.User },
          { path: 'tutor', model: models.User },
        ],
        options: { sort: { _id: -1 } },
      }),
      user.populate({
        path: 'requestedSessions',
        model: models.Session,
        populate: [
          { path: 'user', model: models.User },
          { path: 'tutor', model: models.User },
        ],
        options: { sort: { _id: -1 } },
      }),
      user.populate({
        path: 'posts',
        model: models.Post,
        populate: [
          { path: 'creator', model: models.User },
          { path: 'answeredBy', model: models.User },
        ],
        options: { sort: { _id: -1 } },
      }),
    ]);

    currentUser.reviews = user.reviews.map(getReviewDocumentObject);
    currentUser.posts = user.posts.map(getPostDocumentObject);
    currentUser.requestedSessions = user.requestedSessions
      .map(getSessionDocumentObject)
      .filter((s: SessionDocumentObject) => s.checkoutCompleted);

    let pertinentGlobalPostsObjects: PostDocumentObject[] = [];
    if (pertinentGlobalPosts) {
      pertinentGlobalPostsObjects = (
        pertinentGlobalPosts as Array<PostDocument>
      )
        .map(p => getPostDocumentObject(p as PostDocument))
        .filter(p => p.checkoutCompleted);
    }

    return {
      props: {
        currentUser,
        pertinentGlobalPosts: pertinentGlobalPostsObjects,
      },
    };
  }
  return {
    props: {},
    redirect: {
      permanent: false,
      destination: `/tutors`,
    },
  };
};

export default ProfilePage;
