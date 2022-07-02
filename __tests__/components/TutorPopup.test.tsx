import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TutorPopup from '../../components/cluster-map/TutorPopup';
import { createMockRouter } from '../../utils/testing';
import seedTutors from '../../seed-tutors.json';
import * as functions from 'next-auth/react';
import type { ReviewDocumentObject } from '../../models/Review';

const tutor = seedTutors[0];

functions!.useSession = jest.fn().mockReturnValue({ status: 'authenticated' });

describe('TutorPopup tests', () => {
  beforeEach(() => {
    render(
      <TutorPopup
        popupInfo={{
          type: 'Feature',
          properties: {
            cluster: false,
            ...tutor,
            coordinates: tutor.coordinates as [number, number],
            reviews: tutor.reviews as ReviewDocumentObject[],
          },
          geometry: {
            type: 'Point',
            coordinates: tutor.coordinates as [number, number],
          },
        }}
      />
    );
  });
  it('renders without crashing', () => {
    expect(screen.getByTestId('popup-container')).toBeInTheDocument();
  });
  it('displays correct information', () => {
    expect(screen.getByText(tutor.fullname)).toBeInTheDocument();
  });
  it('navigates to the correct tutor page', () => {
    const router = createMockRouter({
      query: { id: tutor._id },
    });
    userEvent.click(screen.getByText('Learn more'));
    waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/tutors/' + router.query.id);
    });
  });
});
