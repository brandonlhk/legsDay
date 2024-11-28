import {useState, useEffect} from "react"
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faUser, faSignal, faFileLines, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs"; 


export default function MessageGroup () {
    // show actual page first
    const navigate = useNavigate()
    const marker = JSON.parse(localStorage.getItem("marker"))
    const timeslot = JSON.parse(localStorage.getItem("timeslot"))
    const selectedGroup = localStorage.getItem("selectedGroup")
    const userId = localStorage.getItem("userId")
    const [groups, setGroups] = useState(null); // State to store user groups

    console.log(marker)
    console.log(timeslot)
    console.log(selectedGroup)
    console.log(userId)

    // we need to find current message groups

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

    const [view, setView] = useState("groups")

    const getGroups = async () => {
        // Construct the request payload
        const payload = {
            user_id : userId
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/get_user_groups`, {
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

    useEffect(() => {
        if (selectedGroup && marker && timeslot) {
            setView("viewGroup")
        }
    }, [marker, selectedGroup, timeslot, view])


    useEffect(() => {
        const fetchGroups = async () => {
        const userGroups = await getGroups(); // Wait for the async function
        setGroups(userGroups); // Update the state
        console.log("Fetched groups:", userGroups);
        };

        fetchGroups();
    }, []);


    return (
        <div className="p-6">

            {
            // view === "groups" && (
                <>
                    <h2 className="text-2xl font-bold mb-3">Workout Groups</h2>
                    {groups !== null &&
                        groups.map((groupObj, index) => {
                            // Access the date-time key and details object
                            const [time, details] = Object.entries(groupObj)[0]; // Get the first key-value pair
                            const userGroup = formatUserGroupName(details.user_group)

                            return (
                            <div key={index} className="p-3 mb-3 bg-blueGrey rounded-lg">
                                {/* Show the Time */}
                                <h3 className="text-lg font-bold">{userGroup}</h3>

                                {/* Show the Group Details */}
                                <div className="group-details">
                                    <p>
                                        <FontAwesomeIcon icon={faUser} className="mr-3"/>
                                        <span className="text-gray-500">{details.user_group} group</span>
                                    </p>

                                    <p><FontAwesomeIcon icon={faCalendarAlt} className="mr-3"/>
                                        <span className="text-gray-500">{dayjs(time).format("dddd, MMM D, h:mm A")}</span>
                                    </p>

                                    <p><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3"/>
                                        <span className="text-gray-500">{details.location.name}</span>
                                    </p>
                                </div>
                            </div>
                            );
                    })}

                </>
            // )
            }

            {/* nav */}
            <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md py-2 flex justify-around btm-nav text-sm">
              <button onClick={() => navigate("/home")}><span className="btm-nav-label">Home</span></button>
              <button><span className="btm-nav-label">Library</span></button>
              <button className="active"><span className="btm-nav-label">Workout Groups</span></button>
              <button><span className="btm-nav-label">Settings</span></button>
            </footer>
        </div>
    )
}