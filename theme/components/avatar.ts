import type { ComponentStyleConfig } from '@chakra-ui/react';

const avatarOverrides: ComponentStyleConfig = {
  baseStyle: {
    container: {
      boxShadow: '-5px 5px 5px 1px rgba(0, 0, 0, 0.25)',
      _hover: {
        boxShadow: '-2.5px 2.5px 2.5px 1px rgba(0, 0, 0, 0.125)',
        cursor: 'pointer',
      },
    },
  },
};

export default avatarOverrides;
