import { useState } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const mapOptions = {
  gestureHandling: "greedy",
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: false
};

const mapContainerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "20px",
};

export default function Map({ locations, center, zoom, currentLocation, selectedMarkerId, setSelectedMarkerId, onMarkerClick }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;
  // console.log(locations)
  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={zoom} options={mapOptions}>
      {/* Render filtered markers */}
      {locations.map((location) => (
        <Marker
          icon={{
            url: `markers/${location.markerName}.png`,
            scaledSize: new window.google.maps.Size(48, 48)
          }}
          key={location.id}
          position={{ lat: location.coordinates[1], lng: location.coordinates[0] }}
          onClick={() =>{ onMarkerClick(location); setSelectedMarkerId(location.id)}}
          animation={location.id === selectedMarkerId ? window.google.maps.Animation.BOUNCE : null}
        />
      ))}

      {/* Render blue marker for current location */}
      {currentLocation && (
        <Marker
          position={currentLocation}
          title="Your Current Location"
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
        />
      )}

    </GoogleMap>
  );
}
