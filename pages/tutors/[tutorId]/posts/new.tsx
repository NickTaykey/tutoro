import type { NextPage, GetServerSideProps } from 'next';
import NewPostForm from '../../../../components/posts/NewPostForm';
import User from '../../../../models/User';

interface Props {
  subjects?: string[];
}

const NewPostPage: NextPage<Props> = props => {
  return (
    <>
      {!props.subjects && <h1>404 Tutor not found</h1>}
      {props.subjects && <NewPostForm subjects={props.subjects} />}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const tutor = await User.findById(context.query.tutorId);
  return { props: { subjects: tutor ? tutor.subjects : null } };
};

export default NewPostPage;
