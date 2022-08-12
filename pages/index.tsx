import Illustration from '../components/landing/Illustration';
import { GoDeviceDesktop, GoPerson } from 'react-icons/go';
import LandingStyles from '../styles/Landing.module.css';
import { RiFilePaper2Fill } from 'react-icons/ri';
import Footer from '../components/global/Footer';
import Card from '../components/landing/Card';
import { useRouter } from 'next/router';
import * as c from '@chakra-ui/react';
import * as fa from 'react-icons/fa';
import { NextPage } from 'next';

const LandingPage: NextPage = () => {
  const { push } = useRouter();

  const bgGradient = c.useColorModeValue(
    'linear-gradient(to right, #12c2e9, #c471ed, #f64f59)',
    'linear-gradient(to right, #f64f59, #1565c9)'
  );

  const [isLargerThan768] = c.useMediaQuery('(min-width: 768px)');
  const [isSmallerThan380] = c.useMediaQuery('(max-width: 380px)');
  const [isSmallerThan1000] = c.useMediaQuery('(max-width: 1000px)');
  const [isSmallerThan450] = c.useMediaQuery('(max-height: 450px)');
  const isInLandscape = isSmallerThan1000 && isSmallerThan450;
  const headingColor = c.useColorModeValue('gray.800', 'white');
  const textColor = c.useColorModeValue('gray.500', 'gray.300');

  const illustrationSize = isInLandscape
    ? '250px'
    : isLargerThan768
    ? '500px'
    : isSmallerThan380
    ? '200px'
    : '250px';

  const textShadow = '-2px 2px 2px rgba(0, 0, 0, 0.3)';

  return (
    <>
      <c.Flex height="100vh" alignItems="center">
        <c.Flex
          width="100%"
          alignItems="center"
          mt={isSmallerThan380 ? '60px' : isInLandscape ? '65px' : 0}
        >
          <c.Grid
            templateRows="repeat(2, 1fr)"
            templateColumns="repeat(2, 1fr)"
            borderRadius="200px 50px 200px 50px"
            height={['80vh', null, '75vh']}
            width="95%"
            mx="auto"
            bgGradient={bgGradient}
            p="5"
          >
            <c.GridItem
              colSpan={[2, isInLandscape ? 1 : 2, isInLandscape ? 1 : null, 1]}
              rowSpan={[1, isInLandscape ? 2 : 1, isInLandscape ? 2 : null, 2]}
              display="flex"
              width="100%"
              justifyContent="center"
            >
              <c.Flex
                id={LandingStyles.hero}
                width="100%"
                direction="column"
                align="center"
                justify="center"
              >
                <c.Heading
                  as="h1"
                  size={isInLandscape ? 'xl' : isSmallerThan380 ? '3xl' : '4xl'}
                  color="white"
                  textTransform="uppercase"
                  fontWeight="medium"
                  textShadow={textShadow}
                >
                  Tutoro
                </c.Heading>
                <c.Heading
                  as="h2"
                  size="md"
                  fontWeight="normal"
                  mt="5"
                  color="gray.50"
                  textShadow={textShadow}
                >
                  Book tutoring sessions
                </c.Heading>
                <c.Heading
                  as="h2"
                  size="md"
                  fontWeight="normal"
                  mt="5"
                  color="gray.50"
                  textShadow={textShadow}
                >
                  Review your homework
                </c.Heading>
                <c.Button
                  variant="cta"
                  width={['90%', null, '45%']}
                  mt="5"
                  mb={[5, null, null, 0]}
                  onClick={() => push('/tutors')}
                >
                  Join now
                </c.Button>
              </c.Flex>
            </c.GridItem>
            <c.GridItem
              colSpan={[2, isInLandscape ? 1 : 2, isInLandscape ? 1 : null, 1]}
              rowSpan={[1, null, isInLandscape ? 2 : null, 2]}
            >
              <Illustration size={illustrationSize} />
            </c.GridItem>
          </c.Grid>
        </c.Flex>
      </c.Flex>
      <c.Flex alignItems="center" direction="column">
        <c.Heading
          as="h2"
          size="2xl"
          fontWeight="medium"
          mb="10"
          color={headingColor}
        >
          What is Tutoro?
        </c.Heading>
        <c.Text
          width={['85%', '95%']}
          mx="auto"
          textAlign="justify"
          mb="10"
          fontSize="xl"
          lineHeight="1.75"
          color={textColor}
        >
          Tutor is a platform where students and teachers who want to do
          tutoring in their spare time can find people who are looking for them.
          Tutoro enables users to book tutoring sessions with their favorite
          tutors. Moreover, it allows tutors to expand their service further
          more, thanks to Posts. These enables Tutors to answer specific
          questions or review users homework. Posts do not target only specific
          tutors, in fact Tutoro allows users to create posts which are received
          by every tutor. In this way posts are reviewed and answered much more
          quickly.
        </c.Text>
        <c.Grid
          height="100%"
          width="95%"
          mx="auto"
          columnGap="5"
          rowGap="5"
          templateRows="repeat(6, 1fr)"
          templateColumns="repeat(3, 1fr)"
        >
          <c.GridItem colSpan={[3, null, null, 1]} rowSpan={[1, null, null, 3]}>
            <Card
              heading="Our tutors next to your door"
              text="Tutoro enables you to book school tutoring sessions with qualified
              teachers living near you."
              iconGroup={
                <fa.FaHome size="50" color="var(--chakra-colors-special)" />
              }
            />
          </c.GridItem>
          <c.GridItem colSpan={[3, null, null, 1]} rowSpan={[1, null, null, 3]}>
            <Card
              heading="Remotely or in person?"
              text="Have your tutoring sessions in person or remotely with Tutoro
            built-in video conference service."
              iconGroup={
                <c.Flex>
                  <GoPerson
                    size="50"
                    color="var(--chakra-colors-special)"
                    style={{ marginRight: '15px' }}
                  />
                  <GoDeviceDesktop
                    size="50"
                    color="var(--chakra-colors-special)"
                  />
                </c.Flex>
              }
            />
          </c.GridItem>
          <c.GridItem colSpan={[3, null, null, 1]} rowSpan={[1, null, null, 3]}>
            <Card
              heading="Troubles with some homework?"
              text="You can create a Post about a specific subject, asking questions
            and providing attachments related to your homework. Our qualified
            tutors will examine your post and answer it as soon possible. You
            can also create a Post to have a specific question answered."
              iconGroup={
                <RiFilePaper2Fill
                  size="50"
                  color="var(--chakra-colors-special)"
                />
              }
            />
          </c.GridItem>
          <c.GridItem colSpan={[3, null, null, 1]} rowSpan={[1, null, null, 3]}>
            <Card
              heading="Don't know any Tutor?"
              text="Create a global Post to receive an answer as quickly as possible
            by one of our available tutors. Bear in mind that if you ask a
            specific Tutor you might wait more before receiving your answer."
              iconGroup={
                <fa.FaGlobe size="50" color="var(--chakra-colors-special)" />
              }
            />
          </c.GridItem>
          <c.GridItem colSpan={[3, null, null, 1]} rowSpan={[1, null, null, 3]}>
            <Card
              heading="Your review let us improve"
              text="Your feedback in very precious both for our tutors and for our
            platform to improve."
              iconGroup={
                <c.Flex>
                  <fa.FaStar
                    size="50"
                    color="var(--chakra-colors-special)"
                    style={{ marginRight: '15px' }}
                  />
                  <fa.FaStarHalfAlt
                    size="50"
                    color="var(--chakra-colors-special)"
                    style={{ marginRight: '15px' }}
                  />
                </c.Flex>
              }
            />
          </c.GridItem>
          <c.GridItem colSpan={[3, null, null, 1]} rowSpan={[1, null, null, 3]}>
            <Card
              heading="Are you able to be a tutor?"
              text="If you are someone who can offer his help to students in their
            learning journey you would be a perfect Tutor for us."
              iconGroup={
                <fa.FaDollarSign
                  size="50"
                  color="var(--chakra-colors-special)"
                  style={{ marginRight: '15px' }}
                />
              }
            />
          </c.GridItem>
        </c.Grid>
      </c.Flex>
      <Footer />
    </>
  );
};

export default LandingPage;
