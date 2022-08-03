import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const Footer: React.FC = () => {
  const { pathname } = useRouter();
  return (
    <Box as="footer">
      {pathname === '/tutors' && (
        <>
          <Divider orientation="horizontal" borderTopWidth="1px" />
          <Flex justify="center" alignItems="center">
            <Text textAlign="center" m="3">
              Copyright © 2022 Niccolò Toccane - founder of Tutoro - All rights
              reserved.
            </Text>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Footer;
