import type { UserDocumentObject } from '../../../../models/User';
import type { NextPage, GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';

import { getUserDocumentObject } from '../../../../utils/casting-helpers';
import NewPostForm from '../../../../components/posts/NewPostForm';
import { authOptions } from '../../../api/auth/[...nextauth]';
import * as models from '../../../../models';

interface Props {
  tutor?: UserDocumentObject;
  subjects?: string[];
}

const NewPostPage: NextPage<Props> = props => {
  return <NewPostForm subjects={props.subjects} tutor={props.tutor} />;
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const session = await getServerSession(context, authOptions);
  if (session?.user) {
    if (context.query.tutorId !== 'global') {
      try {
        const tutor = await models.User.findById(
          context.query.tutorId as string
        );
        return {
          props: tutor
            ? {
                subjects: tutor ? tutor.subjects : [],
                tutor: tutor ? getUserDocumentObject(tutor) : undefined,
              }
            : {},
        };
      } catch {
        return { props: {} };
      }
    }
    const allSubjects: string[] = (
      await models.User.find({ tutors: true })
    ).flatMap(t => t.subjects);
    return { props: { subjects: Array.from(new Set(allSubjects)) } };
  }
  return {
    props: {},
    redirect: { permanent: false, destination: '/tutoro' },
  };
};

export default NewPostPage;
