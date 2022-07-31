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
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { ClientSafeProvider, signIn, signOut } from 'next-auth/react';
import {
  FaListUl,
  FaMoon,
  FaRegTimesCircle,
  FaRegUserCircle,
  FaSignOutAlt,
  FaSun,
  FaDollarSign,
  FaHandsHelping,
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
import { useRouter } from 'next/router';
import EarningsMenu from '../users/EarningsMenu';

const Navbar: React.FC = () => {
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const [providersList, setProvidersList] = useState<ClientSafeProvider[]>([]);
  const { colorMode, toggleColorMode } = useColorMode();
  const toogleColorModeBtnColor = useColorModeValue('gray.50', 'gray.700');
  const toogleColorModeBtnBgColor = useColorModeValue('gray.700', 'gray.100');
  const toogleColorModeBtnBgColorHover = useColorModeValue('gray.800', 'white');
  const toogleColorModeBtnColorHover = useColorModeValue('white', 'black');

  const { pathname, push } = useRouter();

  useEffect(() => {
    getProvidersList().then(list => setProvidersList(list));
  }, []);

  const {
    user,
    openSignInMenu,
    showUpdateAvatarMenu,
    openUpdateAvatarMenu,
    closeUpdateAvatarMenu,
    showUpdateTutorMenu,
    openUpdateTutorMenu,
    closeUpdateTutorMenu,
    openEarningsMenu,
    showEarningsMenu,
    closeEarningsMenu,
  } = useContext(AuthenticatedUserContext);

  const btnRef = React.useRef(null);

  return (
    <Box
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
              <Text textTransform="capitalize" ml={2} letterSpacing="1px">
                tutoro
              </Text>
            </Flex>
          </Heading>
        </Link>
        <Show breakpoint="(max-width: 767px)">
          <Flex>
            {pathname !== '/auth-wall' && (
              <IconButton
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
                        <Link href="/users/user-profile">
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
                      ) : showEarningsMenu && user.isTutor ? (
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
                              onClick={closeEarningsMenu}
                            />
                          </Box>
                          <Box my="3">
                            <EarningsMenu />
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
                          <IconButton
                            width="100%"
                            variant="special"
                            onClick={() => openEarningsMenu()}
                            aria-label="Tutor profile page link"
                            icon={<FaDollarSign size={25} />}
                            color="white"
                            mt="2"
                          />
                          <IconButton
                            width="100%"
                            bgGradient="linear(to-l, #7928CA, #f03291)"
                            onClick={() => push('/users/tutor-profile')}
                            aria-label="Tutor profile page link"
                            icon={<FaHandsHelping size={25} />}
                            color="white"
                            mt="2"
                          />
                          <IconButton
                            width="100%"
                            aria-label="toggle website color mode"
                            backgroundColor={toogleColorModeBtnBgColor}
                            onClick={() => toggleColorMode()}
                            color={toogleColorModeBtnColor}
                            _hover={{
                              color: toogleColorModeBtnColorHover,
                              backgroundColor: toogleColorModeBtnBgColorHover,
                            }}
                            icon={
                              colorMode === 'dark' ? (
                                <FaSun size="25" />
                              ) : (
                                <FaMoon size="25" />
                              )
                            }
                          />
                        </VStack>
                      )}
                    </Flex>
                  )}
                </DrawerBody>
              </DrawerContent>
            </Drawer>
            {pathname === '/auth-wall' && (
              <IconButton
                width="100%"
                aria-label="toggle website color mode"
                backgroundColor={toogleColorModeBtnBgColor}
                onClick={() => toggleColorMode()}
                color={toogleColorModeBtnColor}
                _hover={{
                  color: toogleColorModeBtnColorHover,
                  backgroundColor: toogleColorModeBtnBgColorHover,
                }}
                icon={
                  colorMode === 'dark' ? (
                    <FaSun size="25" />
                  ) : (
                    <FaMoon size="25" />
                  )
                }
              />
            )}
          </Flex>
        </Show>
        <Show breakpoint="(min-width: 768px)">
          <HStack spacing="3" mr="3">
            {user && (
              <>
                <Link href="/users/user-profile">
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
                    variant="special"
                    icon={<FaDollarSign size="25" />}
                    onClick={() => openEarningsMenu()}
                    aria-label="Tutor profile page link"
                    mr={2}
                  />
                )}
                {user.isTutor && (
                  <>
                    <IconButton
                      variant="special"
                      width="100%"
                      icon={<FaHandsHelping size={25} />}
                      bgGradient="linear(to-l, #7928CA, #f03291)"
                      onClick={() => push('/users/tutor-profile')}
                      aria-label="Tutor profile page link"
                      _hover={{
                        boxShadow:
                          '-2.5px 2.5px 2.5px 1px rgba(0, 0, 0, 0.125)',
                        bgGradient: 'linear(to-l, #7928CA, #FF0080, )',
                      }}
                      mt="2"
                    />
                    <IconButton
                      width="100%"
                      icon={<FaListUl size="25" />}
                      variant="warning"
                      onClick={openUpdateTutorMenu}
                      aria-label="Update tutor profile"
                      mr={2}
                    />
                  </>
                )}
                <IconButton
                  icon={<FaSignOutAlt size="25" />}
                  colorScheme="gray"
                  onClick={() => signOut()}
                  aria-label="Sign out button"
                  mr={2}
                />
              </>
            )}
            {!user && pathname !== '/auth-wall' && (
              <Button
                variant="link"
                size="lg"
                mr="2"
                onClick={openSignInMenu}
                _hover={{
                  textDecoration: 'none',
                  color: colorMode === 'dark' ? 'white' : 'blackAlpha.800',
                }}
              >
                Sign In
              </Button>
            )}
            <IconButton
              backgroundColor={toogleColorModeBtnBgColor}
              color={toogleColorModeBtnColor}
              _hover={{
                boxShadow: '-2.5px 2.5px 2.5px 1px rgba(0, 0, 0, 0.125)',
                color: toogleColorModeBtnColorHover,
                backgroundColor: toogleColorModeBtnBgColorHover,
              }}
              icon={
                colorMode === 'dark' ? (
                  <FaSun size="25" />
                ) : (
                  <FaMoon size="25" />
                )
              }
              onClick={() => toggleColorMode()}
              aria-label="toggle website color mode"
            />
          </HStack>
        </Show>
      </Flex>
    </Box>
  );
};

export default Navbar;
