import connectDB from './middleware/mongo-connect';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import fs from 'fs';
import Review from './models/Review';
import User from './models/User';
import Session from './models/Session';
import type { UserDocument } from './models/User';
import type { ReviewDocument } from './models/Review';
import fakeCoordinates from './seed-coordinates.json';

dotenv.config({ path: __dirname + '/.env.local' });

const LOCATION_CENTER_COORDINATES: [number, number] = [12.21, 46.14];
const N_USERS = process.argv.length === 6 ? Number(process.argv[3]) : 1;
const N_TUTORS =
  process.argv.length === 6
    ? Number(process.argv[5]) > fakeCoordinates.length
      ? fakeCoordinates.length
      : Number(process.argv[5])
    : 1;

const seeder = async () => {
  faker.setLocale('it');
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Review.deleteMany({}),
    Session.deleteMany({}),
  ]);
  const users: Array<UserDocument> = [];
  const tutors: Array<UserDocument> = [];
  const defaultSubjects = ['science', 'maths', 'physics'];

  const getRandomSubjects = () => {
    const nSubjects = Math.trunc(Math.random() * defaultSubjects.length) + 1;
    const randomSubjects = new Set();
    while (randomSubjects.size !== nSubjects) {
      randomSubjects.add(
        defaultSubjects[Math.trunc(Math.random() * defaultSubjects.length)]
      );
    }
    return Array.from(randomSubjects);
  };

  for (let i = 0; i < N_USERS; i++) {
    const user = new User({
      fullname: faker.name.findName(),
      email: faker.internet.email(),
      avatar: faker.internet.avatar(),
      isTutor: false,
    });
    users.push(user as UserDocument);
  }

  for (let i = 0; i < N_TUTORS; i++) {
    /* const coordinates = faker.address.nearbyGPSCoordinate(
      LOCATION_CENTER_COORDINATES,
      50,
      true
    ); */
    const coordinates = fakeCoordinates[i];
    const tutor = new User({
      fullname: faker.name.findName(),
      email: faker.internet.email(),
      avatar: faker.internet.avatar(),
      pricePerHour: Math.trunc(Math.random() * 250) + 6,
      subjects: getRandomSubjects(),
      bio: faker.lorem.lines(1),
      location: faker.lorem.words(2),
      isTutor: true,
      geometry: {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      },
    });
    tutors.push(tutor as UserDocument);
  }

  const reviews: ReviewDocument[] = [];
  for (let t of tutors) {
    for (let u of users) {
      const review = new Review({
        stars: Math.trunc(Math.random() * 6),
        text: faker.lorem.lines(1),
        tutor: t._id,
        user: u._id,
      });
      reviews.push(review);
      u.createdReviews.push(review);
      t.reviews.push(review);
      review.save();
    }
  }

  await Promise.all([
    ...users.map(u => u.save()),
    ...tutors.map(t => t.save()),
  ]);

  fs.writeFile(
    'seed-tutors.json',
    JSON.stringify([...tutors, ...users]),
    () => {}
  );

  console.log(`Created ${N_USERS} regular users and ${N_TUTORS} tutors`);
};

seeder();
