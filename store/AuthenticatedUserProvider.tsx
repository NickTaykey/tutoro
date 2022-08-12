import AuthenticatedUserContext from './authenticated-user-context';
import { Show, useDisclosure } from '@chakra-ui/react';
import { UserDocumentObject } from '../models/User';
import ApiHelper from '../utils/api-helper';
import { signOut } from 'next-auth/react';
import { useReducer } from 'react';

import type { UpdateTutorObject } from './authenticated-user-context';
import type { CloudFile } from '../utils/types';
import NavbarModals from '../components/global/navbar/NavbarModals';

enum AuthenticatedUserActionTypes {
  UPDATE_AVATAR,
  UPDATE_TUTOR,
  RESET_AVATAR,
  DELETE_ACCOUNT,
}

type UpdateAvatarAction = {
  type: AuthenticatedUserActionTypes.UPDATE_AVATAR;
  payload: CloudFile;
};

type ResetAvatarAction = {
  type: AuthenticatedUserActionTypes.RESET_AVATAR;
  payload: null;
};

type DeleteAccountAction = {
  type: AuthenticatedUserActionTypes.DELETE_ACCOUNT;
  payload: null;
};

type UpdateTutorAction = {
  type: AuthenticatedUserActionTypes.UPDATE_TUTOR;
  payload: UpdateTutorObject;
};

type AuthenticatedUserAction =
  | UpdateAvatarAction
  | UpdateTutorAction
  | ResetAvatarAction
  | DeleteAccountAction;

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
  if (action.type === AuthenticatedUserActionTypes.DELETE_ACCOUNT) {
    return null;
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
  const {
    isOpen: showDeleteAccountMenu,
    onOpen: openDeleteAccountMenu,
    onClose: closeDeleteAccountMenu,
  } = useDisclosure();

  const deleteAccount = () => {
    return new Promise<null>(async resolve => {
      await ApiHelper('/api/auth/delete-account', null, 'DELETE');
      signOut();
      dispatchAuthenticatedUserAction({
        type: AuthenticatedUserActionTypes.DELETE_ACCOUNT,
        payload: null,
      });
      window.location.assign('/tutors');
      return resolve(null);
    });
  };

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
        showDeleteAccountMenu,
        openDeleteAccountMenu,
        closeDeleteAccountMenu,
        user: authenticatedUserState,
        deleteAccount,
        updateAvatar(cloudinaryResponse: CloudFile) {
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
                cloudinaryResponse,
                'PUT'
              );
              if (error || !newAvatar)
                return reject({
                  errorMessage:
                    'Unexpected server error, impossible to upload your avatar, try again later...',
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
              window.location.assign('/users/tutor-profile');
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
                    'Unexpected server side error, impossible to reset your avatar, try again later...',
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
      <NavbarModals />
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

export default AuthenticatedUserProvider;
