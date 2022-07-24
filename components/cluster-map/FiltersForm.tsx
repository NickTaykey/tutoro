import type { TutorFilters, TutorFiltersFormFields } from '../../types';
import { useForm } from 'react-hook-form';

interface Props {
  allSubjects: string[];
}

import {
  Heading,
  FormControl,
  FormLabel,
  Input,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Button,
  Flex,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  RangeSliderMark,
  Select,
} from '@chakra-ui/react';
import { FaBroom, FaFilter } from 'react-icons/fa';
import { useContext } from 'react';
import ClusterMapContext from '../../store/cluster-map-context';

const FiltersForm: React.FC<Props> = props => {
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<TutorFiltersFormFields>({
      defaultValues: {
        distance: 100,
        location: '',
        name: '',
        sessionPriceMin: 5,
        sessionPriceMax: 250,
        postPriceMin: 5,
        postPriceMax: 50,
        starsMin: 0,
        starsMax: 5,
        subject: '',
      },
    });

  const ctx = useContext(ClusterMapContext);
  const formResetHandler = () => {
    ctx.setFilteredPoints(null);
  };

  const formSubmitHandler = (data: TutorFiltersFormFields) => {
    ctx.setFilteredPoints(data);
  };

  return (
    <Flex
      direction="column"
      justify="center"
      height={{ lg: '100%' }}
      width={['90%', '95%']}
      mx="auto"
    >
      <form onSubmit={handleSubmit(formSubmitHandler)}>
        <Heading as="h2" size="xl">
          Filters
        </Heading>
        <FormControl my="4">
          <FormLabel htmlFor="tutor-name">Tutor's name</FormLabel>
          <Input
            id="tutor-name"
            type="text"
            {...register('name', { maxLength: 50 })}
          />
        </FormControl>
        <FormControl my="4">
          <Text fontWeight="medium">Session price range</Text>
          <RangeSlider
            mt={10}
            aria-label={['session-price-min', 'session-price-max']}
            defaultValue={[watch('sessionPriceMin'), watch('sessionPriceMax')]}
            min={5}
            max={250}
            onChange={(values: number[]) => {
              setValue('sessionPriceMin', values[0]);
              setValue('sessionPriceMax', values[1]);
            }}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} borderColor="blackAlpha.500" />
            <RangeSliderThumb index={1} borderColor="blackAlpha.500" />
            <RangeSliderMark
              borderRadius="md"
              value={watch('sessionPriceMin')}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              €{watch('sessionPriceMin')}
            </RangeSliderMark>
            <RangeSliderMark
              borderRadius="md"
              value={watch('sessionPriceMax')}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              €{watch('sessionPriceMax')}
            </RangeSliderMark>
          </RangeSlider>
        </FormControl>
        <FormControl my="4">
          <Text fontWeight="medium">Post price range</Text>
          <RangeSlider
            mt={10}
            aria-label={['post-price-min', 'post-price-max']}
            defaultValue={[watch('postPriceMin'), watch('postPriceMax')]}
            min={5}
            max={50}
            onChange={(values: number[]) => {
              setValue('postPriceMin', values[0]);
              setValue('postPriceMax', values[1]);
            }}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} borderColor="blackAlpha.500" />
            <RangeSliderThumb index={1} borderColor="blackAlpha.500" />
            <RangeSliderMark
              borderRadius="md"
              value={watch('postPriceMin')}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              €{watch('postPriceMin')}
            </RangeSliderMark>
            <RangeSliderMark
              borderRadius="md"
              value={watch('postPriceMax')}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              €{watch('postPriceMax')}
            </RangeSliderMark>
          </RangeSlider>
        </FormControl>
        <FormControl my="4">
          <Text fontWeight="medium">Stars range</Text>
          <RangeSlider
            mt={10}
            aria-label={['tutor-stars-min', 'tutor-stars-max']}
            min={0}
            max={5}
            defaultValue={[watch('starsMin'), watch('starsMax')]}
            onChange={(values: number[]) => {
              setValue('starsMin', values[0]);
              setValue('starsMax', values[1]);
            }}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} borderColor="blackAlpha.500" />
            <RangeSliderThumb index={1} borderColor="blackAlpha.500" />
            <RangeSliderMark
              borderRadius="md"
              value={watch('starsMin')}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              {watch('starsMin')}
            </RangeSliderMark>
            <RangeSliderMark
              borderRadius="md"
              value={watch('starsMax')}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              {watch('starsMax')}
            </RangeSliderMark>
          </RangeSlider>
        </FormControl>
        <FormControl my="4">
          <FormLabel htmlFor="select-subject">Tutor's subject</FormLabel>
          <Select
            placeholder="Select a subject"
            id="select-subject"
            {...register('subject')}
          >
            {props.allSubjects.map((s, i) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl my="4">
          <FormLabel htmlFor="tutor-location">Location</FormLabel>
          <Input id="tutor-location" type="text" {...register('location')} />
        </FormControl>
        <FormControl my="4">
          <FormLabel htmlFor="tutor-distance">
            Distance<strong>(km)</strong>
          </FormLabel>
          <NumberInput defaultValue={0}>
            <NumberInputField {...register('distance', { min: 0 })} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <Text fontWeight="light" color="gray.500" mt="0" mb="4">
          Find tutors by distance from a location
        </Text>
        <Button
          colorScheme="blue"
          type="submit"
          width="100%"
          mb="2"
          textTransform="uppercase"
          bgGradient="linear-gradient(to right, #1fa2ff, #12d8fa, #a6ffcb);"
          _hover={{
            bgGradient: 'linear-gradient(to right, #1a2980, #26d0ce);',
          }}
          leftIcon={<FaFilter />}
        >
          Apply filters
        </Button>
        {ctx.filteredPoints?.features && (
          <Button
            colorScheme="red"
            type="reset"
            width="100%"
            onClick={formResetHandler}
            leftIcon={<FaBroom />}
          >
            Remove filters
          </Button>
        )}
      </form>
    </Flex>
  );
};

export default FiltersForm;
