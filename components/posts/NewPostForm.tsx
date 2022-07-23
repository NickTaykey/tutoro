import type { NewPostFormFields } from '../../types';
import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import ApiHelper from '../../utils/api-helper';
import {
  FormControl,
  FormLabel,
  Button,
  Textarea,
  Select,
  Input,
  Text,
  Heading,
  Flex,
  Alert,
  Box,
  Spinner,
} from '@chakra-ui/react';
import Layout from '../global/Layout';
import { FaArrowRight, FaBroom } from 'react-icons/fa';

interface Props {
  subjects: string[] | null;
}

const NewPostForm: React.FC<Props> = props => {
  const { query, replace } = useRouter();
  const [filesList, setFilesList] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewPostFormFields>({
    defaultValues: {
      description: '',
      subject: props.subjects ? props.subjects[0] : '',
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

  const [validationError, setValidationError] = useState<string | null>(null);
  const formResetHandler = () => {
    reset();
    setValidationError(null);
  };
  const formSubmitHandler = async (data: NewPostFormFields) => {
    const formData = new FormData();
    formData.append('description', data.description);
    formData.append('subject', data.subject);

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
    setIsUploading(true);
    const res = await ApiHelper(
      `/api/${query.tutorId ? `/tutors/${query.tutorId}/posts` : '/posts'}`,
      formData,
      'POST',
      false
    );
    setIsUploading(false);
    if (res.errorMessage) return setValidationError(res.errorMessage);
    replace('/users');
  };

  return (
    <Layout>
      {props.subjects ? (
        <Flex
          height={[null, null, null, '75vh']}
          width={['90%', null, null, '60%', '40%']}
          mx="auto"
          align="center"
          display="flex"
          direction="column"
          mb={5}
        >
          <Heading as="h1" size="lg" textAlign="center">
            Create a Post
          </Heading>
          <Text my="3" fontWeight="light" textAlign="center">
            You can find answer to specific questions or have your homework
            reviewd.
          </Text>
          {query.tutorId === 'global' && (
            <Text my="3" fontWeight="bold" textAlign="center">
              You will be answered by one of our qualified tutors.
            </Text>
          )}
          <form
            onSubmit={handleSubmit(formSubmitHandler)}
            style={{ width: '100%' }}
          >
            {(validationError || !!Object.keys(errors).length) && (
              <Alert status="error" mb="3" fontWeight="bold">
                {validationError || `Provide your ${Object.keys(errors)[0]}`}
              </Alert>
            )}
            <FormControl mb="4">
              <FormLabel htmlFor="post-subject" fontWeight="bold">
                Subject
              </FormLabel>
              <Select id="post-subject" {...register('subject')}>
                {props.subjects.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb="4">
              <FormLabel htmlFor="post-description" fontWeight="bold">
                Description
              </FormLabel>
              <Textarea
                id="post-description"
                {...register('description', { required: true })}
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
                  Saving Post
                </Heading>
              </Flex>
            ) : (
              <Box mt="3">
                <Button
                  disabled={filesList && filesList.length > 4 ? true : false}
                  colorScheme="blue"
                  type="submit"
                  width={['100%', null, 'auto']}
                  mr={[0, 2]}
                  rightIcon={<FaArrowRight />}
                >
                  Create Post
                </Button>
                <Button
                  colorScheme="red"
                  type="reset"
                  onClick={formResetHandler}
                  rightIcon={<FaBroom />}
                  width={['100%', null, 'auto']}
                  mt={[3, 3, 0]}
                  mr={[0, 2]}
                >
                  Reset
                </Button>
              </Box>
            )}
          </form>
        </Flex>
      ) : (
        <Flex justifyContent="center" alignItems="center" height="80vh">
          <Heading>404 Tutor not found</Heading>
        </Flex>
      )}
    </Layout>
  );
};

export default NewPostForm;
