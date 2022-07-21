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
    fullname: user.fullname,
    isTutor: user.isTutor,
    bio: user.bio || '',
    receiveOpenPosts: user.receiveOpenPosts,
    location: user.location || '',
    subjects: user.subjects && user.subjects.length ? [...user.subjects] : [],
    pricePerHour: user.pricePerHour,
    avgRating: user.avgRating,
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
  _id: s._id.toString(),
  subject: s.subject,
  topic: s.topic,
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
    _id: p._id.toString(),
    subject: p.subject,
    description: p.description,
    status: p.status,
    answer: p.answer,
    type: p.type,
    postImages: [],
    answerImages: [],
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
