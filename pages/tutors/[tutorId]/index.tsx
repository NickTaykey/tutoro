import type { UserDocument, UserDocumentObject } from '../../../models/User';
import type { ReviewDocument } from '../../../models/Review';
import type { GetServerSideProps, NextPage } from 'next';
import type { ObjectId } from 'mongoose';

import { getReviewDocumentObject } from '../../../utils/casting-helpers';
import TutorPage from '../../../components/tutors/TutorPage';

interface Props {
  tutor?: UserDocumentObject;
}

const Page: NextPage<Props> = ({ tutor }) => <TutorPage tutor={tutor} />;

import { getUserDocumentObject } from '../../../utils/casting-helpers';
import { authOptions } from '../../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import * as models from '../../../models';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const session = await getServerSession(context, authOptions);
  try {
    const [user, userTutor]: UserDocument[] = await Promise.all([
      models.User.findOne({ email: session?.user?.email }),
      models.User.findById(context.query.tutorId)
        .populate({
          path: 'reviews',
          options: {
            sort: { _id: -1 },
          },
          model: models.Review,
          populate: [
            { path: 'user', model: models.User },
            { path: 'tutor', model: models.User },
          ],
        })
        .exec(),
    ]);

    const tutor = getUserDocumentObject(userTutor as UserDocument);
    tutor.reviews = userTutor.reviews.map(r =>
      getReviewDocumentObject(r as ReviewDocument)
    );

    if (user) {
      return {
        props: { tutor },
      };
    }

    return {
      props: { tutor },
    };
  } catch (e) {
    return {
      props: {},
    };
  }
};

export default Page;
