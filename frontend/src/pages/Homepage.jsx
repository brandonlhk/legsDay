import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faSearch } from "@fortawesome/free-solid-svg-icons";
import Map from "../components/Map";
import dayjs from "dayjs"; 

export default function Homepage() {

  // ------------------------------------------- on load stuff -------------------------------------------
  const [name, setName] = useState(localStorage.getItem("name"))
  const [workoutFreq, setWorkoutFreq] = useState(localStorage.getItem("workoutFreq"))

  // ------------------------------------------- end of on load stuff -------------------------------------  


  // ------------------------------------------- MAP STUFF -------------------------------------------
  const [center, setCenter] = useState({ lat: 1.3521, lng: 103.8198 }); // Default center (Singapore)
  const [zoom, setZoom] = useState(12); // Default zoom
  const [currentLocation, setCurrentLocation] = useState(null); // Current user location
  const [locations, setLocations] = useState([ //dummy data right now
    { id: 1, lat: 1.3521, lng: 103.8198, title: "Strength – Fit" },
    { id: 2, lat: 1.344, lng: 103.819, title: "HIIT" },
    { id: 3, lat: 1.338, lng: 103.81, title: "Circuit Training" },
    { id: 4, lat: 1.3376, lng: 103.6969, title: "Circuit Training" },
  ]);
  const [filteredLocations, setFilteredLocations] = useState([]); // Locations within 3 km
  const [locationQuery, setLocationQuery] = useState(""); // Search query

  useEffect(() => {
    const fetchCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(userLocation);
            setCenter(userLocation);
            setZoom(15);
            filterLocations(userLocation);
          },
          (error) => {
            console.error("Error fetching location:", error);
            alert("Unable to fetch your location. Using default location.");
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    };

    fetchCurrentLocation();
  }, []);

  // Handle search
  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${locationQuery}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        const newLocation = data.results[0].geometry.location;
        setCurrentLocation(newLocation);
        setCenter(newLocation);
        setZoom(15);
        filterLocations(newLocation);
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  // Filter locations within 3 km of the current location
  const filterLocations = (current) => {
    const R = 6371; // Radius of Earth in km
    const toRad = (value) => (value * Math.PI) / 180;

    const nearbyLocations = locations.filter((loc) => {
      const dLat = toRad(loc.lat - current.lat);
      const dLng = toRad(loc.lng - current.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(current.lat)) *
          Math.cos(toRad(loc.lat)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km
      return distance <= 3; // Filter locations within 3 km
    });

    setFilteredLocations(nearbyLocations);
  };

  // ------------------------------------------- END OF MAP STUFF -------------------------------------------



  // ------------------------------------------- SLIDER STUFF -------------------------------------------

  const [timeValue, setTimeValue] = useState(18); // Default to 6 PM (24-hour format)
  const today = dayjs(); // Today's date
  const [selectedDate, setSelectedDate] = useState(today.format("YYYY-MM-DD"));
  const dates = Array.from({ length: 6 }, (_, index) =>
    today.add(index, "day").format("YYYY-MM-DD")
  );

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };


  const formatTime = (value) => {
    // Convert 24-hour value to readable time (e.g., 6 PM)
    const hours = Math.floor(value);
    const isAM = hours < 12;
    const displayHour = hours % 12 || 12;
    const period = isAM ? "AM" : "PM";
    return `${displayHour} ${period}`;
  };

  const calculatePosition = () => {
    const min = 7; // Start time
    const max = 22; // End time
    const position = ((timeValue - min) / (max - min)) * 100; // Percentage
    return position;
  };


  const getTooltipStyle = () => {
    const position = calculatePosition();
    if (position <= 10) {
      // Tooltip near the left edge
      return { left: "0%", transform: "translateX(0%)", textAlign: "left" };
    } else if (position >= 90) {
      // Tooltip near the right edge
      return { right: "0%", transform: "translateX(0%)", textAlign: "right" };
    } else {
      // Tooltip centered above the slider knob
      return { left: `${position}%`, transform: "translateX(-50%)", textAlign: "center" };
    }
  };

  // ------------------------------------------- END OF SLIDER STUFF -------------------------------------------



  return (
    <div>
      <header className="mb-6 bg-[#E5EBF1] p-6 rounded-b-3xl">
        <h1 className="text-3xl font-bold mt-3">Welcome back!</h1>
        <div className="flex gap-3 mt-3">
          <FontAwesomeIcon icon={faTrophy} className="w-6 h-6" />
          <div className="w-full">
            <p className="text-lg text-gray-500">
              Workout completed this week <span className="text-black font-medium">0 of {workoutFreq}</span>
            </p>
            <progress className="progress h-3 w-full bg-white" value="0" max="100"></progress>
          </div>
        </div>
      </header>

      <div className="px-6">
        {/* Map Section */}
        <section className="mb-6">
          <h2 className="text-xl font-bold">Find workout groups near you</h2>
          <div className="join w-full my-2">
            <input
              type="text"
              placeholder="Your location"
              className="w-full input input-bordered join-item"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <button onClick={handleSearch} className="btn join-item">
              <FontAwesomeIcon icon={faSearch}/>
            </button>
          </div>
          <p className="mb-3">Tap the location icons below to find workout group in your community.</p>

          {/* map component */}
          <Map locations={filteredLocations} center={center} zoom={zoom} currentLocation={currentLocation} />

          {/* legend */}
          <div>
            {/* top part */}
            <div className="flex gap-3 text-sm">

              <div className="flex items-center gap-2">
                <span className="w-8 h-2 bg-green-500 rounded-md"></span>
                <span>Less Popular</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-8 h-2 bg-yellow-500 rounded-md"></span>
                <span>Popular</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-8 h-2 bg-orange-500 rounded-md"></span>
                <span>Very Popular</span>
              </div>

            </div>

            <div className="flex gap-6 text-sm">

              <div className="flex">
                <img src="park.png" alt="" className="w-6 h-6"/>
                <p>Park</p>
              </div>

              <div className="flex">
                <img src="fitness-corner.png" alt="" className="w-6 h-6"/>
                <p>Fitness Corner</p>
              </div>
              
              <div className="flex">
                <img src="gym.png" alt="" className="w-6 h-6"/>
                <p>Gym</p>
              </div>

            </div>
          </div>

          {/* slider component */}
          <div className="flex flex-col items-center">
            <div className="relative w-full mt-10">
              {/* Tooltip */}
              <div
                className="absolute -top-8 text-sm bg-gray-200 p-1 rounded-md min-w-[6rem]"
                style={getTooltipStyle()}
              >
                {`${dayjs(selectedDate).format("DD")} ${dayjs(selectedDate).format("MMM")}, ${formatTime(timeValue)}`}
              </div>

              {/* Slider */}
              <input
                type="range"
                min="7" // Start time (7 AM)
                max="22" // End time (10 PM)
                value={timeValue}
                step="1" // Step increments of 1 hour
                className="range  w-full range-sm"
                onChange={(e) => setTimeValue(Number(e.target.value))}
              />

              {/* Labels below the slider */}
              <div className="flex justify-between text-xs mt-1 text-gray-600">
                <span>{dayjs(selectedDate).format("DD")} {dayjs(selectedDate).format("MMM")}, 7am</span>
                <span>{dayjs(selectedDate).format("DD")} {dayjs(selectedDate).format("MMM")}, 10pm</span>
              </div>
            </div>
          </div>

          {/* dates */}
          <div className="flex gap-2 overflow-x-auto mt-4">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => handleDateSelect(date)}
                className={`flex flex-col items-center w-16 py-2 border rounded-md ${
                  selectedDate === date
                    ? "border-green-500 text-green-500 font-bold"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                <span className="text-lg">{dayjs(date).format("DD")}</span>
                <span className="text-sm">{dayjs(date).format("MMM")}</span>
              </button>
            ))}
          </div>



        </section>

        {/* Recommended Workout */}
        <section className="mb-6">
        <h2 className="text-xl font-bold">Recommended Workout</h2>

        </section>

        {/* Other Activities Section */}
        <section>
          <h2 className="text-xl font-bold">Other Activities</h2>
          <button className="btn btn-primary w-full mb-32">
            Take Health Assessment
          </button>
        </section>

        {/* Footer Navigation */}
        <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md py-2 flex justify-around">
          <button className="btn btn-ghost">My Activities</button>
          <button className="btn btn-ghost">Library</button>
          <button className="btn btn-ghost">Group Chat</button>
          <button className="btn btn-ghost">Settings</button>
        </footer>
      </div>
      
    </div>
  );
}
