import type { ComponentStyleConfig } from '@chakra-ui/react';
import brandColors from '../colors';

const buttonOverrides: ComponentStyleConfig = {
  baseStyle: {
    borderRadius: '0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '-5px 5px 5px 1px rgba(0, 0, 0, 0.25)',
    _hover: {
      boxShadow: '-2.5px 2.5px 2.5px 1px rgba(0, 0, 0, 0.125)',
    },
  },
  variants: {
    danger: {
      color: 'white',
      backgroundColor: brandColors.dangerV1,
    },
    link: {
      boxShadow: 'none',
      textTransform: 'Capitalize',
      _hover: {
        boxShadow: 'none',
      },
    },
    primary: {
      color: 'white',
      backgroundColor: brandColors.primaryV1,
    },
    success: {
      color: 'white',
      backgroundColor: brandColors.successV1,
    },
    warning: {
      color: 'white',
      backgroundColor: brandColors.warning,
    },
    cyan: {
      color: 'white',
      backgroundColor: brandColors.primaryV3,
    },
  },
};

export default buttonOverrides;
