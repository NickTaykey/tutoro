import type { ComponentStyleConfig } from '@chakra-ui/react';

const inputOverrides: ComponentStyleConfig = {
  sizes: {
    md: { field: { borderRadius: 'none' } },
  },
  baseStyle: {
    field: {
      rounded: 'none',
      fontSize: '16',
      fontWeight: '700',
      border: '2px solid rgba(0, 0, 0, 0.1)',
      letterSpacing: '1px',
      boxShadow: '-5px 5px 5px 1px rgba(0, 0, 0, 0.25)',
      _hover: {
        boxShadow: '-2.5px 2.5px 2.5px 1px rgba(0, 0, 0, 0.125)',
      },
    },
  },
};

export default inputOverrides;
