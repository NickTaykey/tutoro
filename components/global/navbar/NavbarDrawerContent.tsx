import AuthenticatedUserContext from '../../../store/authenticated-user-context';
import UpdateAvatarForm from '../../users/UpdateAvatarForm';
import UpdateTutorForm from '../../tutors/UpdateTutorForm';
import EarningsMenu from '../../users/EarningsMenu';
import * as c from '@chakra-ui/react';
import * as fa from 'react-icons/fa';
import { useContext } from 'react';

const NavbarDrawerContent: React.FC = () => {
  const {
    showUpdateAvatarMenu,
    closeUpdateAvatarMenu,
    showUpdateTutorMenu,
    closeUpdateTutorMenu,
    showEarningsMenu,
    closeEarningsMenu,
    showDeleteAccountMenu,
    deleteAccount,
    closeDeleteAccountMenu,
  } = useContext(AuthenticatedUserContext);

  return (
    <>
      {showDeleteAccountMenu && (
        <c.Flex
          direction="column"
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          p="6"
          width="100%"
          mt={[2, 0]}
        >
          <c.Box
            color="gray.500"
            onClick={closeDeleteAccountMenu}
            alignSelf="end"
          >
            <fa.FaRegTimesCircle size="25" />
          </c.Box>
          <c.Box my="3">
            <c.Heading as="h2" size="lg" textAlign="center">
              Are you sure you want to delete your account?
            </c.Heading>
            <c.Text align="center" my="4">
              All your data (Posts, Sessions and Reviews) will be lost forever.
            </c.Text>
            <c.Button
              mr={3}
              onClick={closeDeleteAccountMenu}
              width="100%"
              mt="3"
            >
              Close
            </c.Button>
            <c.Button
              variant="danger"
              onClick={deleteAccount}
              width="100%"
              mt="3"
            >
              Delete your account
            </c.Button>
          </c.Box>
        </c.Flex>
      )}
      {showUpdateAvatarMenu && (
        <c.Flex
          direction="column"
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          p="6"
          width="100%"
          mt={[2, 0]}
        >
          <c.Box
            color="gray.500"
            onClick={closeUpdateAvatarMenu}
            alignSelf="end"
          >
            <fa.FaRegTimesCircle size="25" />
          </c.Box>
          <c.Box my="3">
            <UpdateAvatarForm />
          </c.Box>
        </c.Flex>
      )}
      {showEarningsMenu && (
        <c.Flex
          direction="column"
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          p="6"
          width="100%"
          mt={[2, 0]}
        >
          <c.Box color="gray.500" onClick={closeEarningsMenu} alignSelf="end">
            <fa.FaRegTimesCircle size="25" />
          </c.Box>
          <c.Box my="3">
            <EarningsMenu />
          </c.Box>
        </c.Flex>
      )}
      {showUpdateTutorMenu && (
        <c.Flex
          direction="column"
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          p="6"
          width="100%"
          mt={[2, 0]}
        >
          <c.Box color="gray.500" alignSelf="end">
            <fa.FaRegTimesCircle size="25" onClick={closeUpdateTutorMenu} />
          </c.Box>
          <c.Box my="3">
            <UpdateTutorForm />
          </c.Box>
        </c.Flex>
      )}
    </>
  );
};

export default NavbarDrawerContent;
