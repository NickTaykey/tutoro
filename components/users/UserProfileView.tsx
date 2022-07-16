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
} from '@chakra-ui/react';
import { FaHandsHelping } from 'react-icons/fa';

interface Props {
  currentUser: UserDocumentObject;
}

const UserProfileView: React.FC<Props> = (props: Props) => {
  return (
    <Box width={['100%', null, '80%']} mx="auto">
      <Tabs isFitted variant="soft-rounded" colorScheme="blue">
        <TabList mb="1em" width="95%" mx="auto">
          <Tab fontSize="sm">My posts</Tab>
          <Tab mx="1" fontSize="sm">
            My sessions
          </Tab>
          <Tab fontSize="sm">My reviews</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {props.currentUser.createdPosts.length ? (
              <PostsContextProvider posts={props.currentUser.createdPosts}>
                <PostsContext.Consumer>
                  {ctx => (
                    <VStack>
                      {ctx.posts.map((p: PostDocumentObject) => (
                        <Post key={p._id} post={p} viewAsTutor={false} />
                      ))}
                    </VStack>
                  )}
                </PostsContext.Consumer>
              </PostsContextProvider>
            ) : (
              <Flex justify="center" align="center" height="50vh">
                <Heading as="h2" size="md">
                  You dont't have any posts for now!
                </Heading>
              </Flex>
            )}
          </TabPanel>
          <TabPanel>
            {props.currentUser.bookedSessions.length ? (
              <SessionsContextProvider
                sessions={props.currentUser.bookedSessions}
              >
                <SessionsContext.Consumer>
                  {ctx => (
                    <VStack>
                      {ctx.sessions.map((s: SessionDocumentObject) => (
                        <Session key={s._id} session={s} viewAsTutor={false} />
                      ))}
                    </VStack>
                  )}
                </SessionsContext.Consumer>
              </SessionsContextProvider>
            ) : (
              <Flex justify="center" align="center" height="50vh">
                <Heading as="h2" size="md">
                  You dont't have any booked sessions for now!
                </Heading>
              </Flex>
            )}
          </TabPanel>
          <TabPanel>
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
          </TabPanel>
        </TabPanels>
      </Tabs>
      {!props.currentUser.isTutor && (
        <Box
          my="5"
          display="flex"
          width={['100%', null, '80%']}
          position="fixed"
          bottom="0px"
        >
          <Button
            boxShadow="dark-lg"
            colorScheme="pink"
            bgGradient="linear(to-l, #7928CA, #FF0080)"
            width="95%"
            mx="auto"
            leftIcon={<FaHandsHelping size={25} />}
            textTransform="uppercase"
          >
            <Link href="/users/become-tutor">Become a tutor</Link>
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UserProfileView;
