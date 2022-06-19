import { render, screen } from '@testing-library/react';
import Review from '../../components/reviews/Review';
import fakeTutors from '../../fake-tutors.json';

const randomTutorIdx = Math.trunc(Math.random() * fakeTutors.features.length);
const fakeReview = fakeTutors.features[randomTutorIdx].properties.reviews[0];

describe('Review tests', () => {
  beforeEach(() => {
    render(<Review review={fakeReview} />);
  });
  it('renders without crashing', () => {
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
  it('displays correct information', () => {
    expect(screen.getByText(fakeReview.stars)).toBeInTheDocument();
    expect(screen.getByText(fakeReview.text)).toBeInTheDocument();
    expect(screen.getByText(fakeReview.username)).toBeInTheDocument();
  });
});
