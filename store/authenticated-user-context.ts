import React from 'react';
import type { UserDocumentObject } from '../models/User';
import type { CloudFile } from '../utils/types';

export interface UpdateTutorObject {
  location?: string;
  subjects?: string[];
  bio?: string;
  pricePerPost?: number;
  sessionPricePerHour?: number;
  sessionEarnings?: number;
  postEarnings?: number;
}

type UserUpdateError = { errorMessage: string };

interface AuthenticatedUserContextObject {
  user: UserDocumentObject | null;
  showSignInMenu: boolean;
  openSignInMenu(): void;
  closeSignInMenu(): void;
  showUpdateAvatarMenu: boolean;
  openUpdateAvatarMenu(): void;
  closeUpdateAvatarMenu(): void;
  showUpdateTutorMenu: boolean;
  openUpdateTutorMenu(): void;
  closeUpdateTutorMenu(): void;
  showEarningsMenu: boolean;
  openEarningsMenu(): void;
  closeEarningsMenu(): void;
  showDeleteAccountMenu: boolean;
  openDeleteAccountMenu(): void;
  closeDeleteAccountMenu(): void;
  deleteAccount(): Promise<null>;
  updateAvatar(cloudinaryResponse: CloudFile): Promise<null | UserUpdateError>;
  resetAvatar(): Promise<null | UserUpdateError>;
  becomeTutor(
    formData: Record<string, string | string[]>
  ): Promise<null | UserUpdateError>;
  updateTutorProfile(
    newTutor: UpdateTutorObject
  ): Promise<null | UserUpdateError>;
}

const AuthenticatedUserContext =
  React.createContext<AuthenticatedUserContextObject>({
    user: null,
    showSignInMenu: false,
    openSignInMenu() {},
    openEarningsMenu() {},
    closeEarningsMenu() {},
    showEarningsMenu: false,
    closeSignInMenu() {},
    showUpdateAvatarMenu: false,
    openUpdateAvatarMenu() {},
    closeUpdateAvatarMenu() {},
    showUpdateTutorMenu: false,
    openUpdateTutorMenu() {},
    closeUpdateTutorMenu() {},
    showDeleteAccountMenu: false,
    openDeleteAccountMenu() {},
    closeDeleteAccountMenu() {},
    deleteAccount() {
      return Promise.resolve(null);
    },
    updateAvatar(cloudinaryResponse: CloudFile) {
      return Promise.resolve(null);
    },
    resetAvatar() {
      return Promise.resolve(null);
    },
    updateTutorProfile(newTutor: UpdateTutorObject) {
      return Promise.resolve(null);
    },
    becomeTutor(formData: Record<string, string | string[]>) {
      return Promise.resolve(null);
    },
  });

export default AuthenticatedUserContext;
