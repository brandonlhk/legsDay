import { useNavigate } from 'react-router-dom';
import {useState} from "react"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export default function Settings() {
    
    const navigate = useNavigate()

    // getting data from localstorage
    const [age, setAge] = useState(localStorage.getItem("age"))
    const [gender, setGender] = useState(localStorage.getItem("gender"))
    const [level, setLevel] = useState(localStorage.getItem("level"))
    const [days, setDays] = useState(localStorage.getItem("days"))
    const [duration, setDuration] = useState(localStorage.getItem("duration"))
    const [injuries, setInjuries] = useState(JSON.parse((localStorage.getItem("injuries"))))
    const [core, setCore] = useState(JSON.parse((localStorage.getItem("core"))))
    const [lowerBody, setLowerBody] = useState(JSON.parse((localStorage.getItem("lowerbody"))))
    const [upperBody,  setUpperBody] = useState(JSON.parse((localStorage.getItem("upperbody"))))

    // handling modal
    const [isOpen, setIsOpen] = useState(false)
    const [showSavedModal, setShowSavedModal] = useState(false);
    const handleProceed = () => {
        setIsOpen(false)
        handleSave()

        // show that its saved
        setShowSavedModal(true)
        setTimeout(() => {
            setShowSavedModal(false);
          }, 3000);
      };
    
      const handleCancel = () => {
        setIsOpen(false)
      };


    // handle the logic to uncheck others options 
    // if contains None. Used in injuries, core, lowerbody, upperbody 
    const handleCheckboxChange = (event, from) => {
        const { value } = event.target;

        if (value === "None") {
            //if none is seleceted, removes all other stuff
            switch (from) {
                case "injuries":
                    setInjuries(["None"])
                    break

                case "core":
                    setCore(["None"])
                    break

                case "lowerBody":
                    setLowerBody(["None"])
                    break

                case "upperBody":
                    setUpperBody(["None"])
                    break

                default:
            }
                
        } 
        else {
            // if none is already inside, it removes it and set whatever value is pressed

                switch (from) {
                    case "injuries":
                        if (injuries.includes("None")){
                            setInjuries([value])
                        } else {
                            setInjuries((prevSelected) => prevSelected.includes(value) ? prevSelected.filter((item) => item !== value) : [...prevSelected, value])
                        }
                        break
    
                    case "core":
                        if (core.includes("None")) {
                            setCore([value])
                        } else {
                            setCore((prevSelected) => prevSelected.includes(value) ? prevSelected.filter((item) => item !== value) : [...prevSelected, value]);
                        }
                        break
    
                    case "lowerBody":
                        if (lowerBody.includes("None")) {
                            setLowerBody([value])
                        } else {
                            setLowerBody((prevSelected) => prevSelected.includes(value) ? prevSelected.filter((item) => item !== value) : [...prevSelected, value])                 
                        }
                        break
    
                    case "upperBody":
                        if (upperBody.includes("None")) {
                            setUpperBody([value])
                        } else {
                            setUpperBody((prevSelected) => prevSelected.includes(value) ? prevSelected.filter((item) => item !== value) : [...prevSelected, value]);
                        }
                            break

                    default:
            }
        }
    };

    // set data to localstorage
    const handleSave = () => {
        localStorage.setItem("age", age)
        localStorage.setItem("gender", gender)
        localStorage.setItem("level", level)
        localStorage.setItem("days", days)
        localStorage.setItem("duration", duration)
        localStorage.setItem("injuries", JSON.stringify(injuries))
        localStorage.setItem("core", JSON.stringify(core))
        localStorage.setItem("lowerbody", JSON.stringify(lowerBody))
        localStorage.setItem("upperbody", JSON.stringify(upperBody))
    }

    return (

        <div className="bg-[#F5F5F5] min-h-screen">
            <p className="text-center text-dark-purple font-bold text-3xl pt-6">Settings</p>

            
            <div className="container mx-auto p-6">
                {/* Age */}
                <label className="form-control w-full">
                    <div className="label">
                        <span className="label-text font-bold text-xl">Age</span>
                    </div>
                    <input type="email" placeholder="Type here" className="input input-bordered w-full" value={age} onChange={(event) => setAge(event.target.value)}/>
                </label>

                {/* Gender */}
                <label className="form-control w-full mt-3">
                    <div className="label">
                        <span className="label-text font-bold text-xl">Gender</span>
                    </div>
                    <select className="select select-bordered relative" value={gender} onChange={(event) => setGender(event.target.value)}>
                        <option disabled selected value="">Pick one option</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Others / I'd rather not say</option>
                    </select>
                </label>

                {/* DIVIDER */}
                <div className="divider before:bg-purple after:bg-purple"></div>

                {/* Injuries */}
                <div className="flex flex-col">
                    <p className="font-bold text-xl">Do you have any past or existing injuries?</p>
                    {[
                        "None", 
                        "Shoulder",
                        "Wrist",
                        "Knee",
                        "Ankle",
                        "Lower back"
                        ].map((data, index) => (
                            <div key={index}>
                                <div className="form-control">
                                    <label className="label cursor-pointer flex justify-start">
                                    <input type="checkbox" name="freq" className="checkbox" value={data} checked={injuries.includes(data)} onChange={(event) => handleCheckboxChange(event, "injuries")}/>
                                    <div className="flex items-center ml-2">
                                        <span className="label-text text-lg">{data}</span>
                                    </div>
                                    </label>
                                </div>
                        </div>
                        ))}
                </div>

                {/* core strength */}
                <div className="flex flex-col mt-3">
                    <p className="font-bold text-xl">Accessing core strength: Do you face difficulties</p>
                    {[
                            "None",
                            "Sitting up after lying down",
                            "Balancing on uneven ground",
                            "Sitting up straight",
                            ].map((data, index) => (
                        <div key={index}>
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="checkbox" name="freq" className="checkbox" value={data} checked={core.includes(data)} onChange={(event) => handleCheckboxChange(event, "core")}/>
                                <div className="flex items-center ml-2">
                                    <span className="label-text text-lg">{data}</span>
                                </div>
                                </label>

                            </div>
                        </div>
                        ))}
                </div>

                {/* lower body strength */}
                <div className="flex flex-col mb-12 mt-3">
                    <p className="font-bold text-xl">Accessing upper body strength: Do you face difficulties</p>
                    {[
                            "None",
                            "Carrying groceries",
                            "Pushing a pram or wheelchair",
                            "Lifting heavy objects",
                            ].map((data, index) => (
                        <div key={index}>
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="checkbox" name="freq" className="checkbox" value={data} checked={upperBody.includes(data)} onChange={(event) => handleCheckboxChange(event, "upperBody")}/>
                                <div className="flex items-center ml-2">
                                    <span className="label-text text-lg">{data}</span>
                                </div>
                                </label>
                            </div>
                    </div>
                        ))}
                </div>

                {/* upper body strength */}
                <div className="flex flex-col mt-3">
                    <p className="font-bold text-xl">Accessing lower body strength: Do you face difficulties</p>
                    {[
                            "None",
                            "Standing up from sitting on the floor or squatting",
                            "Getting out of a car or vehicle",
                            "Walking up or down stairs",
                            ].map((data, index) => (
                        <div key={index}>
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="checkbox" name="freq" className="checkbox" value={data} checked={lowerBody.includes(data)} onChange={(event) => handleCheckboxChange(event, "lowerBody")}/>
                                <div className="flex items-center ml-2">
                                    <span className="label-text text-lg">{data}</span>
                                </div>
                                </label>
                            </div>
                    </div>
                        ))}
                </div>

                <button className="btn bg-primary text-white text-lg w-full mb-16 mt-6" onClick={() => setIsOpen(true)}>Submit</button>

                
            </div>



            {/* sticky bottom tab */}
            <div>
                <div className="btm-nav">
                    <button onClick={() => navigate("/home")}>
                    Workout
                    </button>
                    <button onClick={() => navigate("/library")}>
                    Library
                    </button>
                    <button className="active" >
                    Settings
                    </button>

                </div>
            </div>


            {/* Proceed changes modal */}
            {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/3">
                    <h2 className="text-lg font-semibold mb-4 text-center">
                    Changes will be applied on the next recommended program.
                    </h2>
                    <div className="flex flex-col justify-center mt-6">
                    <button 
                        onClick={handleProceed} 
                        className="btn bg-purple text-white px-4 py-2 mx-2"
                    >
                        Proceed
                    </button>
                    <button 
                        onClick={handleCancel} 
                        className="btn btn-ghost px-4 py-2 mx-2 text-purple"
                    >
                        Cancel
                    </button>
                    </div>
                </div>
            </div>
            )}

            {showSavedModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/3">
                            <div className="flex justify-center items-center">
                            <FontAwesomeIcon
                                icon={faCircleCheck}
                                className="w-20 h-20 text-purple"
                            />
                            </div>
                            <h2 className="text-lg font-semibold text-center mt-4 text-purple">
                            Changes saved!
                            </h2>
                        </div>
                    </div>
                )}

        </div>
    )
}