import type { TutorObjectGeoJSON } from '../../types/index';
import Link from 'next/link';

const TutorPopup: React.FC<{
  popupInfo: TutorObjectGeoJSON;
}> = ({ popupInfo }) => {
  return (
    <section data-testid="popup-container">
      <h2>{popupInfo.properties.fullname}</h2>
      <Link href={`/tutors/${popupInfo.properties._id}`}>Learn more</Link>
    </section>
  );
};

export default TutorPopup;
