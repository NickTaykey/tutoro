import type { StyleFunctionProps } from '@chakra-ui/theme-tools';
import type { ComponentStyleConfig } from '@chakra-ui/react';
import colors from '../colors';

const alertOverrides: ComponentStyleConfig = {
  baseStyle: (props: StyleFunctionProps) => ({
    container: {
      fontSize: '16',
      fontWeight: '600',
      boxShadow: '-5px 5px 5px 1px rgba(0, 0, 0, 0.25)',
      backgroundColor:
        props.status === 'error'
          ? `${
              props.colorMode === 'dark' ? colors.dangerV2 : 'auto'
            }!important;`
          : `${
              props.colorMode === 'dark' ? colors.successV2 : 'auto'
            }!important;`,
      color:
        props.colorMode === 'dark'
          ? 'white'
          : props.status === 'error'
          ? `${colors.dangerV1}!important;`
          : `${colors.successV1}!important;`,
    },
  }),
};

export default alertOverrides;
