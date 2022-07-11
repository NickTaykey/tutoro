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
    const tutor = await User.findById(context.query.tutorId as string);
    return { props: { subjects: tutor ? tutor.subjects : null } };
  }
  return { props: { subjects: null } };
};

export default NewPostPage;
