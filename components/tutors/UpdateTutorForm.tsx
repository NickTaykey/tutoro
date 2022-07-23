import { useState, ChangeEvent, MouseEvent, useContext } from 'react';
import { useSession } from 'next-auth/react';
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

interface Props {}

type FormValues = {
  location: string;
  bio: string;
  price: number;
  subjects: Array<{ subject: string }>;
};

const UpdateAvatarForm: React.FC<Props> = props => {
  const clusterMapCtx = useContext(ClusterMapContext);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const { data } = useSession();
  const user = data!.user as UserDocumentObject;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      location: user.location,
      bio: user.bio,
      price: user.pricePerHour,
      subjects: user.subjects.map(s => ({ subject: s })),
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
      '/api/tutors',
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
          <FormLabel htmlFor="tutor-price">
            Your price per hour of session
          </FormLabel>
          <Heading as="h3" size="md">
            ${watch('price')}
          </Heading>
          <Slider
            aria-label="tutor-price"
            id="tutor-price"
            defaultValue={watch('price')}
            min={0}
            max={250}
            onChange={(value: number) => setValue('price', value)}
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
