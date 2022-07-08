import type { UserDocument, UserDocumentObject } from '../models/User';
import type { SessionDocument } from '../models/Session';
import type { ReviewDocument } from '../models/Review';

export const getUserDocumentObject = (
  user: UserDocument
): UserDocumentObject => {
  const userObject: UserDocumentObject = {
    _id: user._id.toString(),
    email: user.email,
    fullname: user.fullname,
    isTutor: user.isTutor,
    avatar: user.avatar,
    bio: user.bio || '',
    location: user.location || '',
    subjects: user.subjects || [],
    pricePerHour: user.pricePerHour,
    avgRating: user.avgRating,
    reviews: [],
    createdReviews: [],
    bookedSessions: [],
    requestedSessions: [],
  };
  if (user.isTutor)
    userObject.geometry = {
      type: 'Point',
      coordinates: [...user.geometry!.coordinates] as [number, number],
    };
  return userObject;
};

export const getReviewDocumentObject = (r: ReviewDocument) => ({
  stars: r.stars,
  _id: r._id.toString(),
  text: r.text,
  user: getUserDocumentObject(r.user as UserDocument),
  tutor: getUserDocumentObject(r.tutor as UserDocument),
});

export const getSessionDocumentObject = (s: SessionDocument) => ({
  subject: s.subject,
  topic: s.topic,
  hours: s.hours,
  status: s.status,
  _id: s._id.toString(),
  user: getUserDocumentObject(s.user as UserDocument),
  tutor: getUserDocumentObject(s.tutor as UserDocument),
});
