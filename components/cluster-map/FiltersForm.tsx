import type { TutorFilters, TutorFiltersFormFields } from '../../types';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
  filterTutorsHandler(filters: TutorFilters | null): void;
  setGeoLocatedUser(coordinates: [number, number] | null): void;
}

import {
  Heading,
  FormControl,
  FormLabel,
  FormHelperText,
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
  Spinner,
} from '@chakra-ui/react';

const FiltersForm: React.FC<Props> = props => {
  const { register, handleSubmit, resetField, reset, setValue, watch } =
    useForm<TutorFiltersFormFields>({
      defaultValues: {
        distance: 100,
        location: '',
        name: '',
        priceMin: 75,
        priceMax: 125,
        starsMin: 3,
        starsMax: 4,
        subject: '',
      },
    });
  const [geolocationFeedback, setGeolocationFeedback] = useState<string | null>(
    null
  );
  const [geoLocation, setGeoLocation] = useState<GeolocationPosition | null>(
    null
  );

  const formResetHandler = () => {
    reset();
    setGeolocationFeedback(null);
    setGeoLocation(null);
    props.setGeoLocatedUser(null);
    props.filterTutorsHandler(null);
  };

  const formSubmitHandler = (data: TutorFiltersFormFields) => {
    props.filterTutorsHandler({
      ...data,
      location: data.location
        ? data.location
        : geoLocation
        ? [geoLocation!.coords.longitude, geoLocation!.coords.latitude]
        : '',
    });
  };

  const geoLocalizationHandler = (e: FormEvent) => {
    e.preventDefault();
    if (navigator.geolocation) {
      setGeolocationFeedback('loading');
      navigator.geolocation.getCurrentPosition(
        p => {
          props.setGeoLocatedUser([p.coords.longitude, p.coords.latitude]);
          resetField('location');
          setGeolocationFeedback('Location successfully retreived!');
          setGeoLocation(p);
        },
        () => {
          setGeolocationFeedback('Your browser does not support geolocation!');
        }
      );
    }
  };
  return (
    <Flex direction="column" justify="center" height={{ lg: '100%' }}>
      <form onSubmit={handleSubmit(formSubmitHandler)}>
        <Heading as="h2" size="xl">
          Filters
        </Heading>
        <FormControl my="4">
          <FormLabel htmlFor="tutor-name">Tutor name</FormLabel>
          <Input
            id="tutor-name"
            type="text"
            {...register('name', { maxLength: 50 })}
          />
          <FormHelperText>Search Tutor by name.</FormHelperText>
        </FormControl>
        <FormControl my="4">
          <Text>Price</Text>
          <Text>
            Min Price {watch('priceMin')} Max Price {watch('priceMax')}
          </Text>
          <RangeSlider
            aria-label={['tutor-price-min', 'tutor-price-max']}
            defaultValue={[watch('priceMin'), watch('priceMax')]}
            min={5}
            max={250}
            onChange={(values: number[]) => {
              setValue('priceMin', values[0]);
              setValue('priceMax', values[1]);
            }}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          <FormHelperText>Select your price range.</FormHelperText>
        </FormControl>
        <FormControl my="4">
          <Text>Stars</Text>
          <Text>
            Min Rating {watch('starsMin')} Max Rating {watch('starsMax')}
          </Text>
          <RangeSlider
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
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          <FormHelperText>Select your star rating range.</FormHelperText>
        </FormControl>
        <FormControl my="4">
          <FormLabel htmlFor="tutor-subject">Tutor subject</FormLabel>
          <Input
            id="tutor-subject"
            type="text"
            {...register('subject', { maxLength: 50 })}
          />
          <FormHelperText>Search Tutor by subject.</FormHelperText>
        </FormControl>
        <FormControl my="4">
          <FormLabel htmlFor="tutor-location">Tutor location</FormLabel>
          {geolocationFeedback && (
            <>
              {geolocationFeedback === 'loading' ? (
                <Flex my="3">
                  <Spinner />
                  <Text ml="3">Geolocation in progress..</Text>
                </Flex>
              ) : (
                geolocationFeedback
              )}
            </>
          )}
          <Flex direction={'column'}>
            <Input id="tutor-location" type="text" {...register('location')} />
            <Button colorScheme="green" mt="2" onClick={geoLocalizationHandler}>
              Geolocalize me
            </Button>
          </Flex>
          <FormHelperText>Where are you looking for a Tutor?</FormHelperText>
        </FormControl>
        <FormControl my="4">
          <FormLabel htmlFor="tutor-distance">Tutor distance</FormLabel>
          <NumberInput defaultValue={0}>
            <NumberInputField {...register('distance', { min: 0 })} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>How far are you looking for (km)?</FormHelperText>
        </FormControl>
        <Button colorScheme="blue" type="submit" width="100%" mb="2">
          Filter
        </Button>
        <Button
          colorScheme="red"
          type="reset"
          width="100%"
          onClick={formResetHandler}
        >
          Reset
        </Button>
      </form>
    </Flex>
  );
};

export default FiltersForm;
