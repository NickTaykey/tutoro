import { render, screen } from '@testing-library/react';
import Review from '../../components/reviews/Review';
import seedTutors from '../../seed-tutors.json';
import * as functions from 'next-auth/react';

const tutor = seedTutors[0];

functions!.useSession = jest.fn().mockReturnValue({ status: 'authenticated' });

describe('Review tests', () => {
  beforeEach(() => {
    render(
      <Review
        tutorId={tutor._id}
        review={{ ...tutor.reviews[0], ownerAuthenticated: true }}
      />
    );
  });
  it('renders without crashing', () => {
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
  it('displays correct information', () => {
    expect(screen.getByText(tutor.reviews[0].stars)).toBeInTheDocument();
    expect(screen.getByText(tutor.reviews[0].text)).toBeInTheDocument();
  });
});
