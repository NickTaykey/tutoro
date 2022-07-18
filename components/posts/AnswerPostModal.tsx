import {
  Alert,
  Button,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Textarea,
  useDisclosure,
  Box,
  Tooltip,
} from '@chakra-ui/react';
import React, {
  useState,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
} from 'react';
import { useForm } from 'react-hook-form';
import { PostDocumentObject } from '../../models/Post';
import { AnswerFormFields } from '../../types';

export type AnswerPostModalHandler = {
  onClose: () => void;
  onOpen: () => void;
  setValidationError: Dispatch<SetStateAction<string | null>>;
};

const AnswerPostModal = React.forwardRef<
  AnswerPostModalHandler,
  {
    setAnswer: (newAnswer: string) => void;
    post: PostDocumentObject;
  }
>((props, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnswerFormFields>({
    defaultValues: {
      text: props.post?.answer,
    },
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const formSubmitHandler = (data: AnswerFormFields) => {
    props.setAnswer(data.text);
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  useImperativeHandle(ref, () => ({
    onOpen,
    onClose,
    setValidationError,
  }));
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Flex
            width="90%"
            direction={['column', 'column', 'row']}
            mx="auto"
            mt="5"
            height={[null, null, '80vh', '80vh']}
            alignItems="center"
          >
            <Box width={['100%', '100%', '50%']} mx={['0', '0', '2']} my="2">
              <Flex
                direction="column"
                shadow="md"
                borderWidth="1px"
                p="6"
                width="100%"
                borderRadius="md"
              >
                <Heading as="h2" size="lg">
                  Post content
                </Heading>
                <Heading as="h3" size="md" my="4">
                  Description
                </Heading>
                <Text>{props.post?.description}</Text>
              </Flex>
            </Box>
            <Box width={['100%', '100%', '50%']} mx={['0', '0', '2']} my="2">
              <Heading as="h1" size="lg">
                Your answer
              </Heading>
              {validationError && (
                <Alert status="error" my="4">
                  {validationError}
                </Alert>
              )}
              {!!Object.keys(errors).length && (
                <Alert status="error" my="4">
                  {Object.keys(errors)[0].includes('text')
                    ? 'Provide the description of your answer'
                    : ` Provide your ${Object.keys(errors)[0]}}`}
                </Alert>
              )}
              <form onSubmit={handleSubmit(formSubmitHandler)}>
                <FormControl>
                  <FormLabel htmlFor="answer-text" fontWeight="bold" my="3">
                    Answer description
                  </FormLabel>
                  <Textarea
                    mb="4"
                    id="answer-text"
                    {...register('text', { minLength: 10, required: true })}
                  />
                </FormControl>
                <Flex
                  width={['100%', '100%', '50%']}
                  direction={['column', 'column', 'row', null, null]}
                >
                  <Tooltip
                    hasArrow
                    p="3"
                    label="You will not be able to modify the answer!"
                    bg="red.500"
                  >
                    <Button
                      colorScheme="blue"
                      type="submit"
                      w="100%"
                      mt={[3, 3, 0, 0, 0]}
                      mr={[0, 0, 3, 3, 3]}
                    >
                      Submit
                    </Button>
                  </Tooltip>
                  <Button
                    colorScheme="red"
                    type="reset"
                    w="100%"
                    mt={[3, 3, 0, 0, 0]}
                    mr={[0, 0, 3, 3, 3]}
                  >
                    Reset
                  </Button>
                </Flex>
              </form>
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

AnswerPostModal.displayName = 'AnswerPostModalHandler';

export default AnswerPostModal;
