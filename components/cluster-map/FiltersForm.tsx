import type { TutorFilters, TutorFiltersFormFields } from '../../types';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
  filterTutorsHandler(filters: TutorFilters): void;
}

const FiltersForm: React.FC<Props> = props => {
  const { register, handleSubmit } = useForm<TutorFiltersFormFields>({
    defaultValues: {
      distance: 500,
      name: '',
      priceMin: 5,
      priceMax: 250,
      subject: '',
    },
  });
  const [geolocationFeedback, setGeolocationFeedback] = useState<string | null>(
    null
  );
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  const formSubmitHandler = (data: TutorFiltersFormFields) => {
    props.filterTutorsHandler({
      ...data,
      location: location
        ? [location!.coords.latitude, location!.coords.longitude]
        : null,
    });
  };

  const geoLocalizationHandler = (e: FormEvent) => {
    e.preventDefault();
    if (navigator.geolocation) {
      setGeolocationFeedback('just a moment...');
      navigator.geolocation.getCurrentPosition(
        p => {
          setGeolocationFeedback('Location successfully retreived!');
          setLocation(p);
        },
        e =>
          setGeolocationFeedback('Your browser does not support geolocation!')
      );
    }
  };

  return (
    <>
      <h2>Find the best Tutor for you using filters</h2>
      <form onSubmit={handleSubmit(formSubmitHandler)}>
        <fieldset>
          <label htmlFor="tutor-name">Name</label>
          <input
            type="text"
            id="tutor-name"
            {...register('name', { maxLength: 50 })}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="tutor-price-min">Min</label>
          <input
            type="number"
            id="tutor-price-min"
            min={5}
            max={250}
            {...register('priceMin', { max: 250, min: 5 })}
          />
          <label htmlFor="tutor-price-max">Max</label>
          <input
            type="number"
            id="tutor-price-max"
            min={5}
            max={250}
            {...register('priceMax', { max: 250, min: 5 })}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="tutor-subject">Subject</label>
          <input
            type="text"
            id="tutor-subject"
            {...register('subject', { maxLength: 50 })}
          />
        </fieldset>
        <fieldset>
          {geolocationFeedback && <div>{geolocationFeedback}</div>}
          <label htmlFor="tutor-distance">Distance from me</label>
          <input type="number" id="tutor-distance" name="tutor-distance" />
          <button onClick={geoLocalizationHandler}>Geolocalize me</button>
        </fieldset>
        <button type="submit">Filter</button>
      </form>
    </>
  );
};

export default FiltersForm;
