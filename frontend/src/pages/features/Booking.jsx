import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faUser, faSignal, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

export default function Booking() {
    const marker = JSON.parse(localStorage.getItem("marker"))
    const timeslot = JSON.parse(localStorage.getItem("timeslot"))
    console.log(marker)
    console.log(timeslot)
    
    // Extract and preprocess the start time (e.g., "7:00am")
    const startTime = timeslot.timeslot.split(" - ")[0].trim(); // Extract the starting time
    const isPM = startTime.toLowerCase().includes("pm");
    const [hour, minute] = startTime.replace(/am|pm/i, "").split(":").map(Number); // Extract hour and minute
    const formattedHour = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour); // Handle PM and 12 AM edge cases
    const formattedTime = `${String(formattedHour).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}:00`; // Format to "HH:MM:SS"

    const navigate = useNavigate()
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null)
    
    // view
    const [view, setView] = useState("selectWorkout")
    
    // handleViews
    const handleBack = () => {
        if (view === "selectWorkout") {
            navigate("/home")
        }

        if (view === "chooseGroup") {
            setView("selectWorkout")
        }
    }

    const selectWorkout = () => {
        setView("chooseGroup")
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
        fitness_corners: "others",
      };
    // Filter workouts based on the category type
    const filteredWorkouts = workouts.filter(
        (workout) => workout.type === categoryToType[marker.category]
    );

    const join = async () => {
        // Construct the request payload
        const payload = {
            date: timeslot.date, // Expected timeslot format: { date: "YYYY-MM-DD", time: "HH:mm" }
            time: formattedTime,
            user_id: localStorage.getItem("userId"),
            user_group: selectedGroup, // Group name selected by the user
            location_id: marker.id, // Use the location ID from marker
            location_type: marker.category, // Use the location type from marker (e.g., "gym", "park", etc.)
        };

        try {
            const response = await fetch("http://localhost:5000/join_user_group", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            });

            if (response.ok) {
            alert("Successfully joined the group!");
            setView("done")
            const result = await response.json();
            console.log("Join group result:", result);
            } else {
            console.error("Failed to join group:", await response.text());
            alert("Failed to join the group. Please try again.");
            }
        } catch (error) {
            console.error("Error joining the group:", error);
            alert("An error occurred. Please try again.");
        }
    }

  return (
    <div className="p-6">
      {/* GO BACK - SELECTWORKOUT & CHOOSEGROUP */}
      {view !== "done" && (
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

      {/* SUCCESSFUL - DONE */}
        {view === "done" && (
            <>
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="text-green-500 mb-2">
                    <FontAwesomeIcon icon={faSignal} size="3x" />
                    </div>
                    <h1 className="text-2xl font-bold">You’re all set!</h1>

                    <div className="bg-blueGrey p-4">
                        <p className="text-sm text-gray-600 mt-2">
                            <FontAwesomeIcon icon={faFileLines}/>
                        Please note that our platform only facilitates joining workout groups.
                        Visit the respective gym's website to complete facility bookings before the session date.
                        </p>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-bold">{selectedWorkout.name}</h2>
                </div>

            </>
        )

        }
      {/* Date and Location */}
      <div className="mb-6">
        {view === "done" && (
            <>
                <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon icon={faSignal} />
                    <span className="text-gray-500">{selectedWorkout.difficulty}</span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon icon={faUser} />
                    <span className="text-gray-500">{selectedGroup}</span>
                </div>
            
            </>
        )}
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span className="text-gray-500">{timeslot.date}, {timeslot.timeslot}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span className="text-gray-500">{marker.coordinates[0]}, {marker.coordinates[1]}</span>
        </div>
      </div>

    {/* SELECT WORKOUT - SELECTWORKOUT */}
    {view === "selectWorkout" && (
        <>
            {/* Workout Options */}
            <h2 className="text-lg font-bold mb-4">Select a preferred workout</h2>
            <div className="flex flex-col items-center space-y-4 mb-24">
                {filteredWorkouts.map((workout) => (
                    <div className={`card w-[22rem] border border-gray-200 ${selectedWorkout && selectedWorkout.id === workout.id ? "border-green-500 shadow-md" : "border-gray-200"}`} key={workout.id} 
                    onClick={() => setSelectedWorkout(workout)}>
                    <div className="card-body p-6">
                    <h2 className="card-title text-xl font-semibold flex justify-between items-center">{workout.name} 
                    </h2>
                    <img src={workout.image} alt="" />
                    <p className="font-semibold">Strengthens muscles with bodyweight exercises like push-ups and squats, improving endurance and core stability without equipment.</p>
                    </div>
                </div>
                ))}
            </div>
        </>
    )}

    {/* SELECT WORKOUT BUTTON - SELECTWORKOUT */}
    {view === "selectWorkout" && (
        <>
            {/* Footer Button */}
            <div className="mt-6 fixed bottom-0 left-0 w-full p-4 bg-white shadow-md">
                <button
                className="w-full py-3 bg-green-500 text-white font-bold rounded-lg"
                disabled={!selectedWorkout}
                onClick={selectWorkout}
                >
                Select Workout
                </button>
            </div>
        </>
    )}

    {view === "done" && (
        <>
            <h2 className="text-lg font-bold">Join the conversation!</h2>

        </>
    )}

    {/* CHOOSE GROUP - CHOOSEGROUP */}
    {view === "chooseGroup" && (
        <>
            <h2 className="text-lg font-bold mb-4">Select a workout group to join</h2>
            <div className="card w-full border border-gray-200">
                <div className="card-body p-6 bg-blueGrey">
                    <h2 className="text-lg font-bold">{selectedWorkout.name}</h2>
                    <p>{selectedWorkout.description}</p>
                    <p>Level of difficulty: {selectedWorkout.difficulty}</p>
                </div>
            </div>

            {/* add conditoning later */}
            <div className="mt-6 space-y-3">
                {Object.keys(marker.userGroups)
                .filter((group) => group.startsWith(selectedWorkout.tag)) // Match userGroups using the selected workout's tag
                .map((group, index) => (
                    <div
                        key={index}
                        className={`p-4 border rounded-lg flex justify-between items-center cursor-pointer ${
                        selectedGroup === group ? "border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                        onClick={() => setSelectedGroup(group)} // Set the selected group
                    >
                        <div>
                            <h3 className="text-lg font-semibold capitalize">
                                {group.replace(/_/g, " ").replace("general", "General Group").replace("ladies", "Ladies Only Group").replace("parents", "Parents Only Group")}
                            </h3>
                            <p className="text-sm text-gray-600">
                            <FontAwesomeIcon icon={faUser} />
                            <span className="ml-3">{marker.userGroups[group].users.length} pax has joined</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )}

    {/* SELECT WORKOUT BUTTON - SELECTWORKOUT */}
    {view === "chooseGroup" && (
        <>
            {/* Footer Button */}
            <div className="mt-6 fixed bottom-0 left-0 w-full p-4 bg-white shadow-md">
                <button
                className="w-full py-3 bg-green-500 text-white font-bold rounded-lg"
                disabled={!selectedGroup}
                onClick={join}
                >
                Join Workout Group
                </button>
            </div>
        </>
    )}

    {/* GO HOME OR JOIN CONVO - DONE */} 
    {view === "done" && (
        <>
            {/* Footer Button */}
            <div className="mt-6 fixed bottom-0 left-0 w-full p-4 bg-white shadow-md">
                <button
                className="w-full py-3 bg-themeGreen text-white font-bold rounded-full"
                disabled={!selectedGroup}
                onClick={join}
                >
                Join Conversation 
                </button>

                <button
                className="btn btn-ghost w-full py-3 text-themeGreen font-bold rounded-full"
                disabled={!selectedGroup}
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
