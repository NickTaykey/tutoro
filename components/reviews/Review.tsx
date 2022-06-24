import { useContext, useState } from 'react';
import ReviewContext from '../../store/reviews-context';
import type { TutorReviewObject } from '../../types';
import ReviewForm from './ReviewForm';
import { ReviewFormTypes } from './ReviewForm';

const Review: React.FC<{
  tutorId: string;
  review: TutorReviewObject;
}> = props => {
  const ctx = useContext(ReviewContext);
  const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);
  const deleteReviewClickHandler = () => {
    const c = confirm('Are you sure you want to delete this review?');
    if (c) ctx.deleteReview(props.tutorId, props.review._id);
  };
  return (
    <article>
      <div>{props.review.stars}</div>
      {props.review.text && <div>{props.review.text}</div>}
      <button onClick={deleteReviewClickHandler}>DELETE</button>
      <button onClick={() => setShowUpdateForm(prevState => !prevState)}>
        {showUpdateForm ? 'HIDE' : 'UPDATE'}
      </button>
      {showUpdateForm && (
        <ReviewForm
          type={ReviewFormTypes.Edit}
          review={props.review}
          tutorId={props.tutorId}
        />
      )}
    </article>
  );
};

export default Review;
