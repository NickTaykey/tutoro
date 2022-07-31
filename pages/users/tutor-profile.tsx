import TutorProfileView from '../../components/tutors/TutorProfileView';
import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import User from '../../models/User';

import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocumentObject } from '../../models/User';
import { QueryObject, PostType, PostStatus } from '../../types';

import {
  getUserDocumentObject,
  getReviewDocumentObject,
  getSessionDocumentObject,
  getPostDocumentObject,
} from '../../utils/casting-helpers';

import { Box, Heading, Alert, AlertIcon } from '@chakra-ui/react';

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
        <TutorProfileView
          setSuccessAlert={setSuccessAlert}
          setErrorAlert={setErrorAlert}
          errorAlert={errorAlert}
          successAlert={successAlert}
          currentUser={currentUser}
          pertinentGlobalPosts={pertinentGlobalPosts}
        />
      )}
    </Box>
  );
};

import connectDB from '../../middleware/mongo-connect';
import Review from '../../models/Review';
import Session from '../../models/Session';
import Post, { PostDocument, PostDocumentObject } from '../../models/Post';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaRegEye } from 'react-icons/fa';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const [session] = await Promise.all([
    getServerSession(context, authOptions),
    connectDB(),
  ]);

  let query: QueryObject = {};
  if (session?.user?.email) query = { email: session.user.email };

  const populateConfig = {
    options: {
      sort: { _id: -1 },
    },
    populate: [
      { path: 'user', model: User },
      { path: 'tutor', model: User },
    ],
  };

  const user = await User.findOne(query);

  if (user?.isTutor) {
    const currentUser = getUserDocumentObject(user);
    let [pertinentGlobalPosts] = await Promise.all([
      user.globalPostsEnabled
        ? Post.find({
            type: PostType.GLOBAL,
            status: { $ne: PostStatus.ANSWERED },
            subject: { $in: user.subjects },
            creator: { $ne: currentUser._id },
          })
            .populate({
              path: 'creator',
              model: User,
            })
            .populate({
              path: 'answeredBy',
              model: User,
            })
            .exec()
        : null,
      user.populate({
        path: 'createdReviews',
        ...populateConfig,
        model: Review,
        sort: { _id: -1 },
      }),
      user.populate({
        path: 'bookedSessions',
        ...populateConfig,
        model: Session,
        sort: { _id: -1 },
      }),
      user.populate({
        path: 'createdPosts',
        model: Post,
        options: { sort: { _id: -1 } },
        populate: [
          { path: 'answeredBy', model: User },
          { path: 'creator', model: User },
        ],
      }),
      user.populate({
        path: 'reviews',
        model: Review,
        ...populateConfig,
      }),
      user.populate({
        path: 'requestedSessions',
        model: Session,
        ...populateConfig,
      }),
      user.populate({
        path: 'posts',
        model: Post,
        options: { sort: { _id: -1 } },
        populate: [
          { path: 'answeredBy', model: User },
          { path: 'creator', model: User },
        ],
      }),
    ]);

    currentUser.reviews = user.reviews.map(getReviewDocumentObject);
    currentUser.requestedSessions = user.requestedSessions.map(
      getSessionDocumentObject
    );
    currentUser.posts = user.posts.map(getPostDocumentObject);
    currentUser.createdPosts = user.createdPosts.map(getPostDocumentObject);
    currentUser.createdReviews = user.createdReviews.map(
      getReviewDocumentObject
    );
    currentUser.bookedSessions = user.bookedSessions.map(
      getSessionDocumentObject
    );

    let pertinentGlobalPostsObjects: PostDocumentObject[] = [];
    if (pertinentGlobalPosts) {
      pertinentGlobalPostsObjects = (
        pertinentGlobalPosts as Array<PostDocument>
      )
        .map((p: PostDocument): PostDocumentObject => getPostDocumentObject(p))
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
      destination: `/auth-wall`,
    },
  };
};

export default ProfilePage;
