import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TutorPopup from '../../components/cluster-map/TutorPopup';
import { createMockRouter } from '../../utils/testing';
import fakeTutors from '../../fake-tutors.json';

import type { TutorObjectGeoJSON } from '../../types/index';

const randomTutorIdx = Math.trunc(Math.random() * fakeTutors.features.length);
const fakeTutor = fakeTutors.features[randomTutorIdx] as TutorObjectGeoJSON;

describe('TutorPopup tests', () => {
  beforeEach(() => {
    render(<TutorPopup popupInfo={fakeTutor} />);
  });
  it('renders without crashing', () => {
    expect(screen.getByTestId('popup-container')).toBeInTheDocument();
  });
  it('displays correct information', () => {
    expect(screen.getByText(fakeTutor.properties.username)).toBeInTheDocument();
    expect(screen.getByText(fakeTutor.properties.name)).toBeInTheDocument();
  });
  it('navigates to the correct tutor page', () => {
    const router = createMockRouter({
      query: { id: fakeTutor.properties.id },
    });
    userEvent.click(screen.getByText('Learn more'));
    waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/tutors/' + router.query.id);
    });
  });
});
