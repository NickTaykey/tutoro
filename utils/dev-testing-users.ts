import User from '../models/User';
import type { UserDocument } from '../models/User';

const findTestingUsers = async () => {
  const [tutor, user] = await Promise.all([
    User.findOne({ isTutor: true }),
    User.findOne({ isTutor: false }),
  ]);
  return {
    tutor: {
      fakeId: 'TUTOR-TESTING',
      tutor: tutor as UserDocument,
    },
    user: {
      fakeId: 'USER-TESTING',
      user: user as UserDocument,
    },
  };
};

export default findTestingUsers;
