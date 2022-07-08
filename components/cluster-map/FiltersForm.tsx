import type { TutorFilters, TutorFiltersFormFields } from '../../types';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
  filterTutorsHandler(filters: TutorFilters | null): void;
  setGeoLocatedUser(coordinates: [number, number] | null): void;
}

const FiltersForm: React.FC<Props> = props => {
  const { register, handleSubmit, resetField, reset } =
    useForm<TutorFiltersFormFields>({
      defaultValues: {
        distance: 100,
        location: '',
        name: '',
        priceMin: 5,
        priceMax: 250,
        starsMin: 0,
        starsMax: 5,
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
      setGeolocationFeedback('just a moment...');
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
          <label htmlFor="tutor-price-min">Min price</label>
          <input
            type="number"
            id="tutor-price-min"
            min={5}
            max={250}
            {...register('priceMin', { max: 250, min: 5 })}
          />
          <label htmlFor="tutor-price-max">Max price</label>
          <input
            type="number"
            id="tutor-price-max"
            min={5}
            max={250}
            {...register('priceMax', { min: 5, max: 250 })}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="tutor-stars-min">Min stars</label>
          <input
            type="number"
            id="tutor-stars-min"
            min={0}
            max={5}
            {...register('starsMin', { max: 5, min: 0 })}
          />
          <label htmlFor="tutor-stars-max">Max stars</label>
          <input
            type="number"
            id="tutor-stars-max"
            min={0}
            max={5}
            {...register('starsMax', { max: 5, min: 0 })}
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
          <label htmlFor="tutor-location">Location</label>
          <input type="text" id="tutor-location" {...register('location')} />
          <label htmlFor="tutor-distance">Distance from me</label>
          <input type="number" id="tutor-distance" {...register('distance')} />
          <button type="button" onClick={geoLocalizationHandler}>
            Geolocalize me
          </button>
        </fieldset>
        <button type="submit">Filter</button>
        <button type="button" onClick={formResetHandler}>
          Reset
        </button>
      </form>
    </>
  );
};

export default FiltersForm;
