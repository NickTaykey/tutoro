import { useState, useRef, useContext } from 'react';
import Map, {
  GeolocateControl,
  FullscreenControl,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  Popup,
  Marker,
} from 'react-map-gl';
import {
  unclusteredPointLayer,
  clusterCountLayer,
  clusterLayer,
} from './layers';
import TutorPopup from './TutorPopup';
import ClusterMapContext from '../../store/cluster-map-context';

import type { MapRef, GeoJSONSource } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'mapbox-gl';
import type { TutorObjectGeoJSON } from '../../types';

const ClusterMap: React.FC = () => {
  const [popupInfo, setPopupInfo] = useState<TutorObjectGeoJSON | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  const onMapClick = (e: MapLayerMouseEvent) => {
    if (e.features && e.features.length) {
      const clusterId = e.features[0]!.properties!.cluster_id;
      const mapboxSource = mapRef!.current!.getSource(
        'tutors'
      ) as GeoJSONSource;
      mapboxSource.getClusterExpansionZoom(clusterId, (_, zoom) => {
        mapRef!.current!.easeTo({
          center: e.lngLat,
          zoom,
          duration: 500,
        });
      });
    }
  };

  const onMapLoad = () => {
    mapRef!.current!.on('click', 'unclustered-point', e => {
      const { properties } = e.features![0];
      setPopupInfo({
        type: 'Feature',
        properties: {
          ...e.features![0].properties,
          reviews: JSON.parse(properties!.reviews),
          createdReviews: JSON.parse(properties!.createdReviews),
        },
        geometry: JSON.parse(properties!.geometry),
      } as TutorObjectGeoJSON);
    });
  };

  const { points, filteredPoints, authenticatedTutor } =
    useContext(ClusterMapContext);

  return (
    <Map
      initialViewState={{
        latitude: 45.46,
        longitude: 9.19,
        zoom: 7,
        bearing: 0,
        pitch: 0,
      }}
      interactiveLayerIds={[clusterLayer.id!]}
      onClick={onMapClick}
      onLoad={onMapLoad}
      ref={mapRef}
      style={{ minHeight: '300px' }}
      mapStyle="mapbox://styles/mapbox/streets-v10"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      testMode={true}
    >
      <Source
        id="tutors"
        type="geojson"
        data={filteredPoints ? filteredPoints : points}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredPointLayer} />
      </Source>
      {authenticatedTutor && (
        <Marker
          longitude={authenticatedTutor.geometry.coordinates[0]}
          latitude={authenticatedTutor.geometry.coordinates[1]}
          anchor="top"
          color="var(--chakra-colors-red-500)"
          onClick={() => setPopupInfo(authenticatedTutor)}
        />
      )}
      {popupInfo && (
        <Popup
          closeOnClick={false}
          style={
            authenticatedTutor?.properties._id === popupInfo.properties._id
              ? {
                  marginLeft: '15px',
                }
              : {}
          }
          anchor={
            authenticatedTutor?.properties._id === popupInfo.properties._id
              ? 'left'
              : 'top'
          }
          longitude={+popupInfo.geometry.coordinates[0]}
          latitude={+popupInfo.geometry.coordinates[1]}
          onClose={() => setPopupInfo(null)}
        >
          <TutorPopup
            popupInfo={popupInfo}
            authenticatedTutor={
              popupInfo.properties._id === authenticatedTutor?.properties._id
            }
          />
        </Popup>
      )}
      <GeolocateControl position="top-left" />
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />
      <ScaleControl />
    </Map>
  );
};

export default ClusterMap;
