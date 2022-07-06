import { useContext, useState } from 'react';
import { ReviewFormTypes } from './ReviewForm';
import { useSession } from 'next-auth/react';
import ReviewContext from '../../store/reviews-context';
import ReviewForm from './ReviewForm';
import type { ReviewDocumentObject } from '../../models/Review';
import { UserDocumentObject } from '../../models/User';

interface Props {
  review: ReviewDocumentObject;
  viewAsTutor: boolean;
}

const Review: React.FC<Props> = ({ review, viewAsTutor }) => {
  const ctx = useContext(ReviewContext);
  const { status } = useSession();
  const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);
  const { tutor, user } = review;
  const { _id: tutorId, fullname: tutorFullname } = tutor as UserDocumentObject;
  const { fullname: userFullname } = user as UserDocumentObject;

  const deleteReviewClickHandler = () => {
    const c = confirm('Are you sure you want to delete this review?');
    if (c) ctx.deleteReview(tutorId.toString(), review._id);
  };

  return (
    <article>
      <h3>{viewAsTutor ? userFullname : tutorFullname}</h3>
      <div>{review.stars}</div>
      {review.text && <div>{review.text}</div>}
      {status === 'authenticated' && review.ownerAuthenticated && (
        <>
          <button onClick={deleteReviewClickHandler}>DELETE</button>
          <button onClick={() => setShowUpdateForm(prevState => !prevState)}>
            {showUpdateForm ? 'HIDE' : 'UPDATE'}
          </button>
          {showUpdateForm && (
            <ReviewForm
              type={ReviewFormTypes.Edit}
              review={review}
              hideForm={() => setShowUpdateForm(false)}
            />
          )}
        </>
      )}
    </article>
  );
};

export default Review;
