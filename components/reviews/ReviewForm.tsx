import React, { FormEvent, useContext, useRef, useState } from 'react';
import type { ReviewDocumentObject } from '../../models/Review';
import { UserDocumentObject } from '../../models/User';
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
  review: ReviewDocumentObject;
  hideForm: () => void;
};

const ReviewForm: React.FC<
  CreateReviewFormProps | EditReviewFormProps
> = props => {
  const ctx = useContext(ReviewContext);
  const isEdit = props.type === ReviewFormTypes.Edit;
  const imperativeHandlingRef = useRef<StarRatingHandle>(null);
  const [errorAlert, setErrorAlert] = useState<string>('');
  const [stars, setStars] = useState<number>(isEdit ? props.review.stars : 0);
  const [text, setText] = useState<string>(
    isEdit && props.review?.text ? props.review.text : ''
  );

  const createReviewHandler = async () => {
    if (props.type === ReviewFormTypes.Create) {
      const apiResponse = await ctx.addReview(props.tutorId, {
        stars,
        text,
      });
      if (apiResponse.errorMessage) setErrorAlert(apiResponse.errorMessage);
      else {
        setStars(0);
        setText('');
        setErrorAlert('');
        imperativeHandlingRef.current!.reset();
      }
    }
  };

  const updateReviewHandler = async () => {
    if (props.type === ReviewFormTypes.Edit) {
      const editReviewProps = props as EditReviewFormProps;
      const apiResponse = await ctx.updateReview(
        (props.review.tutor as UserDocumentObject)._id,
        {
          ...editReviewProps.review,
          stars,
          text,
        }
      );
      if (apiResponse.errorMessage) setErrorAlert(apiResponse.errorMessage);
      else {
        setErrorAlert('');
        editReviewProps.hideForm();
      }
    }
  };

  const formSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    if (props.type === ReviewFormTypes.Create && !stars) {
      const r = confirm('Are you sure you want to give 0 stars?');
      if (r) createReviewHandler();
    } else if (props.type === ReviewFormTypes.Create && stars) {
      createReviewHandler();
    } else if (props.type === ReviewFormTypes.Edit && !stars) {
      updateReviewHandler();
    } else if (props.type === ReviewFormTypes.Edit && stars) {
      updateReviewHandler();
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
      <button type="submit">{isEdit ? 'Update' : 'Post'} review</button>
    </form>
  );
};

export default ReviewForm;
