import type { NextPage, GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import NewPostForm from '../../../../components/posts/NewPostForm';
import User, { UserDocumentObject } from '../../../../models/User';
import { getUserDocumentObject } from '../../../../utils/casting-helpers';
import { authOptions } from '../../../api/auth/[...nextauth]';

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
        const tutor = await User.findById(context.query.tutorId as string);
        return {
          props: {
            subjects: tutor.subjects,
            tutor: getUserDocumentObject(tutor),
          },
        };
      } catch {
        return { props: {} };
      }
    }
    const allSubjects: string[] = (await User.find({ tutors: true })).flatMap(
      t => t.subjects
    );
    return { props: { subjects: Array.from(new Set(allSubjects)) } };
  }
  return {
    props: {},
    redirect: { permanent: false, destination: '/tutoro' },
  };
};

export default NewPostPage;
