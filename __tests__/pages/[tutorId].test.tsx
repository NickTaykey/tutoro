import { render, screen, waitFor } from '@testing-library/react';
import TutorDetails from '../../pages/tutors/[tutorId]';
import { createMockRouter } from '../../utils/testing';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import fakeTutors from '../../fake-tutors.json';

import type { FakeTutorsAPIResponseType } from '../../types/index';

const randomTutorIdx = Math.trunc(Math.random() * fakeTutors.features.length);
const fakeTutor = fakeTutors.features[randomTutorIdx];

global.fetch = jest.fn(() => {
  return Promise.resolve({
    json: () => Promise.resolve(fakeTutors as FakeTutorsAPIResponseType),
  });
}) as jest.Mock;

describe('Tutor details page tests', () => {
  beforeEach(() => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          query: { id: fakeTutor.properties._id },
        })}
      >
        <TutorDetails />
      </RouterContext.Provider>
    );
  });

  it('renders without crashing', () => {
    waitFor(() => {
      const heading = screen.getByDisplayValue(fakeTutor.properties.username);
      expect(heading).toBeInTheDocument();
    });
  });
  it('loads data from API', () => {
    waitFor(() => {
      expect(fetch).toBeCalled();
    });
  });
});
