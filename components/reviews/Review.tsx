import { useContext } from 'react';
import ReviewContext from '../../store/reviews-context';
import ReviewForm from './ReviewForm';
import type { UserDocumentObject } from '../../models/User';
import type { ReviewDocumentObject } from '../../models/Review';
import { ReviewFormTypes } from './ReviewForm';

interface Props {
  review: ReviewDocumentObject;
  staticView?: boolean;
}

import {
  FaStar,
  FaTrashAlt,
  FaPencilAlt,
  FaExpandArrowsAlt,
} from 'react-icons/fa';
import * as c from '@chakra-ui/react';
import Link from 'next/link';
import AuthenticatedUserContext from '../../store/authenticated-user-context';

const Review: React.FC<Props> = ({ review, staticView }) => {
  const reviewCtx = useContext(ReviewContext);
  const { user: currentUser } = useContext(AuthenticatedUserContext);
  const { isOpen: showFullText, onOpen: setShowFullText } = c.useDisclosure();
  const {
    isOpen: showUpdateForm,
    onClose: closeUpdateForm,
    onToggle: toggleUpdateForm,
  } = c.useDisclosure();
  const { isOpen, onOpen, onClose } = c.useDisclosure();
  const { tutor, user } = review;
  const { _id: tutorId, fullname: tutorFullname } = tutor as UserDocumentObject;
  const {
    fullname: userFullname,
    avatar,
    _id: creatorId,
  } = user as UserDocumentObject;
  const deleteReviewClickHandler = () => {
    reviewCtx.deleteReview(tutorId.toString(), review._id);
  };
  const datetime =
    review.updatedAt!.toString() === review.updatedAt!.toString()
      ? review.createdAt!.toString()
      : review.updatedAt!.toString();
  const readableDatetime = datetime.slice(
    0,
    review.createdAt!.toString().length === 18 ? -3 : -6
  );

  return (
    <c.Box shadow="md" borderWidth="1px" p="6" width="100%" borderRadius="md">
      {showUpdateForm ? (
        <ReviewForm
          type={ReviewFormTypes.Edit}
          review={review}
          hideForm={closeUpdateForm}
        />
      ) : (
        <>
          <c.Modal isOpen={isOpen} onClose={onClose}>
            <c.ModalOverlay />
            <c.ModalContent width="90%">
              <c.ModalHeader>This action is irreversibile</c.ModalHeader>
              <c.ModalCloseButton />
              <c.ModalFooter>
                <c.Button colorScheme="gray" mr={3} onClick={onClose}>
                  Close
                </c.Button>
                <c.Button colorScheme="red" onClick={deleteReviewClickHandler}>
                  Delete review
                </c.Button>
              </c.ModalFooter>
            </c.ModalContent>
          </c.Modal>
          {staticView ? (
            <c.Heading as="h3" size="sm">
              {tutorFullname}
            </c.Heading>
          ) : (
            <c.Flex
              justify={staticView ? 'space-between' : 'start'}
              alignItems="center"
            >
              <c.Avatar name={userFullname} src={avatar?.url} />
              <c.Heading as="h3" size="sm" mx="3">
                {userFullname}
              </c.Heading>
            </c.Flex>
          )}
          <c.Flex justify="space-between" align="center">
            <c.Flex justify="start" my="3">
              {Array(review.stars)
                .fill(null)
                .map((_, i) => (
                  <FaStar key={i} color="#ffbe0b" />
                ))}
              {Array(5 - review.stars)
                .fill(null)
                .map((_, i) => (
                  <FaStar key={i} color="#e5e5e5" />
                ))}
            </c.Flex>
            <c.Flex alignItems="center">
              <time dateTime={datetime} style={{ float: 'right' }}>
                {readableDatetime}
              </time>
              {staticView && (
                <Link href={`/tutors/${tutorId}`} style={{ float: 'left' }}>
                  <c.IconButton
                    ml="3"
                    aria-label="view tutor page"
                    icon={<FaExpandArrowsAlt />}
                  />
                </Link>
              )}
            </c.Flex>
          </c.Flex>
          {review.text && (
            <c.Text mb="3">
              {showFullText || review.text.length < 100 ? (
                review.text
              ) : (
                <>
                  {`${review.text.slice(0, 100)} ... `}
                  <strong onClick={setShowFullText}>View more</strong>
                </>
              )}
            </c.Text>
          )}
          {currentUser && currentUser._id === creatorId && (
            <c.Box mt="2">
              <c.IconButton
                variant="danger"
                onClick={onOpen}
                aria-label="delete review"
                icon={<FaTrashAlt />}
                mr="3"
              />
              <c.IconButton
                onClick={toggleUpdateForm}
                variant="warning"
                aria-label="update review"
                icon={<FaPencilAlt />}
              />
            </c.Box>
          )}
        </>
      )}
    </c.Box>
  );
};

export default Review;
