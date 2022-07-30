import { useState, useContext } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { FaCheck, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import ClusterMapContext from '../../store/cluster-map-context';
import AuthenticatedUserContext from '../../store/authenticated-user-context';

type FormValues = {
  location: string;
  bio: string;
  sessionPricePerHour: number;
  pricePerPost: number;
  subjects: Array<{ subject: string }>;
};

const UpdateAvatarForm: React.FC = () => {
  const { updateTutorProfile, closeUpdateTutorMenu } = useContext(
    AuthenticatedUserContext
  );
  const clusterMapCtx = useContext(ClusterMapContext);
  const { user } = useContext(AuthenticatedUserContext);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      location: user!.location,
      bio: user!.bio,
      sessionPricePerHour: user!.sessionPricePerHour,
      pricePerPost: user!.pricePerPost,
      subjects: user!.subjects.map(s => ({ subject: s })),
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

  const onSubmit: SubmitHandler<FormValues> = data => {
    if (Object.keys(touchedFields).length) {
      updateTutorProfile({
        ...data,
        subjects: data.subjects.map(s => s.subject),
      })
        .then(() => {
          setErrorAlert(null);
          clusterMapCtx.updateAuthenticatedTutorLocation(
            user!.location,
            user!.geometry!.coordinates
          );
        })
        .catch(({ errorMessage }) => setErrorAlert(errorMessage));
      return;
    }
    closeUpdateTutorMenu();
  };

  return (
    <Box height={['70vh', null, 'auto']} overflowY="auto" p="3">
      <form onSubmit={handleSubmit(onSubmit)}>
        {(!!Object.keys(errors).length || errorAlert) && (
          <Alert status="error" my={3}>
            <AlertIcon />
            {!!Object.keys(errors).length
              ? Object.keys(errors)[0] === 'bio'
                ? 'Provide some words sbout you'
                : Object.keys(errors)[0] === 'location'
                ? 'Specify a place where you will host sessions'
                : `Provide your ${Object.keys(errors)[0]}`
              : errorAlert}
          </Alert>
        )}
        <FormControl mb="3">
          <FormLabel htmlFor="bio">Some words about you</FormLabel>
          <Textarea id="bio" {...register('bio', { required: true })} />
        </FormControl>
        <FormControl mb="3">
          <FormLabel htmlFor="tutor-location">Location</FormLabel>
          <Input type="text" id="tutor-location" {...register('location')} />
          <FormHelperText mt="3">
            Where will you host your tutoring sessions?
          </FormHelperText>
        </FormControl>
        <FormControl mb="3">
          <FormLabel htmlFor="tutor-price-session">
            Your price per hour of session
          </FormLabel>
          <Heading as="h3" size="md">
            €{watch('sessionPricePerHour')}
          </Heading>
          <Slider
            aria-label="tutor-price-session"
            id="tutor-price-session"
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
          <FormLabel htmlFor="post-price">Your price per post</FormLabel>
          <Heading as="h3" size="md">
            €{watch('pricePerPost')}
          </Heading>
          <Slider
            aria-label="post-price"
            id="post-price"
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
        <FormControl>
          <FormLabel id="subjects-label">What are you subjects?</FormLabel>
          <VStack spacing={3}>
            {subjects.map((subject, index, subjects) => (
              <Flex width="100%" key={subject.id}>
                <Input
                  aria-labelledby="subjects-label"
                  {...register(`subjects.${index}.subject`, {
                    required: true,
                  })}
                />
                {!!index && (
                  <IconButton
                    aria-label="delete subject"
                    ml="2"
                    onClick={() => subjects.length > 1 && remove(index)}
                    children={<FaTrashAlt />}
                    variant="danger"
                  />
                )}
              </Flex>
            ))}
          </VStack>
          <Button
            width={['100%', null, 'auto']}
            variant="success"
            type="button"
            onClick={() => append({ subject: '' })}
            leftIcon={<FaPlus />}
            aria-label="Add another subject"
            mt="3"
          >
            Add a subject
          </Button>
        </FormControl>
        <Button
          type="submit"
          variant="primary"
          width={['100%', null, 'auto']}
          my="3"
          leftIcon={<FaCheck />}
        >
          Update
        </Button>
      </form>
    </Box>
  );
};

export default UpdateAvatarForm;
