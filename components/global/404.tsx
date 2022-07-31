import { Flex, Center, Heading } from '@chakra-ui/react';
import illustration from '../../public/images/404-illustration.png';
import Image from 'next/image';

interface Props {
  message: string;
}

const Banner: React.FC<Props> = ({ message }) => (
  <Center>
    <Flex height="50vh" justify="center" direction="column">
      <Heading
        as="h1"
        size="3xl"
        my="10"
        fontFamily="Inter"
        fontWeight="normal"
        letterSpacing="1px"
        textShadow="-5px 5px 5px rgba(0, 0, 0, 0.25)"
      >
        404 {message}
      </Heading>
      <Image src={illustration} alt="404 error illustration" />
    </Flex>
  </Center>
);

export default Banner;
