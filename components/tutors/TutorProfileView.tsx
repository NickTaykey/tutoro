import Session from '../sessions/Session';
import Review from '../reviews/Review';
import Post from '../posts/Post';
import SessionsContextProvider from '../../store/SessionsProvider';
import SessionsContext from '../../store/sessions-context';
import type { UserDocumentObject } from '../../models/User';
import type { SessionDocumentObject } from '../../models/Session';
import type { ReviewDocumentObject } from '../../models/Review';
import type { PostDocumentObject } from '../../models/Post';
import { PostStatus, PostType, SessionStatus } from '../../types';
import PostsContextProvider from '../../store/PostsProvider';
import PostsContext from '../../store/posts-context';
import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react';
import {
  FaArchive,
  FaCheckCircle,
  FaDollarSign,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaStar,
  FaUserTie,
} from 'react-icons/fa';

interface Props {
  pertinentGlobalPosts: PostDocumentObject[];
  currentUser: UserDocumentObject;
  setSuccessAlert(alertContent: string): void;
}

const TutorProfileView: React.FC<Props> = (props: Props) => {
  const { requestedSessions } = props.currentUser;
  const getApprovedSessions = (sessions: SessionDocumentObject[]) => {
    return sessions
      .filter(s => s.status === SessionStatus.APPROVED)
      .sort((a, b) =>
        new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
      );
  };
  const getNotApprovedSessions = (sessions: SessionDocumentObject[]) => {
    return sessions
      .filter(s => s.status === SessionStatus.NOT_APPROVED)
      .sort((a, b) =>
        new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
      );
  };
  const getRejectedSessions = (sessions: SessionDocumentObject[]) => {
    return sessions
      .filter(s => s.status === SessionStatus.REJECTED)
      .sort((a, b) =>
        new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
      );
  };

  const { posts } = props.currentUser;

  const getAnsweredPosts = (posts: PostDocumentObject[]) => {
    return posts
      .filter(p => p.status === PostStatus.ANSWERED)
      .sort((a, b) =>
        new Date(a.createdAt!).getTime() > new Date(b.createdAt!).getTime()
          ? -1
          : 1
      );
  };
  const getClosedPosts = (posts: PostDocumentObject[]) => {
    return posts
      .filter(p => p.status === PostStatus.CLOSED)
      .sort((a, b) =>
        new Date(a.createdAt!).getTime() > new Date(b.createdAt!).getTime()
          ? -1
          : 1
      );
  };
  const getNotAnsweredPosts = (posts: PostDocumentObject[]) => {
    return posts
      .filter(p => p.status === PostStatus.NOT_ANSWERED)
      .sort((a, b) =>
        new Date(a.createdAt!).getTime() > new Date(b.createdAt!).getTime()
          ? -1
          : 1
      );
  };

  const getGlobalPosts = (posts: PostDocumentObject[]) => {
    return posts.filter(
      p => p.type === PostType.GLOBAL && p.status !== PostStatus.ANSWERED
    );
  };
  const getSpecificPosts = (posts: PostDocumentObject[]) => {
    return posts.filter(p => p.type === PostType.SPECIFIC);
  };
  const getAnsweredByMePosts = (posts: PostDocumentObject[]) => {
    return posts.filter(p => {
      if (p.answeredBy) {
        return (
          (typeof p.answer === 'string' &&
            p.answeredBy === props.currentUser._id) ||
          (p.answeredBy as UserDocumentObject)._id === props.currentUser._id
        );
      }
      return false;
    });
  };

  const [lowerThan690] = useMediaQuery('(max-height: 690px)');
  const [higherThan840] = useMediaQuery('(min-height: 840px)');

  return (
    <>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Flex flex="1" textAlign="left">
              <Box mr="3">
                <FaUserTie size={25} />
              </Box>
              <Text fontWeight="bold">Tutor profile</Text>
            </Flex>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Box my="2">
            <Flex alignItems="center" mb="2">
              <Text mr="2">Averge rating:</Text>
              <Flex justify="start">
                {Array(props.currentUser.avgRating)
                  .fill(null)
                  .map((_, i) => (
                    <FaStar key={i} color="#ffbe0b" />
                  ))}
                {Array(5 - props.currentUser.avgRating)
                  .fill(null)
                  .map((_, i) => (
                    <FaStar key={i} color="#e5e5e5" />
                  ))}
              </Flex>
            </Flex>
            <Flex alignItems="center" mb="2">
              <Text mr="2">Subjects:</Text>
              {props.currentUser.subjects.map((s: string) => (
                <Badge key={s} mr="2">
                  {s}
                </Badge>
              ))}
            </Flex>
            <Flex alignItems="center">
              <FaMapMarkerAlt size={25} />
              <Text ml="2">{props.currentUser.location}</Text>
            </Flex>
          </Box>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Flex flex="1" textAlign="left">
              <Box mr="3">
                <FaDollarSign size={25} />
              </Box>
              <Text fontWeight="bold">Tutor activity</Text>
            </Flex>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Tabs isFitted variant="soft-rounded" colorScheme="blue">
            <TabList my="1" width="95%" mx="auto">
              <Tab fontSize="sm">Posts</Tab>
              <Tab fontSize="sm">Global Posts</Tab>
              <Tab mx="1" fontSize="sm">
                Sessions
              </Tab>
              <Tab fontSize="sm">Reviews</Tab>
            </TabList>
            <PostsContextProvider
              posts={[...props.pertinentGlobalPosts, ...posts]}
            >
              <PostsContext.Consumer>
                {({ posts }) => (
                  <TabPanels
                    height={
                      higherThan840 ? '65vh' : lowerThan690 ? '55vh' : '400px'
                    }
                  >
                    <TabPanel height="100%">
                      {getSpecificPosts(posts).length ? (
                        <Tabs isFitted variant="soft-rounded" height="100%">
                          <TabList mb="1em">
                            <Tab
                              color="gray"
                              _selected={{ bg: 'gray.100', color: 'gray' }}
                            >
                              <FaHourglassHalf size="25" />
                            </Tab>
                            <Tab color="green" _selected={{ bg: 'green.100' }}>
                              <FaCheckCircle size="25" />
                            </Tab>
                            <Tab color="red.500" _selected={{ bg: 'red.100' }}>
                              <FaArchive size="25" />
                            </Tab>
                          </TabList>
                          <TabPanels overflowY="auto" height="90%">
                            <TabPanel height="100%">
                              {getNotAnsweredPosts(getSpecificPosts(posts))
                                .length ? (
                                <VStack>
                                  {getNotAnsweredPosts(
                                    getSpecificPosts(posts)
                                  ).map((p: PostDocumentObject) => (
                                    <Post
                                      key={p._id}
                                      post={p}
                                      viewAsTutor
                                      setSuccessAlert={props.setSuccessAlert}
                                    />
                                  ))}
                                </VStack>
                              ) : (
                                <Flex
                                  justify="center"
                                  align="center"
                                  height="100%"
                                >
                                  <Heading as="h2" size="md" textAlign="center">
                                    No Posts waiting to be answered!
                                  </Heading>
                                </Flex>
                              )}
                            </TabPanel>
                            <TabPanel height="100%">
                              {getAnsweredByMePosts(posts).length ? (
                                <VStack>
                                  {getAnsweredPosts(
                                    getAnsweredByMePosts(posts)
                                  ).map((p: PostDocumentObject) => (
                                    <Post
                                      key={p._id}
                                      post={p}
                                      viewAsTutor
                                      setSuccessAlert={props.setSuccessAlert}
                                    />
                                  ))}
                                </VStack>
                              ) : (
                                <Flex
                                  justify="center"
                                  align="center"
                                  height="100%"
                                >
                                  <Heading as="h2" size="md" textAlign="center">
                                    No answered posts!
                                  </Heading>
                                </Flex>
                              )}
                            </TabPanel>
                            <TabPanel height="100%">
                              {getClosedPosts(getSpecificPosts(posts))
                                .length ? (
                                <VStack>
                                  {getClosedPosts(getSpecificPosts(posts)).map(
                                    (p: PostDocumentObject) => (
                                      <Post
                                        key={p._id}
                                        post={p}
                                        viewAsTutor
                                        setSuccessAlert={props.setSuccessAlert}
                                      />
                                    )
                                  )}
                                </VStack>
                              ) : (
                                <Flex
                                  justify="center"
                                  align="center"
                                  height="100%"
                                >
                                  <Heading as="h2" size="md" textAlign="center">
                                    No closed posts!
                                  </Heading>
                                </Flex>
                              )}
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      ) : (
                        <Flex justify="center" align="center" height="100%">
                          <Heading as="h2" size="md" textAlign="center">
                            For now nobody has posts for you!
                          </Heading>
                        </Flex>
                      )}
                    </TabPanel>
                    <TabPanel height="100%">
                      {getGlobalPosts(posts).length ? (
                        <Tabs isFitted variant="soft-rounded" height="100%">
                          <TabList mb="1em">
                            <Tab
                              color="gray"
                              _selected={{ bg: 'gray.100', color: 'gray' }}
                            >
                              <FaHourglassHalf size="25" />
                            </Tab>
                            <Tab color="red.500" _selected={{ bg: 'red.100' }}>
                              <FaArchive size="25" />
                            </Tab>
                          </TabList>
                          <TabPanels overflowY="auto" height="90%">
                            <TabPanel height="100%">
                              {getNotAnsweredPosts(getGlobalPosts(posts))
                                .length ? (
                                <VStack>
                                  {getNotAnsweredPosts(
                                    getGlobalPosts(posts)
                                  ).map((p: PostDocumentObject) => (
                                    <Post
                                      key={p._id}
                                      post={p}
                                      viewAsTutor
                                      setSuccessAlert={props.setSuccessAlert}
                                    />
                                  ))}
                                </VStack>
                              ) : (
                                <Flex
                                  justify="center"
                                  align="center"
                                  height="100%"
                                >
                                  <Heading as="h2" size="md" textAlign="center">
                                    No Posts waiting to be answered!
                                  </Heading>
                                </Flex>
                              )}
                            </TabPanel>
                            <TabPanel height="100%">
                              {getClosedPosts(getGlobalPosts(posts)).length ? (
                                <VStack>
                                  {getClosedPosts(getGlobalPosts(posts)).map(
                                    (p: PostDocumentObject) => (
                                      <Post
                                        key={p._id}
                                        post={p}
                                        viewAsTutor
                                        setSuccessAlert={props.setSuccessAlert}
                                      />
                                    )
                                  )}
                                </VStack>
                              ) : (
                                <Flex
                                  justify="center"
                                  align="center"
                                  height="100%"
                                >
                                  <Heading as="h2" size="md" textAlign="center">
                                    No closed posts!
                                  </Heading>
                                </Flex>
                              )}
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      ) : (
                        <Flex justify="center" align="center" height="100%">
                          <Heading as="h2" size="md" textAlign="center">
                            No global posts for now!
                          </Heading>
                        </Flex>
                      )}
                    </TabPanel>
                    <TabPanel height="100%">
                      {requestedSessions.length ? (
                        <Tabs isFitted variant="soft-rounded" height="100%">
                          <TabList mb="1em">
                            <Tab
                              color="gray"
                              _selected={{ bg: 'gray.100', color: 'gray' }}
                            >
                              <FaHourglassHalf size="25" />
                            </Tab>
                            <Tab color="green" _selected={{ bg: 'green.100' }}>
                              <FaCheckCircle size="25" />
                            </Tab>
                            <Tab color="red.500" _selected={{ bg: 'red.100' }}>
                              <FaArchive size="25" />
                            </Tab>
                          </TabList>
                          <SessionsContextProvider sessions={requestedSessions}>
                            <SessionsContext.Consumer>
                              {({ sessions: requestedSessions }) => (
                                <TabPanels overflowY="auto" height="90%">
                                  <TabPanel height="100%">
                                    {getNotApprovedSessions(requestedSessions)
                                      .length ? (
                                      <VStack>
                                        {getNotApprovedSessions(
                                          requestedSessions
                                        ).map((s: SessionDocumentObject) => (
                                          <Session
                                            key={s._id}
                                            session={s}
                                            viewAsTutor
                                          />
                                        ))}
                                      </VStack>
                                    ) : (
                                      <Flex
                                        justify="center"
                                        align="center"
                                        height="100%"
                                      >
                                        <Heading
                                          as="h2"
                                          size="md"
                                          textAlign="center"
                                        >
                                          No sessions waiting to be approved!
                                        </Heading>
                                      </Flex>
                                    )}
                                  </TabPanel>
                                  <TabPanel height="100%">
                                    {getApprovedSessions(requestedSessions)
                                      .length ? (
                                      <VStack>
                                        {getApprovedSessions(
                                          requestedSessions
                                        ).map((s: SessionDocumentObject) => (
                                          <Session
                                            key={s._id}
                                            session={s}
                                            viewAsTutor
                                          />
                                        ))}
                                      </VStack>
                                    ) : (
                                      <Flex
                                        justify="center"
                                        align="center"
                                        height="100%"
                                      >
                                        <Heading
                                          as="h2"
                                          size="md"
                                          textAlign="center"
                                        >
                                          No approved sessions!
                                        </Heading>
                                      </Flex>
                                    )}
                                  </TabPanel>
                                  <TabPanel height="100%">
                                    {getRejectedSessions(requestedSessions)
                                      .length ? (
                                      <VStack>
                                        {getRejectedSessions(
                                          requestedSessions
                                        ).map((s: SessionDocumentObject) => (
                                          <Session
                                            key={s._id}
                                            session={s}
                                            viewAsTutor
                                          />
                                        ))}
                                      </VStack>
                                    ) : (
                                      <Flex
                                        justify="center"
                                        align="center"
                                        height="100%"
                                      >
                                        <Heading
                                          as="h2"
                                          size="md"
                                          textAlign="center"
                                        >
                                          No rejected sessions!
                                        </Heading>
                                      </Flex>
                                    )}
                                  </TabPanel>
                                </TabPanels>
                              )}
                            </SessionsContext.Consumer>
                          </SessionsContextProvider>
                        </Tabs>
                      ) : (
                        <Flex justify="center" align="center" height="100%">
                          <Heading as="h2" size="md" textAlign="center">
                            For now nobody booked a session with you!
                          </Heading>
                        </Flex>
                      )}
                    </TabPanel>
                    <TabPanel height="100%" overflowY="auto">
                      {props.currentUser.reviews.length ? (
                        <VStack>
                          {props.currentUser.reviews.map(
                            (r: ReviewDocumentObject) => (
                              <Review
                                key={r._id}
                                review={r}
                                deleteUserCreateReviewId={null}
                              />
                            )
                          )}
                        </VStack>
                      ) : (
                        <Flex justify="center" align="center" height="100%">
                          <Heading as="h2" size="md" textAlign="center">
                            You haven't been reviewed yet!
                          </Heading>
                        </Flex>
                      )}
                    </TabPanel>
                  </TabPanels>
                )}
              </PostsContext.Consumer>
            </PostsContextProvider>
          </Tabs>
        </AccordionPanel>
      </AccordionItem>
    </>
  );
};

export default TutorProfileView;
