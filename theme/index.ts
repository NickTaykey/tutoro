import type { StyleFunctionProps } from '@chakra-ui/theme-tools';
import { extendTheme } from '@chakra-ui/react';
import Button from './components/button';
import Alert from './components/alert';
import Avatar from './components/avatar';
import Textarea from './components/textarea';
import inputOverride from './components/input';
import brandColors from './colors';
import { mode } from '@chakra-ui/theme-tools';

const theme = extendTheme({
  colors: brandColors,
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  components: {
    Button,
    Alert,
    Avatar,
    Textarea,
    Input: inputOverride,
    Select: inputOverride,
    NumberInput: inputOverride,
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: mode('gray.50', 'gray.600')(props),
      },
    }),
  },
  fonts: {
    Heading: 'Raleway',
    body: 'Lato',
  },
});

export default theme;
