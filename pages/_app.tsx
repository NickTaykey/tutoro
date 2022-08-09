import '../styles/react-datepicker.css';
import '../styles/globals.css';
import '../styles/fonts.css';

import type { AppProps } from 'next/app';

import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';
import Layout from '../components/global/Layout';
import theme from '../theme';
import Head from 'next/head';

import { configureAbly } from '@ably-labs/react-hooks';

const prefix = process.env.NEXT_PUBLIC_API_ROOT || '';
const clientId =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

configureAbly({
  authUrl: `${prefix}/api/createTokenRequest?clientId=${clientId}`,
  clientId: clientId,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Tutoro</title>
      </Head>
      <ChakraProvider theme={theme}>
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
