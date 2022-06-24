import React, { FormEvent, useContext, useRef, useState } from 'react';
import ReviewContext, { APIError } from '../../store/reviews-context';
import { TutorReviewObject } from '../../types';
import StarRating, { StarRatingHandle } from './StarRating';

export enum ReviewFormTypes {
  Create,
  Edit,
}

type CreateReviewFormProps = {
  type: ReviewFormTypes.Create;
  tutorId: string;
};

type EditReviewFormProps = {
  type: ReviewFormTypes.Edit;
  tutorId: string;
  review: { stars: number; text?: string };
};

const ReviewForm: React.FC<
  CreateReviewFormProps | EditReviewFormProps
> = props => {
  const ctx = useContext(ReviewContext);
  const imperativeHandlingRef = useRef<StarRatingHandle>(null);
  const [stars, setStars] = useState<number>(0);
  const [text, setText] = useState<string>('');
  const [errorAlert, setErrorAlert] = useState<string>('');

  const createReviewHandler = async () => {
    const apiResponse = await ctx.addReview(props.tutorId, {
      stars,
      text,
    });
    if (apiResponse.errorMessage) setErrorAlert(apiResponse.errorMessage);
    else {
      setStars(0);
      setText('');
      imperativeHandlingRef.current!.reset();
    }
  };

  const formSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    if (props.type === ReviewFormTypes.Create && !stars) {
      const r = confirm('Are you sure you want to give 0 stars?');
      if (r) createReviewHandler();
    } else if (props.type === ReviewFormTypes.Create && stars) {
      createReviewHandler();
    }
  };

  return (
    <form onSubmit={formSubmitHandler}>
      {errorAlert && <div>{errorAlert}</div>}
      <fieldset>
        <StarRating
          ref={imperativeHandlingRef}
          stars={stars}
          setStars={setStars}
        />
      </fieldset>
      <fieldset>
        <label>
          (optional) your review
          <textarea
            cols={30}
            rows={10}
            onChange={e => setText(e.target.value)}
            value={text}
          ></textarea>
        </label>
      </fieldset>
      <button type="submit">Post review</button>
    </form>
  );
};

export default ReviewForm;
