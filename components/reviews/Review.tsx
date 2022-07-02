import { useContext, useState } from 'react';
import ReviewContext from '../../store/reviews-context';
import ReviewForm from './ReviewForm';
import { ReviewFormTypes } from './ReviewForm';
import { useSession } from 'next-auth/react';
import type { ReviewDocumentObject } from '../../models/Review';

const Review: React.FC<{
  tutorId: string;
  review: ReviewDocumentObject;
}> = props => {
  const ctx = useContext(ReviewContext);
  const { status } = useSession();
  const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);

  const deleteReviewClickHandler = () => {
    const c = confirm('Are you sure you want to delete this review?');
    if (c) ctx.deleteReview(props.tutorId, props.review._id);
  };

  return (
    <article>
      <div>{props.review.stars}</div>
      {props.review.text && <div>{props.review.text}</div>}
      {status === 'authenticated' && props.review.ownerAuthenticated && (
        <>
          <button onClick={deleteReviewClickHandler}>DELETE</button>
          <button onClick={() => setShowUpdateForm(prevState => !prevState)}>
            {showUpdateForm ? 'HIDE' : 'UPDATE'}
          </button>
          {showUpdateForm && (
            <ReviewForm
              type={ReviewFormTypes.Edit}
              review={props.review}
              tutorId={props.tutorId}
              hideForm={() => setShowUpdateForm(false)}
            />
          )}
        </>
      )}
    </article>
  );
};

export default Review;
