import AuthenticatedUserContext from '../../../store/authenticated-user-context';
import { GiHamburgerMenu } from 'react-icons/gi';
import { signOut } from 'next-auth/react';
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import * as c from '@chakra-ui/react';
import * as fa from 'react-icons/fa';
import Brand from './Brand';

const Navbar: React.FC = () => {
  const { push } = useRouter();

  const {
    user,
    openSignInMenu,
    openDeleteAccountMenu,
    openEarningsMenu,
    openUpdateAvatarMenu,
    openUpdateTutorMenu,
  } = useContext(AuthenticatedUserContext);

  const { colorMode, toggleColorMode } = c.useColorMode();

  return (
    <c.Box
      as="nav"
      boxShadow="lg"
      rounded="md"
      position="fixed"
      right="0"
      left="0"
      zIndex="200"
      top="0"
      p="2"
      borderRadius="none"
      backgroundColor={colorMode === 'dark' ? 'gray.700' : 'white'}
      width="100%"
    >
      <c.Flex justify="space-between" alignItems="center">
        <c.Heading
          size="xl"
          fontFamily="itim"
          ml="1"
          _hover={{ cursor: 'pointer' }}
          style={{ fontFamily: 'Inter', fontWeight: '500' }}
        >
          <c.Flex alignItems="center">
            <c.Box onClick={() => push('/')}>
              <Brand width={45} height={45} />
            </c.Box>
            <c.Text
              textTransform="capitalize"
              ml={2}
              letterSpacing="1px"
              onClick={() => push('/tutors')}
            >
              tutoro
            </c.Text>
          </c.Flex>
        </c.Heading>
        <c.Menu>
          <c.MenuButton
            as={c.IconButton}
            aria-label="Options"
            icon={<GiHamburgerMenu size="30" />}
            variant="link"
          />
          <c.MenuList>
            {user ? (
              <>
                <c.MenuGroup title="User profile">
                  <c.MenuItem
                    width="100%"
                    icon={<fa.FaRegUserCircle size="25" />}
                    onClick={() => push('/users/user-profile')}
                  >
                    Profile page
                  </c.MenuItem>
                  <c.MenuItem
                    icon={
                      <c.Avatar
                        src={user.avatar?.url}
                        name={user.fullname}
                        size="xs"
                        boxShadow="none"
                      />
                    }
                    onClick={() => openUpdateAvatarMenu()}
                  >
                    Update avatar
                  </c.MenuItem>
                </c.MenuGroup>
                <c.MenuDivider />
                {user.isTutor && (
                  <>
                    <c.MenuGroup title="Tutor profile">
                      <c.MenuItem
                        width="100%"
                        icon={<fa.FaHandsHelping size="25" />}
                        onClick={() => push('/users/tutor-profile')}
                      >
                        Profile page
                      </c.MenuItem>
                      <c.MenuItem
                        icon={<fa.FaListUl size="25" />}
                        onClick={openUpdateTutorMenu}
                      >
                        Update info
                      </c.MenuItem>
                      <c.MenuItem
                        icon={<fa.FaDollarSign size="25" />}
                        onClick={openEarningsMenu}
                      >
                        Earnings
                      </c.MenuItem>
                    </c.MenuGroup>
                    <c.MenuDivider />
                  </>
                )}
                <c.MenuGroup title="Settings">
                  <c.MenuItem
                    icon={<fa.FaTrash size="25" />}
                    onClick={openDeleteAccountMenu}
                  >
                    Delete Account
                  </c.MenuItem>
                  <c.MenuItem
                    icon={<fa.FaSignOutAlt size="25" />}
                    onClick={() => signOut()}
                  >
                    Logout
                  </c.MenuItem>
                </c.MenuGroup>
              </>
            ) : (
              <c.MenuItem
                onClick={openSignInMenu}
                icon={<fa.FaUserCheck size="25" />}
              >
                Sign In
              </c.MenuItem>
            )}
            <c.MenuItem
              onClick={toggleColorMode}
              icon={
                colorMode === 'dark' ? (
                  <fa.FaSun size="25" />
                ) : (
                  <fa.FaMoon size="25" />
                )
              }
            >
              {colorMode === 'dark' ? 'Light' : 'Dark'}
            </c.MenuItem>
          </c.MenuList>
        </c.Menu>
      </c.Flex>
    </c.Box>
  );
};

export default Navbar;
