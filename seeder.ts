import connectDB from './middleware/mongo-connect';
import User from './models/User';
import Review from './models/Review';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env.local' });

let nUsers = 2;
let nReviews = 2;

if (process.argv.length === 4) {
  nUsers = Number(process.argv[2]);
  nReviews = Number(process.argv[3]);
}

(async () => {
  faker.setLocale('it');
  await connectDB();
  await User.deleteMany({});
  await Review.deleteMany({});
  for (let i = 0; i < nUsers; i++) {
    const user = new User({
      fullname: faker.name.findName(),
      email: faker.internet.email(),
      avatar: faker.internet.avatar(),
      isTutor: true,
    });
    for (let j = 0; j < nReviews; j++) {
      const review = await Review.create({
        stars: Math.trunc(Math.random() * 6),
        text: faker.lorem.lines(1),
      });
      user.reviews.push(review);
    }
    await user.save();
  }
  console.log(
    `Created ${nUsers} fake users with ${nReviews} fake reviews each.`
  );
})();
