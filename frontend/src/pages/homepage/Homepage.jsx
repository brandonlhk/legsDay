import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faSearch, faUser, faCalendarAlt, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import Map from "../../components/Map";
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
  const [workoutProg, setWorkoutProg] = useState(localStorage.getItem("workoutCounter"))
  const [groups, setGroups] = useState(null); // State to store user groups
  const userId = localStorage.getItem("userId")
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  // Track if `fetchCurrentLocation` has been called
  const hasFetchedLocation = useRef(false);

  const getGroups = async () => {
    // Construct the request payload
    const payload = {
        user_id : userId
    };

    try {
        const response = await fetch(`${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/get_user_groups`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        });

        if (response.ok) {
            const result = await response.json();
            return result.user_groups
        } else {
            console.error("Failed to get groups:", await response.text());
        }
    } catch (error) {
        console.error("Error getting groups:", error);
    }
  }

  const formatUserGroupName = (userGroup) => {
    // Split the string by underscores
    const parts = userGroup.split("_");
    
    // Remove the last part
    parts.pop();
    
    // Join the remaining parts into a readable name
    const formattedName = parts
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" "); // Join with spaces

    return formattedName;
  };


  // ------------------------------------------- END LOAD -------------------------------------  
  


  // ------------------------------------------- VIEW -------------------------------------------
  const [view, setView] = useState("all_markers"); // State to toggle views
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null)

  const handleMarkerClick = (location) => {
    setSelectedMarker(location);
    setSelectedMarkerId(location.id)
    setView("timeslots"); // Switch to timeslot view
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
  const [locations, setLocations] = useState([]);
  const [locationQuery, setLocationQuery] = useState(""); // Search query

  const handleSearch = async () => {
    try {
      setLoading(true)
      let currentPosition = locationQuery
      if (locationQuery === "") {
        currentPosition = "MacRitchie"
      }
      fetchCoordinates(currentPosition)
      const requestBody = {
        address: currentPosition, // Use the user's search query for the address
        date: selectedDate, // Current date in YYYY-MM-DD format
        time: `${timeValue}:00:00`, // Current time in HH:mm:ss format
      };
  
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/get_nearest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody), // Send the request body as JSON
      });
  
      const data = await response.json();
      console.log(data)
  
      if (data.locations) {
        const allLocations = [];
        Object.keys(data.locations).forEach((category) => {

          const categoryData = data.locations[category];
  
          Object.keys(categoryData).forEach((id) => {
            const location = categoryData[id];
            const userGroups = location.user_groups || {};
  
            // Calculate total popularity
            const totalPopularity = Object.values(userGroups).reduce(
              (sum, group) => sum + (group.users?.length || 0),
              0
            );
  
            // Determine popularity status
            let popularityStatus = "lesspop";
            if (totalPopularity >= 3 && totalPopularity <= 10) {
              popularityStatus = "pop";
            } else if (totalPopularity >= 11) {
              popularityStatus = "verypop";
            }
            console.log(`${popularityStatus}-${category}`)
            // Add location with calculated marker name
            allLocations.push({
              id,
              category,
              coordinates: location.coordinates,
              markerName: `${popularityStatus}-${category}`,
              userGroups : location.user_groups
            });
          });
        });
  
        // Update the map state
        if (allLocations.length > 0) {
          setLocations(allLocations);
          setZoom(15);
        } else {
          alert("No locations found near your search.");
        }
        setLoading(false)
      } else {
        alert("No locations found.");
      }
    } catch (error) {
      console.error("Error fetching nearest locations:", error);
    }
  };

  const fetchCurrentLocation = () => {
    if (hasFetchedLocation.current) return; // Prevent multiple calls
    hasFetchedLocation.current = true; // Mark as called

    if (navigator.geolocation) {
      console.log("Fetching current location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Set location states
          setCurrentLocation(userLocation);
          setCenter(userLocation);
          setZoom(15);

          console.log("Calling handleSearch...");
          handleSearch(); // Trigger search after setting location
        },
        (error) => {
          console.error("Error fetching location:", error);
          handleSearch(); // Trigger search even on error
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };


  useEffect(() => {
    fetchCurrentLocation(); // Runs once on mount
    const fetchGroups = async () => {
      const userGroups = await getGroups(); // Wait for the async function
      setGroups(userGroups); // Update the state
      console.log("Fetched groups:", userGroups);
      };

      fetchGroups();
  }, []);
  

  // ------------------------------------------- END MAP  -------------------------------------------




  // ------------------------------------------- SLIDER -------------------------------------------

  const today = dayjs(); // Today's date
  const currentHour = today.hour()
  const [selectedDate, setSelectedDate] = useState(
    currentHour >= 22 ? today.add(1, "day").format("YYYY-MM-DD") : today.format("YYYY-MM-DD")
  );
  const startDay = currentHour >= 22 ? today.add(1, "day") : today;
  const dates = Array.from({ length: 7 }, (_, index) =>
    startDay.add(index, "day").format("YYYY-MM-DD"));
  const startHour = 7; // Start at 7 AM
  const endHour = 22; // End at 10 PM (22 in 24-hour format)
  const isAfterEndHour = currentHour >= endHour;



  const generateTimeSlots = (startHour, endHour) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const start = dayjs().hour(hour).minute(0).format("h:00a");
      const end = dayjs().hour(hour + 1).minute(0).format("h:00a");
      slots.push(`${start} - ${end}`);
    }
    return slots;
  };



  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const isToday = dayjs(date).isSame(dayjs(), "day");
    const filteredSlots = isToday
      ? timeslots.filter((_, index) => startHour + index >= currentHour)
      : timeslots;
    setRenderedTimeslots(filteredSlots);
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

  const getDefaultTime = () => {
    const currentHour = dayjs().hour();
    if (currentHour >= 22 || currentHour < startHour) {
      return startHour;
    }
    return currentHour;
  };
  const [timeValue, setTimeValue] = useState(getDefaultTime);
  const timeslots = generateTimeSlots(startHour, endHour + 1)
  const filteredTimeslots =
  dayjs(selectedDate).isSame(dayjs(), "day") && !isAfterEndHour
    ? timeslots.filter((_, index) => startHour + index >= currentHour)
    : timeslots;
  const [renderedTimeslots, setRenderedTimeslots] = useState(filteredTimeslots);
  

  // ------------------------------------------- END SLIDER -------------------------------------------


  
  // ------------------------------------------- RENDER TIMESLOT  -------------------------------------------
  const [selectedTimeslot, setSelectedTimeslot] = useState({date: selectedDate, timeslot: timeslots[0]}); // State to track selected timeslot

  const handleTimeslotSelect = (date, timeslot) => {
    handleDateSelect(date);
    setSelectedTimeslot({ date, timeslot }); // Update the globally selected timeslot
  
    const get24HourValue = (time) => {
      const [hours, minutes] = time
      .toUpperCase() // Ensure case consistency
      .replace("AM", "") // Remove AM
      .replace("PM", "") // Remove PM
      .trim() // Remove extra spaces
      .split(":")
      .map(Number); // Convert to numbers
  
    // Adjust for PM times
    const isPM = time.toUpperCase().includes("PM");
    const hour24 = isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours;
  
    console.log("Converted 24-hour value:", hour24);
    return hour24;
    };

    // Parse the start time from the timeslot (e.g., "7:00 AM - 8:00 AM")
    const [startTime] = timeslot.split(" - "); // Extract "7:00 AM"
    const parsedHour = get24HourValue(startTime)
  
    // Update the slider value
    setTimeValue(parsedHour);
  };
  

  // ------------------------------------------- END RENDER TIMESLOT  -------------------------------------------


    const handleNextPage = () => {
      localStorage.setItem("marker", JSON.stringify(selectedMarker))
      localStorage.setItem("timeslot", JSON.stringify(selectedTimeslot))
      navigate("/booking")
    }

    const fetchCoordinates = async (locationQuery) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            locationQuery
          )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
    
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          setCurrentLocation(location); // Update current location
          setCenter(location); // Center the map
        } else {
          console.error("Location not found");
          return null;
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
      }
    }

    useEffect(() => {
      if (!didMount.current) {
        // Skip the first render
        didMount.current = true;
        return;
      }
    
      // Call handleSearch on subsequent updates
      handleSearch();
    }, [timeValue, selectedDate]);
    const didMount = useRef(false); // Ref to track the first render
  

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
        <header className="p-6">

          <div className="flex gap-4 items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={handleBack}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.41379 11.0011H18.9998C19.6668 11.0011 19.9998 11.3351 19.9998 12.0011C19.9998 12.6681 19.6668 13.0011 18.9998 13.0011H7.41379L10.7068 16.2941C10.8023 16.3863 10.8785 16.4967 10.9309 16.6187C10.9833 16.7407 11.0109 16.8719 11.012 17.0047C11.0132 17.1375 10.9879 17.2691 10.9376 17.392C10.8873 17.5149 10.8131 17.6266 10.7192 17.7205C10.6253 17.8144 10.5136 17.8886 10.3907 17.9389C10.2678 17.9892 10.1362 18.0145 10.0034 18.0133C9.87061 18.0122 9.73939 17.9846 9.61738 17.9322C9.49538 17.8798 9.38503 17.8036 9.29279 17.7081L4.29279 12.7081C4.10532 12.5206 4 12.2662 4 12.0011C4 11.7359 4.10532 11.4816 4.29279 11.2941L9.29379 6.29308C9.38603 6.19757 9.49638 6.12139 9.61838 6.06898C9.74039 6.01657 9.87161 5.98898 10.0044 5.98783C10.1372 5.98668 10.2688 6.01198 10.3917 6.06226C10.5146 6.11254 10.6263 6.18679 10.7202 6.28069C10.8141 6.37458 10.8883 6.48623 10.9386 6.60913C10.9889 6.73202 11.0142 6.8637 11.013 6.99648C11.0119 7.12926 10.9843 7.26048 10.9319 7.38249C10.8795 7.50449 10.8033 7.61483 10.7078 7.70708L7.41379 11.0011Z" fill="#476380"/>
              </svg>

              <h2 className="text-3xl font-bold">Join Workout Group</h2>

          </div>
        </header>
      )}

      <div className="px-6">

        {/* GROUPS */}
        {groups !== null && (
          <>
            <section className="mb-3">
              <h2 className="text-xl font-bold">Your workout Group(s)</h2>
            <div className="carousel carousel-center rounded-box mt-3 w-full gap-6">
                {groups !== null &&
                  groups.map((groupObj, index) => {
                    // Access the date-time key and details object
                    const [time, details] = Object.entries(groupObj)[0];
                    const userGroup = formatUserGroupName(details.user_group);
                    const groupType = details.user_group.split("_").pop();

                    return (
                      <div key={index} className="carousel-item">
                        <div className="p-4 bg-blueGrey rounded-lg shadow-md">
                          {/* Show the Group Name */}
                          <h3 className="text-lg font-bold">{userGroup}</h3>

                          {/* Show the Group Details */}
                          <div className="group-details mt-2">
                            <p>
                              <FontAwesomeIcon icon={faUser} className="mr-3" />
                              <span className="text-gray-500">{groupType} group</span>
                            </p>

                            <p>
                              <FontAwesomeIcon icon={faCalendarAlt} className="mr-3" />
                              <span className="text-gray-500">{dayjs(time).format("dddd, MMM D, h:mm A")}</span>
                            </p>

                            <p>
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3" />
                              <span className="text-gray-500">{details.location.name}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          </>
        )}
        
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
          locations={locations} 
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
                  min="7"
                  max="22" // End time (10 PM)
                  value={timeValue}
                  step="1" // Step increments of 1 hour
                  className="range  w-full range-xs"
                  onChange={(e) => {
                    const newValue = Number(e.target.value);

                    // If today, prevent moving slider to earlier times than currentHour
                    if (dayjs(selectedDate).isSame(dayjs(), "day") && newValue < currentHour) {
                      return; // Ignore invalid movement
                    }
                    setTimeValue(newValue);
                
                    // Find the corresponding timeslot
                    const slotIndex = Math.max(0, newValue - startHour);
                    const selectedSlot = renderedTimeslots[slotIndex];
                
                    // Update the selected timeslot
                    if (selectedSlot) {
                      setSelectedTimeslot({ date: selectedDate, timeslot: selectedSlot });
                    }
                  }}
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
            {/* nav */}
            <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md py-2 flex justify-around btm-nav text-sm">
              <button className="active"><span className="btm-nav-label">Home</span></button>
              <button><span className="btm-nav-label">Library</span></button>
              <button onClick={() => {
                // clear everything before going into message-groups
                localStorage.removeItem("marker")
                localStorage.removeItem("timeslot")
                localStorage.removeItem("selectedGroup")
                navigate("/message-groups")
              }}><span className="btm-nav-label">Workout Groups</span></button>
              <button><span className="btm-nav-label">Settings</span></button>
            </footer>
          </>
        )}

        {/* TIMESLOTS & STICKY - TIMESLOTS */}
        {view === "timeslots" && selectedMarker && (
          <>
            {/* title */}
            <h2 className="font-semibold text-lg">
              {dayjs(selectedDate).isSame(dayjs(), "day") ? "Today" : `${dayjs(selectedDate).format("ddd")} ${dayjs(selectedDate).format("DD")}`}
            </h2>
            
            {/* RENDER DATES */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {renderedTimeslots.map((timeslot, index) => (
                <button
                    key={index}
                    onClick={() => handleTimeslotSelect(selectedDate, timeslot)}
                    className={`p-3 rounded-md border font-bold ${
                      selectedTimeslot.date === selectedDate && selectedTimeslot.timeslot === timeslot
                        ? "border-green-500 border-2"
                        : "border-gray-200 text-gray-700 border-2"
                    }`}
                  >
                    {timeslot}
                  </button>
              ))}
            </div>
   

            <div className="mb-32"></div>

            {/* STICKY CTA */}
            <div className="relative">
              <div className="fixed bottom-0 left-0 w-full bg-white p-4  flex-col justify-between items-center z-50 shadow-inner">
                <p className="text-lg font-medium">
                  {dayjs(selectedTimeslot.date).isSame(dayjs(), "day") ? `Today, ${dayjs(selectedTimeslot.date).format("ddd")} ${dayjs(selectedTimeslot.date).format("DD")}, ${selectedTimeslot.timeslot}` : `${dayjs(selectedTimeslot.date).format("ddd")} ${dayjs(selectedTimeslot.date).format("DD")}, ${selectedTimeslot.timeslot}`}
                </p>
                <button className="btn bg-green-500 text-white rounded-full px-6 py-2 flex items-center w-full" onClick={() => handleNextPage()}>
                  Select Timeslot
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {loading && (
      
      <> 
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
            <p className="mt-4 text-white text-lg font-bold">Loading...</p>
            </div>
        </div>
      </>
      )}
      
    </div>
  );
}
