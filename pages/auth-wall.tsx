import { Flex, Heading, Button, Text } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { ClientSafeProvider, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';
import { FcGoogle } from 'react-icons/fc';
import AuthenticatedUserContext from '../store/authenticated-user-context';
import getProvidersList from '../utils/get-providers';

const AuthWallPage: NextPage = () => {
  const [providersList, setProvidersList] = useState<ClientSafeProvider[]>([]);
  const { user } = useContext(AuthenticatedUserContext);
  const { replace } = useRouter();

  useEffect(() => {
    getProvidersList().then(list => setProvidersList(list));
  }, []);

  useEffect(() => {
    if (user) replace('/users/user-profile');
  }, [user, replace]);

  return (
    <Flex
      height="80vh"
      width={['90%', null, '30%']}
      direction="column"
      justify="center"
      mx="auto"
    >
      <Heading as="h1" size="md" textAlign="center" my="4">
        {providersList.length ? 'Sign In' : '500 Unexpected server error'}
      </Heading>
      {!providersList.length && (
        <Text textAlign="center">
          Authentication not working please contact us
        </Text>
      )}
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
  );
};

export default AuthWallPage;
