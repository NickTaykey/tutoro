import type { NextPage } from 'next';
import type { UserDocument } from '../../../../models/User';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ApiHelper from '../../../../utils/api-helper';

interface FormStructure {
  subject: string;
  topic: string;
  hours: number;
}

const DEFAULT_FORM_VALUES: FormStructure = {
  subject: 'maths',
  topic: '',
  hours: 1,
};

const Page: NextPage = () => {
  const [tutor, setTutor] = useState<UserDocument | null>();
  const [validationError, setValidationError] = useState<string | null>();
  const [formFields, setFormFields] =
    useState<FormStructure>(DEFAULT_FORM_VALUES);

  const formFieldUpdater = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormFields(prevState => {
      const value = Number(e.target.value)
        ? Number(e.target.value)
        : e.target.value;
      return {
        ...prevState,
        [e.target.name]: value,
      };
    });
  };

  const formValidator = (): { errorMessage: string } | null => {
    if (!formFields.hours) return { errorMessage: 'Invalid number of hours' };
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
        { ...formFields, date: new Date().toISOString() },
        'POST'
      ).then(() => {
        setValidationError(null);
        setFormFields(DEFAULT_FORM_VALUES);
        alert('Session successfully registered');
      });
    } else setValidationError(validationError.errorMessage);
  };

  const router = useRouter();

  useEffect(() => {
    if (router.query.tutorId) {
      ApiHelper(`/api/tutors/${router.query.tutorId}`, {}, 'GET').then(
        features => setTutor(features)
      );
    }
  }, [router.query.tutorId]);

  let markup = <h1>Loading</h1>;
  if (tutor && !tutor.reviews) markup = <h1>404 Tutor not found!</h1>;
  if (tutor && tutor.reviews) {
    markup = (
      <>
        <h1>Book a session with {tutor.fullname}</h1>
        {validationError?.length && <div>{validationError}</div>}
        <form onSubmit={formSubmitHandler}>
          <fieldset>
            <label htmlFor="subject">Subject</label>
            <select name="subject" id="subject" onChange={formFieldUpdater}>
              <option value="maths" defaultChecked>
                Maths
              </option>
              <option value="physics">Physics</option>
              <option value="computer-science">Computer Science</option>
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
          <button type="submit">Submit request</button>
        </form>
      </>
    );
  }
  return markup;
};

export default Page;
