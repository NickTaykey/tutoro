import React, { FormEvent, useContext, useRef, useState } from 'react';
import type { ReviewDocumentObject } from '../../models/Review';
import { UserDocumentObject } from '../../models/User';
import ReviewContext from '../../store/reviews-context';
import StarRating, { StarRatingHandle } from './StarRating';

export enum ReviewFormTypes {
  Create,
  Edit,
}

import {
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Alert,
} from '@chakra-ui/react';

type CreateReviewFormProps = {
  type: ReviewFormTypes.Create;
  tutorId: string;
  addUserCreateReviewId(reviewId: string): void;
};

type EditReviewFormProps = {
  type: ReviewFormTypes.Edit;
  review: ReviewDocumentObject;
  hideForm(): void;
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
        props.addUserCreateReviewId(apiResponse._id);
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

  const formSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (props.type === ReviewFormTypes.Create) {
      createReviewHandler();
    } else {
      updateReviewHandler();
    }
  };

  return (
    <form onSubmit={formSubmitHandler}>
      {errorAlert && (
        <Alert status="error" my="3">
          {errorAlert}
        </Alert>
      )}
      <fieldset>
        <StarRating
          ref={imperativeHandlingRef}
          stars={stars}
          setStars={setStars}
        />
      </fieldset>
      <FormControl>
        <FormLabel htmlFor="email">
          Describe your experience (optional)
        </FormLabel>
        <Textarea
          id="text"
          name="text"
          value={text}
          cols={100}
          rows={5}
          onChange={e => setText(e.target.value)}
        />
      </FormControl>
      <Button type="submit" colorScheme="blue" my="3" width={['100%', 'auto']}>
        {isEdit ? 'Update' : 'Post'} review
      </Button>
    </form>
  );
};

export default ReviewForm;
