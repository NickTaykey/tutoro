import '../styles/globals.css';
import '../styles/fonts.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import '../styles/react-datepicker.css';
import Layout from '../components/global/Layout';
import theme from '../theme';

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
