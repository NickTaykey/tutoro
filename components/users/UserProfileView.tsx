import SessionsContextProvider from '../../store/SessionsProvider';
import PostsContextProvider from '../../store/PostsProvider';
import SessionsContext from '../../store/sessions-context';
import PostsContext from '../../store/posts-context';
import sdk from '../../utils/ably-config';
import Session from '../sessions/Session';
import Review from '../reviews/Review';

import type { SessionDocumentObject } from '../../models/Session';
import type { ReviewDocumentObject } from '../../models/Review';
import type { UserDocumentObject } from '../../models/User';
import type { PostDocumentObject } from '../../models/Post';

import { FaHandsHelping } from 'react-icons/fa';
import * as c from '@chakra-ui/react';
import Post from '../posts/Post';
import { useMemo } from 'react';
import Link from 'next/link';

interface Props {
  currentUser: UserDocumentObject;
  errorAlert: string | null;
  successAlert: string | null;
  setSuccessAlert(alertContent: string | null): void;
  setErrorAlert(alertContent: string | null): void;
}

const UserProfileView: React.FC<Props> = (props: Props) => {
  const [lowerThan690] = c.useMediaQuery('(max-height: 690px)');
  const [higherThan840] = c.useMediaQuery('(min-height: 840px)');
  const [isLandscapeWidth] = c.useMediaQuery('(max-width: 930px)');
  const [isLandscapeHeight] = c.useMediaQuery('(max-height: 500px)');
  const isXSLandscape = isLandscapeWidth && isLandscapeHeight;

  const channel = useMemo(() => {
    const channel = sdk.channels.get(
      `notifications-user-${props.currentUser._id}`
    );
    channel.attach();
    return channel;
  }, [props.currentUser._id]);

  const unSelectedTabColor = c.useColorModeValue('gray.600', 'white');

  return (
    <c.Box width="100%" mx="auto">
      <c.Tabs isFitted variant="soft-rounded" colorScheme="blue">
        <c.TabList
          my="1em"
          width={['95%', null, '100%']}
          mx="auto"
          flexDirection={['column', 'row']}
        >
          <c.Tab fontSize="sm" color={unSelectedTabColor}>
            ({props.currentUser.createdPosts.length}) Posts
          </c.Tab>
          <c.Tab mx="1" fontSize="sm" color={unSelectedTabColor}>
            ({props.currentUser.bookedSessions.length}) Sessions
          </c.Tab>
          <c.Tab fontSize="sm" color={unSelectedTabColor}>
            ({props.currentUser.createdReviews.length}) Reviews
          </c.Tab>
        </c.TabList>
        <c.TabPanels
          height={
            higherThan840
              ? props.errorAlert || props.successAlert
                ? '55vh'
                : '60vh'
              : lowerThan690
              ? '45vh'
              : '400px'
          }
        >
          <c.TabPanel height="100%" overflowY="auto">
            {props.currentUser.createdPosts.length ? (
              <PostsContextProvider posts={props.currentUser.createdPosts}>
                <PostsContext.Consumer>
                  {ctx => (
                    <c.VStack>
                      {ctx.posts.map((p: PostDocumentObject, i) => (
                        <Post
                          userChannel={channel}
                          key={p._id}
                          post={p}
                          viewAsTutor={false}
                          isLatestCreated={i === 0}
                          setSuccessAlert={props.setSuccessAlert}
                        />
                      ))}
                    </c.VStack>
                  )}
                </PostsContext.Consumer>
              </PostsContextProvider>
            ) : (
              <c.Flex justify="center" align="center" height="100%">
                <c.Heading as="h2" size="md" textAlign="center">
                  You have no posts for now!
                </c.Heading>
              </c.Flex>
            )}
          </c.TabPanel>
          <c.TabPanel height="100%" overflowY="auto">
            {props.currentUser.bookedSessions.length ? (
              <SessionsContextProvider
                sessions={props.currentUser.bookedSessions}
              >
                <SessionsContext.Consumer>
                  {ctx => (
                    <c.VStack>
                      {ctx.sessions.map((s: SessionDocumentObject, i) => (
                        <Session
                          userChannel={channel}
                          isLatestCreated={i === 0}
                          key={s._id}
                          session={s}
                          viewAsTutor={false}
                        />
                      ))}
                    </c.VStack>
                  )}
                </SessionsContext.Consumer>
              </SessionsContextProvider>
            ) : (
              <c.Flex justify="center" align="center" height="100%">
                <c.Heading as="h2" size="md" textAlign="center">
                  You have no booked sessions for now!
                </c.Heading>
              </c.Flex>
            )}
          </c.TabPanel>
          <c.TabPanel height="100%" overflowY="auto">
            {props.currentUser.createdReviews.length ? (
              <c.VStack>
                {props.currentUser.createdReviews.map(
                  (r: ReviewDocumentObject) => (
                    <c.Box key={r._id} width="100%">
                      <Review review={r} staticView />
                    </c.Box>
                  )
                )}
              </c.VStack>
            ) : (
              <c.Flex justify="center" align="center" height="100%">
                <c.Heading as="h2" size="md" textAlign="center">
                  You have written no reviews yet!
                </c.Heading>
              </c.Flex>
            )}
          </c.TabPanel>
        </c.TabPanels>
      </c.Tabs>
      {!props.currentUser.isTutor && !isXSLandscape && (
        <c.Box
          my="5"
          display="flex"
          width="100%"
          position="fixed"
          bottom="0px"
          left="0px"
        >
          <Link href="/users/become-tutor">
            <c.Button variant="cta" leftIcon={<FaHandsHelping size={25} />}>
              Become a tutor
            </c.Button>
          </Link>
        </c.Box>
      )}
    </c.Box>
  );
};

export default UserProfileView;
