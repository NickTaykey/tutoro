import Navbar from './navbar/Navbar';
import { Box, Flex, Heading, Spinner } from '@chakra-ui/react';
import AuthenticatedUserProvider from '../../store/AuthenticatedUserProvider';
import { useSession } from 'next-auth/react';
import type { UserDocumentObject } from '../../models/User';
import Footer from './Footer';
import { useRouter } from 'next/router';

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
      <Box mb={!pathname.includes('/users') ? 10 : 0} my={5}>
        {children}
      </Box>
      <Footer />
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
      <Heading as="h1" size="xl">
        Loading
      </Heading>
    </Flex>
  );
};

export default Layout;
