import type { UserDocument, UserDocumentObject } from '../models/User';
import type { SessionDocument } from '../models/Session';
import type { ReviewDocument } from '../models/Review';
import type { PostDocument } from '../models/Post';
import { TutorObjectGeoJSON } from '../types';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

export const getUserDocumentObject = (
  user: UserDocument
): UserDocumentObject => {
  const userObject: UserDocumentObject = {
    _id: user._id.toString(),
    email: user.email,
    sessionEarnings: user.sessionEarnings,
    postEarnings: user.postEarnings,
    fullname: user.fullname,
    isTutor: user.isTutor,
    bio: user.bio || '',
    location: user.location || '',
    subjects: user.subjects && user.subjects.length ? [...user.subjects] : [],
    avgRating: user.avgRating,
    sessionPricePerHour: user.sessionPricePerHour,
    pricePerPost: user.pricePerPost,
    avatar: {
      public_id: user.avatar!.public_id ? user.avatar!.public_id : '',
      url: user.avatar!.url ? user.avatar!.url : '',
    },
    reviews: [],
    posts: [],
    createdPosts: [],
    createdReviews: [],
    bookedSessions: [],
    requestedSessions: [],
    globalPostsEnabled: user.globalPostsEnabled,
  };
  if (user.isTutor)
    userObject.geometry = {
      type: 'Point',
      coordinates: [...user.geometry!.coordinates] as [number, number],
    };
  return userObject;
};

export const getReviewDocumentObject = (r: ReviewDocument) => {
  const createdAt = new Date(r.createdAt!);
  const updatedAt = new Date(r.updatedAt!);
  return {
    _id: r._id.toString(),
    stars: r.stars,
    text: r.text,
    user: getUserDocumentObject(r.user as UserDocument),
    tutor: getUserDocumentObject(r.tutor as UserDocument),
    createdAt: createdAt
      ? `${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`
      : null,
    updatedAt: updatedAt
      ? `${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}`
      : null,
  };
};

export const getSessionDocumentObject = (s: SessionDocument) => ({
  checkoutCompleted: s.checkoutCompleted,
  _id: s._id.toString(),
  subject: s.subject,
  topic: s.topic,
  price: s.price,
  hours: s.hours,
  status: s.status,
  date: new Date(s.date).toLocaleString(),
  user: getUserDocumentObject(s.user as UserDocument),
  tutor: getUserDocumentObject(s.tutor as UserDocument),
});

export const getPostDocumentObject = (p: PostDocument) => {
  const createdAt = new Date(p.createdAt!);
  const updatedAt = new Date(p.updatedAt!);
  return {
    checkoutCompleted: p.checkoutCompleted,
    _id: p._id.toString(),
    subject: p.subject,
    description: p.description,
    status: p.status,
    price: p.price,
    answer: p.answer,
    attachments: p.attachments.map(a => ({
      url: a.url,
      public_id: a.public_id,
    })),
    answerAttachments: p.answerAttachments.map(a => ({
      url: a.url,
      public_id: a.public_id,
    })),
    type: p.type,
    createdAt: createdAt ? createdAt.toLocaleDateString() : null,
    updatedAt: updatedAt ? updatedAt.toLocaleDateString() : null,
    creator: getUserDocumentObject(p.creator as UserDocument),
    answeredBy: p.answeredBy
      ? getUserDocumentObject(p.answeredBy as UserDocument)
      : null,
  };
};

export const getTutorGeoJSON = (
  tutor: UserDocumentObject
): TutorObjectGeoJSON => ({
  type: 'Feature',
  properties: {
    cluster: false,
    ...tutor,
  },
  geometry: {
    type: 'Point',
    coordinates: tutor.geometry!.coordinates,
  },
});

export const getUsersPointsCollection = (
  tutors: UserDocumentObject[]
): FeatureCollection<Geometry, GeoJsonProperties> => ({
  type: 'FeatureCollection',
  features: tutors.map(getTutorGeoJSON),
});
