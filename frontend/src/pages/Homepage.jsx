import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faSearch } from "@fortawesome/free-solid-svg-icons";
import Map from "../components/Map";
import dayjs from "dayjs"; 

export default function Homepage() {

  /**
   * some logic dump:
   * on load, call endpoint to get locations
   * render these locations in the map component
   * only those within 3km will be seen on the map
   * user clicks on a marker
   * state switches to viewtimeslots 
   */



  // ------------------------------------------- LOAD -------------------------------------------
  const [name, setName] = useState(localStorage.getItem("name"))
  const [workoutFreq, setWorkoutFreq] = useState(localStorage.getItem("workoutFreq"))
  const [workoutProg, setWorkoutProg] = useState(localStorage.getItem("workoutProg"))

  // ------------------------------------------- END LOAD -------------------------------------  
  


  // ------------------------------------------- VIEW -------------------------------------------
  const [view, setView] = useState("all_markers"); // State to toggle views
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null)

  const handleMarkerClick = (location) => {
    setSelectedMarker(location);
    setSelectedMarkerId(location.id)
    setView("timeslots"); // Switch to timeslot view
    console.log("change to timeslots")
    console.log(location)
  }

  const handleBack = () => {
    setSelectedMarker(null);
    setSelectedMarkerId(null)
    setView("all_markers"); // Switch back to all markers view
  }

  // ------------------------------------------- END VIEW -------------------------------------  



  // ------------------------------------------- MAP  -------------------------------------------
  const [center, setCenter] = useState({ lat: 1.3521, lng: 103.8198 }); // Default center (Singapore)
  const [zoom, setZoom] = useState(12); // Default zoom
  const [currentLocation, setCurrentLocation] = useState(null); // Current user location
  const [locations, setLocations] = useState([ //dummy data right now
    { id: 1, lat: 1.3376, lng: 103.6969, title: "Circuit Training", type: "gym", popularity: "verypop" },
    { id: 2, lat: 1.2857, lng: 103.8269, title: "Circuit Training", type: "fitness", popularity: "lesspop"},
    { id: 3, lat: 1.2873, lng: 103.8246, title: "Circuit Training", type: "park", popularity: "pop"},
    
  ]);
  const [timeslots, setTimeslots] = useState(["5:00pm - 6:00pm", "6:00pm - 7:00pm", "7:00pm - 8:00pm", "8:00pm - 9:00pm",]) //some dummy data
  const [filteredLocations, setFilteredLocations] = useState([]); // Locations within 3 km
  const [locationQuery, setLocationQuery] = useState(""); // Search query

  // useEffect(() => {
  //   const fetchCurrentLocation = () => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           const userLocation = {
  //             lat: position.coords.latitude,
  //             lng: position.coords.longitude,
  //           };
  //           setCurrentLocation(userLocation);
  //           setCenter(userLocation);
  //           setZoom(15);
  //           filterLocations(userLocation);
  //         },
  //         (error) => {
  //           console.error("Error fetching location:", error);
  //           alert("Unable to fetch your location. Using default location.");
  //         }
  //       );
  //     } else {
  //       alert("Geolocation is not supported by your browser.");
  //     }
  //   };

  //   fetchCurrentLocation();
  // }, []);

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

  // ------------------------------------------- END MAP  -------------------------------------------


  // ------------------------------------------- RENDER TIMESLOT  -------------------------------------------
  const [selectedTimeslot, setSelectedTimeslot] = useState({date: null, timeslot: null}); // State to track selected timeslot

  const handleTimeslotSelect = (date, timeslot) => {
    handleDateSelect(date)
    setSelectedTimeslot({ date, timeslot }); // Update the globally selected timeslot
  };

  // ------------------------------------------- END RENDER TIMESLOT  -------------------------------------------

  



  // ------------------------------------------- SLIDER -------------------------------------------

  const [timeValue, setTimeValue] = useState(18); // Default to 6 PM (24-hour format)
  const today = dayjs(); // Today's date
  const [selectedDate, setSelectedDate] = useState(today.format("YYYY-MM-DD"));
  const dates = Array.from({ length: 7 }, (_, index) =>
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

  // ------------------------------------------- END SLIDER -------------------------------------------



  return (
    <div>
      {/* HEADER - ALL_MARKERS */}
      {view === "all_markers" && (
        <header className="mb-6 bg-[#E5EBF1] p-6 rounded-b-3xl">
          <h1 className="text-3xl font-bold mt-3">Welcome back, {name}!</h1>
          <div className="flex gap-3 mt-3">
            <FontAwesomeIcon icon={faTrophy} className="w-6 h-6" />
            <div className="w-full">
              <p className="text-lg text-gray-500">
                Workout completed this week <span className="text-black font-medium">{workoutProg} of {workoutFreq}</span>
              </p>
              <progress className="progress h-3 w-full bg-white" value={(workoutProg/workoutFreq) * 100} max="100"></progress>
            </div>
          </div>
        </header>
      )}

      {/* HEADER - TIMESLOTS */}
      {view === "timeslots" && selectedMarker && (
        <header className="mb- p-6">

          <div className="flex gap-4 items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={handleBack}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.41379 11.0011H18.9998C19.6668 11.0011 19.9998 11.3351 19.9998 12.0011C19.9998 12.6681 19.6668 13.0011 18.9998 13.0011H7.41379L10.7068 16.2941C10.8023 16.3863 10.8785 16.4967 10.9309 16.6187C10.9833 16.7407 11.0109 16.8719 11.012 17.0047C11.0132 17.1375 10.9879 17.2691 10.9376 17.392C10.8873 17.5149 10.8131 17.6266 10.7192 17.7205C10.6253 17.8144 10.5136 17.8886 10.3907 17.9389C10.2678 17.9892 10.1362 18.0145 10.0034 18.0133C9.87061 18.0122 9.73939 17.9846 9.61738 17.9322C9.49538 17.8798 9.38503 17.8036 9.29279 17.7081L4.29279 12.7081C4.10532 12.5206 4 12.2662 4 12.0011C4 11.7359 4.10532 11.4816 4.29279 11.2941L9.29379 6.29308C9.38603 6.19757 9.49638 6.12139 9.61838 6.06898C9.74039 6.01657 9.87161 5.98898 10.0044 5.98783C10.1372 5.98668 10.2688 6.01198 10.3917 6.06226C10.5146 6.11254 10.6263 6.18679 10.7202 6.28069C10.8141 6.37458 10.8883 6.48623 10.9386 6.60913C10.9889 6.73202 11.0142 6.8637 11.013 6.99648C11.0119 7.12926 10.9843 7.26048 10.9319 7.38249C10.8795 7.50449 10.8033 7.61483 10.7078 7.70708L7.41379 11.0011Z" fill="#476380"/>
              </svg>

              <h2 className="text-3xl font-bold">Join Workout Group</h2>

          </div>
        </header>
      )}

      <div className="px-6">
        {/* MAP SEGMENT */}
        <section className="mb-6">

          {/* SEARCH - ALL_MARKERS */}
          {view === "all_markers" && (
            <>
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
            </>
          )}

          {/* SELECT TIMESLOT - TIMESLOTS */}
          {view === "timeslots" && selectedMarker && (
            <>
              <h1 className="text-lg font-bold">Select a timeslot</h1>
              <div className="carousel w-full my-4">
                <div className="tabs tabs-bordered carousel-item gap-3" role="tablist">
                  {dates.map((date, index) => (
                    <div
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      role = "tab"
                      className={`tab ${
                        selectedDate === date
                          ? "tab-active text-green-500 font-bold"
                          : "border-gray-200 text-gray-700"
                      }`}
                    >
                      <span className="text-md"> 
                        {dayjs(date).isSame(dayjs(), "day") // Check if the date is today
                          ? "Today"
                          : `${dayjs(date).format("ddd")} ${dayjs(date).format("DD")}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
          </>)}

          {/* MAP */}
          <Map 
          locations={filteredLocations} 
          center={center} zoom={zoom} 
          currentLocation={currentLocation} 
          selectedMarkerId={selectedMarkerId} // Pass state to child
          setSelectedMarkerId={setSelectedMarkerId} // Pass setter function
          onMarkerClick={handleMarkerClick}/>

          {/* LEGEND */}
          <div className="mt-2">
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
            
            {view === "all_markers" && (
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
            )}

          </div>
          
          {/* SLIDER & DATE - ALL_MARKERS */}
          {view === "all_markers" && (
            <>
            {/* SLIDER */}
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
                  className="range  w-full range-xs"
                  onChange={(e) => setTimeValue(Number(e.target.value))}
                />

                {/* Labels below the slider */}
                <div className="flex justify-between text-xs text-gray-600 font-semibold">
                  <span>{dayjs(selectedDate).format("DD")} {dayjs(selectedDate).format("MMM")}, 7am</span>
                  <span>{dayjs(selectedDate).format("DD")} {dayjs(selectedDate).format("MMM")}, 10pm</span>
                </div>
              </div>
            </div>

            {/* DATE */}
            <div className="flex gap-2 overflow-x-auto mt-4">
              {dates.map((date, index) => (
                <button
                  key={index}
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
            </>
          )}

        </section>
        
        {/* WORKOUT & ACTIVITIES & NAV - ALL_MARKERS */}
        {view === "all_markers" && (
          <>
            {/* Recommended Workout */}
            <section className="mb-6">
              <h2 className="text-xl font-bold">Recommended Workout</h2>
              
                {/* carousel */}
              <div className="carousel carousel-center rounded-box mt-3 w-full gap-3">

                {/* card-1 */}
                <div className="carousel-item">

                  <div className="card w-[22rem] border border-gray-200">
                    <div className="card-body p-6">
                      <h2 className="card-title text-xl font-semibold flex justify-between items-center">Bodyweight Exercises 
                        <span className="flex space-x-2">
                          <img src="park.png" alt="" className="h-8 w-8"/>
                          <img src="fitness-corner.png" alt="" className="h-8 w-8"/>
                        </span>
                      </h2>
                      <img src="bodyweight.png" alt="" />
                      <p className="font-semibold">Strengthens muscles with bodyweight exercises like push-ups and squats, improving endurance and core stability without equipment.</p>
                    </div>
                  </div>

                </div>

                {/* card-2 */}
                <div className="carousel-item">

                  <div className="card w-[22rem] border border-gray-200">
                    <div className="card-body p-6">
                      <h2 className="card-title text-xl font-semibold flex justify-between items-center">Functional Mobility Training 
                        <span className="flex space-x-2">
                          <img src="gym.png" alt="" className="h-8 w-8"/>
                        </span>
                      </h2>
                      <img src="functional.png" alt="" />
                      <p className="font-semibold">Boost strength by improving joint mobility and movement patterns through stretches, rotations, and resistance exercises.</p>
                    </div>
                  </div>

                </div>

                {/* card-3 */}
                <div className="carousel-item">

                  <div className="card w-[22rem] border border-gray-200">
                    <div className="card-body p-6">
                      <h2 className="card-title text-xl font-semibold flex justify-between items-center">Brisk walks
                        <span className="flex space-x-2">
                          <img src="park.png" alt="" className="h-8 w-8"/>
                          <img src="fitness-corner.png" alt="" className="h-8 w-8"/>
                        </span>
                      </h2>
                      <img src="brisk.png" alt="" />
                      <p className="font-semibold">Strengthen the lower body, improve endurance, and tone muscles with low-impact, moderate-intesity movement.</p>
                    </div>
                  </div>

                </div>


              </div>
            </section>

            {/* Other Activities Section */}
            <section className="mb-20">
              <h2 className="text-xl font-bold">Other Activities</h2>
              <div className="rounded-lg bg-[#F5F7FA] mt-3 p-4">
                <p className="text-md font-semibold">Unlock your unique path to better health with our free health assessment.</p>
                <button className="btn bg-themeGreen w-full rounded-full my-3">
                  Take Health Assessment
                </button>
              </div>
            </section>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md py-2 flex justify-around">
              <button className="btn btn-ghost">My Activities</button>
              <button className="btn btn-ghost">Library</button>
              <button className="btn btn-ghost">Group Chat</button>
              <button className="btn btn-ghost">Settings</button>
            </footer>
          </>
        )}

        {/* TIMESLOTS & STICKY - TIMESLOTS */}
        {view === "timeslots" && selectedMarker && (
          <>
            {/* RENDER DATES */}
            {dates.map((date, index) => (
              <div key={index} className="mb-3">
                {/* title */}
                <h2 className="font-semibold text-lg">
                  {dayjs(date).isSame(dayjs(), "day") ? "Today" : `${dayjs(date).format("ddd")} ${dayjs(date).format("DD")}`}
                </h2>

                {/* buttons */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {timeslots.map((timeslot, index) => (
                    <button
                        key={index}
                        onClick={() => handleTimeslotSelect(date, timeslot)}
                        className={`p-3 rounded-md border font-bold ${
                          selectedTimeslot.date === date && selectedTimeslot.timeslot === timeslot
                            ? "border-green-500 border-2"
                            : "border-gray-200 text-gray-700"
                        }`}
                      >
                        {timeslot}
                      </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mb-32"></div>

            {/* STICKY CTA */}
            <div className="relative">
              <div className="fixed bottom-0 left-0 w-full bg-white p-4  flex-col justify-between items-center z-50 shadow-inner">
                <p className="text-lg font-medium">
                  {dayjs(selectedTimeslot.date).isSame(dayjs(), "day") ? `Today, ${dayjs(selectedTimeslot.date).format("ddd")} ${dayjs(selectedTimeslot.date).format("DD")}, ${selectedTimeslot.timeslot}` : `${dayjs(selectedTimeslot.date).format("ddd")} ${dayjs(selectedTimeslot.date).format("DD")}, ${selectedTimeslot.timeslot}`}
                </p>
                <button className="btn bg-green-500 text-white rounded-full px-6 py-2 flex items-center w-full">
                  Select Timeslot
                </button>
              </div>
            </div>
          </>
        )}

      </div>
      
    </div>
  );
}
