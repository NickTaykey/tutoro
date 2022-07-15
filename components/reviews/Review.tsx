import { useContext, useState } from 'react';
import { ReviewFormTypes } from './ReviewForm';
import { useSession } from 'next-auth/react';
import ReviewContext from '../../store/reviews-context';
import ReviewForm from './ReviewForm';
import { UserDocumentObject } from '../../models/User';
import type { ReviewDocumentObject } from '../../models/Review';

interface Props {
  review: ReviewDocumentObject;
  deleteUserCreateReviewId: ((rid: string) => void) | null;
}

import {
  FaStar,
  FaTrashAlt,
  FaPencilAlt,
  FaRegTimesCircle,
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

const Review: React.FC<Props> = ({ review, deleteUserCreateReviewId }) => {
  const ctx = useContext(ReviewContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { status } = useSession();
  const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);
  const { tutor, user } = review;
  const { _id: tutorId } = tutor as UserDocumentObject;
  const { fullname: userFullname, avatar } = user as UserDocumentObject;

  const deleteReviewClickHandler = () => {
    if (deleteUserCreateReviewId) {
      deleteUserCreateReviewId(review._id);
      ctx.deleteReview(tutorId.toString(), review._id);
    }
  };

  return (
    <Box shadow="md" borderWidth="1px" p="6" width="100%" borderRadius="md">
      {showUpdateForm ? (
        <>
          <Box float="right" _hover={{ cursor: 'pointer' }}>
            <FaRegTimesCircle
              size="25"
              onClick={() => setShowUpdateForm(false)}
            />
          </Box>
          <ReviewForm
            type={ReviewFormTypes.Edit}
            review={review}
            hideForm={() => setShowUpdateForm(false)}
          />
        </>
      ) : (
        <>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
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
          <Flex alignItems="center">
            <Avatar name={userFullname} src={avatar} />
            <Heading as="h3" size="sm" mx="3">
              {userFullname}
            </Heading>
          </Flex>
          <Flex justify="space-between" align="center">
            <Flex justify="start" my="3">
              {Array(review.stars ? review.stars : 5)
                .fill(null)
                .map((_, i) => (
                  <FaStar
                    key={i}
                    size={25}
                    color={review.stars ? '#ffbe0b' : '#e5e5e5'}
                  />
                ))}
            </Flex>
            <time
              dateTime={
                review.updatedAt!.toString() === review.updatedAt!.toString()
                  ? review.createdAt!.toString()
                  : review.updatedAt!.toString()
              }
              style={{ float: 'right' }}
            >
              {review.updatedAt!.toString() === review.updatedAt!.toString()
                ? review
                    .createdAt!.toString()
                    .slice(
                      0,
                      review.createdAt!.toString().length === 18 ? -3 : -6
                    )
                : review
                    .updatedAt!.toString()
                    .slice(
                      0,
                      review.updatedAt!.toString().length === 18 ? -3 : -6
                    )}
            </time>
          </Flex>
          {review.text && <Text>{review.text}</Text>}
          {status === 'authenticated' && review.ownerAuthenticated && (
            <Box mt="2">
              <IconButton
                colorScheme="red"
                onClick={onOpen}
                aria-label="delete review"
                icon={<FaTrashAlt />}
                mr="1"
              />
              <IconButton
                onClick={() => setShowUpdateForm(prevState => !prevState)}
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
