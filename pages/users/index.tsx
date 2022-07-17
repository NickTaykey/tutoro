import TutorProfileView from '../../components/tutors/TutorProfileView';
import UserProfileView from '../../components/users/UserProfileView';
import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import User from '../../models/User';

import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocumentObject } from '../../models/User';
import { QueryObject, PostType, PostStatus } from '../../types';
import { FaUserAlt } from 'react-icons/fa';

import {
  getUserDocumentObject,
  getReviewDocumentObject,
  getSessionDocumentObject,
  getPostDocumentObject,
} from '../../utils/user-casting-helpers';

import {
  Text,
  Box,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
} from '@chakra-ui/react';

interface Props {
  currentUser: UserDocumentObject;
  pertinentGlobalPosts: PostDocumentObject[];
}

const ProfilePage: NextPage<Props> = ({
  currentUser,
  pertinentGlobalPosts,
}) => {
  return (
    <Layout>
      <Heading as="h1" size="xl" textAlign="center" my={[5, 10]}>
        Hello, {currentUser.fullname}!
      </Heading>
      {currentUser.isTutor ? (
        <Accordion width={['100%', null, '80%']} mx="auto" allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Flex flex="1" textAlign="left">
                  <Box mr="3">
                    <FaUserAlt size={25} />
                  </Box>
                  <Text fontWeight="bold">User profile</Text>
                </Flex>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <UserProfileView currentUser={currentUser} />
            </AccordionPanel>
          </AccordionItem>
          {currentUser.isTutor && (
            <TutorProfileView
              currentUser={currentUser}
              pertinentGlobalPosts={pertinentGlobalPosts}
            />
          )}
        </Accordion>
      ) : (
        <UserProfileView currentUser={currentUser} />
      )}
    </Layout>
  );
};

import connectDB from '../../middleware/mongo-connect';
import findTestingUsers from '../../utils/dev-testing-users';
import Review from '../../models/Review';
import Session from '../../models/Session';
import Post, { PostDocument, PostDocumentObject } from '../../models/Post';
import Layout from '../../components/global/Layout';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  await connectDB();

  const [session, testingUsers] = await Promise.all([
    getServerSession(context, authOptions),
    findTestingUsers(),
  ]);

  // === PRODUCTION VERSION
  let query: QueryObject = {};
  if (session?.user?.email) query = { email: session.user.email };
  // ===

  // === REMOVE IN PRODUCTION, ONLY FOR TESTING PORPOSE ===
  /* const {
    tutor: { tutor, fakeId: tutorFakeId },
    user: { user: normalUser, fakeId: userFakeId },
  } = testingUsers;
  const visitingUserTestingProfile = context.req.url?.includes(userFakeId);
  const visitingTutorTestingProfile = context.req.url?.includes(tutorFakeId); */
  // ===

  const populateConfig = {
    options: {
      sort: { _id: -1 },
    },
    populate: [
      { path: 'user', model: User },
      { path: 'tutor', model: User },
    ],
  };

  /* if (visitingTutorTestingProfile || visitingUserTestingProfile) {
    if (
      (visitingTutorTestingProfile && !tutor) ||
      (visitingUserTestingProfile && !normalUser)
    ) {
      return {
        props: {},
        redirect: { permanent: false, destination: '/tutoro' },
      };
    } else query = { _id: normalUser?._id, isTutor: false };
    if (visitingTutorTestingProfile) {
      query._id = tutor._id;
      query.isTutor = true;
    }
  } */
  // ===

  if (query.email) {
    const user = await User.findOne(query);
    const currentUser = getUserDocumentObject(user);
    let promises: Array<Promise<unknown>> = [
      user.populate({
        path: 'createdReviews',
        ...populateConfig,
        model: Review,
      }),
      user.populate({
        path: 'bookedSessions',
        ...populateConfig,
        model: Session,
      }),
      user.populate({
        path: 'createdPosts',
        model: Post,
        populate: [
          { path: 'answeredBy', model: User },
          { path: 'creator', model: User },
        ],
      }),
    ];
    if (user.isTutor) {
      promises = [
        Post.find({
          type: PostType.GLOBAL,
          status: PostStatus.NOT_ANSWERED,
          subject: { $in: user.subjects },
        })
          .populate({ path: 'creator', model: User })
          .populate({ path: 'answeredBy', model: User })
          .exec(),
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
          populate: [
            { path: 'answeredBy', model: User },
            { path: 'creator', model: User },
          ],
        }),
        ...promises,
      ];
    }

    const [pertinentPosts] = await Promise.all(promises);

    if (user.isTutor) {
      currentUser.reviews = user.reviews.map(getReviewDocumentObject);
      currentUser.requestedSessions = user.requestedSessions.map(
        getSessionDocumentObject
      );
      currentUser.posts = user.posts.map(getPostDocumentObject);
    }

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
        pertinentGlobalPosts: user.isTutor
          ? (pertinentPosts as Array<unknown>).map(p => {
              return getPostDocumentObject(p as PostDocument);
            })
          : [],
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

export default ProfilePage;
