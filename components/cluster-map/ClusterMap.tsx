import { useState, useRef } from 'react';
import Map, {
  GeolocateControl,
  FullscreenControl,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  Popup,
} from 'react-map-gl';
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from './layers';
import TutorPopup from './TutorPopup';

import type { MapRef, GeoJSONSource } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'mapbox-gl';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { TutorObjectGeoJSON } from '../../types';

const ClusterMap: React.FC<{
  tutors: FeatureCollection<Geometry, GeoJsonProperties>;
}> = ({ tutors }) => {
  const [popupInfo, setPopupInfo] = useState<TutorObjectGeoJSON | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const onMapClick = (event: MapLayerMouseEvent) => {
    const feature: any = event.features![0];
    const clusterId = feature!.properties!.cluster_id;
    const mapboxSource = mapRef!.current!.getSource('tutors') as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (_, zoom) => {
      mapRef!.current!.easeTo({
        center: feature!.geometry!.coordinates,
        zoom,
        duration: 500,
      });
    });
  };

  const onMapLoad = () => {
    mapRef!.current!.on('click', 'unclustered-point', e => {
      setPopupInfo({
        type: 'Feature',
        properties: e.features![0].properties,
        geometry: { type: 'Point', coordinates: e.lngLat.toArray() },
      } as TutorObjectGeoJSON);
    });
  };

  return (
    <Map
      initialViewState={{
        latitude: 45.46,
        longitude: 9.19,
        zoom: 7,
        bearing: 0,
        pitch: 0,
      }}
      interactiveLayerIds={[clusterLayer.id]}
      onClick={onMapClick}
      onLoad={onMapLoad}
      ref={mapRef}
      style={{ width: '80vw', height: '80vh', margin: '0 auto' }}
      mapStyle="mapbox://styles/mapbox/dark-v9"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      testMode={true}
    >
      <Source
        id="tutors"
        type="geojson"
        data={tutors}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredPointLayer} />
      </Source>
      {popupInfo && (
        <Popup
          closeOnClick={false}
          anchor="top"
          longitude={+popupInfo.geometry.coordinates[0]}
          latitude={+popupInfo.geometry.coordinates[1]}
          onClose={() => setPopupInfo(null)}
        >
          <TutorPopup popupInfo={popupInfo} />
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
