import { TutorReviewObject } from '../../types';

const Review: React.FC<{
  review: TutorReviewObject;
}> = ({ review }) => {
  return (
    <article key={review.id}>
      <div>{review.stars}</div>
      <div>{review.username}</div>
      <div>{review.text}</div>
    </article>
  );
};

export default Review;
