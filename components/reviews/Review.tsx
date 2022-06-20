import { TutorReviewObject } from '../../types';

const Review: React.FC<{
  review: TutorReviewObject;
}> = ({ review }) => {
  return (
    <article>
      <div>{review.stars}</div>
      <div>{review.text}</div>
    </article>
  );
};

export default Review;
