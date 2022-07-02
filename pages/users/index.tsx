import TutorProfileView from '../../components/tutors/TutorProfileView';
import UserProfileView from '../../components/users/UserProfileView';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import User, { UserDocument } from '../../models/User';

import type { GetServerSideProps, NextPage } from 'next';
import type { UserDocumentObject } from '../../models/User';
import type { ObjectId } from 'mongoose';

interface Props {
  currentUser: UserDocumentObject | null;
}

const ProfilePage: NextPage<Props> = ({ currentUser }) => {
  if (currentUser) {
    return (
      <>
        <h1>Hi, {currentUser.fullname}!</h1>
        <UserProfileView currentUser={currentUser} />
        {currentUser.isTutor && <TutorProfileView currentUser={currentUser} />}
      </>
    );
  }
  return <h1>For now only tutors can visit this page</h1>;
};

import connectDB from '../../middleware/mongo-connect';
import ReviewModel from '../../models/Review';
import SessionModel from '../../models/Session';
import findTestingUsers from '../../utils/dev-testing-users';
import type { ReviewDocument, ReviewDocumentObject } from '../../models/Review';
import type {
  SessionDocument,
  SessionDocumentObject,
} from '../../models/Session';

type QueryObject = {
  email?: string;
  isTutor?: boolean;
  _id?: ObjectId;
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  await connectDB();

  // === PRODUCTION VERSION
  const session = await getServerSession(context, authOptions);
  let query: QueryObject = {};
  if (session?.user?.email) query = { email: session.user.email };
  // ===

  // === REMOVE IN PRODUCTION, ONLY FOR TESTING PORPOSE ===
  const {
    tutor: { tutor, fakeId: tutorFakeId },
    user: { user: normalUser, fakeId: userFakeId },
  } = await findTestingUsers();
  if (
    context.req.url?.includes(tutorFakeId) ||
    context.req.url?.includes(userFakeId)
  ) {
    query = { _id: normalUser._id, isTutor: false };
    if (context.req.url?.includes(tutorFakeId)) {
      query._id = tutor._id;
      query.isTutor = true;
    }
  }
  // ===

  const getPopulateReviews = (
    reviews: ReviewDocument[]
  ): ReviewDocumentObject[] => {
    return reviews.map(
      (r: ReviewDocument): ReviewDocumentObject => ({
        stars: r.stars,
        _id: r._id.toString(),
        tutorId: r.tutorId.toString(),
        text: r.text,
      })
    );
  };
  const getPopulateSessions = (
    reviews: SessionDocument[]
  ): SessionDocumentObject[] => {
    return reviews.map(
      (s: SessionDocument): SessionDocumentObject => ({
        subject: s.subject,
        topic: s.topic,
        hours: s.hours,
        approved: s.approved,
        _id: s._id.toString(),
        tutorId: s.tutorId.toString(),
        date: s.date.toLocaleString(),
      })
    );
  };

  const getUserDocumentObject = (user: UserDocument): UserDocumentObject => {
    return {
      _id: user._id.toString(),
      email: user.email,
      fullname: user.fullname,
      isTutor: user.isTutor,
      coordinates: user.coordinates.length
        ? [user.coordinates[0], user.coordinates[1]]
        : [NaN, NaN],
      avatar: user.avatar,
      reviews: [],
      createdReviews: [],
      bookedSessions: [],
      requestedSessions: [],
    };
  };

  const user = await User.findOne(query);
  if (user) {
    const currentUser = getUserDocumentObject(user);
    if (user.isTutor) {
      await user.populate({
        path: 'reviews',
        options: {
          sort: { _id: -1 },
        },
        model: ReviewModel,
      });
      await user.populate({
        path: 'requestedSessions',
        options: {
          sort: { _id: -1 },
        },
        model: SessionModel,
      });
      currentUser.reviews = getPopulateReviews(user.reviews);
      currentUser.requestedSessions = getPopulateSessions(
        user.requestedSessions
      );
    } else {
      await user.populate({
        path: 'createdReviews',
        options: {
          sort: { _id: -1 },
        },
        model: ReviewModel,
      });
      await user.populate({
        path: 'bookedSessions',
        options: {
          sort: { _id: -1 },
        },
        model: SessionModel,
      });
      currentUser.createdReviews = getPopulateReviews(user.createdReviews);
      currentUser.bookedSessions = getPopulateSessions(user.bookedSessions);
    }
    return {
      props: { currentUser },
    };
  }
  return {
    props: { currentUser: null },
  };
};

export default ProfilePage;
