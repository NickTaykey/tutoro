import type { NextPage, GetServerSideProps } from 'next';
import NewPostForm from '../../../../components/posts/NewPostForm';
import User from '../../../../models/User';

interface Props {
  subjects: string[] | null;
}

const NewPostPage: NextPage<Props> = props => {
  return <NewPostForm subjects={props.subjects} />;
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  if (context.query.tutorId !== 'global') {
    try {
      const tutor = await User.findById(context.query.tutorId as string);
      return { props: { subjects: tutor.subjects } };
    } catch {
      return { props: { subjects: null } };
    }
  }
  const allSubjects: string[] = (await User.find({ tutors: true })).flatMap(
    t => t.subjects
  );
  return { props: { subjects: Array.from(new Set(allSubjects)) } };
};

export default NewPostPage;
