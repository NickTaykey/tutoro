import * as c from '@chakra-ui/react';

const Card: React.FC<{
  heading: string;
  text: string;
  iconGroup: React.ReactNode;
}> = props => {
  const headingColor = c.useColorModeValue('gray.800', 'white');
  const textColor = c.useColorModeValue('gray.500', 'gray.300');
  const borderColor = c.useColorModeValue('gray.200', 'gray.500');
  return (
    <c.Flex
      _hover={{ cursor: 'pointer' }}
      boxShadow="lg"
      p="5"
      borderRadius="xl"
      borderColor={borderColor}
      borderWidth="2px"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      direction="column"
    >
      {props.iconGroup}
      <c.Heading
        as="h3"
        size="lg"
        textAlign="center"
        fontWeight="medium"
        my="5"
        color={headingColor}
      >
        {props.heading}
      </c.Heading>
      <c.Text
        textAlign="center"
        color={textColor}
        lineHeight="1.75"
        width="90%"
        mx="auto"
      >
        {props.text}
      </c.Text>
    </c.Flex>
  );
};

export default Card;
