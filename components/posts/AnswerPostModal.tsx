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
  Input,
  Spinner,
} from '@chakra-ui/react';
import Link from 'next/link';
import React, {
  useState,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from 'react';
import { useForm } from 'react-hook-form';
import {
  FaArrowRight,
  FaBroom,
  FaFile,
  FaImage,
  FaPaperclip,
} from 'react-icons/fa';
import { PostDocumentObject } from '../../models/Post';
import { AnswerFormFields, CloudFile } from '../../types';

export type AnswerPostModalHandler = {
  onClose: () => void;
  onOpen: () => void;
  setValidationError: Dispatch<SetStateAction<string | null>>;
};

const AnswerPostModal = React.forwardRef<
  AnswerPostModalHandler,
  {
    setAnswer: (formData: FormData) => Promise<void>;
    post: PostDocumentObject;
  }
>((props, ref) => {
  const [filesList, setFilesList] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnswerFormFields>({
    defaultValues: {
      text: props.post?.answer,
    },
  });

  const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    if (!fileInput.files) {
      alert('No file was chosen');
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Files list is empty');
      return;
    }

    setFilesList(fileInput.files);
  };

  const formSubmitHandler = async (data: AnswerFormFields) => {
    const formData = new FormData();

    if (filesList) {
      const allowedFileRegExp = new RegExp(
        'image|pdf|wordprocessing|spreadsheetml|presentationml'
      );
      const fileListArray = Array.from(filesList);
      for (let i = 0; i < fileListArray.length; i++) {
        if (!allowedFileRegExp.test(fileListArray[i].type)) {
          return setValidationError(`Invalid file, ${fileListArray[i].type}`);
        }
        formData.append(`attachment-${i}`, fileListArray[i]);
      }
    }

    formData.append('text', data.text);
    setIsUploading(true);
    await props.setAnswer(formData);
    setIsUploading(false);
  };

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
                <Flex my="4">
                  <FaPaperclip size={25} />
                  <Heading as="h3" size="md" ml="1">
                    Attachments
                  </Heading>
                </Flex>
                {props.post.attachments.map((f: CloudFile, i: number) => (
                  <Link href={f.url} key={f.public_id} passHref>
                    <Button
                      mb="3"
                      as="a"
                      leftIcon={
                        f.url.includes('raw') ? (
                          <FaFile size={18} />
                        ) : (
                          <FaImage size={18} />
                        )
                      }
                    >
                      <>Attachment {i + 1}</>
                    </Button>
                  </Link>
                ))}
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
                <FormControl mb="4">
                  {filesList && filesList.length! > 4 && (
                    <Alert status="error" fontWeight="bold" my="3">
                      Maximum 4 attachments
                    </Alert>
                  )}
                  <FormLabel htmlFor="attachments-input" fontWeight="bold">
                    Optional, any attachments to share?
                  </FormLabel>
                  <Input
                    type="file"
                    multiple
                    id="attachments-input"
                    onChange={onFileUploadChange}
                  />
                  <Text fontWeight="bold" my="2">
                    Only images, PDFs and office format files
                  </Text>
                </FormControl>

                {isUploading ? (
                  <Flex alignItems="center">
                    <Spinner
                      thickness="4px"
                      speed="0.65s"
                      emptyColor="gray.200"
                      color="blue.500"
                      size="xl"
                    />
                    <Heading as="h3" size="md" ml="3">
                      Uploading attachments
                    </Heading>
                  </Flex>
                ) : (
                  <Flex
                    width="100%"
                    direction={['column', 'column', 'row', null, null]}
                  >
                    <Tooltip
                      hasArrow
                      p="3"
                      bg="gray.300"
                      color="black"
                      label="You will not be able to modify the answer!"
                    >
                      <Button
                        disabled={
                          filesList && filesList.length > 4 ? true : false
                        }
                        colorScheme="blue"
                        type="submit"
                        w="100%"
                        mt={[3, 3, 0, 0, 0]}
                        mr={[0, 0, 3, 3, 3]}
                        rightIcon={<FaArrowRight />}
                      >
                        Answer Post
                      </Button>
                    </Tooltip>
                    <Button
                      colorScheme="red"
                      type="reset"
                      rightIcon={<FaBroom />}
                      w="100%"
                      mt={[3, 3, 0, 0, 0]}
                      mr={[0, 0, 3, 3, 3]}
                    >
                      Reset
                    </Button>
                  </Flex>
                )}
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
