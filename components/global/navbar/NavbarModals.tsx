import AuthenticatedUserContext from '../../../store/authenticated-user-context';
import * as c from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import UpdateTutorForm from '../../tutors/UpdateTutorForm';
import EarningsMenu from '../../users/EarningsMenu';
import UpdateAvatarForm from '../../users/UpdateAvatarForm';
import getProvidersList from '../../../utils/get-providers';

import type { ClientSafeProvider } from 'next-auth/react';

const NavbarModals: React.FC = () => {
  const { user } = useContext(AuthenticatedUserContext);
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
    showSignInMenu,
    closeSignInMenu,
  } = useContext(AuthenticatedUserContext);

  const [providersList, setProvidersList] = useState<ClientSafeProvider[]>([]);

  useEffect(() => {
    getProvidersList().then(list => setProvidersList(list));
  }, []);

  return user ? (
    <>
      <c.Modal
        isCentered
        blockScrollOnMount={false}
        isOpen={showUpdateAvatarMenu}
        onClose={closeUpdateAvatarMenu}
      >
        <c.ModalOverlay />
        <c.ModalContent width="90%" mx="auto">
          <c.ModalHeader>Choose another avatar!</c.ModalHeader>
          <c.ModalCloseButton />
          <c.ModalBody>
            <UpdateAvatarForm />
          </c.ModalBody>
        </c.ModalContent>
      </c.Modal>
      <c.Modal
        isCentered
        blockScrollOnMount={false}
        size="lg"
        isOpen={showDeleteAccountMenu}
        onClose={closeDeleteAccountMenu}
      >
        <c.ModalOverlay />
        <c.ModalContent width="90%" mx="auto">
          <c.ModalHeader>
            Are you sure you want to delete your account?
          </c.ModalHeader>
          <c.ModalCloseButton />
          <c.ModalBody>
            <c.Text align="center" mb="3">
              All your data (Posts, Sessions and Reviews) will be lost forever.
            </c.Text>
            <c.ModalFooter justifyContent="center">
              <c.Button mr={3} onClick={closeDeleteAccountMenu}>
                Close
              </c.Button>
              <c.Button variant="danger" onClick={deleteAccount}>
                Delete your account
              </c.Button>
            </c.ModalFooter>
          </c.ModalBody>
        </c.ModalContent>
      </c.Modal>
      {user.isTutor && (
        <>
          <c.Modal
            isCentered
            blockScrollOnMount={false}
            isOpen={showUpdateTutorMenu}
            onClose={closeUpdateTutorMenu}
          >
            <c.ModalOverlay />
            <c.ModalContent width="90%" mx="auto">
              <c.ModalHeader>Update your tutor profile</c.ModalHeader>
              <c.ModalCloseButton />
              <c.ModalBody>
                <UpdateTutorForm />
              </c.ModalBody>
            </c.ModalContent>
          </c.Modal>
          <c.Modal
            isCentered
            blockScrollOnMount={false}
            isOpen={showEarningsMenu}
            onClose={closeEarningsMenu}
          >
            <c.ModalOverlay />
            <c.ModalContent width="90%" mx="auto">
              <c.ModalHeader>Your earnings as a Tutor</c.ModalHeader>
              <c.ModalCloseButton />
              <c.ModalBody>
                <EarningsMenu />
              </c.ModalBody>
            </c.ModalContent>
          </c.Modal>
        </>
      )}
    </>
  ) : (
    <c.Modal isCentered isOpen={showSignInMenu} onClose={closeSignInMenu}>
      <c.ModalOverlay />
      <c.ModalContent width="90%" mx="auto">
        <c.ModalCloseButton />
        <c.ModalHeader textAlign="center">Sign In to Tutoro</c.ModalHeader>
        <c.ModalBody mb="5">
          {providersList.map(provider => (
            <c.Button
              width="100%"
              key={provider.name}
              leftIcon={<FcGoogle size="30" />}
              aria-label="Google OAuth Icon"
              onClick={() => signIn(provider.id)}
            >
              Google
            </c.Button>
          ))}
        </c.ModalBody>
      </c.ModalContent>
    </c.Modal>
  );
};
export default NavbarModals;
