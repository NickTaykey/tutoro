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
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  Avatar,
  Flex,
  Text,
  Heading,
  Box,
  IconButton,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import Link from 'next/link';
import AuthenticatedUserContext from '../../store/authenticated-user-context';

const Review: React.FC<Props> = ({ review, staticView }) => {
  const reviewCtx = useContext(ReviewContext);
  const { user: currentUser } = useContext(AuthenticatedUserContext);
  const { isOpen: showFullText, onOpen: setShowFullText } = useDisclosure();
  const {
    isOpen: showUpdateForm,
    onClose: closeUpdateForm,
    onToggle: toggleUpdateForm,
  } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    <Box shadow="md" borderWidth="1px" p="6" width="100%" borderRadius="md">
      {showUpdateForm ? (
        <ReviewForm
          type={ReviewFormTypes.Edit}
          review={review}
          hideForm={closeUpdateForm}
        />
      ) : (
        <>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent width="90%">
              <ModalHeader>This action is irreversibile</ModalHeader>
              <ModalCloseButton />
              <ModalFooter>
                <Button colorScheme="gray" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme="red" onClick={deleteReviewClickHandler}>
                  Delete review
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          {staticView ? (
            <Heading as="h3" size="sm">
              {tutorFullname}
            </Heading>
          ) : (
            <Flex
              justify={staticView ? 'space-between' : 'start'}
              alignItems="center"
            >
              <Avatar name={userFullname} src={avatar?.url} />
              <Heading as="h3" size="sm" mx="3">
                {userFullname}
              </Heading>
            </Flex>
          )}
          <Flex justify="space-between" align="center">
            <Flex justify="start" my="3">
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
            </Flex>
            <Flex alignItems="center">
              <time dateTime={datetime} style={{ float: 'right' }}>
                {readableDatetime}
              </time>
              {staticView && (
                <Link href={`/tutors/${tutorId}`} style={{ float: 'left' }}>
                  <IconButton
                    ml="3"
                    aria-label="view tutor page"
                    icon={<FaExpandArrowsAlt />}
                  />
                </Link>
              )}
            </Flex>
          </Flex>
          {review.text && (
            <Text mb="3">
              {showFullText || review.text.length < 100 ? (
                review.text
              ) : (
                <>
                  {`${review.text.slice(0, 100)} ... `}
                  <strong onClick={setShowFullText}>View more</strong>
                </>
              )}
            </Text>
          )}
          {currentUser && currentUser._id === creatorId && (
            <Box mt="2">
              <IconButton
                colorScheme="red"
                onClick={onOpen}
                aria-label="delete review"
                icon={<FaTrashAlt />}
                mr="1"
              />
              <IconButton
                onClick={toggleUpdateForm}
                colorScheme="yellow"
                aria-label="update review"
                icon={<FaPencilAlt />}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Review;
