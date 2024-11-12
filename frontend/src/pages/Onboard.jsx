import {useState, useEffect} from "react"
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";


export default function Onboard() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0)
    const [progressVal, setProgressVal] = useState(11.1) 

    const [name, setName] = useState("")
    const [age, setAge] = useState("") //page 1
    const [gender, setGender] = useState("") //page 1

    const [level, setLevel] = useState("") //page 2
    const [eatingHabits, setEatingHabits] = useState("") //page 3
    const [duration, setDuration] = useState("") //page 4
    const [injuries, setInjuries] = useState([]) //page 5
    const [core, setCore] = useState([]) //page 6
    const [lowerBody, setLowerBody] = useState([]) //page 7
    const [upperBody, setUpperBody] = useState([]) // page 8

    const decision = () => {
    if (page === 0) {
        return navigate("/")
    }
    else {
        setPage((pageIndex) => pageIndex - 1)
        setProgressVal((prevProgress) => prevProgress - 11.11)
    }
    }

    const nextPage = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behaviour: 'smooth'
        })
        setPage((pageIndex) => pageIndex + 1)
        setProgressVal((prevProgress) => prevProgress + 11.11)
    }

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

    // send data to next page
    useEffect(() => {
    if (page === 8) {
        const data = [age, gender, level, days, duration, injuries, core, lowerBody, upperBody]
        return navigate("/loading", {state: {data: data}})
    }
    }, [page, navigate, age, gender, level, eatingHabits, duration, injuries, core, lowerBody, upperBody])

    return (
        <div>
            
            <div className="container mx-auto p-3 flex flex-col">
 
                {/* back button and progress */}
                <div className="flex gap-4">
                    <div>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={decision}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.41379 11.0011H18.9998C19.6668 11.0011 19.9998 11.3351 19.9998 12.0011C19.9998 12.6681 19.6668 13.0011 18.9998 13.0011H7.41379L10.7068 16.2941C10.8023 16.3863 10.8785 16.4967 10.9309 16.6187C10.9833 16.7407 11.0109 16.8719 11.012 17.0047C11.0132 17.1375 10.9879 17.2691 10.9376 17.392C10.8873 17.5149 10.8131 17.6266 10.7192 17.7205C10.6253 17.8144 10.5136 17.8886 10.3907 17.9389C10.2678 17.9892 10.1362 18.0145 10.0034 18.0133C9.87061 18.0122 9.73939 17.9846 9.61738 17.9322C9.49538 17.8798 9.38503 17.8036 9.29279 17.7081L4.29279 12.7081C4.10532 12.5206 4 12.2662 4 12.0011C4 11.7359 4.10532 11.4816 4.29279 11.2941L9.29379 6.29308C9.38603 6.19757 9.49638 6.12139 9.61838 6.06898C9.74039 6.01657 9.87161 5.98898 10.0044 5.98783C10.1372 5.98668 10.2688 6.01198 10.3917 6.06226C10.5146 6.11254 10.6263 6.18679 10.7202 6.28069C10.8141 6.37458 10.8883 6.48623 10.9386 6.60913C10.9889 6.73202 11.0142 6.8637 11.013 6.99648C11.0119 7.12926 10.9843 7.26048 10.9319 7.38249C10.8795 7.50449 10.8033 7.61483 10.7078 7.70708L7.41379 11.0011Z" fill="#000000"/>
                        </svg>
                    </div>

                    <div className="flex items-center w-full">
                        <progress className="progress w-full" value={progressVal} max="100"></progress>
                    </div>
                </div>
                
                {/* First page */}
                {page === 0 && <div className="p-3">
                    {/* Header */}
                    <p className="text-2xl font-bold mt-3">Free Health Assessment</p>
                    <p className="text-lg mt-3 text-pretty">Let&apos;s begin by answering a few questions about yourself.</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-3 gap-4">
                        {/* name */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Name</span>
                            </div>
                            <input type="text" placeholder="Type here" className="input input-bordered w-full" value={name} onChange={(event) => setName(event.target.value)}/>
                        </label>
                        {/* age */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Age</span>
                            </div>
                            <input type="text" placeholder="Type here" className="input input-bordered w-full" value={age} onChange={(event) => setAge(event.target.value)}/>
                        </label>

                        {/* Gender */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Gender</span>
                            </div>
                            <select className="select select-bordered relative mb-6 " value={gender} onChange={(event) => setGender(event.target.value)}>
                                <option disabled selected value="">Pick one option</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Others / I&apos;d rather not say</option>
                            </select>
                        </label>
                    </div>
                </div>}

                {/* Second page */}
                {page === 1 && <div>
                    {/* Header */}
                    <p className="text-2xl font-bold mt-3">Free Health Assessment</p>
                    <p className="text-lg mt-3 text-pretty">Hello {name}, please share with us the following details.</p>
                    <div className="">
                        <div className="tooltip mt-3" data-tip="Your data is being used to assess your healthy habits.">
                            <div className="flex">
                                <FontAwesomeIcon icon={faCircleQuestion} className="w-6 h-6"/>
                                <p className="ml-2 text-gray-500">How are these information being used?</p>
                            </div>
                        </div>
                    </div>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-8 gap-6 mb-6" >
                        {/* 2 days */}
                        {[
                            {"level" : "Not very active", "info" : "Have a sedentary job, and spend most of the day sitting (E.g. Work in the office)"},
                            {"level" : "Lightly active", "info" : "Spend a good amount of your day moving around (E.g. Teacher, Salesperson)"},
                            {"level" : "Active", "info" : "Spend a good amount of time doing physical activities (E.g. Food server, Retail assistant)"},
                            {"level" : "Very Active", "info" : "Spend a good amount of time doing heavy physical activities (E.g. Delivery driver, Warehouse worker"}
                        ].map((part, index) => (

                        <div key={index} className={`card w-full shadow-md ${level === part.level ? "border-black border-2": "border-slate-300 border"}`} 
                        onClick={() => setLevel(part.level)}>

                        <div className="card-body h-28 flex justify-center">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                 <input type="radio" name="days" className="radio" value={part.level} checked={level === part.level} hidden/>
                                 <div>
                                    <p className="label-text font-bold text-lg">{part.level}</p>
                                    <span className="label-text font-bold text-gray-400 text-md">{part.info}</span>
                                 </div>
                                </label>
                            </div>
                        </div>
                    </div>
                        ))}

                    </div>
                </div>}

                {/* Third page */}
                {page === 2 && <div>
                    {/* Header */}
                    <p className="text-2xl font-bold mt-3">Free Health Assessment</p>
                    <p className="text-lg mt-3 text-pretty">How would you describe your daily eating habits?</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-6 mb-6" >
                        {/* 2 days */}
                        {[
                            "Healthy and balanced",
                            "Mostly healthy, with ocassional indulgences",
                            "Unhealthy, with high intake of fast food and processed foods",
                            "Irregular, with inconsistent meal times and portion sizes"

                        ].map((habit, index) => (

                        <div key={habit} className={`card w-full shadow-md ${eatingHabits == habit ? "border-black border-2": "border-slate-300 border"}`} onClick={() => setEatingHabits(habit)}>

                        <div className="card-body h-20 flex justify-center">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="radio" name="days" className="radio" value={index+2} checked={eatingHabits == habit} hidden/>
                                <div className="flex items-center">
                                    <span className="label-text font-bold text-lg">{habit}</span>
                                </div>
                                </label>
                            </div>
                        </div>
                    </div>
                        ))}

                    </div>
                </div>}

                {/* Fourth page */}
                {page === 3 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">How long do you plan to work out each day?</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6" >
                        {/* 2 days */}
                        {[
                        {
                            "day" : "15 min / day",
                            "value": "15"
                        },
                        {
                            "day" : "30 min / day (recommended)",
                            "picture": "https://seeklogo.com/images/H/health-promotion-board-logo-EB6810BFC8-seeklogo.com.png",
                            "value": "30"
                        },
                        {
                            "day" : "45 min / day",
                            "value": "45"
                        },
                        {
                            "day" : "60 min / day",
                            "value": "60"
                        },
                            ].map((data, index) => (
                        <div key={index} className={`card w-full shadow-md ${duration === data.value ? "border-purple border-2": "border-slate-300 border"}`} onClick={() => setDuration(data.value)}>
                        <div className="card-body h-20 flex justify-center">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="radio" name="freq" className="radio" value={data.value} checked={duration === data.value} hidden/>
                                <div className="flex items-center">
                                    <span className="label-text font-bold text-lg">{data.day}</span>
                                    {data.picture && (<span><img src={data.picture} alt="logo" className="ml-2 w-16"/></span>)}
                                </div>
                                </label>
                            </div>
                        </div>
                    </div>
                        ))}

                    </div>
                </div>}

                {/* Fifth page */}
                {page === 4 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Do you have any past or existing injuries?</p>
                    <p className="text-md text-gray-400 mt-3">If you have any significant injuries or medical conditions. Please consult a professional before using this app</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6" >
                        {/* 2 days */}
                        {[
                            "None", 
                            "Shoulder",
                            "Wrist",
                            "Knee",
                            "Ankle",
                            "Lower back"
                            ].map((data, index) => (
                        <div key={index} className={`card w-full shadow-md ${injuries.includes(data) ? "border-purple border-2": "border-slate-300 border"}`}>
                        <div className="card-body h-20 flex justify-center">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="checkbox" name="freq" className="checkbox" value={data} checked={injuries.includes(data)} onChange={(event) => handleCheckboxChange(event, "injuries")}/>
                                <div className="flex items-center ml-2">
                                    <span className="label-text font-bold text-lg">{data}</span>
                                </div>
                                </label>
                            </div>
                        </div>
                    </div>
                        ))}

                    </div>
                </div>}

                {/* Sixth page */}
                {page === 5 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Assessing core strength:</p>
                    <p className="text-3xl font-bold mt-3">Do you face difficulties</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6" >
                        {[
                            "None",
                            "Sitting up after lying down",
                            "Balancing on uneven ground",
                            "Sitting up straight",
                            ].map((data, index) => (
                        <div key={index} className={`card w-full shadow-md ${core.includes(data) ? "border-purple border-2": "border-slate-300 border"}`}>
                        <div className="card-body h-20 flex justify-center">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="checkbox" name="freq" className="checkbox" value={data} checked={core.includes(data)} onChange={(event) => handleCheckboxChange(event, "core")}/>
                                <div className="flex items-center ml-2">
                                    <span className="label-text font-bold text-lg">{data}</span>
                                </div>
                                </label>
                            </div>
                        </div>
                    </div>
                        ))}

                    </div>
                </div>}

                {/* Seventh page */}
                {page === 6 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Assessing lower body strength:</p>
                    <p className="text-3xl font-bold mt-3">Do you face difficulties</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6" >
                        {[
                            "None",
                            "Standing up from sitting on the floor or squatting",
                            "Getting out of a car or vehicle",
                            "Walking up or down stairs",
                            ].map((data, index) => (
                        <div key={index} className={`card w-full shadow-md ${lowerBody.includes(data) ? "border-purple border-2": "border-slate-300 border"}`}>
                        <div className="card-body h-20 flex justify-center">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="checkbox" name="freq" className="checkbox" value={data} checked={lowerBody.includes(data)} onChange={(event) => handleCheckboxChange(event, "lowerBody")}/>
                                <div className="flex items-center ml-2">
                                    <span className="label-text font-bold text-lg">{data}</span>
                                </div>
                                </label>
                            </div>
                        </div>
                    </div>
                        ))}

                    </div>
                </div>}

                {/* Eighth page */}
                {page === 7 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Assessing upper body strength:</p>
                    <p className="text-3xl font-bold mt-3">Do you face difficulties</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6" >
                        {[
                            "None",
                            "Carrying groceries",
                            "Pushing a pram or wheelchair",
                            "Lifting heavy objects",
                            ].map((data, index) => (
                        <div key={index} className={`card w-full shadow-md ${upperBody.includes(data) ? "border-purple border-2": "border-slate-300 border"}`}>
                        <div className="card-body h-20 flex justify-center">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="checkbox" name="freq" className="checkbox" value={data} checked={upperBody.includes(data)} onChange={(event) => handleCheckboxChange(event, "upperBody")}/>
                                <div className="flex items-center ml-2">
                                    <span className="label-text font-bold text-lg">{data}</span>
                                </div>
                                </label>
                            </div>
                        </div>
                    </div>
                        ))}

                    </div>
                </div>}

                
                
                {/* Next page */}
                <button className="btn bg-black text-center w-full text-white mt-auto mb-6 rounded-full" onClick={nextPage}>Continue</button>
            </div>
        </div>
    )
}