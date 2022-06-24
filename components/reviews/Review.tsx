import { useContext } from 'react';
import ReviewContext from '../../store/reviews-context';
import type { TutorReviewObject } from '../../types';

const Review: React.FC<{
  tutorId: string;
  review: TutorReviewObject;
}> = props => {
  const ctx = useContext(ReviewContext);
  const deleteReviewClickHandler = () => {
    ctx.deleteReview(props.tutorId, props.review._id);
  };
  return (
    <article>
      <div>{props.review.stars}</div>
      {props.review.text && <div>{props.review.text}</div>}
      <button onClick={deleteReviewClickHandler}>DELETE</button>
    </article>
  );
};

export default Review;
