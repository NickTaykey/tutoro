import type { NextPage, GetServerSideProps } from 'next';
import NewPostForm from '../../../../components/posts/NewPostForm';
import User, { UserDocumentObject } from '../../../../models/User';
import { getUserDocumentObject } from '../../../../utils/casting-helpers';

interface Props {
  tutor?: UserDocumentObject;
  subjects?: string[];
}

const NewPostPage: NextPage<Props> = props => {
  return <NewPostForm subjects={props.subjects} tutor={props.tutor} />;
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
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
};

export default NewPostPage;
