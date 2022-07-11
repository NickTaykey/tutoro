import type { NewPostFormFields } from '../../types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import ApiHelper from '../../utils/api-helper';

interface Props {
  subjects: string[] | null;
}

const NewPostForm: React.FC<Props> = props => {
  const { query, replace } = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewPostFormFields>({
    defaultValues: {
      description: '',
      subject: props.subjects ? props.subjects[0] : '',
    },
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const formResetHandler = () => {
    reset();
    setValidationError(null);
  };
  const formSubmitHandler = (data: NewPostFormFields) => {
    ApiHelper(
      `/api/${query.tutorId ? `/tutors/${query.tutorId}/posts` : '/posts'}`,
      data,
      'POST'
    ).then(res => {
      if (res.errorMessage) return setValidationError(res.errorMessage);
      replace('/users');
    });
  };
  return (
    <>
      <h2>Do you have a question, a problem a doubt on a homework?</h2>
      <div>Solve it by asking our tutors with a post</div>
      {!!Object.keys(errors).length && (
        <div>Provide your {Object.keys(errors)[0]}</div>
      )}
      {validationError && <div>{validationError}</div>}
      <form onSubmit={handleSubmit(formSubmitHandler)}>
        <fieldset>
          <label htmlFor="post-subject">Subject</label>
          {props.subjects ? (
            <select id="post-subject" {...register('subject')}>
              {props.subjects.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="post-subject"
              {...register('subject', { maxLength: 50 })}
            />
          )}
        </fieldset>
        <fieldset>
          <label htmlFor="post-description">Description</label>
          <textarea
            id="post-description"
            {...register('description', { minLength: 10, maxLength: 1000 })}
          />
        </fieldset>
        <button type="submit">Submit</button>
        <button type="button" onClick={formResetHandler}>
          Reset
        </button>
      </form>
    </>
  );
};

export default NewPostForm;
