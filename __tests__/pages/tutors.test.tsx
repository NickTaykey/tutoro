import { render, screen, act } from '@testing-library/react';
import Home from '../../pages/tutors';
import seedTutors from '../../seed-tutors.json';
import * as functions from 'next-auth/react';

functions!.useSession = jest.fn().mockReturnValue({
  status: 'authenticated',
  data: { user: { email: 'random@mail.com', fullname: 'Nick' } },
});

global.fetch = jest.fn(() => {
  return Promise.resolve({
    json: () => Promise.resolve(seedTutors),
  });
}) as jest.Mock;

jest.mock('../../components/cluster-map/ClusterMap', () => {
  return () => <div data-testid="map" />;
});

global.fetch = jest.fn(() => {
  return Promise.resolve({
    json: () => Promise.resolve(seedTutors),
  });
}) as jest.Mock;

describe('Home page tests', () => {
  it('renders without crashing', async () => {
    await act(() => {
      render(<Home />);
    });
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(fetch).toBeCalled();
  });
});
