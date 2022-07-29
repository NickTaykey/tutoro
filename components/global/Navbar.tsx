import {
  Flex,
  Heading,
  Text,
  Avatar,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Show,
  IconButton,
  Box,
  useDisclosure,
  Button,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { ClientSafeProvider, signIn, signOut } from 'next-auth/react';
import {
  FaListUl,
  FaRegTimesCircle,
  FaRegUserCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';

import { FcGoogle } from 'react-icons/fc';
import { GoThreeBars } from 'react-icons/go';
import UpdateAvatarForm from '../users/UpdateAvatarForm';
import UpdateTutorForm from '../tutors/UpdateTutorForm';
import AuthenticatedUserContext from '../../store/authenticated-user-context';
import getProvidersList from '../../utils/get-providers';

const Navbar: React.FC = () => {
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const [providersList, setProvidersList] = useState<ClientSafeProvider[]>([]);

  useEffect(() => {
    getProvidersList().then(list => setProvidersList(list));
  }, [getProvidersList]);

  const {
    user,
    openSignInMenu,
    showUpdateAvatarMenu,
    openUpdateAvatarMenu,
    closeUpdateAvatarMenu,
    showUpdateTutorMenu,
    openUpdateTutorMenu,
    closeUpdateTutorMenu,
  } = useContext(AuthenticatedUserContext);

  const btnRef = React.useRef(null);

  return (
    <Box
      boxShadow="lg"
      rounded="md"
      bg="white"
      position="sticky"
      top="0"
      p="2"
      zIndex="200"
      width="100%"
    >
      <Flex justify="space-between" alignItems="center">
        <Link href="/tutors">
          <Heading
            size="xl"
            fontFamily="itim"
            ml="1"
            _hover={{ cursor: 'pointer' }}
            style={{ fontFamily: 'Inter', fontWeight: '500' }}
          >
            <Flex alignItems="center">
              <Logo width={60} height={60} />
              <Text textTransform="capitalize" ml={2}>
                tutoro
              </Text>
            </Flex>
          </Heading>
        </Link>
        <Show breakpoint="(max-width: 767px)">
          <IconButton
            ref={btnRef}
            boxShadow="none"
            onClick={onDrawerOpen}
            size="lg"
            backgroundColor="white"
            fontSize="48"
            mr={3}
            color="gray.500"
            aria-label="navbar-hamburger"
            icon={<GoThreeBars />}
          />
          <Drawer
            isOpen={isDrawerOpen}
            placement="right"
            onClose={onDrawerClose}
            size="full"
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              {!showUpdateAvatarMenu && !showUpdateTutorMenu && (
                <DrawerCloseButton />
              )}
              <DrawerBody>
                {!user && providersList && (
                  <Flex height="100%" direction="column" justify="center">
                    <Heading as="h1" size="md" textAlign="center" my="4">
                      Sign In
                    </Heading>
                    {providersList.map(provider => (
                      <Button
                        width="100%"
                        key={provider.name}
                        leftIcon={<FcGoogle size="30" />}
                        aria-label="Google OAuth Icon"
                        onClick={() => signIn(provider.id)}
                      >
                        Google
                      </Button>
                    ))}
                  </Flex>
                )}
                {user && (
                  <Flex
                    alignItems="center"
                    justify="center"
                    direction="column"
                    height="100%"
                  >
                    {!showUpdateAvatarMenu && !showUpdateTutorMenu && (
                      <Link href="/users">
                        <Avatar
                          size="xl"
                          name={user.fullname}
                          src={user.avatar?.url || ''}
                          _hover={{ cursor: 'pointer' }}
                          mb="2"
                        />
                      </Link>
                    )}
                    {showUpdateAvatarMenu ? (
                      <Flex
                        direction="column"
                        shadow="md"
                        borderWidth="1px"
                        borderRadius="md"
                        p="6"
                        width="100%"
                        mt={[2, 0]}
                      >
                        <Box
                          color="gray.500"
                          onClick={closeUpdateAvatarMenu}
                          alignSelf="end"
                        >
                          <FaRegTimesCircle size="25" />
                        </Box>
                        <Box my="3">
                          <UpdateAvatarForm />
                        </Box>
                      </Flex>
                    ) : showUpdateTutorMenu && user ? (
                      <Flex
                        direction="column"
                        shadow="md"
                        borderWidth="1px"
                        borderRadius="md"
                        p="6"
                        width="100%"
                        mt={[2, 0]}
                      >
                        <Box color="gray.500" alignSelf="end">
                          <FaRegTimesCircle
                            size="25"
                            onClick={closeUpdateTutorMenu}
                          />
                        </Box>
                        <Box my="3">
                          <UpdateTutorForm />
                        </Box>
                      </Flex>
                    ) : (
                      <VStack width="100%" spacing="4">
                        <IconButton
                          width="100%"
                          icon={<FaRegUserCircle size="25" />}
                          variant="cyan"
                          color="white"
                          onClick={openUpdateAvatarMenu}
                          aria-label="Update avatar"
                          mt="2"
                        />
                        {user.isTutor && (
                          <IconButton
                            width="100%"
                            icon={<FaListUl size="25" />}
                            variant="warning"
                            onClick={openUpdateTutorMenu}
                            aria-label="Update avatar"
                            mt="2"
                          />
                        )}
                        <IconButton
                          width="100%"
                          icon={<FaSignOutAlt size="25" />}
                          colorScheme="gray"
                          onClick={() => signOut()}
                          aria-label="Sign out button"
                          mt="2"
                        />
                      </VStack>
                    )}
                  </Flex>
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Show>
        <Show breakpoint="(min-width: 768px)">
          {!user && (
            <Flex alignItems="center" mr="4">
              <Button
                variant="link"
                size="lg"
                onClick={openSignInMenu}
                _hover={{ textDecoration: 'none', color: 'blackAlpha.800' }}
              >
                Sign In
              </Button>
            </Flex>
          )}
          {user && (
            <HStack spacing="3" mr="3">
              <Link href="/users">
                <Avatar name={user.fullname} src={user.avatar?.url || ''} />
              </Link>
              <IconButton
                icon={<FaRegUserCircle size="25" />}
                variant="cyan"
                color="white"
                onClick={openUpdateAvatarMenu}
                aria-label="Update avatar"
                mr={2}
              />
              {user.isTutor && (
                <IconButton
                  width="100%"
                  icon={<FaListUl size="25" />}
                  variant="warning"
                  onClick={openUpdateTutorMenu}
                  aria-label="Update avatar"
                  mr={2}
                />
              )}
              <IconButton
                icon={<FaSignOutAlt size="25" />}
                colorScheme="gray"
                onClick={() => signOut()}
                aria-label="Sign out button"
                mr={4}
              />
            </HStack>
          )}
        </Show>
      </Flex>
    </Box>
  );
};

export default Navbar;
