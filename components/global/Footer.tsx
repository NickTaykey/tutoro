import { Divider, Flex, Text, Box } from '@chakra-ui/react';

const Footer: React.FC = () => (
  <Box as="footer" alignItems="center" width="100%" mt="10" mx="auto">
    <Divider orientation="horizontal" borderTopWidth="1px" />
    <Flex justify="center" alignItems="center" height="5vh" my="5">
      <Text textAlign="center">
        Copyright © 2022 Niccolò Toccane - founder of Tutoro - All rights
        reserved.
      </Text>
    </Flex>
  </Box>
);

export default Footer;
