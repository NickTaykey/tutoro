import TutorProfileView from '../../components/tutors/TutorProfileView';
import UserProfileView from '../../components/users/UserProfileView';
import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import User from '../../models/User';

import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocumentObject } from '../../models/User';
import type { QueryObject } from '../../types';

import {
  getUserDocumentObject,
  getReviewDocumentObject,
  getSessionDocumentObject,
  getPostDocumentObject,
} from '../../utils/user-casting-helpers';

interface Props {
  currentUser: UserDocumentObject | null;
}

const ProfilePage: NextPage<Props> = ({ currentUser }) => {
  const { query } = useRouter();
  if (currentUser) {
    return (
      <>
        {query['q'] === 'bc' && <div>Congratulations you are a Tutor now!</div>}
        <h1>Hi, {currentUser.fullname}!</h1>
        <UserProfileView currentUser={currentUser} />
        {currentUser.isTutor && <TutorProfileView currentUser={currentUser} />}
      </>
    );
  }
  return <h1>You have to be authenticated to visit this page!</h1>;
};

import connectDB from '../../middleware/mongo-connect';
import findTestingUsers from '../../utils/dev-testing-users';
import { useRouter } from 'next/router';
import Review from '../../models/Review';
import Session from '../../models/Session';
import Post from '../../models/Post';

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
    if (user.isTutor) {
      await Promise.all([
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
      ]);
      currentUser.reviews = user.reviews.map(getReviewDocumentObject);
      currentUser.requestedSessions = user.requestedSessions.map(
        getSessionDocumentObject
      );
      currentUser.posts = user.posts.map(getPostDocumentObject);
    }
    await Promise.all([
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
    ]);
    currentUser.createdPosts = user.createdPosts.map(getPostDocumentObject);
    currentUser.createdReviews = user.createdReviews.map(
      getReviewDocumentObject
    );
    currentUser.bookedSessions = user.bookedSessions.map(
      getSessionDocumentObject
    );
    return {
      props: { currentUser },
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
