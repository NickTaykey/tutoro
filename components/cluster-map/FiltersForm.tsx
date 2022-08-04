import type { TutorFiltersFormFields } from '../../utils/types';
import { useForm } from 'react-hook-form';
import * as c from '@chakra-ui/react';
import { FaBroom, FaFilter } from 'react-icons/fa';
import { useContext } from 'react';
import ClusterMapContext from '../../store/cluster-map-context';

interface Props {
  allSubjects: string[];
}

const FiltersForm: React.FC<Props> = props => {
  const { register, handleSubmit, setValue, watch, reset } =
    useForm<TutorFiltersFormFields>({
      defaultValues: {
        distance: 100,
        location: '',
        name: '',
        sessionPriceMin: +process.env.NEXT_PUBLIC_MIN_SESSION_PRICE!,
        sessionPriceMax: +process.env.NEXT_PUBLIC_MAX_SESSION_PRICE!,
        postPriceMin: +process.env.NEXT_PUBLIC_MIN_POST_PRICE!,
        postPriceMax: +process.env.NEXT_PUBLIC_MAX_POST_PRICE!,
        starsMin: 0,
        starsMax: 5,
        subject: '',
      },
    });

  const ctx = useContext(ClusterMapContext);
  const formResetHandler = () => {
    reset();
    ctx.setFilteredPoints(null);
  };

  const formSubmitHandler = (data: TutorFiltersFormFields) => {
    ctx.setFilteredPoints(data);
  };

  return (
    <c.Flex
      direction="column"
      justify="center"
      height={{ lg: '100%' }}
      width={['90%', '95%']}
      mx="auto"
    >
      <form onSubmit={handleSubmit(formSubmitHandler)}>
        <c.Heading as="h2" size="xl" letterSpacing="1px">
          Filters
        </c.Heading>
        <c.FormControl my="4">
          <c.FormLabel htmlFor="tutor-name">Tutor name</c.FormLabel>
          <c.Input
            id="tutor-name"
            type="text"
            {...register('name', { maxLength: 50 })}
          />
        </c.FormControl>
        <c.FormControl my="4">
          <c.Text fontWeight="medium">Session price range</c.Text>
          <c.RangeSlider
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
            <c.RangeSliderTrack>
              <c.RangeSliderFilledTrack bgColor="primaryV1" />
            </c.RangeSliderTrack>
            <c.RangeSliderThumb index={0} borderColor="blackAlpha.500" />
            <c.RangeSliderThumb index={1} borderColor="blackAlpha.500" />
            <c.RangeSliderMark
              value={watch('sessionPriceMin')}
              textAlign="center"
              bg="primaryV1"
              borderRadius="none"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              €{watch('sessionPriceMin')}
            </c.RangeSliderMark>
            <c.RangeSliderMark
              value={watch('sessionPriceMax')}
              textAlign="center"
              bg="primaryV1"
              borderRadius="none"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              €{watch('sessionPriceMax')}
            </c.RangeSliderMark>
          </c.RangeSlider>
        </c.FormControl>
        <c.FormControl my="4">
          <c.Text fontWeight="medium">Post price range</c.Text>
          <c.RangeSlider
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
            <c.RangeSliderTrack>
              <c.RangeSliderFilledTrack bgColor="primaryV1" />
            </c.RangeSliderTrack>
            <c.RangeSliderThumb index={0} borderColor="blackAlpha.500" />
            <c.RangeSliderThumb index={1} borderColor="blackAlpha.500" />
            <c.RangeSliderMark
              value={watch('postPriceMin')}
              textAlign="center"
              bg="primaryV1"
              borderRadius="none"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              €{watch('postPriceMin')}
            </c.RangeSliderMark>
            <c.RangeSliderMark
              value={watch('postPriceMax')}
              textAlign="center"
              bg="primaryV1"
              borderRadius="none"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              €{watch('postPriceMax')}
            </c.RangeSliderMark>
          </c.RangeSlider>
        </c.FormControl>
        <c.FormControl my="4">
          <c.Text fontWeight="medium">Stars range</c.Text>
          <c.RangeSlider
            mt={10}
            color="primaryV1"
            aria-label={['tutor-stars-min', 'tutor-stars-max']}
            min={0}
            max={5}
            defaultValue={[watch('starsMin'), watch('starsMax')]}
            onChange={(values: number[]) => {
              setValue('starsMin', values[0]);
              setValue('starsMax', values[1]);
            }}
          >
            <c.RangeSliderTrack>
              <c.RangeSliderFilledTrack bgColor="primaryV1" />
            </c.RangeSliderTrack>
            <c.RangeSliderThumb index={0} borderColor="blackAlpha.500" />
            <c.RangeSliderThumb index={1} borderColor="blackAlpha.500" />
            <c.RangeSliderMark
              value={watch('starsMin')}
              textAlign="center"
              bg="primaryV1"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              {watch('starsMin')}
            </c.RangeSliderMark>
            <c.RangeSliderMark
              value={watch('starsMax')}
              textAlign="center"
              bg="primaryV1"
              color="white"
              mt="-10"
              ml="-5"
              w="12"
            >
              {watch('starsMax')}
            </c.RangeSliderMark>
          </c.RangeSlider>
        </c.FormControl>
        <c.FormControl my="4">
          <c.FormLabel htmlFor="select-subject">Tutor subject</c.FormLabel>
          <c.Select
            placeholder="Select a subject"
            id="select-subject"
            {...register('subject')}
          >
            {props.allSubjects.map((s, i) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </c.Select>
        </c.FormControl>
        <c.FormControl my="4">
          <c.FormLabel htmlFor="tutor-location">Location</c.FormLabel>
          <c.Input id="tutor-location" type="text" {...register('location')} />
        </c.FormControl>
        <c.FormControl my="4">
          <c.FormLabel htmlFor="tutor-distance">
            Distance <strong>(km)</strong>
          </c.FormLabel>
          <c.NumberInput defaultValue={0}>
            <c.NumberInputField {...register('distance', { min: 0 })} />
            <c.NumberInputStepper>
              <c.NumberIncrementStepper />
              <c.NumberDecrementStepper />
            </c.NumberInputStepper>
          </c.NumberInput>
        </c.FormControl>
        <c.Text fontWeight="light" mt="0" mb="4">
          Find tutors by distance from a location
        </c.Text>
        <c.Button
          variant="primary"
          type="submit"
          width="100%"
          mb="2"
          leftIcon={<FaFilter />}
        >
          Apply filters
        </c.Button>
        {ctx.filteredPoints?.features && (
          <c.Button
            variant="danger"
            type="reset"
            width="100%"
            onClick={formResetHandler}
            leftIcon={<FaBroom />}
          >
            Remove filters
          </c.Button>
        )}
      </form>
    </c.Flex>
  );
};

export default FiltersForm;
