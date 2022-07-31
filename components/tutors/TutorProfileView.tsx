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
  Flex,
  FormLabel,
  Heading,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react';
import { FaArchive, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import colors from '../../theme/colors';
import { useState } from 'react';
import ApiHelper from '../../utils/api-helper';

interface Props {
  pertinentGlobalPosts: PostDocumentObject[];
  currentUser: UserDocumentObject;
  errorAlert: string | null;
  successAlert: string | null;
  setSuccessAlert(alertContent: string | null): void;
  setErrorAlert(alertContent: string | null): void;
}

const TutorProfileView: React.FC<Props> = ({
  pertinentGlobalPosts,
  currentUser,
  setSuccessAlert,
}) => {
  const { requestedSessions, posts } = currentUser;
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
      if (p.answeredBy && p.status === PostStatus.ANSWERED) {
        return (
          (typeof p.answer === 'string' && p.answeredBy === currentUser._id) ||
          (p.answeredBy as UserDocumentObject)._id === currentUser._id
        );
      }
      return false;
    });
  };

  const [lowerThan690] = useMediaQuery('(max-height: 690px)');
  const [higherThan840] = useMediaQuery('(min-height: 840px)');
  const unSelectedTabColor = useColorModeValue('gray.600', 'white');
  const hourGlassIconBgColor = 'gray.100';
  const hourGlassIconColor = useColorModeValue('gray.800', 'white.50');

  const [globalPostsEnabled, setGlobalPostsEnabled] = useState<boolean>(
    currentUser.globalPostsEnabled
  );

  const handlerGlobalPostsSwitch = () => {
    setGlobalPostsEnabled(prevState => !prevState);
    ApiHelper(
      `/api/tutors/${currentUser._id}`,
      { globalPostsEnabled: !globalPostsEnabled },
      'PUT'
    );
  };

  return (
    <SessionsContextProvider sessions={requestedSessions}>
      <SessionsContext.Consumer>
        {({ sessions: requestedSessions }) => (
          <PostsContextProvider
            posts={
              globalPostsEnabled ? [...pertinentGlobalPosts, ...posts] : posts
            }
          >
            <PostsContext.Consumer>
              {({ posts }) => {
                return (
                  <Tabs isFitted variant="soft-rounded">
                    <Flex
                      alignItems="center"
                      justifyContent={['center', null, 'start']}
                      my={[1, null, 0]}
                    >
                      <FormLabel
                        htmlFor="global-posts-enabled"
                        mr="3"
                        mb="0"
                        fontSize="lg"
                      >
                        Show global posts
                      </FormLabel>
                      <Switch
                        id="global-posts-enabled"
                        isChecked={globalPostsEnabled}
                        size="lg"
                        onChange={handlerGlobalPostsSwitch}
                      />
                    </Flex>
                    <TabList
                      m="0"
                      flexDirection={['column', null, 'row']}
                      mx="auto"
                      width={['95%', null, '100%']}
                      my="4"
                    >
                      <Tab m="0" fontSize="sm" color={unSelectedTabColor}>
                        ({getNotAnsweredPosts(posts).length}) Posts
                      </Tab>
                      {globalPostsEnabled && (
                        <Tab m="0" fontSize="sm" color={unSelectedTabColor}>
                          ({getNotAnsweredPosts(getGlobalPosts(posts)).length})
                          Global Posts
                        </Tab>
                      )}
                      <Tab m="0" fontSize="sm" color={unSelectedTabColor}>
                        ({getNotApprovedSessions(requestedSessions).length})
                        Sessions
                      </Tab>
                      <Tab m="0" fontSize="sm" color={unSelectedTabColor}>
                        <Flex>({currentUser.reviews.length}) Reviews</Flex>
                      </Tab>
                    </TabList>
                    <TabPanels
                      height={
                        higherThan840 ? '60vh' : lowerThan690 ? '52vh' : '500px'
                      }
                    >
                      <TabPanel p="0" height="100%">
                        {getSpecificPosts(posts).length ? (
                          <Tabs isFitted variant="soft-rounded" height="100%">
                            <TabList
                              mb="1em"
                              width={['95%', null, '100%']}
                              mx="auto"
                            >
                              <Tab
                                color={hourGlassIconColor}
                                _selected={{
                                  color: 'gray.800',
                                  bgColor: hourGlassIconBgColor,
                                }}
                              >
                                <FaHourglassHalf size="25" />
                              </Tab>
                              <Tab
                                color="green"
                                _selected={{ bg: 'green.100' }}
                              >
                                <FaCheckCircle
                                  color={colors.successV1}
                                  size="25"
                                />
                              </Tab>
                              <Tab
                                color="red.500"
                                _selected={{ bg: 'red.100' }}
                              >
                                <FaArchive color={colors.dangerV1} size="25" />
                              </Tab>
                            </TabList>
                            <TabPanels
                              overflowY="auto"
                              height={lowerThan690 ? '80%' : '90%'}
                            >
                              <TabPanel p="0" height="100%">
                                {getNotAnsweredPosts(getSpecificPosts(posts))
                                  .length ? (
                                  <VStack
                                    width={['90%', null, '100%']}
                                    mx="auto"
                                    pb="2"
                                  >
                                    {getNotAnsweredPosts(
                                      getSpecificPosts(posts)
                                    ).map((p: PostDocumentObject, i) => (
                                      <Post
                                        isLatestCreated={i === 0}
                                        key={p._id}
                                        post={p}
                                        viewAsTutor
                                        setSuccessAlert={setSuccessAlert}
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
                                      No Posts waiting to be answered!
                                    </Heading>
                                  </Flex>
                                )}
                              </TabPanel>
                              <TabPanel p="0" height="100%">
                                {getAnsweredByMePosts(posts).length ? (
                                  <VStack
                                    width={['90%', null, '100%']}
                                    mx="auto"
                                    pb="2"
                                  >
                                    {getAnsweredPosts(
                                      getAnsweredByMePosts(posts)
                                    ).map((p: PostDocumentObject, i) => (
                                      <Post
                                        key={p._id}
                                        isLatestCreated={i === 0}
                                        post={p}
                                        viewAsTutor
                                        setSuccessAlert={setSuccessAlert}
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
                                      No answered posts!
                                    </Heading>
                                  </Flex>
                                )}
                              </TabPanel>
                              <TabPanel p="0" height="100%">
                                {getClosedPosts(getSpecificPosts(posts))
                                  .length ? (
                                  <VStack
                                    width={['90%', null, '100%']}
                                    mx="auto"
                                    pb="2"
                                  >
                                    {getClosedPosts(
                                      getSpecificPosts(posts)
                                    ).map((p: PostDocumentObject, i) => (
                                      <Post
                                        isLatestCreated={i === 0}
                                        key={p._id}
                                        post={p}
                                        viewAsTutor
                                        setSuccessAlert={setSuccessAlert}
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
                      {globalPostsEnabled && (
                        <TabPanel p="0" height="100%">
                          {getGlobalPosts(posts).length ? (
                            <Tabs isFitted variant="soft-rounded" height="100%">
                              <TabList
                                mb="1em"
                                width={['95%', null, '100%']}
                                mx="auto"
                              >
                                <Tab
                                  color="gray"
                                  _selected={{ bg: 'gray.100', color: 'gray' }}
                                >
                                  <FaHourglassHalf size="25" />
                                </Tab>
                                <Tab
                                  color="red.500"
                                  _selected={{ bg: 'red.100' }}
                                >
                                  <FaArchive
                                    color={colors.dangerV1}
                                    size="25"
                                  />
                                </Tab>
                              </TabList>
                              <TabPanels
                                overflowY="auto"
                                height={lowerThan690 ? '80%' : '90%'}
                              >
                                <TabPanel p="0" height="100%">
                                  {getNotAnsweredPosts(getGlobalPosts(posts))
                                    .length ? (
                                    <VStack
                                      width={['90%', null, '100%']}
                                      mx="auto"
                                      pb="2"
                                    >
                                      {getNotAnsweredPosts(
                                        getGlobalPosts(posts)
                                      ).map((p: PostDocumentObject, i) => (
                                        <Post
                                          isLatestCreated={i === 0}
                                          key={p._id}
                                          post={p}
                                          viewAsTutor
                                          setSuccessAlert={setSuccessAlert}
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
                                        No Posts waiting to be answered!
                                      </Heading>
                                    </Flex>
                                  )}
                                </TabPanel>
                                <TabPanel p="0" height="100%">
                                  {getClosedPosts(getGlobalPosts(posts))
                                    .length ? (
                                    <VStack
                                      width={['90%', null, '100%']}
                                      mx="auto"
                                      pb="2"
                                    >
                                      {getClosedPosts(
                                        getGlobalPosts(posts)
                                      ).map((p: PostDocumentObject, i) => (
                                        <Post
                                          isLatestCreated={i === 0}
                                          key={p._id}
                                          post={p}
                                          viewAsTutor
                                          setSuccessAlert={setSuccessAlert}
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
                      )}
                      <TabPanel p="0" height="100%">
                        {requestedSessions.length ? (
                          <Tabs isFitted variant="soft-rounded" height="100%">
                            <TabList
                              mb="1em"
                              width={['95%', null, '100%']}
                              mx="auto"
                            >
                              <Tab
                                color="gray"
                                _selected={{ bg: 'gray.100', color: 'gray' }}
                              >
                                <FaHourglassHalf size="25" />
                              </Tab>
                              <Tab
                                color="green"
                                _selected={{ bg: 'green.100' }}
                              >
                                <FaCheckCircle
                                  color={colors.successV1}
                                  size="25"
                                />
                              </Tab>
                              <Tab
                                color="red.500"
                                _selected={{ bg: 'red.100' }}
                              >
                                <FaArchive color={colors.dangerV1} size="25" />
                              </Tab>
                            </TabList>
                            <TabPanels
                              overflowY="auto"
                              height={lowerThan690 ? '80%' : '90%'}
                            >
                              <TabPanel p="0" height="100%">
                                {getNotApprovedSessions(requestedSessions)
                                  .length ? (
                                  <VStack
                                    width={['90%', null, '100%']}
                                    mx="auto"
                                    pb="2"
                                  >
                                    {getNotApprovedSessions(
                                      requestedSessions
                                    ).map((s: SessionDocumentObject, i) => (
                                      <Session
                                        isLatestCreated={i === 0}
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
                              <TabPanel p="0" height="100%">
                                {getApprovedSessions(requestedSessions)
                                  .length ? (
                                  <VStack
                                    width={['90%', null, '100%']}
                                    mx="auto"
                                    pb="2"
                                  >
                                    {getApprovedSessions(requestedSessions).map(
                                      (s: SessionDocumentObject, i) => (
                                        <Session
                                          isLatestCreated={i === 0}
                                          key={s._id}
                                          session={s}
                                          viewAsTutor
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
                              <TabPanel p="0" height="100%">
                                {getRejectedSessions(requestedSessions)
                                  .length ? (
                                  <VStack
                                    width={['90%', null, '100%']}
                                    mx="auto"
                                    pb="2"
                                  >
                                    {getRejectedSessions(requestedSessions).map(
                                      (s: SessionDocumentObject, i) => (
                                        <Session
                                          isLatestCreated={i === 0}
                                          key={s._id}
                                          session={s}
                                          viewAsTutor
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
                          </Tabs>
                        ) : (
                          <Flex justify="center" align="center" height="100%">
                            <Heading as="h2" size="md" textAlign="center">
                              For now nobody booked a session with you!
                            </Heading>
                          </Flex>
                        )}
                      </TabPanel>
                      <TabPanel p="0" height="100%" overflowY="auto">
                        {currentUser.reviews.length ? (
                          <VStack
                            width={['90%', null, '100%']}
                            mx="auto"
                            pb="2"
                          >
                            {currentUser.reviews.map(
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
                              You have no reviews yet!
                            </Heading>
                          </Flex>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                );
              }}
            </PostsContext.Consumer>
          </PostsContextProvider>
        )}
      </SessionsContext.Consumer>
    </SessionsContextProvider>
  );
};

export default TutorProfileView;
