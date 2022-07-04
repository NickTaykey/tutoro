import type { UserDocument, UserDocumentObject } from '../../models/User';
import type { GetServerSideProps, NextPage } from 'next';
import type { SubmitHandler } from 'react-hook-form';
import type { QueryObject } from '../../types';

import { getUserDocumentObject } from '../../utils/user-casting-helpers';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import connectDB from '../../middleware/mongo-connect';
import findTestingUsers from '../../utils/dev-testing-users';
import User from '../../models/User';
import { useForm, useFieldArray } from 'react-hook-form';
import ApiHelper from '../../utils/api-helper';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface Props {
  currentUser: UserDocumentObject | null;
}

type FormValues = {
  location: string;
  bio: string;
  subjects: Array<{ subject: string }>;
};

const BecomeTutorPage: NextPage<Props> = ({ currentUser }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      location: '',
      bio: '',
      subjects: [{ subject: '' }],
    },
  });
  const {
    fields: subjects,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'subjects',
  });

  const [apiError, setApiError] = useState<string | null>();
  const router = useRouter();

  const onSubmit: SubmitHandler<FormValues> = async data => {
    const res = await ApiHelper(
      '/api/tutors/become-tutor',
      { ...data, subjects: data.subjects.map(s => s.subject) },
      'PUT'
    );
    if (res.errorMessage) return setApiError(res.errorMessage);
    return router.replace('/users?q=bc');
  };

  if (currentUser) {
    return (
      <>
        <h1>So you would like to become a Tutoro Tutor?</h1>
        {!!apiError && <div>{apiError}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          {!!Object.keys(errors).length && (
            <div>Provide your {Object.keys(errors)[0]}</div>
          )}
          <fieldset>
            <label htmlFor="bio">Some words about you</label>
            <textarea id="bio" {...register('bio', { required: true })} />
          </fieldset>
          <fieldset>
            <label htmlFor="location">Where will you host your sessions?</label>
            <input
              id="location"
              type="text"
              {...register('location', { required: true, maxLength: 50 })}
            />
          </fieldset>
          <fieldset>
            <ul>
              {subjects.map((subject, index, subjects) => (
                <li key={subject.id}>
                  <label htmlFor={`subjects.${index}.subject`}>
                    Your subject n. {index + 1}
                  </label>
                  <input
                    {...register(`subjects.${index}.subject`, {
                      required: true,
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => subjects.length > 1 && remove(index)}
                  >
                    remove
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => append({ subject: '' })}>
              append
            </button>
          </fieldset>
          <button>Become a Tutor!</button>
        </form>
      </>
    );
  }
  return <h1>Only authenticated users can visit this page</h1>;
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  await connectDB();

  // === PRODUCTION VERSION
  const session = await getServerSession(context, authOptions);
  let query: QueryObject = {};
  if (session?.user?.email) query = { email: session.user.email };
  // ===

  // === REMOVE IN PRODUCTION, ONLY FOR TESTING PORPOSE ===
  const {
    tutor: { tutor, fakeId: tutorFakeId },
    user: { user: normalUser, fakeId: userFakeId },
  } = await findTestingUsers();
  if (
    context.req.url?.includes(tutorFakeId) ||
    context.req.url?.includes(userFakeId)
  ) {
    query = { _id: normalUser._id, isTutor: false };
    if (context.req.url?.includes(tutorFakeId)) {
      query._id = tutor._id;
      query.isTutor = true;
    }
  }
  // ===

  const user = await User.findOne(query);
  if (user) {
    if (user.isTutor)
      return {
        props: {},
        redirect: { permanent: false, destination: '/users' },
      };
    return {
      props: { currentUser: getUserDocumentObject(user as UserDocument) },
    };
  }
  return {
    props: { currentUser: null },
  };
};

export default BecomeTutorPage;
