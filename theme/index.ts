import { extendTheme } from '@chakra-ui/react';
import Heading from './components/heading';
import Button from './components/button';
import Alert from './components/alert';
import Avatar from './components/avatar';
import Textarea from './components/textarea';
import inputOverride from './components/input';
import brandColors from './colors';

const theme = extendTheme({
  colors: brandColors,
  components: {
    Heading,
    Button,
    Alert,
    Avatar,
    Textarea,
    Input: inputOverride,
    Select: inputOverride,
    NumberInput: inputOverride,
  },
  fonts: {
    Heading: 'Raleway',
    body: 'Lato',
  },
});

export default theme;
