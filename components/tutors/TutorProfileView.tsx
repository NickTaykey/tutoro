import Session from '../sessions/Session';
import Review from '../reviews/Review';
import Post from '../posts/Post';
import SessionsContextProvider from '../../store/SessionsProvider';
import SessionsContext from '../../store/sessions-context';
import type { UserDocumentObject } from '../../models/User';
import type { SessionDocumentObject } from '../../models/Session';
import type { ReviewDocumentObject } from '../../models/Review';
import type { PostDocumentObject } from '../../models/Post';
import { SessionStatus } from '../../types';
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
  VStack,
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaDollarSign,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaStar,
  FaTimesCircle,
  FaUserTie,
} from 'react-icons/fa';

interface Props {
  pertinentGlobalPosts: PostDocumentObject[];
  currentUser: UserDocumentObject;
}

const TutorProfileView: React.FC<Props> = (props: Props) => {
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
              <Tab mx="1" fontSize="sm">
                Sessions
              </Tab>
              <Tab fontSize="sm">Reviews</Tab>
            </TabList>
            <TabPanels height={['55vh', null, null, '45vh']}>
              <TabPanel height="100%" overflowY="scroll">
                {props.currentUser.posts.length ? (
                  <PostsContextProvider posts={props.currentUser.posts}>
                    <PostsContext.Consumer>
                      {ctx => (
                        <VStack>
                          {ctx.posts.map((p: PostDocumentObject) => (
                            <Post key={p._id} post={p} viewAsTutor />
                          ))}
                        </VStack>
                      )}
                    </PostsContext.Consumer>
                  </PostsContextProvider>
                ) : (
                  <Flex justify="center" align="center">
                    <Heading as="h2" size="md" textAlign="center">
                      You don't have any posts for now!
                    </Heading>
                  </Flex>
                )}
              </TabPanel>
              <TabPanel height="100%">
                {props.currentUser.requestedSessions.length ? (
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
                        <FaTimesCircle size="25" />
                      </Tab>
                    </TabList>
                    <TabPanels overflowY="scroll" height="90%">
                      <TabPanel>
                        {props.currentUser.requestedSessions.filter(
                          s => s.status === SessionStatus.NOT_APPROVED
                        ).length ? (
                          <VStack>
                            <SessionsContextProvider
                              sessions={props.currentUser.requestedSessions.filter(
                                s => s.status === SessionStatus.NOT_APPROVED
                              )}
                            >
                              <SessionsContext.Consumer>
                                {ctx => {
                                  return ctx.sessions.map(
                                    (s: SessionDocumentObject) => (
                                      <Session
                                        key={s._id}
                                        session={s}
                                        viewAsTutor
                                      />
                                    )
                                  );
                                }}
                              </SessionsContext.Consumer>
                            </SessionsContextProvider>
                          </VStack>
                        ) : (
                          <Flex justify="center" align="center">
                            <Heading as="h2" size="md" textAlign="center">
                              No sessions waiting to be approved!
                            </Heading>
                          </Flex>
                        )}
                      </TabPanel>
                      <TabPanel>
                        {props.currentUser.requestedSessions.filter(
                          s => s.status === SessionStatus.APPROVED
                        ).length ? (
                          <VStack>
                            <SessionsContextProvider
                              sessions={props.currentUser.requestedSessions.filter(
                                s => s.status === SessionStatus.APPROVED
                              )}
                            >
                              <SessionsContext.Consumer>
                                {ctx => {
                                  return ctx.sessions.map(
                                    (s: SessionDocumentObject) => (
                                      <Session
                                        key={s._id}
                                        session={s}
                                        viewAsTutor
                                      />
                                    )
                                  );
                                }}
                              </SessionsContext.Consumer>
                            </SessionsContextProvider>
                          </VStack>
                        ) : (
                          <Flex justify="center" align="center">
                            <Heading as="h2" size="md" textAlign="center">
                              No approved sessions!
                            </Heading>
                          </Flex>
                        )}
                      </TabPanel>
                      <TabPanel>
                        {props.currentUser.requestedSessions.filter(
                          s => s.status === SessionStatus.REJECTED
                        ).length ? (
                          <VStack>
                            <SessionsContextProvider
                              sessions={props.currentUser.requestedSessions.filter(
                                s => s.status === SessionStatus.REJECTED
                              )}
                            >
                              <SessionsContext.Consumer>
                                {ctx => {
                                  return ctx.sessions.map(
                                    (s: SessionDocumentObject) => (
                                      <Session
                                        key={s._id}
                                        session={s}
                                        viewAsTutor
                                      />
                                    )
                                  );
                                }}
                              </SessionsContext.Consumer>
                            </SessionsContextProvider>
                          </VStack>
                        ) : (
                          <Flex justify="center" align="center">
                            <Heading as="h2" size="md" textAlign="center">
                              No rejected sessions!
                            </Heading>
                          </Flex>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                ) : (
                  <Flex justify="center" align="center">
                    <Heading as="h2" size="md" textAlign="center">
                      For now nobody booked a session with you!
                    </Heading>
                  </Flex>
                )}
              </TabPanel>
              <TabPanel height="100%" overflowY="scroll">
                {props.currentUser.createdReviews.length ? (
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
                  <Flex justify="center" align="center">
                    <Heading as="h2" size="md" textAlign="center">
                      You haven't been reviewed yet!
                    </Heading>
                  </Flex>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </AccordionPanel>
      </AccordionItem>
    </>
  );
};

export default TutorProfileView;
