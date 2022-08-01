import { useContext } from 'react';
import AuthenticatedUserContext from '../../../store/authenticated-user-context';
import { signOut } from 'next-auth/react';
import * as fa from 'react-icons/fa';
import * as c from '@chakra-ui/react';
import { useRouter } from 'next/router';
import ColorModeToggler from './ColorModeToggler';

const NavbarButtonGroup: React.FC = () => {
  const { push } = useRouter();
  const { user, openUpdateAvatarMenu, openEarningsMenu, openUpdateTutorMenu } =
    useContext(AuthenticatedUserContext);
  return (
    <>
      <c.IconButton
        width="100%"
        icon={<fa.FaRegUserCircle size="25" />}
        variant="cyan"
        color="white"
        onClick={openUpdateAvatarMenu}
        aria-label="Update avatar"
        mr={[0, 2]}
      />
      {user?.isTutor && (
        <c.IconButton
          width="100%"
          variant="special"
          icon={<fa.FaDollarSign size="25" />}
          onClick={() => openEarningsMenu()}
          aria-label="Tutor profile page link"
          mr={[0, 2]}
        />
      )}
      {user?.isTutor && (
        <>
          <c.IconButton
            variant="cta"
            width="100%"
            icon={<fa.FaHandsHelping size={25} />}
            onClick={() => push('/users/tutor-profile')}
            aria-label="Tutor profile page link"
            mt="2"
          />
          <c.IconButton
            width="100%"
            icon={<fa.FaListUl size="25" />}
            variant="warning"
            onClick={openUpdateTutorMenu}
            aria-label="Update tutor profile"
            mr={[0, 2]}
          />
        </>
      )}
      <c.IconButton
        width="100%"
        icon={<fa.FaSignOutAlt size="25" />}
        colorScheme="gray"
        onClick={() => signOut()}
        aria-label="Sign out button"
        mr={[0, 2]}
      />
      <ColorModeToggler />
    </>
  );
};

export default NavbarButtonGroup;
