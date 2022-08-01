import type { ReviewDocumentObject } from '../../models/Review';
import React, { FormEvent, useContext, useRef, useState } from 'react';
import { UserDocumentObject } from '../../models/User';
import ReviewContext from '../../store/reviews-context';
import StarRating, { StarRatingHandle } from './StarRating';
import {
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Alert,
  IconButton,
  AlertIcon,
} from '@chakra-ui/react';
import { FaPen, FaRegTimesCircle } from 'react-icons/fa';

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
  hideForm(): void;
};

const ReviewForm: React.FC<
  CreateReviewFormProps | EditReviewFormProps
> = props => {
  const reviewCtx = useContext(ReviewContext);
  const isEdit = props.type === ReviewFormTypes.Edit;
  const imperativeHandlingRef = useRef<StarRatingHandle>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [stars, setStars] = useState<number>(isEdit ? props.review.stars : 0);
  const [text, setText] = useState<string>(
    isEdit && props.review?.text ? props.review.text : ''
  );

  const createReviewHandler = async () => {
    if (props.type === ReviewFormTypes.Create) {
      const apiResponse = await reviewCtx.addReview(props.tutorId, {
        stars,
        text,
      });
      if (apiResponse.errorMessage) setErrorAlert(apiResponse.errorMessage);
      else {
        setStars(0);
        setText('');
        setErrorAlert(null);
        imperativeHandlingRef.current!.reset();
      }
    }
  };

  const updateReviewHandler = async () => {
    if (props.type === ReviewFormTypes.Edit) {
      const editReviewProps = props as EditReviewFormProps;
      const apiResponse = await reviewCtx.updateReview(
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
    if (props.type === ReviewFormTypes.Create) return createReviewHandler();
    updateReviewHandler();
  };

  return (
    <form onSubmit={formSubmitHandler}>
      {errorAlert && (
        <Alert status="error" my="3">
          <AlertIcon />
          {errorAlert}
        </Alert>
      )}
      <FormControl my="2">
        <StarRating
          ref={imperativeHandlingRef}
          stars={stars}
          setStars={setStars}
        />
      </FormControl>
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
      <Button
        type="submit"
        variant="primary"
        my="3"
        width={['100%', 'auto']}
        leftIcon={<FaPen size="15" />}
      >
        {isEdit ? 'Update' : 'Post'} review
      </Button>
      {isEdit && (
        <IconButton
          width={['100%', 'auto']}
          ml={[0, 2]}
          icon={<FaRegTimesCircle size="25" />}
          aria-label="close edit Review form"
          onClick={() => props.hideForm()}
        />
      )}
    </form>
  );
};

export default ReviewForm;
