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
      _disabled: {
        bg: 'gray.500',
      },
    },
  },
  variants: {
    danger: {
      color: 'white',
      backgroundColor: brandColors.dangerV1,
    },
    special: {
      color: 'white',
      backgroundColor: brandColors.special,
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
    cta: {
      bgGradient: 'linear(to-l, #7928CA, #f03291)',
      width: ['calc(90% + 4px)', '95%', '80%'],
      mx: 'auto',
      color: 'white',
      textTransform: 'uppercase',
      _hover: {
        boxShadow: '-2.5px 2.5px 2.5px 1px rgba(0, 0, 0, 0.125)',
        bgGradient: 'linear(to-l, #7928CA, #FF0080, )',
      },
    },
  },
};

export default buttonOverrides;
