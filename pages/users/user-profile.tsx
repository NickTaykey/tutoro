import UserProfileView from '../../components/users/UserProfileView';
import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';

import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocumentObject } from '../../models/User';
import type { QueryObject } from '../../types';

import {
  getUserDocumentObject,
  getReviewDocumentObject,
  getSessionDocumentObject,
  getPostDocumentObject,
} from '../../utils/casting-helpers';

import { Box, Heading, Alert, AlertIcon } from '@chakra-ui/react';

interface Props {
  currentUser: UserDocumentObject;
}

const ProfilePage: NextPage<Props> = ({ currentUser }) => {
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
      <UserProfileView
        currentUser={currentUser}
        setSuccessAlert={setSuccessAlert}
        setErrorAlert={setErrorAlert}
        errorAlert={errorAlert}
        successAlert={successAlert}
      />
    </Box>
  );
};

import * as models from '../../models';
import Post from '../../models/Post';
import { useState } from 'react';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const session = await getServerSession(context, authOptions);

  let query: QueryObject = {};
  if (session?.user?.email) query = { email: session.user.email };

  const populateConfig = {
    options: {
      sort: { _id: -1 },
    },
    populate: [
      { path: 'user', model: models.User },
      { path: 'tutor', model: models.User },
    ],
    sort: { _id: -1 },
  };

  if (query.email) {
    const user = await models.User.findOne(query);
    const currentUser = getUserDocumentObject(user);
    await Promise.all([
      user.populate({
        path: 'createdReviews',
        ...populateConfig,
        model: models.Review,
      }),
      user.populate({
        path: 'bookedSessions',
        ...populateConfig,
        model: models.Session,
      }),
      user.populate({
        path: 'createdPosts',
        model: Post,
        options: { sort: { _id: -1 } },
        populate: [
          { path: 'answeredBy', model: models.User },
          { path: 'creator', model: models.User },
        ],
      }),
    ]);

    currentUser.createdPosts = user.createdPosts.map(getPostDocumentObject);
    currentUser.createdReviews = user.createdReviews.map(
      getReviewDocumentObject
    );
    currentUser.bookedSessions = user.bookedSessions.map(
      getSessionDocumentObject
    );

    return {
      props: {
        currentUser,
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
