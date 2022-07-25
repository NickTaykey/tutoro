import Session from '../sessions/Session';
import Review from '../reviews/Review';
import SessionsContextProvider from '../../store/SessionsProvider';
import SessionsContext from '../../store/sessions-context';
import PostsContext from '../../store/posts-context';
import PostsContextProvider from '../../store/PostsProvider';

import type { UserDocumentObject } from '../../models/User';
import type { ReviewDocumentObject } from '../../models/Review';
import type { SessionDocumentObject } from '../../models/Session';
import type { PostDocumentObject } from '../../models/Post';

import Link from 'next/link';
import Post from '../posts/Post';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Heading,
  Flex,
  Box,
  Button,
  VStack,
  useMediaQuery,
} from '@chakra-ui/react';
import { FaHandsHelping } from 'react-icons/fa';

interface Props {
  currentUser: UserDocumentObject;
}

const UserProfileView: React.FC<Props> = (props: Props) => {
  const [lowerThan690] = useMediaQuery('(max-height: 690px)');
  const [higherThan840] = useMediaQuery('(min-height: 840px)');
  const [isLandscapeWidth] = useMediaQuery('(max-width: 930px)');
  const [isLandscapeHeight] = useMediaQuery('(max-height: 500px)');
  const isXSLandscape = isLandscapeWidth && isLandscapeHeight;
  return (
    <Box width="100%" mx="auto">
      <Tabs isFitted variant="soft-rounded" colorScheme="blue">
        <TabList
          my="1em"
          width={['95%', null, '100%']}
          mx="auto"
          flexDirection={['column', 'row']}
        >
          <Tab fontSize="sm">
            ({props.currentUser.createdPosts.length}) Posts
          </Tab>
          <Tab mx="1" fontSize="sm">
            ({props.currentUser.bookedSessions.length}) Sessions
          </Tab>
          <Tab fontSize="sm">
            ({props.currentUser.createdReviews.length}) Reviews
          </Tab>
        </TabList>
        <TabPanels
          height={higherThan840 ? '65vh' : lowerThan690 ? '50vh' : '400px'}
        >
          <TabPanel height="100%" overflowY="auto">
            {props.currentUser.createdPosts.length ? (
              <PostsContextProvider posts={props.currentUser.createdPosts}>
                <PostsContext.Consumer>
                  {ctx => (
                    <VStack>
                      {ctx.posts.map((p: PostDocumentObject, i) => (
                        <Post
                          key={p._id}
                          post={p}
                          viewAsTutor={false}
                          isLatestCreated={i === 0}
                        />
                      ))}
                    </VStack>
                  )}
                </PostsContext.Consumer>
              </PostsContextProvider>
            ) : (
              <Flex justify="center" align="center" height="100%">
                <Heading as="h2" size="md" textAlign="center">
                  You dont't have any posts for now!
                </Heading>
              </Flex>
            )}
          </TabPanel>
          <TabPanel height="100%" overflowY="auto">
            {props.currentUser.bookedSessions.length ? (
              <SessionsContextProvider
                sessions={props.currentUser.bookedSessions}
              >
                <SessionsContext.Consumer>
                  {ctx => (
                    <VStack>
                      {ctx.sessions.map((s: SessionDocumentObject, i) => (
                        <Session
                          isLatestCreated={i === 0}
                          key={s._id}
                          session={s}
                          viewAsTutor={false}
                        />
                      ))}
                    </VStack>
                  )}
                </SessionsContext.Consumer>
              </SessionsContextProvider>
            ) : (
              <Flex justify="center" align="center" height="100%">
                <Heading as="h2" size="md" textAlign="center">
                  You dont't have any booked sessions for now!
                </Heading>
              </Flex>
            )}
          </TabPanel>
          <TabPanel height="100%" overflowY="auto">
            {props.currentUser.createdReviews.length ? (
              <VStack>
                {props.currentUser.createdReviews.map(
                  (r: ReviewDocumentObject) => (
                    <Box key={r._id} width="100%">
                      <Review
                        review={r}
                        deleteUserCreateReviewId={null}
                        staticView
                      />
                    </Box>
                  )
                )}
              </VStack>
            ) : (
              <Flex justify="center" align="center" height="100%">
                <Heading as="h2" size="md" textAlign="center">
                  You have written no reviews yet!
                </Heading>
              </Flex>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
      {!props.currentUser.isTutor && !isXSLandscape && (
        <Box
          my="5"
          display="flex"
          width="100%"
          position="fixed"
          bottom="0px"
          left="0px"
        >
          <Link href="/users/become-tutor">
            <Button
              boxShadow="dark-lg"
              colorScheme="pink"
              bgGradient="linear(to-l, #7928CA, #FF0080)"
              width={['calc(90% + 4px)', '95%', '80%']}
              mx="auto"
              leftIcon={<FaHandsHelping size={25} />}
              textTransform="uppercase"
            >
              Become a tutor
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default UserProfileView;
