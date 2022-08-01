import * as c from '@chakra-ui/react';
import * as fa from 'react-icons/fa';
import { ClientSafeProvider, signIn } from 'next-auth/react';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Brand from './Brand';
import { FcGoogle } from 'react-icons/fc';
import { GoThreeBars } from 'react-icons/go';
import UpdateAvatarForm from '../../users/UpdateAvatarForm';
import UpdateTutorForm from '../../tutors/UpdateTutorForm';
import AuthenticatedUserContext from '../../../store/authenticated-user-context';
import getProvidersList from '../../../utils/get-providers';
import { useRouter } from 'next/router';
import NavbarButtonGroup from './NavbarButtonGroup';
import ColorModeToggler from './ColorModeToggler';

const Navbar: React.FC = () => {
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = c.useDisclosure();
  const { colorMode } = c.useColorMode();
  const [providersList, setProvidersList] = useState<ClientSafeProvider[]>([]);
  const { pathname } = useRouter();

  useEffect(() => {
    getProvidersList().then(list => setProvidersList(list));
  }, []);

  const {
    user,
    openSignInMenu,
    showUpdateAvatarMenu,
    closeUpdateAvatarMenu,
    showUpdateTutorMenu,
    closeUpdateTutorMenu,
    showEarningsMenu,
  } = useContext(AuthenticatedUserContext);

  const noMenusToDisplay =
    !showEarningsMenu && !showUpdateAvatarMenu && !showUpdateTutorMenu;
  const btnRef = React.useRef(null);

  return (
    <c.Box
      as="nav"
      boxShadow="lg"
      rounded="md"
      position="sticky"
      top="0"
      p="2"
      borderRadius="none"
      backgroundColor={colorMode === 'dark' ? 'gray.700' : 'white'}
      zIndex="200"
      width="100%"
    >
      <c.Flex justify="space-between" alignItems="center">
        <Link href="/tutors">
          <c.Heading
            size="xl"
            fontFamily="itim"
            ml="1"
            _hover={{ cursor: 'pointer' }}
            style={{ fontFamily: 'Inter', fontWeight: '500' }}
          >
            <c.Flex alignItems="center">
              <Brand width={60} height={60} />
              <c.Text textTransform="capitalize" ml={2} letterSpacing="1px">
                tutoro
              </c.Text>
            </c.Flex>
          </c.Heading>
        </Link>
        <c.Show breakpoint="(max-width: 767px)">
          <c.Flex>
            {pathname !== '/auth-wall' && (
              <c.IconButton
                ref={btnRef}
                boxShadow="none"
                onClick={onDrawerOpen}
                size="lg"
                backgroundColor="transparent"
                fontSize="48"
                mr={3}
                color="gray.500"
                aria-label="navbar-hamburger"
                icon={<GoThreeBars />}
              />
            )}
            <c.Drawer
              isOpen={isDrawerOpen}
              placement="right"
              onClose={onDrawerClose}
              size="full"
              finalFocusRef={btnRef}
            >
              <c.DrawerOverlay />
              <c.DrawerContent>
                {!showUpdateAvatarMenu && !showUpdateTutorMenu && (
                  <c.DrawerCloseButton />
                )}
                <c.DrawerBody>
                  {!user && providersList && (
                    <c.Flex height="100%" direction="column" justify="center">
                      <c.Heading as="h1" size="md" textAlign="center" my="4">
                        Sign In
                      </c.Heading>
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
                      <ColorModeToggler />
                    </c.Flex>
                  )}
                  {user && (
                    <c.Flex
                      alignItems="center"
                      justify="center"
                      direction="column"
                      height="100%"
                    >
                      {!showUpdateAvatarMenu && !showUpdateTutorMenu && (
                        <Link href="/users/user-profile">
                          <c.Avatar
                            size="xl"
                            name={user.fullname}
                            src={user.avatar?.url || ''}
                            _hover={{ cursor: 'pointer' }}
                            my="5"
                          />
                        </Link>
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
                            <fa.FaRegTimesCircle
                              size="25"
                              onClick={closeUpdateTutorMenu}
                            />
                          </c.Box>
                          <c.Box my="3">
                            <UpdateTutorForm />
                          </c.Box>
                        </c.Flex>
                      )}
                      {noMenusToDisplay && (
                        <c.VStack width="100%" spacing="4">
                          <NavbarButtonGroup />
                        </c.VStack>
                      )}
                    </c.Flex>
                  )}
                </c.DrawerBody>
              </c.DrawerContent>
            </c.Drawer>
            {pathname === '/auth-wall' && <ColorModeToggler />}
          </c.Flex>
        </c.Show>
        <c.Show breakpoint="(min-width: 768px)">
          <c.HStack spacing="3" mr="3">
            {user && (
              <>
                <Link href="/users/user-profile">
                  <c.Avatar name={user.fullname} src={user.avatar?.url || ''} />
                </Link>
                <NavbarButtonGroup />
              </>
            )}
            {!user && pathname !== '/auth-wall' && (
              <>
                <c.Button
                  variant="link"
                  size="lg"
                  onClick={openSignInMenu}
                  _hover={{
                    textDecoration: 'none',
                    color: colorMode === 'dark' ? 'white' : 'blackAlpha.800',
                  }}
                >
                  Sign In
                </c.Button>
                <ColorModeToggler />
              </>
            )}
          </c.HStack>
        </c.Show>
      </c.Flex>
    </c.Box>
  );
};

export default Navbar;
