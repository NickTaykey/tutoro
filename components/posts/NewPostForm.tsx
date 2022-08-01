import type { NewPostFormFields } from '../../types';
import type { UserDocumentObject } from '../../models/User';
import Banner404 from '../global/404';
import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import ApiHelper from '../../utils/api-helper';
import * as c from '@chakra-ui/react';
import { FaArrowRight, FaBroom } from 'react-icons/fa';

interface Props {
  subjects?: string[];
  tutor?: UserDocumentObject;
}

const NewPostForm: React.FC<Props> = props => {
  const { query } = useRouter();
  const [filesList, setFilesList] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const lightTextColor = c.useColorModeValue('gray.500', 'gray.300');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewPostFormFields>({
    defaultValues: {
      description: '',
      subject: props.subjects?.length ? props.subjects[0] : '',
    },
  });

  const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilesList(e.target.files);
  };

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
    window.location.assign(res.redirectUrl);
  };

  return (
    <>
      {props.subjects ? (
        <c.Flex
          height={[null, null, null, '75vh']}
          width={['90%', null, null, '60%', '40%']}
          mx="auto"
          align="center"
          direction="column"
          mb={5}
        >
          <c.Heading as="h1" size="lg" textAlign="center">
            Create a Post
          </c.Heading>
          <c.Text
            my="3"
            fontWeight="light"
            textAlign="center"
            color={lightTextColor}
          >
            Find answer to specific questions or have homework reviewed.
          </c.Text>
          <c.Heading as="h2" size="md" textAlign="center">
            Price: €{props.tutor?.pricePerPost || 20}
          </c.Heading>
          {query.tutorId === 'global' && (
            <c.Text
              my="3"
              fontWeight="light"
              textAlign="center"
              color={lightTextColor}
            >
              Be answered by a qualified Tutor.
            </c.Text>
          )}
          <form
            onSubmit={handleSubmit(formSubmitHandler)}
            style={{ width: '100%' }}
          >
            {(validationError || !!Object.keys(errors).length) && (
              <c.Alert status="error" mb="3" fontWeight="bold">
                <c.AlertIcon />
                {validationError || `Provide your ${Object.keys(errors)[0]}`}
              </c.Alert>
            )}
            <c.FormControl mb="4">
              <c.FormLabel htmlFor="post-subject" fontWeight="bold">
                Subject
              </c.FormLabel>
              <c.Select id="post-subject" {...register('subject')}>
                {props.subjects.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </c.Select>
            </c.FormControl>
            <c.FormControl mb="4">
              <c.FormLabel htmlFor="post-description" fontWeight="bold">
                Description
              </c.FormLabel>
              <c.Textarea
                id="post-description"
                {...register('description', { required: true })}
              />
            </c.FormControl>
            <c.FormControl mb="4">
              {filesList && filesList.length! > 4 && (
                <c.Alert status="error" fontWeight="bold" my="3">
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
                  size="xl"
                />
                <c.Heading as="h3" size="md" ml="3">
                  Saving Post
                </c.Heading>
              </c.Flex>
            ) : (
              <c.Box mt="3">
                <c.Button
                  disabled={filesList && filesList.length > 4 ? true : false}
                  variant="primary"
                  type="submit"
                  width={['100%', null, 'auto']}
                  mr={[0, 2]}
                  rightIcon={<FaArrowRight />}
                >
                  Create Post
                </c.Button>
                <c.Button
                  variant="danger"
                  type="reset"
                  onClick={formResetHandler}
                  rightIcon={<FaBroom />}
                  width={['100%', null, 'auto']}
                  mt={[3, 3, 0]}
                  mr={[0, 2]}
                >
                  Reset
                </c.Button>
              </c.Box>
            )}
          </form>
        </c.Flex>
      ) : (
        <Banner404 message="Tutor not found" />
      )}
    </>
  );
};

export default NewPostForm;
