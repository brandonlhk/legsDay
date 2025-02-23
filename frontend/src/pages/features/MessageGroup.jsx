import { useState, useEffect } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faPaperPlane, faUser } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";

export default function MessageGroup() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name")
  const userId = localStorage.getItem("userId");

  const [groups, setGroups] = useState(null); // State to store user groups
  const [view, setView] = useState("groups"); // Tracks which view to display (group list or chat)
  const [currentGroup, setCurrentGroup] = useState(null); // Current group being viewed
  const [newMessage, setNewMessage] = useState(""); // Message input field
  const { state } = useLocation(); // Retrieve passed state
  const [groupTime, setGroupTime] = useState("") 
  const [locationId, setLocationId] = useState("")
  const [locationType, setLocationType] = useState("")

  const { from } = state;
  const [chatMessages, setChatMessages] = useState([]); // Messages for the selected group
  
  useEffect(() => {
    if (from === "direct") {
      const { time, chat, location_type, groupObj } = state;
      setLocationId(groupObj.location_id)
      setLocationType(location_type)
      setView("viewGroup");
      setGroupTime(time)
      setChatMessages(chat)
      setCurrentGroup(groupObj)
    }

    if ( from === "joinConvo") {
      const groupData = JSON.parse(sessionStorage.getItem("groupData"));
      setView("viewGroup");
      setGroupTime(groupData.datetime)
      setLocationId(groupData.location_id)
      setCurrentGroup(groupData);
      setLocationType(groupData.location_type)
      setChatMessages(groupData.chat_data.chat_history.messages); // Load initial chat messages
    }
  }, []);


  const getGroups = async () => {
    const payload = {
      user_id: userId,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/get_user_groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // console.log(result)
        return result.user_groups;
      } else {
        console.error("Failed to get groups:", await response.text());
      }
    } catch (error) {
      console.error("Error getting groups:", error);
    }
  };


  useEffect(() => {
    const fetchGroups = async () => {
      const userGroups = await getGroups();
      setGroups(userGroups);
      // console.log("Fetched groups:", userGroups);
    };

    fetchGroups();
  }, []);

  const sendMessageToServer = async () => {
    if (!newMessage.trim()) return; // Prevent empty messages
  
    const msgTimestamp = dayjs().toISOString(); // Get current timestamp
    const payload = {
      timeslot: groupTime,
      msg_timestamp: msgTimestamp,
      user_id: userId,
      booking_name: currentGroup.booking_name, 
      location_type: locationType, 
      location_id: locationId, 
      msg_content: newMessage, 
    };
  
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/save_chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        // Append message to chat state
        const newChatMessage = {
          timestamp: dayjs(msgTimestamp).toISOString(), // Add the timestamp as a field
          name,
          user_id: userId,
          message : newMessage
        };
  
        setChatMessages((prevChat) => [...prevChat, newChatMessage]); // Append new message
        setNewMessage(""); // Clear the input field
      } else {
        console.error("Failed to save message:", await response.text());
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const exitGroup = async (date, time, details) => {

    const payload = {
      date,
      time,
      user_id: userId,
      booking_name: details.booking_name,
      location_type: details.location_type,
      location_id: details.location_id,
  };
  
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/exit_user_group`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        alert("Exited the group")
        window.location.reload();

    };
    } catch (error) {
      console.error("Error exiting group:", error);
    }
  }

  const handleCheckIn = async (date, time, details) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/check_in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          date,
          time,
          booking_name: details.booking_name,
          location_type: details.location_type,
          location_id: details.location_id,
        }),
      });
  
      const data = await response.json();
  
      if (data.checked_in) {

        try {
          await fetch(`${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/workout_increment/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            }
          });
          let currentCount = localStorage.getItem("workoutCounter")
          localStorage.setItem("workoutCounter", Number(currentCount) +1)

        } catch (error) {
          console.error("Can't update counter")
        }

        alert("Checked in successfully!");
        window.location.reload()
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      alert("Failed to check in. Please try again.");
    }
  }

  return (
    <div className="p-6">

      {/* HEADER - TIMESLOTS */}
      {view === "viewGroup"  && (
        <header className="mb-6">

          <div className="flex gap-4 items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => setView("groups")}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.41379 11.0011H18.9998C19.6668 11.0011 19.9998 11.3351 19.9998 12.0011C19.9998 12.6681 19.6668 13.0011 18.9998 13.0011H7.41379L10.7068 16.2941C10.8023 16.3863 10.8785 16.4967 10.9309 16.6187C10.9833 16.7407 11.0109 16.8719 11.012 17.0047C11.0132 17.1375 10.9879 17.2691 10.9376 17.392C10.8873 17.5149 10.8131 17.6266 10.7192 17.7205C10.6253 17.8144 10.5136 17.8886 10.3907 17.9389C10.2678 17.9892 10.1362 18.0145 10.0034 18.0133C9.87061 18.0122 9.73939 17.9846 9.61738 17.9322C9.49538 17.8798 9.38503 17.8036 9.29279 17.7081L4.29279 12.7081C4.10532 12.5206 4 12.2662 4 12.0011C4 11.7359 4.10532 11.4816 4.29279 11.2941L9.29379 6.29308C9.38603 6.19757 9.49638 6.12139 9.61838 6.06898C9.74039 6.01657 9.87161 5.98898 10.0044 5.98783C10.1372 5.98668 10.2688 6.01198 10.3917 6.06226C10.5146 6.11254 10.6263 6.18679 10.7202 6.28069C10.8141 6.37458 10.8883 6.48623 10.9386 6.60913C10.9889 6.73202 11.0142 6.8637 11.013 6.99648C11.0119 7.12926 10.9843 7.26048 10.9319 7.38249C10.8795 7.50449 10.8033 7.61483 10.7078 7.70708L7.41379 11.0011Z" fill="#476380"/>
              </svg>

              <h2 className="text-3xl font-bold">Workout Groups</h2>

          </div>
        </header>
      )}

      {/* Group List View */}
      {view === "groups" && (
        <>
          <h2 className="text-2xl font-bold mb-4">Workout Groups</h2>
          {groups !== null &&
            groups.map((groupObj, index) => {

              // console.log(groupObj)
              let location = groupObj.location_data

              return (
                <div key={index} className="p-6 mb-4 rounded-lg bg-[#F5F7FA]">
                  <h3 className="text-lg font-bold">{groupObj.booking_name}</h3>
                  <div className="group-details">
                    <p>
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-3" />
                      <span className="text-gray-500">
                        {dayjs(groupObj.timestamp.split("+")[0]).format("dddd, MMM D, h:mm A")}
                      </span>
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3" />
                      <span className="text-gray-500">
                        {location.address || location.name + ", " + location.postal_code}
                      </span>
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faUser} className="mr-3" />
                      <span className="text-gray-500">
                        Users booked: {groupObj.total_users}
                      </span>
                    </p>


                    <button
                      className={`w-full py-3 font-bold rounded-full ${
                        groupObj.checked_in ? "bg-gray-400" : "bg-themeGreen"
                      } text-black mt-6`}
                      disabled={groupObj.checked_in}
                      onClick={() => {
                        handleCheckIn(groupObj.timestamp.split("+")[0].split("T")[0], groupObj.timestamp.split("+")[0].split("T")[1], groupObj);
                      }}
                    >
                      {groupObj.checked_in ? "Check-in Complete" : "Check in"}
                    </button>
                    <button
                      className="w-full py-3 font-bold rounded-full border border-themeGreen text-black my-3"
                      onClick={() => {
                        setView("viewGroup");
                        setGroupTime(groupObj.timestamp.split("+")[0])
                        setLocationId(groupObj.location_id)
                        setCurrentGroup(groupObj);
                        setLocationType(groupObj.location_type)
                        setChatMessages(groupObj.chat_data.chat_history.messages); // Load initial chat messages
                      }}
                    >
                      Message Group
                    </button>
                    <button
                      className={`btn btn-ghost w-full py-3 text-themeGreen font-bold rounded-full 
                        ${groupObj.checked_in ? "" : ""}`}
                      disabled={groupObj.checked_in}
                      onClick={() => {
                        exitGroup(groupObj.timestamp.split("+")[0].split("T")[0], groupObj.timestamp.split("+")[0].split("T")[1], groupObj)
                      }}
                    >
                      Exit group
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="mb-24"></div>
        </>
      )}

      {/* Chat View */}
      {view === "viewGroup" && currentGroup && (
        <>
          <h2 className="text-2xl font-bold mb-4">{currentGroup.booking_name} Group Chat</h2>
          <div className="mb-4 bg-gray-100 rounded-lg p-4">
            <p>
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-3" />
              {dayjs(groupTime).format("dddd, MMM D, h:mm A")}
            </p>
            <p>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3" />
              {currentGroup.location_data.address || currentGroup.location_data.name + ", " + currentGroup.location_data.postal_code}
            </p>
            <p>
              <FontAwesomeIcon icon={faUser} className="mr-3" />
              Users booked: {currentGroup.total_users}
            </p>
          </div>

          {/* Chat Messages */}
          <div className="mb-4 h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {chatMessages.map((message, index) => (
              <div key={index} className="mb-2">
                <p className="font-bold">{message.name}</p>
                <p className="text-sm">{message.message}</p>
                <p className="text-xs text-gray-400">{dayjs(message.timestamp).format("DD MMM, h:mm A")}</p>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex items-center gap-2 mb-24">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow p-2 border rounded-lg"
            />
            <button onClick={sendMessageToServer} className="bg-themeGreen text-white py-3 px-4 rounded-full">
              <FontAwesomeIcon icon={faPaperPlane}/>
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md py-2 flex justify-around btm-nav text-sm">
        <button onClick={() => navigate("/home")}>
          <span className="btm-nav-label">Home</span>
        </button>
        <button className="active">
          <span className="btm-nav-label">Workout Groups</span>
        </button>
      </footer>
    </div>
  );
}
