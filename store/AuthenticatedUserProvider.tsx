import React, { useEffect, useReducer, useState } from 'react';
import ApiHelper from '../utils/api-helper';
import { UserDocumentObject } from '../models/User';
import AuthenticatedUserContext from './authenticated-user-context';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Show,
  useDisclosure,
} from '@chakra-ui/react';
import type { UpdateTutorObject } from './authenticated-user-context';
import type { CloudFile } from '../types';
import getProvidersList from '../utils/get-providers';
import { ClientSafeProvider, signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import UpdateTutorForm from '../components/tutors/UpdateTutorForm';
import UpdateAvatarForm from '../components/users/UpdateAvatarForm';
import EarningsMenu from '../components/users/EarningsMenu';

enum AuthenticatedUserActionTypes {
  UPDATE_AVATAR,
  UPDATE_TUTOR,
  RESET_AVATAR,
}

type UpdateAvatarAction = {
  type: AuthenticatedUserActionTypes.UPDATE_AVATAR;
  payload: CloudFile;
};

type ResetAvatarAction = {
  type: AuthenticatedUserActionTypes.RESET_AVATAR;
  payload: null;
};

type UpdateTutorAction = {
  type: AuthenticatedUserActionTypes.UPDATE_TUTOR;
  payload: UpdateTutorObject;
};

type AuthenticatedUserAction =
  | UpdateAvatarAction
  | UpdateTutorAction
  | ResetAvatarAction;

type State = UserDocumentObject | null;

function reducer(prevState: State, action: AuthenticatedUserAction): State {
  prevState;
  if (action.type === AuthenticatedUserActionTypes.UPDATE_AVATAR) {
    return prevState ? { ...prevState, avatar: action.payload } : prevState;
  }
  if (action.type === AuthenticatedUserActionTypes.UPDATE_TUTOR) {
    return prevState ? { ...prevState, ...action.payload } : prevState;
  }
  if (action.type === AuthenticatedUserActionTypes.RESET_AVATAR) {
    return prevState
      ? { ...prevState, avatar: { url: '', public_id: '' } }
      : prevState;
  }
  return prevState;
}

const AuthenticatedUserProvider: React.FC<{
  user: UserDocumentObject | null;
  children: React.ReactNode[] | React.ReactNode;
}> = ({ user, children }) => {
  const [authenticatedUserState, dispatchAuthenticatedUserAction] = useReducer(
    reducer,
    user
  );
  const {
    isOpen: showSignInMenu,
    onOpen: openSignInMenu,
    onClose: closeSignInMenu,
  } = useDisclosure();
  const {
    isOpen: showUpdateAvatarMenu,
    onOpen: openUpdateAvatarMenu,
    onClose: closeUpdateAvatarMenu,
  } = useDisclosure();
  const {
    isOpen: showUpdateTutorMenu,
    onOpen: openUpdateTutorMenu,
    onClose: closeUpdateTutorMenu,
  } = useDisclosure();
  const {
    isOpen: showEarningsMenu,
    onOpen: openEarningsMenu,
    onClose: closeEarningsMenu,
  } = useDisclosure();
  const [providersList, setProvidersList] = useState<ClientSafeProvider[]>([]);

  useEffect(() => {
    getProvidersList().then(list => setProvidersList(list));
  }, [getProvidersList]);

  return (
    <AuthenticatedUserContext.Provider
      value={{
        showSignInMenu,
        openSignInMenu,
        closeSignInMenu,
        showEarningsMenu,
        openEarningsMenu,
        closeEarningsMenu,
        showUpdateAvatarMenu,
        openUpdateAvatarMenu,
        closeUpdateAvatarMenu,
        showUpdateTutorMenu,
        openUpdateTutorMenu,
        closeUpdateTutorMenu,
        user: authenticatedUserState,
        updateAvatar(formData: FormData) {
          return new Promise(async (resolve, reject) => {
            if (authenticatedUserState) {
              const {
                error,
                newAvatar,
              }: {
                error: string | null;
                newAvatar: CloudFile | null;
              } = await ApiHelper(
                `/api/${authenticatedUserState._id}`,
                formData,
                'PUT',
                false
              );
              if (error || !newAvatar)
                return reject({
                  errorMessage:
                    'Unexpected server error, impossible to upload your avatr, try again later...',
                });
              dispatchAuthenticatedUserAction({
                type: AuthenticatedUserActionTypes.UPDATE_AVATAR,
                payload: newAvatar!,
              });
              return resolve(null);
            }
          });
        },
        becomeTutor(formData: Record<string, string[]>) {
          return new Promise(async (resolve, reject) => {
            if (authenticatedUserState) {
              const res = await ApiHelper(
                `/api/tutors/${authenticatedUserState._id}`,
                formData,
                'PUT'
              );
              if (res.errorMessage)
                return reject({
                  errorMessage:
                    'Unexpected server side error, impossible to update your profile, try again later...',
                });
              dispatchAuthenticatedUserAction({
                type: AuthenticatedUserActionTypes.UPDATE_TUTOR,
                payload: res,
              });
              return resolve(null);
            }
          });
        },
        resetAvatar() {
          return new Promise(async (resolve, reject) => {
            if (authenticatedUserState) {
              const {
                error,
              }: {
                error: string | null;
              } = await ApiHelper(
                `/api/${authenticatedUserState._id}`,
                {},
                'PUT'
              );
              if (error) {
                return reject({
                  errorMessage:
                    'Unexpected server side error, impossible to rest your avatar, try again later...',
                });
              }
              dispatchAuthenticatedUserAction({
                type: AuthenticatedUserActionTypes.RESET_AVATAR,
                payload: null,
              });
              return resolve(null);
            }
          });
        },
        updateTutorProfile(newTutor: UpdateTutorObject) {
          return new Promise(async (resolve, reject) => {
            if (
              authenticatedUserState &&
              newTutor.bio &&
              newTutor.location &&
              newTutor.pricePerPost &&
              newTutor.sessionPricePerHour &&
              newTutor.subjects?.length
            ) {
              const res = await ApiHelper(
                `/api/tutors/${authenticatedUserState._id}`,
                newTutor,
                'PUT'
              );
              if (res.errorMessage)
                return reject({
                  errorMessage:
                    'Unexpected server side error, impossible to update your profile, try again later...',
                });
              dispatchAuthenticatedUserAction({
                type: AuthenticatedUserActionTypes.UPDATE_TUTOR,
                payload: res,
              });
              return resolve(null);
            }
            dispatchAuthenticatedUserAction({
              type: AuthenticatedUserActionTypes.UPDATE_TUTOR,
              payload: {
                ...authenticatedUserState,
                postEarnings: newTutor.postEarnings
                  ? newTutor.postEarnings
                  : authenticatedUserState?.postEarnings,
                sessionEarnings: newTutor.sessionEarnings
                  ? newTutor.sessionEarnings
                  : authenticatedUserState?.sessionEarnings,
              },
            });
          });
        },
      }}
    >
      <Show breakpoint="(min-width: 767px)">
        {!user && (
          <Modal isOpen={showSignInMenu} onClose={closeSignInMenu} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalHeader textAlign="center">Sign In to Tutoro</ModalHeader>
              <ModalBody mb="5">
                {providersList.map(provider => (
                  <Button
                    width="100%"
                    key={provider.name}
                    leftIcon={<FcGoogle size="30" />}
                    aria-label="Google OAuth Icon"
                    onClick={() => signIn(provider.id)}
                  >
                    Google
                  </Button>
                ))}
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
        {user && (
          <Modal
            blockScrollOnMount={false}
            isOpen={showUpdateAvatarMenu}
            onClose={closeUpdateAvatarMenu}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Choose another avatar!</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <UpdateAvatarForm />
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
        {user && user.isTutor && (
          <>
            <Modal
              blockScrollOnMount={false}
              isOpen={showUpdateTutorMenu}
              onClose={closeUpdateTutorMenu}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Update your tutor profile</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <UpdateTutorForm />
                </ModalBody>
              </ModalContent>
            </Modal>
            <Modal
              blockScrollOnMount={false}
              isOpen={showEarningsMenu}
              onClose={closeEarningsMenu}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Your earnings as a Tutor</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <EarningsMenu />
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        )}
      </Show>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

export default AuthenticatedUserProvider;
