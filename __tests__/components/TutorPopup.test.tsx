import { render, screen } from '@testing-library/react';
import { TutorObjectGeoJSON } from '../../types/index';
import TutorPopup from '../../components/cluster-map/TutorPopup';

const popupInfo: TutorObjectGeoJSON = {
  type: 'Feature',
  properties: {
    cluster: false,
    username: 'paltrinierigoffredo',
    name: 'Victoria Folliero',
    sex: 'F',
    address: "Rotonda Praga, 198 Appartamento 6\n34072, Gradisca D'Isonzo (GO)",
    mail: 'goffredo19@gmail.com',
    birthdate: '1982-04-17',
  },
  geometry: { type: 'Point', coordinates: [7.60872, 43.78956] },
};

describe('TutorPopup tests', () => {
  beforeEach(() => {
    render(<TutorPopup popupInfo={popupInfo} />);
  });
  it('renders without crashing', () => {
    expect(screen.getByTestId('popup-container')).toBeInTheDocument();
  });
  it('displays correct information', () => {
    expect(screen.getByText(popupInfo.properties.username)).toBeInTheDocument();
    expect(screen.getByText(popupInfo.properties.name)).toBeInTheDocument();
  });
});
