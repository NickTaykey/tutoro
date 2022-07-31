import type { GetServerSideProps, NextPage } from 'next';
import type { SubmitHandler } from 'react-hook-form';
import type { QueryObject } from '../../types';

import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import connectDB from '../../middleware/mongo-connect';
import findTestingUsers from '../../utils/dev-testing-users';
import User from '../../models/User';
import { useForm, useFieldArray } from 'react-hook-form';
import { useContext } from 'react';
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
  Text,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Textarea,
  IconButton,
  VStack,
  AlertIcon,
} from '@chakra-ui/react';
import { FaHandsHelping, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import AuthenticatedUserContext from '../../store/authenticated-user-context';

type FormValues = {
  location: string;
  bio: string;
  sessionPricePerHour: number;
  pricePerPost: number;
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
      pricePerPost: 10,
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
  const { becomeTutor } = useContext(AuthenticatedUserContext);

  const router = useRouter();

  const onSubmit: SubmitHandler<FormValues> = async data => {
    const formData: Record<string, string | string[]> = {};
    for (let e of Object.entries(data)) {
      formData[e[0]] =
        e[0] === 'subjects'
          ? (e[1] as Array<{ subject: string }>).map(({ subject }) => subject)
          : e[1].toString();
    }
    becomeTutor(formData);
    return router.replace('/users/tutor-profile');
  };

  return (
    <Box width={['90%', null, null, '80%', '40%']} mx="auto" my={[4, 4, 2]}>
      <Heading
        as="h1"
        mb={!!Object.keys(errors).length ? 0 : 4}
        textAlign="center"
      >
        Become a Tutor
      </Heading>
      {!!Object.keys(errors).length && (
        <Alert status="error" my={3}>
          <AlertIcon />
          {Object.keys(errors)[0] === 'bio'
            ? 'Provide some words sbout you'
            : Object.keys(errors)[0] === 'location'
            ? 'Specify a place where you will host sessions'
            : `Provide your ${Object.keys(errors)[0]}`}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl mb="3">
          <FormLabel htmlFor="bio" fontWeight="bold">
            Some words about you
          </FormLabel>
          <Textarea id="bio" {...register('bio', { required: true })} />
        </FormControl>
        <FormControl mb="3">
          <FormLabel htmlFor="location" fontWeight="bold">
            Where will you host your sessions?
          </FormLabel>
          <Input
            id="location"
            type="text"
            {...register('location', { required: true, maxLength: 50 })}
          />
        </FormControl>
        <FormControl mb="3">
          <FormLabel
            htmlFor="post-price-input"
            id="post-price-label"
            fontWeight="bold"
          >
            How much will you charge per post?
          </FormLabel>
          <Heading as="h3" size="lg">
            ${watch('pricePerPost')}
          </Heading>
          <Slider
            aria-labelledby="post-price-label"
            aria-label="post price"
            defaultValue={watch('pricePerPost')}
            min={0}
            max={250}
            onChange={(value: number) => setValue('pricePerPost', value)}
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
            fontWeight="bold"
          >
            How much will you charge per hour of session?
          </FormLabel>
          <Heading as="h3" size="lg">
            ${watch('sessionPricePerHour')}
          </Heading>
          <Slider
            aria-labelledby="session-price-hour-label"
            aria-label="session price per hour"
            defaultValue={watch('sessionPricePerHour')}
            min={0}
            max={250}
            onChange={(value: number) => setValue('sessionPricePerHour', value)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>
        <FormControl mb="3">
          <FormLabel id="subjects-label" fontWeight="bold">
            What are you subjects?
          </FormLabel>
          <VStack spacing="3">
            {subjects.map((subject, index, subjects) => (
              <Flex key={subject.id} width="100%">
                <Input
                  aria-labelledby="subjects-label"
                  {...register(`subjects.${index}.subject`, {
                    required: true,
                  })}
                />
                {!!index && (
                  <IconButton
                    aria-label="delete subject"
                    variant="danger"
                    color="white"
                    ml="2"
                    onClick={() => subjects.length > 1 && remove(index)}
                    icon={<FaTrashAlt />}
                  />
                )}
              </Flex>
            ))}
          </VStack>
          <Button
            width={['100%', null, 'auto']}
            mt="3"
            type="button"
            variant="success"
            onClick={() => append({ subject: '' })}
            leftIcon={<FaPlus />}
            aria-label="Add another subject"
          >
            Add a subject
          </Button>
        </FormControl>
        <Button
          type="submit"
          variant="primary"
          width={['100%', null, 'auto']}
          mt="3"
        >
          <FaHandsHelping size="25" />
          <Text ml="2">Become a Tutor!</Text>
        </Button>
      </form>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  await connectDB();

  const session = await getServerSession(context, authOptions);
  let query: QueryObject = {};
  if (session?.user?.email) query = { email: session.user.email };

  const user = await User.findOne(query);
  if (user) {
    if (user.isTutor)
      return {
        props: {},
        redirect: { permanent: false, destination: '/users/tutor-profile' },
      };
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
