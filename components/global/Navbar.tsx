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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Button,
} from '@chakra-ui/react';
import { signIn, signOut } from 'next-auth/react';
import { UserDocumentObject } from '../../models/User';
import { FaArrowRight, FaBars } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { getProviders, useSession } from 'next-auth/react';

import type { ClientSafeProvider, LiteralUnion } from 'next-auth/react';

import { FcGoogle } from 'react-icons/fc';
import { GoThreeBars } from 'react-icons/go';
import { BuiltInProviderType } from 'next-auth/providers';

type ProvidersList = Record<
  LiteralUnion<BuiltInProviderType, string>,
  ClientSafeProvider
>;

const Navbar: React.FC = () => {
  const { status, data } = useSession();
  const [providersList, setProvidersList] = useState<ProvidersList | null>(
    null
  );

  useEffect(() => {
    getProviders().then((list: ProvidersList | null) => setProvidersList(list));
  }, [getProviders]);

  const currentUser = data?.user as UserDocumentObject;
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
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
          >
            <Flex alignItems="center">
              <Logo width={60} height={60} />
              <Text textTransform="uppercase" ml={2}>
                tutoro
              </Text>
            </Flex>
          </Heading>
        </Link>
        <Show breakpoint="(max-width: 767px)">
          <IconButton
            ref={btnRef}
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
            size="xs"
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerBody>
                {status === 'unauthenticated' && providersList && (
                  <Flex height="100%" direction="column" justify="center">
                    <Heading as="h1" size="md" textAlign="center" my="4">
                      Sign In
                    </Heading>
                    {Object.values(providersList).map(
                      (provider: ClientSafeProvider) => {
                        return (
                          <Button
                            width="100%"
                            key={provider.name}
                            leftIcon={<FcGoogle size="30" />}
                            aria-label="Google OAuth Icon"
                            onClick={() => signIn(provider.id)}
                          >
                            Google
                          </Button>
                        );
                      }
                    )}
                  </Flex>
                )}
                {status === 'authenticated' && (
                  <Flex
                    alignItems="center"
                    justify="center"
                    direction="column"
                    height="100%"
                  >
                    <Avatar
                      name={currentUser.fullname}
                      src={currentUser.avatar}
                    />
                    <Link href="/users">
                      <Text
                        fontWeight="bold"
                        fontSize="lg"
                        mx="2"
                        _hover={{ cursor: 'pointer' }}
                        my="4"
                      >
                        Hi, {currentUser?.fullname?.split(' ')[0]}
                      </Text>
                    </Link>
                    <Button
                      rightIcon={<FaArrowRight />}
                      colorScheme="gray"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </Flex>
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Show>
        <Show breakpoint="(min-width: 768px)">
          {providersList && (
            <>
              <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                  <ModalCloseButton />
                  <ModalHeader textAlign="center">
                    Sign In to Tutoro
                  </ModalHeader>
                  <ModalBody mb="5">
                    {Object.values(providersList).map(
                      (provider: ClientSafeProvider) => {
                        return (
                          <Button
                            width="100%"
                            key={provider.name}
                            leftIcon={<FcGoogle size="30" />}
                            aria-label="Google OAuth Icon"
                            onClick={() => signIn(provider.id)}
                          >
                            Google
                          </Button>
                        );
                      }
                    )}
                  </ModalBody>
                </ModalContent>
              </Modal>
              {status === 'unauthenticated' && (
                <Flex alignItems="center" mr="4">
                  <Button
                    variant="link"
                    size="lg"
                    onClick={onModalOpen}
                    _hover={{ textDecoration: 'none', color: 'blackAlpha.800' }}
                  >
                    Sign In
                  </Button>
                </Flex>
              )}
            </>
          )}
          {status === 'authenticated' && (
            <Flex alignItems="center" mr={4}>
              <Avatar name={currentUser.fullname} src={currentUser.avatar} />
              <Link href="/users">
                <Text
                  fontWeight="bold"
                  fontSize="lg"
                  mx="2"
                  _hover={{ cursor: 'pointer' }}
                >
                  Hi, {currentUser?.fullname?.split(' ')[0]}
                </Text>
              </Link>
              <Button
                rightIcon={<FaArrowRight />}
                colorScheme="gray"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </Flex>
          )}
        </Show>
      </Flex>
    </Box>
  );
};

export default Navbar;
