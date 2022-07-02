import { render, screen, waitFor } from '@testing-library/react';
import TutorPage from '../../components/tutors/TutorPage';
import seedTutors from '../../seed-tutors.json';
import * as functions from 'next-auth/react';
import type { ReviewDocumentObject } from '../../models/Review';

functions!.useSession = jest.fn().mockReturnValue({ status: 'authenticated' });

const tutor = seedTutors[0];

global.fetch = jest.fn(() => {
  return Promise.resolve({
    json: () => Promise.resolve(seedTutors),
  });
}) as jest.Mock;

describe('Tutor details page tests', () => {
  beforeEach(() => {
    render(
      <TutorPage
        tutor={{ ...tutor, coordinates: tutor.coordinates as [number, number] }}
        userCreatedReviewsIds={tutor.createdReviews.map(
          (r: ReviewDocumentObject) => r._id
        )}
      />
    );
  });

  it('renders without crashing', () => {
    waitFor(() => {
      const heading = screen.getByDisplayValue(tutor.fullname);
      expect(heading).toBeInTheDocument();
    });
  });
});
