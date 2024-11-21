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
  height: "250px",
  borderRadius: "20px",
};

export default function Map({ locations, center, zoom, currentLocation }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={zoom} options={mapOptions}>
      {/* Render filtered markers */}
      {locations.map((location) => (
        <Marker
          icon={{
            url: `markers/${location.popularity}-${location.type}.png`,
            scaledSize: new window.google.maps.Size(48, 48)
          }}
          key={location.id}
          position={{ lat: location.lat, lng: location.lng }}
          title={location.title}
          onClick={() => setSelectedLocation(location)}
        />
      ))}

      {/* Render blue marker for current location */}
      {currentLocation && (
        <Marker
          position={currentLocation}
          title="Your Current Location"
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
        />
      )}

      {/* InfoWindow */}
      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div>
            <h2 className="font-semibold">{selectedLocation.title}</h2>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
