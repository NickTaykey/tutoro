import { render, screen, waitFor } from '@testing-library/react';
import TutorDetails from '../../pages/tutors/[tutorId]';
import { NextRouter } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import fakeTutors from '../../fake-tutors.json';

function createMockRouter(router: Partial<NextRouter>): NextRouter {
  return {
    basePath: '',
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    back: jest.fn(),
    beforePopState: jest.fn(),
    prefetch: jest.fn(),
    push: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    defaultLocale: 'en',
    domainLocales: [],
    isPreview: false,
    ...router,
  };
}

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
