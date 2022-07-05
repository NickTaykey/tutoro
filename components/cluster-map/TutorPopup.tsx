import type { TutorObjectGeoJSON } from '../../types/index';
import Link from 'next/link';
import calcAvgRating from '../../utils/calc-avg-rating';
import { FaStar } from 'react-icons/fa';

const TutorPopup: React.FC<{
  popupInfo: TutorObjectGeoJSON;
  authenticatedTutor: boolean;
}> = ({ popupInfo, authenticatedTutor }) => {
  return (
    <section data-testid="popup-container">
      <h2>{popupInfo.properties.fullname}</h2>
      <div>
        {Array(calcAvgRating(popupInfo.properties.reviews))
          .fill(null)
          .map((_, i) => (
            <FaStar key={i} />
          ))}
      </div>
      <Link href={`/tutors/${popupInfo.properties._id}`}>Learn more</Link>
      <br />
      {!authenticatedTutor && (
        <Link href={`/tutors/${popupInfo.properties._id}/sessions/new`}>
          Book session
        </Link>
      )}
    </section>
  );
};

export default TutorPopup;
