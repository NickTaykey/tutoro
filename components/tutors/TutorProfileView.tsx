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
import * as c from '@chakra-ui/react';
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
    return sessions.filter(s => s.status === SessionStatus.APPROVED);
  };
  const getNotApprovedSessions = (sessions: SessionDocumentObject[]) => {
    return sessions.filter(s => s.status === SessionStatus.NOT_APPROVED);
  };
  const getRejectedSessions = (sessions: SessionDocumentObject[]) => {
    return sessions.filter(s => s.status === SessionStatus.REJECTED);
  };
  const getAnsweredPosts = (posts: PostDocumentObject[]) => {
    return posts.filter(p => p.status === PostStatus.ANSWERED);
  };
  const getClosedPosts = (posts: PostDocumentObject[]) => {
    return posts.filter(p => p.status === PostStatus.CLOSED);
  };
  const getNotAnsweredPosts = (posts: PostDocumentObject[]) => {
    return posts.filter(p => p.status === PostStatus.NOT_ANSWERED);
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

  const [lowerThan690] = c.useMediaQuery('(max-height: 690px)');
  const [higherThan840] = c.useMediaQuery('(min-height: 840px)');
  const unSelectedTabColor = c.useColorModeValue('gray.600', 'white');
  const hourGlassIconBgColor = 'gray.100';
  const hourGlassIconColor = c.useColorModeValue('gray.800', 'white.50');

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
                  <c.Tabs isFitted variant="soft-rounded">
                    <c.Flex
                      alignItems="center"
                      justifyContent={['center', null, 'start']}
                      my={[1, null, 0]}
                    >
                      <c.FormLabel
                        htmlFor="global-posts-enabled"
                        mr="3"
                        mb="0"
                        fontSize="lg"
                      >
                        Show global posts
                      </c.FormLabel>
                      <c.Switch
                        id="global-posts-enabled"
                        isChecked={globalPostsEnabled}
                        size="lg"
                        onChange={handlerGlobalPostsSwitch}
                      />
                    </c.Flex>
                    <c.TabList
                      m="0"
                      flexDirection={['column', null, 'row']}
                      mx="auto"
                      width={['95%', null, '100%']}
                      my="4"
                    >
                      <c.Tab m="0" fontSize="sm" color={unSelectedTabColor}>
                        ({getNotAnsweredPosts(posts).length}) Posts
                      </c.Tab>
                      {globalPostsEnabled && (
                        <c.Tab m="0" fontSize="sm" color={unSelectedTabColor}>
                          ({getNotAnsweredPosts(getGlobalPosts(posts)).length})
                          Global Posts
                        </c.Tab>
                      )}
                      <c.Tab m="0" fontSize="sm" color={unSelectedTabColor}>
                        ({getNotApprovedSessions(requestedSessions).length})
                        Sessions
                      </c.Tab>
                      <c.Tab m="0" fontSize="sm" color={unSelectedTabColor}>
                        <c.Flex>({currentUser.reviews.length}) Reviews</c.Flex>
                      </c.Tab>
                    </c.TabList>
                    <c.TabPanels
                      height={
                        higherThan840 ? '60vh' : lowerThan690 ? '52vh' : '500px'
                      }
                    >
                      <c.TabPanel p="0" height="100%">
                        {getSpecificPosts(posts).length ? (
                          <c.Tabs isFitted variant="soft-rounded" height="100%">
                            <c.TabList
                              mb="1em"
                              width={['95%', null, '100%']}
                              mx="auto"
                            >
                              <c.Tab
                                color={hourGlassIconColor}
                                _selected={{
                                  color: 'gray.800',
                                  bgColor: hourGlassIconBgColor,
                                }}
                              >
                                <FaHourglassHalf size="25" />
                              </c.Tab>
                              <c.Tab
                                color="green"
                                _selected={{ bg: 'green.100' }}
                              >
                                <FaCheckCircle
                                  color={colors.successV1}
                                  size="25"
                                />
                              </c.Tab>
                              <c.Tab
                                color="red.500"
                                _selected={{ bg: 'red.100' }}
                              >
                                <FaArchive color={colors.dangerV1} size="25" />
                              </c.Tab>
                            </c.TabList>
                            <c.TabPanels
                              overflowY="auto"
                              height={lowerThan690 ? '80%' : '90%'}
                            >
                              <c.TabPanel p="0" height="100%">
                                {getNotAnsweredPosts(getSpecificPosts(posts))
                                  .length ? (
                                  <c.VStack
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
                                  </c.VStack>
                                ) : (
                                  <c.Flex
                                    justify="center"
                                    align="center"
                                    height="100%"
                                  >
                                    <c.Heading
                                      as="h2"
                                      size="md"
                                      textAlign="center"
                                    >
                                      No Posts waiting to be answered!
                                    </c.Heading>
                                  </c.Flex>
                                )}
                              </c.TabPanel>
                              <c.TabPanel p="0" height="100%">
                                {getAnsweredByMePosts(posts).length ? (
                                  <c.VStack
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
                                  </c.VStack>
                                ) : (
                                  <c.Flex
                                    justify="center"
                                    align="center"
                                    height="100%"
                                  >
                                    <c.Heading
                                      as="h2"
                                      size="md"
                                      textAlign="center"
                                    >
                                      No answered posts!
                                    </c.Heading>
                                  </c.Flex>
                                )}
                              </c.TabPanel>
                              <c.TabPanel p="0" height="100%">
                                {getClosedPosts(getSpecificPosts(posts))
                                  .length ? (
                                  <c.VStack
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
                                  </c.VStack>
                                ) : (
                                  <c.Flex
                                    justify="center"
                                    align="center"
                                    height="100%"
                                  >
                                    <c.Heading
                                      as="h2"
                                      size="md"
                                      textAlign="center"
                                    >
                                      No closed posts!
                                    </c.Heading>
                                  </c.Flex>
                                )}
                              </c.TabPanel>
                            </c.TabPanels>
                          </c.Tabs>
                        ) : (
                          <c.Flex justify="center" align="center" height="100%">
                            <c.Heading as="h2" size="md" textAlign="center">
                              For now nobody has posts for you!
                            </c.Heading>
                          </c.Flex>
                        )}
                      </c.TabPanel>
                      {globalPostsEnabled && (
                        <c.TabPanel p="0" height="100%">
                          {getGlobalPosts(posts).length ? (
                            <c.Tabs
                              isFitted
                              variant="soft-rounded"
                              height="100%"
                            >
                              <c.TabList
                                mb="1em"
                                width={['95%', null, '100%']}
                                mx="auto"
                              >
                                <c.Tab
                                  color={hourGlassIconColor}
                                  _selected={{
                                    color: 'gray.800',
                                    bgColor: hourGlassIconBgColor,
                                  }}
                                >
                                  <FaHourglassHalf size="25" />
                                </c.Tab>
                                <c.Tab
                                  color="red.500"
                                  _selected={{ bg: 'red.100' }}
                                >
                                  <FaArchive
                                    color={colors.dangerV1}
                                    size="25"
                                  />
                                </c.Tab>
                              </c.TabList>
                              <c.TabPanels
                                overflowY="auto"
                                height={lowerThan690 ? '80%' : '90%'}
                              >
                                <c.TabPanel p="0" height="100%">
                                  {getNotAnsweredPosts(getGlobalPosts(posts))
                                    .length ? (
                                    <c.VStack
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
                                    </c.VStack>
                                  ) : (
                                    <c.Flex
                                      justify="center"
                                      align="center"
                                      height="100%"
                                    >
                                      <c.Heading
                                        as="h2"
                                        size="md"
                                        textAlign="center"
                                      >
                                        No Posts waiting to be answered!
                                      </c.Heading>
                                    </c.Flex>
                                  )}
                                </c.TabPanel>
                                <c.TabPanel p="0" height="100%">
                                  {getClosedPosts(getGlobalPosts(posts))
                                    .length ? (
                                    <c.VStack
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
                                    </c.VStack>
                                  ) : (
                                    <c.Flex
                                      justify="center"
                                      align="center"
                                      height="100%"
                                    >
                                      <c.Heading
                                        as="h2"
                                        size="md"
                                        textAlign="center"
                                      >
                                        No closed posts!
                                      </c.Heading>
                                    </c.Flex>
                                  )}
                                </c.TabPanel>
                              </c.TabPanels>
                            </c.Tabs>
                          ) : (
                            <c.Flex
                              justify="center"
                              align="center"
                              height="100%"
                            >
                              <c.Heading as="h2" size="md" textAlign="center">
                                No global posts for now!
                              </c.Heading>
                            </c.Flex>
                          )}
                        </c.TabPanel>
                      )}
                      <c.TabPanel p="0" height="100%">
                        {requestedSessions.length ? (
                          <c.Tabs isFitted variant="soft-rounded" height="100%">
                            <c.TabList
                              mb="1em"
                              width={['95%', null, '100%']}
                              mx="auto"
                            >
                              <c.Tab
                                color={hourGlassIconColor}
                                _selected={{
                                  color: 'gray.800',
                                  bgColor: hourGlassIconBgColor,
                                }}
                              >
                                <FaHourglassHalf size="25" />
                              </c.Tab>
                              <c.Tab
                                color="green"
                                _selected={{ bg: 'green.100' }}
                              >
                                <FaCheckCircle
                                  color={colors.successV1}
                                  size="25"
                                />
                              </c.Tab>
                              <c.Tab
                                color="red.500"
                                _selected={{ bg: 'red.100' }}
                              >
                                <FaArchive color={colors.dangerV1} size="25" />
                              </c.Tab>
                            </c.TabList>
                            <c.TabPanels
                              overflowY="auto"
                              height={lowerThan690 ? '80%' : '90%'}
                            >
                              <c.TabPanel p="0" height="100%">
                                {getNotApprovedSessions(requestedSessions)
                                  .length ? (
                                  <c.VStack
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
                                  </c.VStack>
                                ) : (
                                  <c.Flex
                                    justify="center"
                                    align="center"
                                    height="100%"
                                  >
                                    <c.Heading
                                      as="h2"
                                      size="md"
                                      textAlign="center"
                                    >
                                      No sessions waiting to be approved!
                                    </c.Heading>
                                  </c.Flex>
                                )}
                              </c.TabPanel>
                              <c.TabPanel p="0" height="100%">
                                {getApprovedSessions(requestedSessions)
                                  .length ? (
                                  <c.VStack
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
                                  </c.VStack>
                                ) : (
                                  <c.Flex
                                    justify="center"
                                    align="center"
                                    height="100%"
                                  >
                                    <c.Heading
                                      as="h2"
                                      size="md"
                                      textAlign="center"
                                    >
                                      No approved sessions!
                                    </c.Heading>
                                  </c.Flex>
                                )}
                              </c.TabPanel>
                              <c.TabPanel p="0" height="100%">
                                {getRejectedSessions(requestedSessions)
                                  .length ? (
                                  <c.VStack
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
                                  </c.VStack>
                                ) : (
                                  <c.Flex
                                    justify="center"
                                    align="center"
                                    height="100%"
                                  >
                                    <c.Heading
                                      as="h2"
                                      size="md"
                                      textAlign="center"
                                    >
                                      No rejected sessions!
                                    </c.Heading>
                                  </c.Flex>
                                )}
                              </c.TabPanel>
                            </c.TabPanels>
                          </c.Tabs>
                        ) : (
                          <c.Flex justify="center" align="center" height="100%">
                            <c.Heading as="h2" size="md" textAlign="center">
                              For now nobody booked a session with you!
                            </c.Heading>
                          </c.Flex>
                        )}
                      </c.TabPanel>
                      <c.TabPanel p="0" height="100%" overflowY="auto">
                        {currentUser.reviews.length ? (
                          <c.VStack
                            width={['90%', null, '100%']}
                            mx="auto"
                            pb="2"
                          >
                            {currentUser.reviews.map(
                              (r: ReviewDocumentObject) => (
                                <Review key={r._id} review={r} />
                              )
                            )}
                          </c.VStack>
                        ) : (
                          <c.Flex justify="center" align="center" height="100%">
                            <c.Heading as="h2" size="md" textAlign="center">
                              You have no reviews yet!
                            </c.Heading>
                          </c.Flex>
                        )}
                      </c.TabPanel>
                    </c.TabPanels>
                  </c.Tabs>
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
