import {useState, useEffect} from "react"
import {GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api"

const mapOptions = {
    gestureHandling: 'greedy',
    mapTypeControl: false,     // Disables Map/Satellite toggle
    streetViewControl: false,  // Disables the yellow Street View pegman
    fullscreenControl: false,  // Disables fullscreen option (optional)
    zoomControl: true,         // Keeps zoom control visible (optional)
};

const mapContainerStyle = {
    width: '100%',
    height: '250px', // Adjust the height to fit the mobile view you want
  };
  
  const defaultCenter = {
    lat: 1.3521, // Set to the desired latitude (example: Singapore)
    lng: 103.8198, // Set to the desired longitude
  };

  const locations = [
      { id: 1, lat: 1.3521, lng: 103.8198, title: 'Strength – Fit' },
      { id: 2, lat: 1.344, lng: 103.819, title: 'HIIT' },
      { id: 3, lat: 1.338, lng: 103.81, title: 'Circuit Training' },
  ];

export default function Map() {

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const [markersVisible, setMarkersVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [zoom, setZoom] = useState(12)
    const [center, setCenter] = useState(defaultCenter);
    const [query, setQuery] = useState('');
    const [filteredLocations, setFilteredLocations] = useState(locations);

    useEffect(() => {
        if (isLoaded) {
          // Set a timeout to delay marker rendering
          const timer = setTimeout(() => setMarkersVisible(true), 500);
          return () => clearTimeout(timer);
        }
      }, [isLoaded]);
    
    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;


    const handleSearch = async () => {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
    
          if (data.results.length > 0) {
            const location = data.results[0].geometry.location;
            setCenter(location);
            setZoom(15)
    
            // Filter markers to show only those within 3 km of the searched location
            const nearbyLocations = locations.filter((loc) => {
              const distance = calculateDistance(
                location.lat,
                location.lng,
                loc.lat,
                loc.lng
              );
              return distance <= 3; // Show markers within 3 km radius
              
            });
            setFilteredLocations(nearbyLocations);
            setMarkersVisible(true)
          } else {
            alert('Location not found');
          }
        } catch (error) {
          console.error('Error fetching location:', error);
        }
      };
    
      // Helper function to calculate distance between two coordinates (in km)
      const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Radius of Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      
    return (
        <div className="p-4 bg-gray-100">
        <h1 className="text-lg font-bold mb-4">Explore workout classes</h1>
        <div className="flex gap-2 mb-4">
            <input
            type="text"
            placeholder="Enter location (e.g., Clementi)"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch} className="px-4 py-2 bg-gray-200 rounded-md">Filter</button>
        </div>
    
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={zoom}
            center={center}
            options={mapOptions}
        >

            {markersVisible  && filteredLocations.map((location) => (
            <Marker
                key={location.id}
                position={{ lat: location.lat, lng: location.lng }}
                title={location.title}
                onClick={() => setSelectedLocation(location)}
            />
            ))}

        {selectedLocation && (
            <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)} // Close InfoWindow on close click
            >
            <div>
                <h2 className="font-semibold">{selectedLocation.title}</h2>
                <p>Lat: {selectedLocation.lat}, Lng: {selectedLocation.lng}</p>
            </div>
            </InfoWindow>
        )}
            
        </GoogleMap>
    
        <div className="mt-4">
            <p className="text-gray-500">3 locations found</p>
            {locations.map((location) => (
            <div key={location.id} className="bg-white p-4 my-2 rounded-lg shadow">
                <h2 className="text-lg font-semibold">{location.title}</h2>
                <p className="text-gray-600">
                <span className="font-bold">Location:</span> {location.title} Gym, Address here
                </p>
                <p className="text-gray-500 mt-1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula.
                </p>
                <button className="mt-2 px-4 py-2 w-full border border-gray-300 rounded-md text-center">
                Find Out More
                </button>
            </div>
            ))}
        </div>
        </div>
    );
};
