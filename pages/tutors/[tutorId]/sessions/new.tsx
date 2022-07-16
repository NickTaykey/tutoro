import type { NextPage, GetServerSideProps } from 'next';
import type { UserDocument, UserDocumentObject } from '../../../../models/User';

import { FormEvent, useState } from 'react';
import { getUserDocumentObject } from '../../../../utils/user-casting-helpers';
import ApiHelper from '../../../../utils/api-helper';
import User from '../../../../models/User';
import Review from '../../../../models/Review';
import ReactDatePicker from 'react-datepicker';

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

interface Props {
  tutor: UserDocumentObject | null;
}

interface FormStructure {
  subject: string;
  topic: string;
  hours: number;
  date: Date;
}

const Page: NextPage<Props> = ({ tutor }) => {
  const DEFAULT_FORM_VALUES: FormStructure = {
    subject: tutor ? tutor.subjects[0] : '',
    topic: '',
    hours: 1,
    date: new Date(Date.now() + 3.6 * 10 ** 6),
  };
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>();
  const [formFields, setFormFields] =
    useState<FormStructure>(DEFAULT_FORM_VALUES);

  const formFieldUpdater = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormFields(prevState => ({
      ...prevState,
      [e.target.name]: Number(e.target.value)
        ? Number(e.target.value)
        : e.target.value,
    }));
  };

  const dateChangeHandler = (date: Date | null) => {
    if (date) {
      date.setHours(formFields.date.getHours());
      date.setMinutes(formFields.date.getMinutes());
      return setFormFields(prevState => ({ ...prevState, date: date }));
    }
    setFormFields(prevState => ({
      ...prevState,
      date: new Date(Date.now() + 3.6 * 10 ** 6),
    }));
  };

  const hoursChangeHandler = (_: string, hours: number) => {
    setFormFields(prevState => ({
      ...prevState,
      hours,
    }));
  };

  const timeChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormFields(prevState => {
      const newDate = new Date(prevState.date);
      const hourComponents = e.target.value.split(':').map(v => +v);
      newDate.setHours(hourComponents[0], hourComponents[1]);
      return { ...prevState, date: newDate };
    });
  };

  const resetFormHandler = () => {
    setFormFields(DEFAULT_FORM_VALUES);
    setValidationError(null);
  };

  const formValidator = (): { errorMessage: string } | null => {
    if (!formFields.hours)
      return { errorMessage: 'Provide a valid number of hours' };
    if (
      !formFields.date ||
      new Date(Date.now()).getTime() > formFields.date.getTime()
    )
      return { errorMessage: 'Provide a valid date' };
    if (!formFields.topic.length)
      return { errorMessage: 'Provide a valid session topic' };
    return null;
  };

  const formSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    const validationError = formValidator();
    if (!validationError) {
      ApiHelper(
        `/api/tutors/${tutor!._id}/sessions`,
        {
          ...formFields,
          date: formFields.date.toISOString(),
        },
        'POST'
      ).then(res => {
        if (res.errorMessage) return setValidationError(res.errorMessage);
        router.replace('/users');
      });
    } else setValidationError(validationError.errorMessage);
  };

  const currentHour =
    formFields.date.getHours() < 10
      ? '0' + formFields.date.getHours().toString()
      : formFields.date.getHours().toString();
  const currentMinutes =
    formFields.date.getMinutes() < 10
      ? '0' + formFields.date.getMinutes().toString()
      : formFields.date.getMinutes().toString();

  let markup = <h1>404 Tutor not found!</h1>;
  if (tutor && tutor.reviews) {
    markup = (
      <Layout>
        <Flex
          height={[null, null, null, '85vh']}
          width={['90%', null, null, '40%']}
          mx="auto"
          my="5"
          align="center"
          justify="center"
          display="flex"
          direction="column"
        >
          <Heading as="h1" size="lg" textAlign="center">
            Book a session with {tutor.fullname}
          </Heading>
          <Heading as="h3" size="md" my="5">
            Price: ${tutor.pricePerHour * formFields.hours}
          </Heading>
          <form onSubmit={formSubmitHandler} style={{ width: '100%' }}>
            {validationError && (
              <Alert status="error" mb="5" fontWeight="bold">
                {validationError}
              </Alert>
            )}
            <FormControl mb="4">
              <FormLabel htmlFor="session-subject" fontWeight="bold">
                Subject
              </FormLabel>
              <Select
                id="session-subject"
                name="subject"
                onChange={formFieldUpdater}
              >
                {tutor.subjects.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb="4">
              <FormLabel htmlFor="session-topic" fontWeight="bold">
                Topic of the session
              </FormLabel>
              <Textarea
                id="session-topic"
                onChange={formFieldUpdater}
                value={formFields.topic}
                name="topic"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel htmlFor="session-hours" fontWeight="bold">
                How many hours do you need?
              </FormLabel>
              <NumberInput
                min={1}
                max={6}
                onChange={hoursChangeHandler}
                value={formFields.hours}
              >
                <NumberInputField
                  id="session-hours"
                  onChange={e => console.log(e)}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Text mb="3">When would you like to have this session?</Text>
            <FormControl>
              <Text fontWeight="bold" mb="2">
                Date
              </Text>
              <Box mb="4">
                <ReactDatePicker
                  id="date"
                  selected={formFields.date}
                  onChange={dateChangeHandler}
                  minDate={new Date(Date.now())}
                />
              </Box>
              <FormLabel htmlFor="time" fontWeight="bold">
                Time
              </FormLabel>
              <Input
                type="time"
                name="time"
                id="time"
                onChange={timeChangeHandler}
                value={`${currentHour}:${currentMinutes}`}
              />
            </FormControl>
            <Button colorScheme="blue" type="submit" w="100%" mt="3">
              Submit request
            </Button>
            <Button
              mt="3"
              colorScheme="red"
              type="reset"
              onClick={resetFormHandler}
              w="100%"
            >
              Reset
            </Button>
          </form>
        </Flex>
      </Layout>
    );
  }
  return markup;
};

import { getServerSession } from 'next-auth';
import connectDB from '../../../../middleware/mongo-connect';
import { authOptions } from '../../../api/auth/[...nextauth]';
import { useRouter } from 'next/router';
import Layout from '../../../../components/global/Layout';

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const [, session] = await Promise.all([
    connectDB(),
    getServerSession(context, authOptions),
  ]);
  try {
    if (session) {
      const tutor = await User.findById(context.query.tutorId)
        .populate({
          path: 'reviews',
          options: {
            sort: { _id: -1 },
          },
          model: Review,
        })
        .exec();
      if (
        context.query.tutorId ===
        (session!.user as UserDocument)!._id.toString()
      ) {
        return {
          props: {},
          redirect: { permanent: false, destination: '/tutoro' },
        };
      }
      return { props: { tutor: tutor ? getUserDocumentObject(tutor) : null } };
    }
  } catch (e) {
    return { props: { tutor: null } };
  }
  return {
    props: {},
    redirect: {
      permanent: false,
      destination: `http://${context.req.headers.host}/api/auth/signin?callbackUrl=/tutors/${context.query.tutorId}/sessions/new`,
    },
  };
};

export default Page;
