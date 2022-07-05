import type { ReviewDocument, ReviewDocumentObject } from '../models/Review';
import type { SessionDocument, SessionDocumentObject } from '../models/Session';
import type { UserDocument, UserDocumentObject } from '../models/User';

export const getPopulatedReviews = (
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

export const getPopulatedSessions = (
  reviews: SessionDocument[]
): SessionDocumentObject[] => {
  return reviews.map(
    (s: SessionDocument): SessionDocumentObject => ({
      subject: s.subject,
      topic: s.topic,
      hours: s.hours,
      status: s.status,
      _id: s._id.toString(),
      tutorId: s.tutorId.toString(),
      date: s.date.toLocaleString(),
    })
  );
};

export const getUserDocumentObject = (
  user: UserDocument
): UserDocumentObject => {
  return {
    _id: user._id.toString(),
    email: user.email,
    fullname: user.fullname,
    isTutor: user.isTutor,
    coordinates: user.coordinates.length
      ? [user.coordinates[0], user.coordinates[1]]
      : [NaN, NaN],
    avatar: user.avatar,
    bio: user.bio || '',
    location: user.location || '',
    subjects: user.subjects || [],
    reviews: [],
    createdReviews: [],
    bookedSessions: [],
    requestedSessions: [],
  };
};
