import TutorProfileView from '../../components/tutors/TutorProfileView';
import UserProfileView from '../../components/users/UserProfileView';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import User from '../../models/User';

import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocumentObject } from '../../models/User';
import type { QueryObject } from '../../types';

import {
  getUserDocumentObject,
  getPopulateReviews,
  getPopulateSessions,
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
import ReviewModel from '../../models/Review';
import SessionModel from '../../models/Session';
import findTestingUsers from '../../utils/dev-testing-users';
import { useRouter } from 'next/router';

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
  const {
    tutor: { tutor, fakeId: tutorFakeId },
    user: { user: normalUser, fakeId: userFakeId },
  } = testingUsers;

  const visitingUserTestingProfile = context.req.url?.includes(userFakeId);
  const visitingTutorTestingProfile = context.req.url?.includes(tutorFakeId);

  if (visitingTutorTestingProfile || visitingUserTestingProfile) {
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
  }
  // ===
  const user = await User.findOne(query);
  if (user) {
    const currentUser = getUserDocumentObject(user);
    if (user.isTutor) {
      await Promise.all([
        user.populate({
          path: 'reviews',
          options: {
            sort: { _id: -1 },
          },
          model: ReviewModel,
        }),
        user.populate({
          path: 'requestedSessions',
          options: {
            sort: { _id: -1 },
          },
          model: SessionModel,
        }),
      ]);
      currentUser.reviews = getPopulateReviews(user.reviews);
      currentUser.requestedSessions = getPopulateSessions(
        user.requestedSessions
      );
    }
    await Promise.all([
      user.populate({
        path: 'createdReviews',
        options: {
          sort: { _id: -1 },
        },
        model: ReviewModel,
      }),
      user.populate({
        path: 'bookedSessions',
        options: {
          sort: { _id: -1 },
        },
        model: SessionModel,
      }),
    ]);
    currentUser.createdReviews = getPopulateReviews(user.createdReviews);
    currentUser.bookedSessions = getPopulateSessions(user.bookedSessions);
    return {
      props: { currentUser },
    };
  }
  return {
    props: {},
    redirect: {
      permanent: false,
      destination: 'http://localhost:3000/api/auth/signin?callbackUrl=/users',
    },
  };
};

export default ProfilePage;
