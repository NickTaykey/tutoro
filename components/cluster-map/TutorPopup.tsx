import { TutorObjectGeoJSON } from '../../types/index';
import Link from 'next/link';

const TutorPopup: React.FC<{
  popupInfo: TutorObjectGeoJSON;
}> = ({ popupInfo }) => {
  return (
    <section data-testid="popup-container">
      <h2>{popupInfo.properties.username}</h2>
      <div>{popupInfo.properties.name}</div>
    </section>
  );
};

export default TutorPopup;
