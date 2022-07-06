import type { NextPage, GetServerSideProps } from 'next';
import type { UserDocument, UserDocumentObject } from '../../../../models/User';

import { FormEvent, useState } from 'react';
import { getUserDocumentObject } from '../../../../utils/user-casting-helpers';
import ApiHelper from '../../../../utils/api-helper';
import User from '../../../../models/User';
import Review from '../../../../models/Review';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  tutor: UserDocumentObject | null;
}

interface FormStructure {
  subject: string;
  topic: string;
  hours: number;
  date: Date;
}

const Page: NextPage<Props> = ({ tutor }) => {
  const DEFAULT_FORM_VALUES: FormStructure = {
    subject: tutor ? tutor.subjects[0] : '',
    topic: '',
    hours: 1,
    date: new Date(Date.now() + 3.6 * 10 ** 6),
  };
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>();
  const [formFields, setFormFields] =
    useState<FormStructure>(DEFAULT_FORM_VALUES);

  const formFieldUpdater = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormFields(prevState => ({
      ...prevState,
      [e.target.name]: Number(e.target.value)
        ? Number(e.target.value)
        : e.target.value,
    }));
  };

  const dateChangeHandler = (date: Date) => {
    setFormFields(prevState => ({ ...prevState, date: date }));
  };

  const timeChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormFields(prevState => {
      const newDate = new Date(prevState.date);
      const hourComponents = e.target.value.split(':').map(v => +v);
      newDate.setHours(hourComponents[0], hourComponents[1]);
      return { ...prevState, date: newDate };
    });
  };

  const formValidator = (): { errorMessage: string } | null => {
    if (!formFields.hours) return { errorMessage: 'Invalid number of hours' };
    if (
      !formFields.date ||
      new Date(Date.now()).getTime() > formFields.date.getTime()
    )
      return { errorMessage: 'Invalid date' };
    if (!formFields.topic.length)
      return { errorMessage: 'Invalid session topic' };
    return null;
  };

  const formSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    const validationError = formValidator();
    if (!validationError) {
      ApiHelper(
        `/api/tutors/${tutor!._id}/sessions`,
        {
          ...formFields,
          date: formFields.date.toISOString(),
        },
        'POST'
      ).then(res => {
        if (res.errorMessage) return setValidationError(res.errorMessage);
        router.replace('/users');
      });
    } else setValidationError(validationError.errorMessage);
  };

  const currentHour =
    formFields.date.getHours() < 9
      ? '0' + formFields.date.getHours().toString()
      : formFields.date.getHours().toString();
  const currentMinutes =
    formFields.date.getMinutes() < 9
      ? '0' + formFields.date.getMinutes().toString()
      : formFields.date.getMinutes().toString();

  let markup = <h1>404 Tutor not found!</h1>;
  if (tutor && tutor.reviews) {
    markup = (
      <>
        <h1>Book a session with {tutor.fullname}</h1>
        {validationError?.length && <div>{validationError}</div>}
        <form onSubmit={formSubmitHandler}>
          <fieldset>
            <label htmlFor="subject">Subject</label>
            <select name="subject" id="subject" onChange={formFieldUpdater}>
              {tutor.subjects.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </fieldset>
          <fieldset>
            <label htmlFor="topic">Topic</label>
            <textarea
              name="topic"
              id="topic"
              onChange={formFieldUpdater}
              value={formFields.topic}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="hours">How many hours you need?</label>
            <input
              type="number"
              name="hours"
              id="hours"
              min={1}
              max={6}
              onChange={formFieldUpdater}
              value={formFields.hours}
            />
          </fieldset>
          <fieldset>
            <div>When would you like to have this session?</div>
            <label htmlFor="date">Date</label>
            <DatePicker
              id="date"
              selected={formFields.date}
              onChange={dateChangeHandler}
              minDate={new Date(Date.now())}
            />
            <label htmlFor="time">Time</label>
            <input
              type="time"
              name="time"
              id="time"
              onChange={timeChangeHandler}
              value={`${currentHour}:${currentMinutes}`}
            />
          </fieldset>
          <button type="submit">Submit request</button>
        </form>
      </>
    );
  }
  return markup;
};

import { getServerSession } from 'next-auth';
import connectDB from '../../../../middleware/mongo-connect';
import { authOptions } from '../../../api/auth/[...nextauth]';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const [, session] = await Promise.all([
    connectDB(),
    getServerSession(context, authOptions),
  ]);
  try {
    if (session) {
      const tutor = await User.findById(context.query.tutorId)
        .populate({
          path: 'reviews',
          options: {
            sort: { _id: -1 },
          },
          model: Review,
        })
        .exec();
      if (
        context.query.tutorId ===
        (session!.user as UserDocument)!._id.toString()
      ) {
        return {
          props: {},
          redirect: { permanent: false, destination: '/tutoro' },
        };
      }
      return { props: { tutor: tutor ? getUserDocumentObject(tutor) : null } };
    }
  } catch (e) {
    return { props: { tutor: null } };
  }
  return {
    props: {},
    redirect: {
      permanent: false,
      destination: `http://${context.req.headers.host}/api/auth/signin?callbackUrl=/tutors/${context.query.tutorId}/sessions/new`,
    },
  };
};

export default Page;
