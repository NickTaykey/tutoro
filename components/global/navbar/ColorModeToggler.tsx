import * as c from '@chakra-ui/react';
import { useContext } from 'react';
import * as fa from 'react-icons/fa';
import AuthenticatedUserContext from '../../../store/authenticated-user-context';

const ColorModeToggler: React.FC = () => {
  const { user } = useContext(AuthenticatedUserContext);
  const { colorMode, toggleColorMode } = c.useColorMode();
  const toogleColorModeBtnColor = c.useColorModeValue('gray.50', 'gray.700');
  const toogleColorModeBtnBgColor = c.useColorModeValue('gray.700', 'gray.100');
  const toogleColorModeBtnBgColorHover = c.useColorModeValue(
    'gray.800',
    'white'
  );
  const toogleColorModeBtnColorHover = c.useColorModeValue('white', 'black');
  return (
    <c.IconButton
      width={['100%', 'auto']}
      aria-label="toggle website color mode"
      backgroundColor={toogleColorModeBtnBgColor}
      onClick={() => toggleColorMode()}
      color={toogleColorModeBtnColor}
      mt={user ? 0 : 4}
      _hover={{
        color: toogleColorModeBtnColorHover,
        backgroundColor: toogleColorModeBtnBgColorHover,
      }}
      icon={
        colorMode === 'dark' ? <fa.FaSun size="25" /> : <fa.FaMoon size="25" />
      }
    />
  );
};

export default ColorModeToggler;
