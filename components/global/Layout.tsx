import Navbar from './navbar/Navbar';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import AuthenticatedUserProvider from '../../store/AuthenticatedUserProvider';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import type { UserDocumentObject } from '../../models/User';

const Layout: React.FC<{ children: React.ReactNode[] | React.ReactNode }> = ({
  children,
}) => {
  const { status, data } = useSession();
  const { pathname } = useRouter();
  return status !== 'loading' ? (
    <AuthenticatedUserProvider
      user={
        status === 'unauthenticated' ? null : (data?.user as UserDocumentObject)
      }
    >
      <Navbar />
      <Box m={0} mt={pathname !== '/' ? 100 : 0} height="auto">
        {children}
      </Box>
    </AuthenticatedUserProvider>
  ) : (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="80vh"
      direction="column"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
        mb="5"
      />
    </Flex>
  );
};

export default Layout;
