import type { GetServerSideProps, NextPage } from 'next';
import type { SubmitHandler } from 'react-hook-form';
import type { QueryObject } from '../../types';

import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import connectionPromise from '../../middleware/mongo-connect';
import { useForm, useFieldArray } from 'react-hook-form';
import { useContext } from 'react';
import { useRouter } from 'next/router';
import * as c from '@chakra-ui/react';
import { FaHandsHelping, FaPlus, FaTrashAlt } from 'react-icons/fa';
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
      sessionPricePerHour: 25,
      pricePerPost: +process.env.NEXT_PUBLIC_GLOBAL_POST_PRICE!,
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
    <c.Box width={['90%', null, null, '80%', '40%']} mx="auto" my={[4, 4, 2]}>
      <c.Heading
        as="h1"
        mb={!!Object.keys(errors).length ? 0 : 4}
        textAlign="center"
      >
        Become a Tutor
      </c.Heading>
      {!!Object.keys(errors).length && (
        <c.Alert status="error" my={3}>
          <c.AlertIcon />
          {Object.keys(errors)[0] === 'bio'
            ? 'Provide some words sbout you'
            : Object.keys(errors)[0] === 'location'
            ? 'Specify a place where you will host sessions'
            : `Provide your ${Object.keys(errors)[0]}`}
        </c.Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <c.FormControl mb="3">
          <c.FormLabel htmlFor="bio" fontWeight="bold">
            Some words about you
          </c.FormLabel>
          <c.Textarea id="bio" {...register('bio', { required: true })} />
        </c.FormControl>
        <c.FormControl mb="3">
          <c.FormLabel htmlFor="location" fontWeight="bold">
            Where will you host your sessions?
          </c.FormLabel>
          <c.Input
            id="location"
            type="text"
            {...register('location', { required: true, maxLength: 50 })}
          />
        </c.FormControl>
        <c.FormControl mb="3">
          <c.FormLabel
            htmlFor="post-price-c.input"
            id="post-price-label"
            fontWeight="bold"
          >
            How much will you charge per post?
          </c.FormLabel>
          <c.Heading as="h3" size="lg">
            ${watch('pricePerPost')}
          </c.Heading>
          <c.Slider
            aria-labelledby="post-price-label"
            aria-label="post price"
            defaultValue={watch('pricePerPost')}
            min={0}
            max={250}
            onChange={(value: number) => setValue('pricePerPost', value)}
          >
            <c.SliderTrack>
              <c.SliderFilledTrack />
            </c.SliderTrack>
            <c.SliderThumb />
          </c.Slider>
        </c.FormControl>
        <c.FormControl mb="3">
          <c.FormLabel
            htmlFor="session-price-c.input"
            id="session-price-hour-label"
            fontWeight="bold"
          >
            How much will you charge per hour of session?
          </c.FormLabel>
          <c.Heading as="h3" size="lg">
            ${watch('sessionPricePerHour')}
          </c.Heading>
          <c.Slider
            aria-labelledby="session-price-hour-label"
            aria-label="session price per hour"
            defaultValue={watch('sessionPricePerHour')}
            min={0}
            max={250}
            onChange={(value: number) => setValue('sessionPricePerHour', value)}
          >
            <c.SliderTrack>
              <c.SliderFilledTrack />
            </c.SliderTrack>
            <c.SliderThumb />
          </c.Slider>
        </c.FormControl>
        <c.FormControl mb="3">
          <c.FormLabel id="subjects-label" fontWeight="bold">
            What are you subjects?
          </c.FormLabel>
          <c.VStack spacing="3">
            {subjects.map((subject, index, subjects) => (
              <c.Flex key={subject.id} width="100%">
                <c.Input
                  aria-labelledby="subjects-label"
                  {...register(`subjects.${index}.subject`, {
                    required: true,
                  })}
                />
                {!!index && (
                  <c.IconButton
                    aria-label="delete subject"
                    variant="danger"
                    color="white"
                    ml="2"
                    onClick={() => subjects.length > 1 && remove(index)}
                    icon={<FaTrashAlt />}
                  />
                )}
              </c.Flex>
            ))}
          </c.VStack>
          <c.Button
            width={['100%', null, 'auto']}
            mt="3"
            type="button"
            variant="success"
            onClick={() => append({ subject: '' })}
            leftIcon={<FaPlus />}
            aria-label="Add another subject"
          >
            Add a subject
          </c.Button>
        </c.FormControl>
        <c.Button
          type="submit"
          variant="primary"
          width={['100%', null, 'auto']}
          mt="3"
        >
          <FaHandsHelping size="25" />
          <c.Text ml="2">Become a Tutor!</c.Text>
        </c.Button>
      </form>
    </c.Box>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  const [session, { models }] = await Promise.all([
    getServerSession(context, authOptions),
    connectionPromise,
  ]);

  let query: QueryObject = {};
  if (session?.user?.email) query = { email: session.user.email };

  const user = await models.User.findOne(query);
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
