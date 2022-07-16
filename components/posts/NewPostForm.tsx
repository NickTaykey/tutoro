import type { NewPostFormFields } from '../../types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import ApiHelper from '../../utils/api-helper';

import {
  FormControl,
  FormLabel,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Box,
  Select,
  Input,
  Text,
  Heading,
  Flex,
  Alert,
} from '@chakra-ui/react';
import Layout from '../global/Layout';

interface Props {
  subjects: string[] | null;
}

const NewPostForm: React.FC<Props> = props => {
  const { query, replace } = useRouter();
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const formResetHandler = () => {
    reset();
    setValidationError(null);
  };
  const formSubmitHandler = (data: NewPostFormFields) => {
    ApiHelper(
      `/api/${query.tutorId ? `/tutors/${query.tutorId}/posts` : '/posts'}`,
      data,
      'POST'
    ).then(res => {
      if (res.errorMessage) return setValidationError(res.errorMessage);
      replace('/users');
    });
  };
  return (
    <Layout>
      <Flex
        height={[null, null, null, '75vh']}
        width={['90%', null, null, '40%']}
        mx="auto"
        align="center"
        display="flex"
        direction="column"
        my="10"
      >
        <Heading as="h1" size="lg" textAlign="center">
          Do you have a question or a problem on a homework?
        </Heading>
        <Text my="5">Solve it by asking our tutors with a post</Text>
        <form
          onSubmit={handleSubmit(formSubmitHandler)}
          style={{ width: '100%' }}
        >
          {!!Object.keys(errors).length && (
            <Alert status="error">Provide your {Object.keys(errors)[0]}</Alert>
          )}
          {validationError && <Alert status="error">{validationError}</Alert>}
          <FormControl mb="4">
            <FormLabel htmlFor="post-subject" fontWeight="bold">
              Subject
            </FormLabel>
            {props.subjects ? (
              <Select id="post-subject" {...register('subject')}>
                {props.subjects.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                type="text"
                id="post-subject"
                {...register('subject', { maxLength: 50 })}
              />
            )}
          </FormControl>
          <FormControl mb="4">
            <FormLabel htmlFor="post-description" fontWeight="bold">
              Description
            </FormLabel>
            <Textarea
              id="post-description"
              {...register('description', { minLength: 10, maxLength: 1000 })}
            />
          </FormControl>
          <Button colorScheme="blue" type="submit" w="100%" mt="3">
            Submit
          </Button>
          <Button
            colorScheme="red"
            type="reset"
            onClick={formResetHandler}
            w="100%"
            mt="3"
          >
            Reset
          </Button>
        </form>
      </Flex>
    </Layout>
  );
};

export default NewPostForm;
