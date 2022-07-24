import { useState, useContext } from 'react';
import { UserDocumentObject } from '../../models/User';
import {
  Alert,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  ListItem,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Textarea,
  UnorderedList,
} from '@chakra-ui/react';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import ApiHelper from '../../utils/api-helper';
import ClusterMapContext from '../../store/cluster-map-context';

type FormValues = {
  location: string;
  bio: string;
  sessionPricePerHour: number;
  pricePerPost: number;
  subjects: Array<{ subject: string }>;
};

interface Props {
  currentUser: UserDocumentObject;
}

const UpdateAvatarForm: React.FC<Props> = ({ currentUser }) => {
  const clusterMapCtx = useContext(ClusterMapContext);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      location: currentUser.location,
      bio: currentUser.bio,
      sessionPricePerHour: currentUser.sessionPricePerHour,
      pricePerPost: currentUser.pricePerPost,
      subjects: currentUser.subjects.map(s => ({ subject: s })),
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

  const onSubmit: SubmitHandler<FormValues> = async data => {
    const res = await ApiHelper(
      `/api/tutors/${currentUser._id}`,
      { ...data, subjects: data.subjects.map(s => s.subject) },
      'PUT'
    );
    if (res.errorMessage) return setErrorAlert(res.errorMessage);
    clusterMapCtx.updateAuthenticatedTutorLocation(
      res.location,
      res.geometry.coordinates
    );
    setSuccessAlert('Your profile has been successfully updated!');
    setErrorAlert(null);
  };

  return (
    <Box height={['70vh', 'auto']} overflowY="scroll">
      <form onSubmit={handleSubmit(onSubmit)}>
        {(!!errorAlert || !!successAlert) && (
          <Alert status={errorAlert ? 'error' : 'success'} mb={3}>
            {errorAlert || successAlert}
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
        <FormControl mb="3">
          <FormLabel htmlFor="bio">Some words about you</FormLabel>
          <Textarea id="bio" {...register('bio', { required: true })} />
        </FormControl>
        <FormControl mb="2">
          <FormLabel htmlFor="tutor-location">Location</FormLabel>
          <Input type="text" id="tutor-location" {...register('location')} />
          <FormHelperText>
            Where will you host your tutoring sessions?
          </FormHelperText>
        </FormControl>
        <FormControl mb="2">
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
        <FormControl mb="2">
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
        <Button type="submit" colorScheme="blue" width={['100%', null, 'auto']}>
          Update
        </Button>
      </form>
    </Box>
  );
};

export default UpdateAvatarForm;
