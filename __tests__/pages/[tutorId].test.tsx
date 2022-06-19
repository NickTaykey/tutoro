import { render, screen, waitFor } from '@testing-library/react';
import TutorDetails from '../../pages/tutors/[tutorId]';
import { createMockRouter } from '../../utils/testing';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import fakeTutors from '../../fake-tutors.json';

const randomTutorIdx = Math.trunc(Math.random() * fakeTutors.features.length);
const fakeTutor = fakeTutors.features[randomTutorIdx];

describe('Tutor details page tests', () => {
  it('renders without crashing', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({ query: { id: fakeTutor.properties.id } })}
      >
        <TutorDetails />
      </RouterContext.Provider>
    );
    waitFor(() => {
      const heading = screen.getByDisplayValue(fakeTutor.properties.username);
      expect(heading).toBeInTheDocument();
    });
  });
});
