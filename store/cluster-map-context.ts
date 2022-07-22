import React from 'react';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { CloudFile, TutorFilters, TutorObjectGeoJSON } from '../types';

export type PointsCollection = FeatureCollection<Geometry, GeoJsonProperties>;

interface ClusterMapContextObject {
  points: PointsCollection;
  filteredPoints: PointsCollection | null;
  authenticatedTutor: TutorObjectGeoJSON | null;
  updateAuthenticatedTutorLocation(
    newLocation: string,
    newCoordinates: [number, number]
  ): void;
  updateAuthenticatedTutorAvatar(newAvatar: CloudFile): void;
  setFilteredPoints(filters: TutorFilters | null): Promise<void>;
  setPoints(newPoints: PointsCollection | null): void;
}

const ClusterMapContext = React.createContext<ClusterMapContextObject>({
  points: { type: 'FeatureCollection', features: [] },
  authenticatedTutor: null,
  filteredPoints: null,
  updateAuthenticatedTutorLocation(
    newLocation: string,
    newCoordinates: [number, number]
  ) {},
  updateAuthenticatedTutorAvatar(newAvatar: CloudFile) {},
  setFilteredPoints(filters: TutorFilters | null) {
    return Promise.resolve();
  },
  setPoints(newPoints: PointsCollection | null) {},
});

export default ClusterMapContext;
