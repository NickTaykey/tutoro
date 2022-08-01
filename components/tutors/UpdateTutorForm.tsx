import { useState, useContext } from 'react';
import * as c from '@chakra-ui/react';
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
    <c.Box height={['70vh', null, 'auto']} overflowY="auto" p="3">
      <form onSubmit={handleSubmit(onSubmit)}>
        {(!!Object.keys(errors).length || errorAlert) && (
          <c.Alert status="error" my={3}>
            <c.AlertIcon />
            {!!Object.keys(errors).length
              ? Object.keys(errors)[0] === 'bio'
                ? 'Provide some words sbout you'
                : Object.keys(errors)[0] === 'location'
                ? 'Specify a place where you will host sessions'
                : `Provide your ${Object.keys(errors)[0]}`
              : errorAlert}
          </c.Alert>
        )}
        <c.FormControl mb="3">
          <c.FormLabel htmlFor="bio">Some words about you</c.FormLabel>
          <c.Textarea id="bio" {...register('bio', { required: true })} />
        </c.FormControl>
        <c.FormControl mb="3">
          <c.FormLabel htmlFor="tutor-location">Location</c.FormLabel>
          <c.Input type="text" id="tutor-location" {...register('location')} />
          <c.FormHelperText mt="3">
            Where will you host your tutoring sessions?
          </c.FormHelperText>
        </c.FormControl>
        <c.FormControl mb="3">
          <c.FormLabel htmlFor="tutor-price-session">
            Your price per hour of session
          </c.FormLabel>
          <c.Heading as="h3" size="md">
            €{watch('sessionPricePerHour')}
          </c.Heading>
          <c.Slider
            aria-label="tutor-price-session"
            id="tutor-price-session"
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
          <c.FormLabel htmlFor="post-price">Your price per post</c.FormLabel>
          <c.Heading as="h3" size="md">
            €{watch('pricePerPost')}
          </c.Heading>
          <c.Slider
            aria-label="post-price"
            id="post-price"
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
        <c.FormControl>
          <c.FormLabel id="subjects-label">What are you subjects?</c.FormLabel>
          <c.VStack spacing={3}>
            {subjects.map((subject, index, subjects) => (
              <c.Flex width="100%" key={subject.id}>
                <c.Input
                  aria-labelledby="subjects-label"
                  {...register(`subjects.${index}.subject`, {
                    required: true,
                  })}
                />
                {!!index && (
                  <c.IconButton
                    aria-label="delete subject"
                    ml="2"
                    onClick={() => subjects.length > 1 && remove(index)}
                    icon={<FaTrashAlt />}
                    variant="danger"
                  />
                )}
              </c.Flex>
            ))}
          </c.VStack>
          <c.Button
            width={['100%', null, 'auto']}
            variant="success"
            type="button"
            onClick={() => append({ subject: '' })}
            leftIcon={<FaPlus />}
            aria-label="Add another subject"
            mt="3"
          >
            Add a subject
          </c.Button>
        </c.FormControl>
        <c.Button
          type="submit"
          variant="primary"
          width={['100%', null, 'auto']}
          my="3"
          leftIcon={<FaCheck />}
        >
          Update
        </c.Button>
      </form>
    </c.Box>
  );
};

export default UpdateAvatarForm;
