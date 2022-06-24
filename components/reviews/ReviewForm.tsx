import React, { FormEvent, useContext, useRef, useState } from 'react';
import ReviewContext from '../../store/reviews-context';
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

  const formSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (props.type === ReviewFormTypes.Create) {
      ctx.addReview(props.tutorId, { stars, text });
      setStars(0);
      setText('');
      imperativeHandlingRef.current!.reset();
    }
  };

  return (
    <form onSubmit={formSubmitHandler}>
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
