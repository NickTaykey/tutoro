import type { GetServerSideProps, NextPage } from 'next';
import type { SubmitHandler } from 'react-hook-form';
import type { QueryObject } from '../../types';

import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import connectDB from '../../middleware/mongo-connect';
import findTestingUsers from '../../utils/dev-testing-users';
import User, { UserDocumentObject } from '../../models/User';
import { useForm, useFieldArray } from 'react-hook-form';
import ApiHelper from '../../utils/api-helper';
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Flex,
  ListItem,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Textarea,
  UnorderedList,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import Layout from '../../components/global/Layout';
import { useSession } from 'next-auth/react';

type FormValues = {
  location: string;
  bio: string;
  sessionPricePerHour: number;
  postPrice: number;
  subjects: Array<{ subject: string }>;
};

const BecomeTutorPage: NextPage = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      location: '',
      bio: '',
      sessionPricePerHour: 20,
      postPrice: 10,
      subjects: [{ subject: '' }],
    },
  });
  const {
    fields: subjects,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'subjects',
  });
  const { data } = useSession();
  const currentUser = data!.user as UserDocumentObject;

  const [errorAlert, setErrorAlert] = useState<string | null>();
  const router = useRouter();

  const onSubmit: SubmitHandler<FormValues> = async data => {
    const res = await ApiHelper(
      `/api/tutors/${currentUser._id}`,
      { ...data, subjects: data.subjects.map(s => s.subject) },
      'PUT'
    );
    if (res.errorMessage) return setErrorAlert(res.errorMessage);
    return router.replace('/users');
  };

  return (
    <Layout>
      <Box width={['90%', null, null, '80%', '40%']} mx="auto" my={[4, 4, 2]}>
        <Heading
          as="h1"
          mb={!!Object.keys(errors).length ? 0 : 4}
          textAlign="center"
        >
          Would you like to become a Tutor?
        </Heading>
        {!!errorAlert && (
          <Alert status="error" my={3}>
            {errorAlert}
          </Alert>
        )}
        {!!Object.keys(errors).length && (
          <Alert status="error" my={3}>
            {Object.keys(errors)[0] === 'bio'
              ? 'Provide some words sbout you'
              : Object.keys(errors)[0] === 'location'
              ? 'Specify a place where you will host sessions'
              : `Provide your ${Object.keys(errors)[0]}`}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl mb="3">
            <FormLabel htmlFor="bio">Some words about you</FormLabel>
            <Textarea id="bio" {...register('bio', { required: true })} />
          </FormControl>
          <FormControl mb="3">
            <FormLabel htmlFor="location">
              Where will you host your sessions?
            </FormLabel>
            <Input
              id="location"
              type="text"
              {...register('location', { required: true, maxLength: 50 })}
            />
          </FormControl>
          <FormControl mb="3">
            <FormLabel htmlFor="post-price-input" id="post-price-label">
              How much are you going to charge for your posts?
            </FormLabel>
            <Heading as="h3" size="md">
              ${watch('postPrice')}
            </Heading>
            <Slider
              aria-labelledby="post-price-label"
              aria-label="post price"
              defaultValue={watch('postPrice')}
              min={0}
              max={250}
              onChange={(value: number) => setValue('postPrice', value)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>
          <FormControl mb="3">
            <FormLabel
              htmlFor="session-price-input"
              id="session-price-hour-label"
            >
              How much are you charging per hour for your sessions?
            </FormLabel>
            <Heading as="h3" size="md">
              ${watch('sessionPricePerHour')}
            </Heading>
            <Slider
              aria-labelledby="session-price-hour-label"
              aria-label="session price per hour"
              defaultValue={watch('sessionPricePerHour')}
              min={0}
              max={250}
              onChange={(value: number) =>
                setValue('sessionPricePerHour', value)
              }
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>
          <FormControl mb="3">
            <FormLabel id="subjects-label">What are you subjects?</FormLabel>
            <UnorderedList styleType="none" mx="0">
              {subjects.map((subject, index, subjects) => (
                <ListItem key={subject.id} mb="2">
                  <Flex>
                    <InputGroup>
                      <Input
                        aria-labelledby="subjects-label"
                        {...register(`subjects.${index}.subject`, {
                          required: true,
                        })}
                      />
                      {index && (
                        <InputRightAddon
                          bg="red.500"
                          color="white"
                          _hover={{ bg: 'red.600', cursor: 'pointer' }}
                          onClick={() => subjects.length > 1 && remove(index)}
                          children={<FaTrashAlt />}
                        />
                      )}
                    </InputGroup>
                  </Flex>
                </ListItem>
              ))}
            </UnorderedList>
            <Button
              width={['100%', null, 'auto']}
              bg="green.500"
              color="white"
              _hover={{ bg: 'green.600' }}
              type="button"
              onClick={() => append({ subject: '' })}
              leftIcon={<FaPlus />}
              aria-label="Add another subject"
            >
              Add a subject
            </Button>
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width={['100%', null, 'auto']}
          >
            Become a Tutor!
          </Button>
        </form>
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  await connectDB();

  // === PRODUCTION VERSION
  const session = await getServerSession(context, authOptions);
  let query: QueryObject = {};
  if (session?.user?.email) query = { email: session.user.email };
  // ===

  // === REMOVE IN PRODUCTION, ONLY FOR TESTING PORPOSE ===
  /* const {
    tutor: { tutor, fakeId: tutorFakeId },
    user: { user: normalUser, fakeId: userFakeId },
  } = await findTestingUsers();
  if (
    context.req.url?.includes(tutorFakeId) ||
    context.req.url?.includes(userFakeId)
  ) {
    query = { _id: normalUser._id, isTutor: false };
    if (context.req.url?.includes(tutorFakeId)) {
      query._id = tutor._id;
      query.isTutor = true;
    }
  } */
  // ===

  const user = await User.findOne(query);
  if (user) {
    /* if (user.isTutor)
      return {
        props: {},
        redirect: { permanent: false, destination: '/users' },
      }; */
    return {
      props: {},
    };
  }
  return {
    props: {},
    redirect: {
      permanent: false,
      destination: '/api/auth/signin?callbackUrl=/users/become-tutor',
    },
  };
};

export default BecomeTutorPage;
