import * as c from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { FaArrowRight, FaBroom, FaFile, FaImage } from 'react-icons/fa';
import { MdOutlineAttachment } from 'react-icons/md';
import React, { useState, useImperativeHandle } from 'react';
import type { Dispatch, SetStateAction, ChangeEvent } from 'react';
import type { PostDocumentObject } from '../../models/Post';
import type { AnswerFormFields, CloudFile } from '../../types';

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
  const { isOpen, onOpen, onClose } = c.useDisclosure();
  const lightTextColor = c.useColorModeValue('gray.500', 'gray.300');

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
    setFilesList(e.target.files);
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
    <c.Modal isOpen={isOpen} onClose={onClose} size="full">
      <c.ModalOverlay />
      <c.ModalContent>
        <c.Show above="md">
          <c.Kbd float="right" position="absolute" right="50px" top="15px">
            esc
          </c.Kbd>
        </c.Show>
        <c.ModalCloseButton />
        <c.ModalBody mt="3" overflowY="auto">
          <c.Flex
            width="90%"
            direction={['column', 'column', 'row']}
            mx="auto"
            mt="5"
            height={[null, null, '80vh', '80vh']}
            alignItems="center"
          >
            <c.Box width={['100%', '100%', '50%']} mx={['0', '0', '2']} my="2">
              <c.Flex
                direction="column"
                shadow="md"
                borderWidth="1px"
                p="6"
                width="100%"
                borderRadius="md"
              >
                <c.Heading as="h2" size="lg">
                  Post content
                </c.Heading>
                <c.Heading as="h3" size="md" my="4">
                  Description
                </c.Heading>
                <c.Text textAlign="justify">{props.post?.description}</c.Text>
                {!!props.post.attachments.length && (
                  <>
                    <c.Flex my="4">
                      <MdOutlineAttachment size={25} />
                      <c.Heading as="h3" size="md" ml="1">
                        Attachments
                      </c.Heading>
                    </c.Flex>
                    {props.post.attachments.map((f: CloudFile, i: number) => (
                      <c.Button
                        width="100%"
                        mb="3"
                        key={f.public_id}
                        textTransform="capitalize"
                        leftIcon={
                          f.url.includes('raw') ? (
                            <FaFile size={18} />
                          ) : (
                            <FaImage size={18} />
                          )
                        }
                      >
                        <a href={f.url} target="_blank" rel="noreferrer">
                          <>Attachment {i + 1}</>
                        </a>
                      </c.Button>
                    ))}
                  </>
                )}
              </c.Flex>
            </c.Box>
            <c.Box width={['100%', '100%', '50%']} mx={['0', '0', '2']} my="2">
              <c.Heading as="h1" size="lg" my="4">
                Your answer
              </c.Heading>
              {validationError && (
                <c.Alert status="error" my="4">
                  <c.AlertIcon />
                  {validationError}
                </c.Alert>
              )}
              {!!Object.keys(errors).length && (
                <c.Alert status="error" my="4">
                  <c.AlertIcon />
                  {Object.keys(errors)[0].includes('text')
                    ? 'Provide the description of your answer'
                    : ` Provide your ${Object.keys(errors)[0]}}`}
                </c.Alert>
              )}
              <form onSubmit={handleSubmit(formSubmitHandler)}>
                <c.FormControl mb="4">
                  <c.FormLabel htmlFor="answer-text" fontWeight="bold">
                    Answer description
                  </c.FormLabel>
                  <c.Textarea
                    id="answer-text"
                    {...register('text', { minLength: 10, required: true })}
                  />
                </c.FormControl>
                <c.FormControl mb="4">
                  {filesList && filesList.length! > 4 && (
                    <c.Alert status="error" fontWeight="bold">
                      <c.AlertIcon />
                      Maximum 4 attachments
                    </c.Alert>
                  )}
                  <c.FormLabel htmlFor="attachments-input" fontWeight="bold">
                    Optional, any attachments to share?
                  </c.FormLabel>
                  <c.Input
                    type="file"
                    multiple
                    id="attachments-input"
                    onChange={onFileUploadChange}
                  />
                  <c.Text fontWeight="light" my="2" color={lightTextColor}>
                    Only images, PDFs and office format files
                  </c.Text>
                </c.FormControl>

                {isUploading ? (
                  <c.Flex alignItems="center">
                    <c.Spinner
                      thickness="4px"
                      speed="0.65s"
                      emptyColor="gray.200"
                      color="blue.500"
                      size="lg"
                    />
                  </c.Flex>
                ) : (
                  <c.Flex
                    width="100%"
                    direction={['column', 'column', 'row', null, null]}
                  >
                    <c.Tooltip
                      hasArrow
                      p="3"
                      bg="gray.300"
                      color="black"
                      label="You will not be able to modify the answer!"
                    >
                      <c.Button
                        disabled={
                          filesList && filesList.length > 4 ? true : false
                        }
                        variant="primary"
                        type="submit"
                        w="100%"
                        mt={[3, 3, 0, 0, 0]}
                        mr={[0, 0, 3, 3, 3]}
                        rightIcon={<FaArrowRight />}
                      >
                        Answer Post
                      </c.Button>
                    </c.Tooltip>
                    <c.Button
                      variant="danger"
                      type="reset"
                      rightIcon={<FaBroom />}
                      w="100%"
                      mt={[3, 3, 0, 0, 0]}
                      mr={[0, 0, 3, 3, 3]}
                    >
                      Reset
                    </c.Button>
                  </c.Flex>
                )}
              </form>
            </c.Box>
          </c.Flex>
        </c.ModalBody>
      </c.ModalContent>
    </c.Modal>
  );
});

AnswerPostModal.displayName = 'AnswerPostModalHandler';

export default AnswerPostModal;
