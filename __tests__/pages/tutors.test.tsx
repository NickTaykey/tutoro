import { render, screen, act } from '@testing-library/react';
import Home from '../../pages/tutors';
import seedTutors from '../../seed-tutors.json';
import type { UserDocumentObject } from '../../models/User';

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
    act(() => {
      render(
        <Home currentUser={seedTutors[0] as unknown as UserDocumentObject} />
      );
    });
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(fetch).toBeCalled();
  });
});
