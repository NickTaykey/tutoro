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
import {
  FaListUl,
  FaRegTimesCircle,
  FaRegUserCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { getProviders, useSession } from 'next-auth/react';

import type { ClientSafeProvider, LiteralUnion } from 'next-auth/react';

import { FcGoogle } from 'react-icons/fc';
import { GoThreeBars } from 'react-icons/go';
import { BuiltInProviderType } from 'next-auth/providers';
import UpdateAvatarForm from '../users/UpdateAvatarForm';
import UpdateTutorForm from '../tutors/UpdateTutorForm';

type ProvidersList = Record<
  LiteralUnion<BuiltInProviderType, string>,
  ClientSafeProvider
>;

const Navbar: React.FC = () => {
  const { status, data } = useSession();
  const [providersList, setProvidersList] = useState<ProvidersList | null>(
    null
  );
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
  const [showDefaultAvatar, setShowDefaultAvatar] = useState<boolean>(false);

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
    isOpen: isAuthModalOpen,
    onOpen: onAuthModalOpen,
    onClose: onAuthModalClose,
  } = useDisclosure();
  const {
    isOpen: isUpdateProfileModalOpen,
    onOpen: onUpdateProfileModalOpen,
    onClose: onUpdateProfileModalClose,
  } = useDisclosure();
  const {
    isOpen: viewUpdateAvatarForm,
    onOpen: showUpdateAvatarForm,
    onClose: hideUpdateAvatarForm,
  } = useDisclosure({ defaultIsOpen: false });
  const btnRef = React.useRef(null);

  const currentUserObject = currentUser as UserDocumentObject;
  const public_id = currentUserObject?.avatar?.public_id;
  const showResetAvatarBtn =
    !showDefaultAvatar &&
    ((!!newAvatarUrl && !public_id) ||
      (!newAvatarUrl && !!public_id) ||
      (!!newAvatarUrl && !!public_id));

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
            size="full"
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
                    <Link href="/users">
                      <Avatar
                        name={currentUser.fullname}
                        src={
                          showDefaultAvatar
                            ? ''
                            : newAvatarUrl
                            ? newAvatarUrl
                            : currentUser.avatar?.url
                        }
                        _hover={{ cursor: 'pointer' }}
                        mb="2"
                      />
                    </Link>
                    {viewUpdateAvatarForm ? (
                      <Flex
                        direction="column"
                        shadow="md"
                        borderWidth="1px"
                        borderRadius="md"
                        p="6"
                        width="100%"
                        mt={[2, 0]}
                      >
                        <FaRegTimesCircle
                          size="25"
                          onClick={hideUpdateAvatarForm}
                          style={{ alignSelf: 'end' }}
                        />
                        <Box my="3">
                          <UpdateAvatarForm
                            showResetAvatarBtn={showResetAvatarBtn}
                            setShowDefaultAvatar={setShowDefaultAvatar}
                            setNewAvatarUrl={setNewAvatarUrl}
                            closeUpdateAvatarModal={onUpdateProfileModalClose}
                          />
                        </Box>
                      </Flex>
                    ) : (
                      <>
                        <IconButton
                          width="100%"
                          icon={<FaRegUserCircle size="25" />}
                          colorScheme="cyan"
                          color="white"
                          onClick={showUpdateAvatarForm}
                          aria-label="Update avatar"
                          mt="2"
                        />
                        {currentUser.isTutor && (
                          <IconButton
                            width="100%"
                            icon={<FaListUl size="25" />}
                            colorScheme="orange"
                            onClick={showUpdateAvatarForm}
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
                      </>
                    )}
                  </Flex>
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Show>
        <Show breakpoint="(min-width: 768px)">
          {providersList && (
            <>
              <Modal
                isOpen={isAuthModalOpen}
                onClose={onAuthModalClose}
                isCentered
              >
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
                    onClick={onAuthModalOpen}
                    _hover={{ textDecoration: 'none', color: 'blackAlpha.800' }}
                  >
                    Sign In
                  </Button>
                </Flex>
              )}
            </>
          )}
          {status === 'authenticated' && (
            <>
              <Modal
                blockScrollOnMount={false}
                isOpen={viewUpdateAvatarForm}
                onClose={hideUpdateAvatarForm}
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Choose another avatar!</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <UpdateAvatarForm
                      showResetAvatarBtn={showResetAvatarBtn}
                      setShowDefaultAvatar={setShowDefaultAvatar}
                      setNewAvatarUrl={setNewAvatarUrl}
                      closeUpdateAvatarModal={hideUpdateAvatarForm}
                    />
                  </ModalBody>
                </ModalContent>
              </Modal>
              {currentUser.isTutor && (
                <Modal
                  blockScrollOnMount={false}
                  isOpen={isUpdateProfileModalOpen}
                  onClose={onUpdateProfileModalClose}
                >
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Update your tutor profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <UpdateTutorForm />
                    </ModalBody>
                  </ModalContent>
                </Modal>
              )}
              <Flex alignItems="center">
                <Link href="/users">
                  <Avatar
                    mr="2"
                    name={currentUser.fullname}
                    src={
                      showDefaultAvatar
                        ? ''
                        : newAvatarUrl
                        ? newAvatarUrl
                        : currentUser.avatar?.url
                    }
                    _hover={{ cursor: 'pointer' }}
                  />
                </Link>
                <IconButton
                  icon={<FaRegUserCircle size="25" />}
                  colorScheme="cyan"
                  color="white"
                  onClick={showUpdateAvatarForm}
                  aria-label="Update avatar"
                  mr={2}
                />
                {currentUser.isTutor && (
                  <IconButton
                    width="100%"
                    icon={<FaListUl size="25" />}
                    colorScheme="orange"
                    onClick={onUpdateProfileModalOpen}
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
              </Flex>
            </>
          )}
        </Show>
      </Flex>
    </Box>
  );
};

export default Navbar;
