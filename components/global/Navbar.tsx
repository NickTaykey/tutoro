import {
  Flex,
  Heading,
  Text,
  Avatar,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Show,
  IconButton,
  Box,
  useDisclosure,
} from '@chakra-ui/react';
import { signIn, signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Logo from './Logo';
import { UserDocumentObject } from '../../models/User';
import { FaArrowRight, FaUserCircle } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import React from 'react';

const Navbar: React.FC = () => {
  const { status, data } = useSession();
  const currentUser = data?.user as UserDocumentObject;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef(null);
  return (
    <Box
      boxShadow="lg"
      rounded="md"
      bg="white"
      position="sticky"
      top={0}
      p="2"
      zIndex="200"
      width="100%"
    >
      <Flex justify="space-between" alignItems="center" width="90%" mx="auto">
        <Flex alignItems="center">
          <Logo width="80" height="80" />
          <Heading size="xl" fontFamily="itim" ml="1">
            TUTORO
          </Heading>
        </Flex>
        <Show breakpoint="(max-width: 767px)">
          <IconButton
            ref={btnRef}
            onClick={onOpen}
            size="lg"
            backgroundColor="white"
            fontSize="48"
            aria-label="navbar-hamburger"
            icon={<GiHamburgerMenu />}
          />
          <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            size="xs"
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerBody>
                {status === 'unauthenticated' && (
                  <Flex
                    alignItems="center"
                    fontWeight="bold"
                    fontSize="lg"
                    color={'blackAlpha.600'}
                    _hover={{
                      cursor: 'Pointer',
                      color: 'blackAlpha.800',
                    }}
                    justify="center"
                    direction="column"
                    height="100%"
                    onClick={() => signIn()}
                  >
                    <FaUserCircle size="40" />
                    <Text mx="2" mt="4">
                      Sign In / Sign Up
                    </Text>
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
                        Hi, {currentUser.fullname.split(' ')[0]}
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
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Show>
        <Show breakpoint="(min-width: 768px)">
          {status === 'unauthenticated' && (
            <Flex
              alignItems="center"
              fontWeight="bold"
              fontSize="lg"
              color={'blackAlpha.600'}
              _hover={{
                cursor: 'Pointer',
                color: 'blackAlpha.800',
              }}
              onClick={() => signIn()}
            >
              <FaUserCircle size="40" />
              <Text mx="2">Sign In / Sign Up</Text>
            </Flex>
          )}
          {status === 'authenticated' && (
            <Flex alignItems="center">
              <Avatar name={currentUser.fullname} src={currentUser.avatar} />
              <Link href="/users">
                <Text
                  fontWeight="bold"
                  fontSize="lg"
                  mx="2"
                  _hover={{ cursor: 'pointer' }}
                >
                  Hi, {currentUser.fullname.split(' ')[0]}
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
