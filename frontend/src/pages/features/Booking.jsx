import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faUser, faSignal, faFileLines, faCircleCheck, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import dayjs from "dayjs"

export default function Booking() {
    const marker = JSON.parse(localStorage.getItem("marker"))
    const timeslot = JSON.parse(localStorage.getItem("timeslot"))
    const userId = localStorage.getItem("userId")
    const bookings = JSON.parse(localStorage.getItem("bookings"))
    // console.log(marker)

    // Extract and preprocess the start time (e.g., "7:00am")
    const startTime = timeslot.timeslot.split(" - ")[0].trim(); // Extract the starting time
    const isPM = startTime.toLowerCase().includes("pm");
    const [hour, minute] = startTime.replace(/am|pm/i, "").split(":").map(Number); // Extract hour and minute
    const formattedHour = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour); // Handle PM and 12 AM edge cases
    const formattedTime = `${String(formattedHour).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}:00`; // Format to "HH:MM:SS"

    const navigate = useNavigate()
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [videos, setVideos] = useState([])
    const [chat, setChat] = useState([])


    // agree checkbox
    const [agreed, setAgreed] = useState(false)
    
    // view
    const [view, setView] = useState("selectWorkout")
    
    const scrollBackToTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    // handleViews
    const handleBack = () => {
        if (view === "selectWorkout") {
            navigate("/home")
        }

        if (view === "agree") {
            setView("selectWorkout")
            scrollBackToTop()
        }
    }

    const selectWorkout = () => {
        setView("agree")
        scrollBackToTop()
    }


    const workouts = [
    {
        id: 1,
        type: "gym",
        name: "Functional Mobility Training",
        description: "Boosts strength by improving joint mobility and movement patterns through stretches, rotations, and resistance exercises.",
        difficulty: "Low",
        image: "functional.png",
        tag: "functional_mobility_training"
    },
    {
        id: 2,
        type: "gym",
        name: "General Strength Training",
        description: "Builds muscle by using resistance exercises to target different muscle groups, promoting growth and strength through progressive overload.",
        difficulty: "Medium",
        image: "strength.png",
        tag: "general_strength_training"
    },
    {
        id: 3,
        type: "gym",
        name: "Powerlifting",
        description: "Builds muscle strength through heavy, compound lifts like squats, deadlifts, and bench presses, promoting growth and power with progressive overload.",
        difficulty: "High",
        image: "powerlifting.png",
        tag: "powerlifting"

    },
    {
        id: 4,
        type: "others",
        name: "Bodyweight Exercises",
        description: "Strengthens muscles with bodyweight exercises like push-ups and squats, improving endurance and core stability without equipment.",
        difficulty: "Medium",
        image: "bodyweight.png",
        tag: "calisthenics"

    },
    {
        id: 5,
        type: "others",
        name: "Brisk walk",
        description: "Strengthen the lower body, improve endurance, and tone muscles with low-impact, moderate-intensity movement.",
        difficulty: "Low",
        image: "brisk.png",
        tag: "brisk_walk"
    },
    {
        id: 6,
        type: "others",
        name: "2.4km Run",
        description: "Strengthens the legs, hips, and core wile improving muscle endurance, toning muscles, and boosting cardiovascular health with a short-distance run.",
        difficulty: "Medium",
        image: "running.png",
        tag: "2.4k"

    },
    {
        id: 7,
        type: "others",
        name: "5km Run",
        description: "Strengthens the legs, hips, and core wile improving muscle endurance, toning muscles, and boosting cardiovascular health with a short-distance run.",
        difficulty: "High",
        image: "running.png",
        tag: "5k"

    },
    ];
    const categoryToType = {
        gym: "gym",
        parks: "others",
        fitness_corner: "others",
      };
    // Filter workouts based on the category type
    const filteredWorkouts = workouts.filter(
        (workout) => workout.type === categoryToType[marker.locationType]
    );

    const join = async () => {
        // Construct the join request payload
        // console.log(marker)
        // console.log(selectedWorkout);
        const payloadForJoin = {
            date: timeslot.date, // Expected timeslot format: { date: "YYYY-MM-DD", time: "HH:mm" }
            time: formattedTime,
            user_id: userId,
            booking_name: selectedWorkout.name, // Group name selected by the user
            location_id: marker.id, // Use the location ID from marker
            location_type: marker.locationType, // Use the location type from marker (e.g., "gym", "park", etc.)
        };
        
        let category = "bodyweight"

        if (selectedWorkout.name.includes("mobility")) {
            category = "mobility"
        }
        
        if (selectedWorkout.name.includes("general_strength")) {
            category = "general_strength"
        }
        
        if (selectedWorkout.name.includes("powerlifting")) {
            category = "powerlifting"
        }

        const payloadForVideos = {
            category : category
        }
    
        // Define the URLs for both requests
        const joinUrl = `${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/join_user_group`;
        const videosUrl = `${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/get_videos`;
    
        try {
            // Create the join request
            const joinRequest = fetch(joinUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payloadForJoin),
            });
    
            // Create the videos request (template request for videos list)
            const videosRequest = fetch(videosUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payloadForVideos),
            });
    
            // Execute both requests in parallel
            const [joinResponse, videosResponse] = await Promise.all([joinRequest, videosRequest]);
            
            // Handle the join request response
            const status = await joinResponse.json() 
            console.log(status)

            if (status.message.includes("already joined")) {
                alert("You have joined another group in the same timeslot!");
                return; // Stop further execution
            }

            if (status.event_details) {
                sessionStorage.setItem("groupData", JSON.stringify(status.event_details));
                setChat(status.event_details.chat_data.chat_history.messages);
            }

            // Handle the videos request response
            if (videosResponse.ok) {
                const response = await videosResponse.json();
                setVideos(response)
            } else {
                console.error("Failed to fetch videos");
                alert("Failed to fetch videos. Please try again.");
            }

            // Update the view after both requests succeed
            setView("complete");
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        } catch (error) {
            console.error("An error occurred:", error);
            alert("An error occurred. Please try again.");
        }
    };
    

    const joinConvo = () => {
        navigate("/message-groups", {
            state: {
                from : "joinConvo",
              },
        })
    }
    

  return (
    <div className="p-6">
      {/* GO BACK - SELECTWORKOUT & CHOOSEGROUP & DONE */}
      {view !== "complete" && (
        <>
            <header className="mb-6">

                <div className="flex gap-4 items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={handleBack}>
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.41379 11.0011H18.9998C19.6668 11.0011 19.9998 11.3351 19.9998 12.0011C19.9998 12.6681 19.6668 13.0011 18.9998 13.0011H7.41379L10.7068 16.2941C10.8023 16.3863 10.8785 16.4967 10.9309 16.6187C10.9833 16.7407 11.0109 16.8719 11.012 17.0047C11.0132 17.1375 10.9879 17.2691 10.9376 17.392C10.8873 17.5149 10.8131 17.6266 10.7192 17.7205C10.6253 17.8144 10.5136 17.8886 10.3907 17.9389C10.2678 17.9892 10.1362 18.0145 10.0034 18.0133C9.87061 18.0122 9.73939 17.9846 9.61738 17.9322C9.49538 17.8798 9.38503 17.8036 9.29279 17.7081L4.29279 12.7081C4.10532 12.5206 4 12.2662 4 12.0011C4 11.7359 4.10532 11.4816 4.29279 11.2941L9.29379 6.29308C9.38603 6.19757 9.49638 6.12139 9.61838 6.06898C9.74039 6.01657 9.87161 5.98898 10.0044 5.98783C10.1372 5.98668 10.2688 6.01198 10.3917 6.06226C10.5146 6.11254 10.6263 6.18679 10.7202 6.28069C10.8141 6.37458 10.8883 6.48623 10.9386 6.60913C10.9889 6.73202 11.0142 6.8637 11.013 6.99648C11.0119 7.12926 10.9843 7.26048 10.9319 7.38249C10.8795 7.50449 10.8033 7.61483 10.7078 7.70708L7.41379 11.0011Z" fill="#476380"/>
                    </svg>

                    <h2 className="text-3xl font-bold">Join Workout Group</h2>

                </div>
            </header>
        </>
      )}

      {view === "agree" && (
        <>
            <div className="mb-3">
                <img className="w-full" src={selectedWorkout.image} alt="" />
                <h2 className="text-lg font-bold">{selectedWorkout.name}</h2>
                <p>{selectedWorkout.description}</p>
                <p className="text-gray-600 mt-3">Level of difficulty: {selectedWorkout.difficulty}</p>
            </div>
        </>
      )}

      {/* SUCCESSFUL - COMPLETE */}
        {view === "complete" && (
            <>
                <div className="flex flex-col items-center text-center my-6">
                    <div className="text-green-500 mb-2">
                    <FontAwesomeIcon icon={faCircleCheck} size="3x" />
                    </div>
                    <h1 className="text-3xl font-bold">You’re all set!</h1>

                    <div className="bg-blueGrey p-4 mt-6 flex">
                            <FontAwesomeIcon icon={faFileLines} className="mr-3 mt-2"/>
                        <p className="text-md text-gray-600 text-left">
                        Please note that our platform only facilitates joining workout groups.
                        <br /><br />Visit the respective gym&apos;s website to complete facility bookings before the session date.
                        </p>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-bold mb-3">{selectedWorkout.name}</h2>
                </div>

            </>
        )

        }
      {/* Date and Location */}
      <div className="mb-6">
        {view === "done" || view === "complete" && (
            <>
                <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon icon={faSignal} />
                    <span className="text-gray-500">Level of difficulty: {selectedWorkout.difficulty}</span>
                </div>
            </>
        )}
        {view === "done" || view === "agree" || view === "complete" && (
            <>
                <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon icon={faUser} />
                    <span className="text-gray-500">Users booked: {Number(bookings[selectedWorkout.name] ?? 0) + 1}</span>
                </div>
            
            </>
        )}
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span className="text-gray-500">{dayjs(timeslot.date).format("ddd D")}, {timeslot.timeslot}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span className="text-gray-500">{marker.address}</span>
        </div>
      </div>

    {/* TERMS AND CONDITIONS - AGREE */}
    {view === "agree" && (
        <>
            <div className="divider"></div>
            <h2 className="text-xl font-bold">Terms of Engagement of Group Workout Sessions on WorkoutKakis</h2>
            <p>Before proceeding, please read and agree to the following guidelines to ensure a positive and supportive community experience:</p>
            <p className="mt-3"><span className="font-bold">Respect is Key:</span> Treat everyone with kindness and respect. We are all here to learn, grow, and support each other.</p>
            <p className="mt-3"><span className="font-bold">Inclusivity matters:</span> This is a safe space for everyone, regardless of fitness level, background, or identity. Encourage and uplift one another.</p>
            <p className="mt-3"><span className="font-bold">Zero Tolerance for Inappropriate Behavior:</span> Harassment, bullying, or any form of inappropriate actions will not be tolerated and may result in removal from the platform.</p>
            <p className="mt-3"><span className="font-bold">Punctuality and Commitment:</span> Show respect for others’ time by being prompt and reliable for sessions you’ve committed to.</p>
            <p className="mt-3"><span className="font-bold">Safety First:</span> Prioritize your health and well-being. Listen to your body and inform the group members of any concerns or limitations.</p>
            <p className="mt-3"><span className="font-bold">Open Communication:</span> Share feedback constructively and report any issues to the app moderators.</p>

            {/* agree portion here */}
            <div className="flex mb-16 mt-3">
                <label className="label">
                    <input type="checkbox" className="checkbox" onChange={() => setAgreed((!agreed))}/>
                    <p className="ml-3">I agree to the terms of engagement for group workout sessions and commit to promoting a respectful, inclusive, and positive environment.</p>
                </label>
            </div>
        </>
    )}

    {/* SELECT WORKOUT OPTIONS - SELECTWORKOUT */}
    {view === "selectWorkout" && (
        <>
            {/* Workout Options */}
            <h2 className="text-lg font-bold mb-4">Select a preferred workout</h2>
            <div className="flex flex-col items-center space-y-4 mb-24">
                {filteredWorkouts.map((workout) => {
                    // Get the booking count from the marker's bookings using the workout name.
                    // If there's no booking for this workout, default to 0.
                    const bookingsObj = bookings[marker.id]
                    let bookingCount = 0
                    if (bookingsObj){ 
                        bookingCount = bookingsObj[workout.name];
                    }                    

                    return (
                    <div
                        className={`card w-[22rem] border border-gray-200 ${
                        selectedWorkout && selectedWorkout.id === workout.id
                            ? "border-green-500 shadow-md"
                            : "border-gray-200"
                        }`}
                        key={workout.id}
                        onClick={() => setSelectedWorkout(workout)}
                    >
                        <div className="card-body p-6">
                        <h2 className="card-title text-xl font-semibold flex justify-between items-center">
                            {workout.name}
                        </h2>
                        <img src={workout.image} alt={workout.name} />
                        <p className="font-semibold">{workout.description}</p>
                        <p className="text-sm text-gray-600">
                            No of attendees: {bookingCount}
                        </p>
                        </div>
                    </div>
                    );
                })}
            </div>
        </>
    )}

    {/* SELECT WORKOUT BUTTON - SELECTWORKOUT */}
    {view === "selectWorkout" && (
        <>
            {/* Footer Button */}
            <div className="mt-6 fixed bottom-0 left-0 w-full p-4 bg-white shadow-md">
                <button
                className={`w-full py-3 font-bold rounded-full ${
                    selectedWorkout
                    ? "bg-themeGreen text-white"
                    : "bg-blueGrey text-[#476380] cursor-not-allowed"
                }`}
                disabled={!selectedWorkout}
                onClick={selectWorkout}
                >
                Select Workout
                </button>
            </div>
        </>
    )}

    {/* SHOW VIDEOS */}
    {view === "complete" && (

        <div className="flex flex-col mb-6">
            <p className="font-bold">Unsure of what exercises to do?</p>
            <div className="flex flex-col gap-y-1">
                {videos.videos.map((link, index) => (
                    <a key={index} className="text-tertGreen" href={link} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faBookOpen} className="mr-2"/>View exercise guide</a>
                ))}
            </div>  
        </div>
    )}

    {/* JOIN CONVERSATION PAGE (SHOW CONVO) - COMPLETE */}
    {view === "complete" && (
        <div className="mb-28">
            <h2 className="text-lg font-bold">Join the conversation!</h2>

            <div className="my-4 bg-gray-100 rounded-lg p-4">
                {chat.length !== 0 && chat.map((convo, index) => (
                    <div key={index} className="mb-2">
                        <p>
                            <strong>{convo.name}</strong>:
                        </p>
                        <p>{convo.message}</p>
                        <small>{dayjs(convo.timestamp).format("DD MMM, h:mm A")} </small>
                    </div>
                ))}

                {chat.length === 0 && (
                    <p className="text-center mt-3">There are no messages yet! Send one to introduce yourself!</p>
                )}
            </div>
        </div>
    )}

    {/* SELECT WORKOUT BUTTON - SELECTWORKOUT */}
    {view === "agree" && (
        <>
            {/* Footer Button */}
            <div className="mt-6 fixed bottom-0 left-0 w-full p-4 bg-white shadow-md ">
                <button
                className={`w-full py-3 font-bold rounded-full ${
                agreed
                ? "bg-themeGreen text-white"
                : "bg-blueGrey text-[#476380] cursor-not-allowed"
            }`}
                disabled={!agreed}
                onClick={join}
                >
                Join Workout Group
                </button>
            </div>
        </>
    )}

    {/* GO HOME OR JOIN CONVO BUTTONS- COMPLETE */} 
    {view === "complete" && (
        <>
            {/* Footer Button */}
            <div className="mt-6 fixed bottom-0 left-0 w-full p-4 bg-white shadow-md">
            <button
            className={`w-full py-3 font-bold rounded-full bg-themeGreen`}
            onClick={joinConvo}
            >
                Join Conversation 
                </button>

                <button
                className="btn btn-ghost w-full py-3 text-themeGreen font-bold rounded-full"
                onClick={() => {navigate("/home")}}
                >
                Back to homepage
                </button>
            </div>
        </>
    )}
    </div>
  );
};
