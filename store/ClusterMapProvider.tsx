import React, { useReducer } from 'react';
import ClusterMapContext from './cluster-map-context';
import type { PointsCollection } from './cluster-map-context';
import type { CloudFile, TutorFilters, TutorObjectGeoJSON } from '../types';
import ApiHelper from '../utils/api-helper';
import { getUsersPointsCollection } from '../utils/casting-helpers';

enum ClusterMapActionTypes {
  SET_POINTS,
  SET_FILTERED_POINTS,
  SET_AUTHENTICATED_TUTOR,
  UPDATE_AUTHENTICATED_TUTOR_LOCATION,
  UPDATE_AUTHENTICATED_TUTOR_AVATAR,
}

interface SetPointsAction {
  type: ClusterMapActionTypes.SET_POINTS;
  payload: { newPoints: PointsCollection };
}

interface SetFilterdPointsAction {
  type: ClusterMapActionTypes.SET_FILTERED_POINTS;
  payload: { newPoints: PointsCollection | null };
}

interface SetAuthenticatedTutorAction {
  type: ClusterMapActionTypes.SET_AUTHENTICATED_TUTOR;
  payload: { newAuthenticatedTutor: TutorObjectGeoJSON };
}

interface UpdateAuthenticatedTutorLocationAction {
  type: ClusterMapActionTypes.UPDATE_AUTHENTICATED_TUTOR_LOCATION;
  payload: { newCoordinates: [number, number]; newLocation: string };
}

interface UpdateAuthenticatedTutorAvatarAction {
  type: ClusterMapActionTypes.UPDATE_AUTHENTICATED_TUTOR_AVATAR;
  payload: { newAvatar: CloudFile };
}

type ClusterMapAction =
  | SetPointsAction
  | SetFilterdPointsAction
  | SetAuthenticatedTutorAction
  | UpdateAuthenticatedTutorLocationAction
  | UpdateAuthenticatedTutorAvatarAction;

type ClusterMapState = {
  points: PointsCollection;
  filteredPoints: PointsCollection | null;
  authenticatedTutor: TutorObjectGeoJSON | null;
};

function reducer(
  prevState: ClusterMapState,
  action: ClusterMapAction
): ClusterMapState {
  if (action.type === ClusterMapActionTypes.SET_FILTERED_POINTS) {
    return { ...prevState, filteredPoints: action.payload.newPoints };
  }
  if (action.type === ClusterMapActionTypes.SET_POINTS) {
    return { ...prevState, points: action.payload.newPoints };
  }
  if (action.type === ClusterMapActionTypes.UPDATE_AUTHENTICATED_TUTOR_AVATAR) {
    return {
      ...prevState,
      authenticatedTutor: {
        ...prevState.authenticatedTutor!,
        properties: {
          ...prevState.authenticatedTutor!.properties,
          avatar: action.payload.newAvatar,
        },
      },
    };
  }
  if (
    action.type === ClusterMapActionTypes.UPDATE_AUTHENTICATED_TUTOR_LOCATION &&
    prevState.authenticatedTutor
  ) {
    return {
      ...prevState,
      authenticatedTutor: {
        ...prevState.authenticatedTutor,
        properties: {
          ...prevState.authenticatedTutor.properties,
          location: action.payload.newLocation,
        },
        geometry: {
          ...prevState.authenticatedTutor.geometry,
          coordinates: action.payload.newCoordinates,
        },
      },
    };
  }
  if (action.type === ClusterMapActionTypes.SET_AUTHENTICATED_TUTOR) {
    return {
      ...prevState,
      authenticatedTutor: action.payload.newAuthenticatedTutor,
    };
  }
  return prevState;
}

const ClusterMapContextProvider: React.FC<{
  points: PointsCollection;
  authenticatedTutor: TutorObjectGeoJSON | null;
  children: React.ReactNode[] | React.ReactNode;
}> = ({ points, authenticatedTutor, children }) => {
  const [clusterMapState, dispatchclusterMapStateAction] = useReducer(reducer, {
    points,
    authenticatedTutor,
    filteredPoints: null,
  });
  return (
    <ClusterMapContext.Provider
      value={{
        points: clusterMapState.points,
        filteredPoints: clusterMapState.filteredPoints,
        authenticatedTutor: clusterMapState.authenticatedTutor,
        updateAuthenticatedTutorLocation(
          newLocation: string,
          newCoordinates: [number, number]
        ) {
          dispatchclusterMapStateAction({
            type: ClusterMapActionTypes.UPDATE_AUTHENTICATED_TUTOR_LOCATION,
            payload: { newLocation, newCoordinates },
          });
        },
        updateAuthenticatedTutorAvatar(newAvatar: CloudFile) {
          dispatchclusterMapStateAction({
            type: ClusterMapActionTypes.UPDATE_AUTHENTICATED_TUTOR_AVATAR,
            payload: { newAvatar },
          });
        },
        async setFilteredPoints(filters: TutorFilters | null) {
          if (filters) {
            const res = await ApiHelper('/api/tutors/filter', filters, 'GET');
            dispatchclusterMapStateAction({
              type: ClusterMapActionTypes.SET_FILTERED_POINTS,
              payload: { newPoints: getUsersPointsCollection(res.tutors) },
            });
            return;
          }
          dispatchclusterMapStateAction({
            type: ClusterMapActionTypes.SET_FILTERED_POINTS,
            payload: { newPoints: null },
          });
        },
        setPoints(newPoints: PointsCollection) {
          dispatchclusterMapStateAction({
            type: ClusterMapActionTypes.SET_POINTS,
            payload: { newPoints },
          });
        },
      }}
    >
      {children}
    </ClusterMapContext.Provider>
  );
};

export default ClusterMapContextProvider;
