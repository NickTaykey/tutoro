import { Flex, Center, Heading, Box, Button } from '@chakra-ui/react';
import illustration from '../../public/images/404-illustration.png';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface Props {
  message: string;
}

const Banner: React.FC<Props> = ({ message }) => {
  const { replace } = useRouter();
  return (
    <Center>
      <Flex height="80vh" justify="center" direction="column">
        <Heading
          as="h1"
          size="2xl"
          fontFamily="Ubuntu"
          fontWeight="400"
          letterSpacing="2px"
          textAlign="center"
        >
          404 {message}
        </Heading>
        <Box mx="2">
          <Image src={illustration} alt="404 error illustration" />
        </Box>
        <Button
          variant="cta"
          width="90%"
          mx="auto"
          onClick={() => replace('/tutors')}
        >
          Checkout other tutors
        </Button>
      </Flex>
    </Center>
  );
};

export default Banner;
