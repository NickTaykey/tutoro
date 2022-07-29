import type { StyleFunctionProps } from '@chakra-ui/theme-tools';
import type { ComponentStyleConfig } from '@chakra-ui/react';
import brandColors from '../colors';

const alertOverrides: ComponentStyleConfig = {
  baseStyle: (props: StyleFunctionProps) => ({
    container: {
      fontSize: '16',
      fontWeight: '600',
      boxShadow: '-5px 5px 5px 1px rgba(0, 0, 0, 0.25)',
      color:
        props.status === 'error' ? brandColors.dangerV1 : brandColors.successV1,
      backgroundColor:
        props.status === 'error' ? brandColors.dangerV2 : brandColors.successV2,
    },
  }),
};

export default alertOverrides;
