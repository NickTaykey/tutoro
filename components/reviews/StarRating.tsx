import { FaStar } from 'react-icons/fa';
import React, { useState, useImperativeHandle } from 'react';
import { Flex } from '@chakra-ui/react';

export type StarRatingHandle = {
  reset: () => void;
};

const StarRating = React.forwardRef<
  StarRatingHandle,
  { stars: number; setStars: (newStars: number) => void }
>((props, ref) => {
  const [hover, setHover] = useState(0);
  useImperativeHandle(ref, () => ({
    reset: () => {
      setHover(0);
      props.setStars(0);
    },
  }));
  return (
    <Flex className="star-rating" alignItems="center">
      {[...Array(5)].map((_, idx) => {
        idx += 1;
        return (
          <button
            type="button"
            key={idx}
            onClick={() => props.setStars(idx)}
            onMouseEnter={() => setHover(idx)}
            onMouseLeave={() => setHover(props.stars)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <span className="star">
              <FaStar
                color={idx <= (hover || props.stars) ? '#ffbe0b' : '#e5e5e5'}
                size={25}
              />
            </span>
          </button>
        );
      })}
    </Flex>
  );
});

StarRating.displayName = 'StarRating';

export default StarRating;
