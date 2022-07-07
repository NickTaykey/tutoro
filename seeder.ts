import connectDB from './middleware/mongo-connect';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import fs from 'fs';
import Review from './models/Review';
import User from './models/User';
import Session from './models/Session';
import type { UserDocument } from './models/User';

dotenv.config({ path: __dirname + '/.env.local' });

const LOCATION_CENTER_COORDINATES: [number, number] = [12.21, 46.14];
const N_USERS = process.argv.length === 4 ? Number(process.argv[2]) : 2;
const N_REVIEWS = process.argv.length === 4 ? Number(process.argv[3]) : 2;

(async () => {
  faker.setLocale('it');
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Review.deleteMany({}),
    Session.deleteMany({}),
  ]);
  const users: Array<UserDocument> = [];
  for (let i = 0; i < N_USERS; i++) {
    const coordinates = faker.address.nearbyGPSCoordinate(
      LOCATION_CENTER_COORDINATES,
      50,
      true
    );
    const isTutor = i === 0;
    const user = new User({
      fullname: faker.name.findName(),
      email: faker.internet.email(),
      avatar: faker.internet.avatar(),
      pricePerHour: isTutor ? Math.trunc(Math.random() * 250) + 5 : 0,
      coordinates: isTutor
        ? [Number(coordinates[0]), Number(coordinates[1])]
        : [],
      subjects: isTutor ? ['Science', 'Maths', 'Physics'] : [],
      bio: isTutor ? faker.lorem.lines(1) : '',
      location: isTutor ? faker.lorem.words(2) : '',
      isTutor,
    });
    if (!user.isTutor) {
      for (let j = 0; j < N_REVIEWS; j++) {
        const review = await Review.create({
          stars: Math.trunc(Math.random() * 6),
          text: faker.lorem.lines(1),
          tutor: users[0]._id,
          user: user._id,
        });
        users[0].reviews.push(review);
        user.createdReviews.push(review);
      }
    }
    users.push(user as UserDocument);
    if (users.length) await users[0].save();
    await user.save();
  }
  fs.writeFile('seed-tutors.json', JSON.stringify(users), () => {});
  console.log(
    `Created ${
      N_USERS - 1
    } regular users and 1 tutor and ${N_REVIEWS} of this tutor`
  );
})();
