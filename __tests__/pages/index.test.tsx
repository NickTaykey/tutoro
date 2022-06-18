import { render, screen, act } from '@testing-library/react';
import fakeTutors from '../../fake-tutors.json';
import Home from '../../pages/index';

import type { FakeTutorsAPIResponseType } from '../../types';

jest.mock('../../components/cluster-map/ClusterMap', () => {
  return () => <div data-testid="map" />;
});

global.fetch = jest.fn(() => {
  return Promise.resolve({
    json: () => Promise.resolve(fakeTutors as FakeTutorsAPIResponseType),
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
