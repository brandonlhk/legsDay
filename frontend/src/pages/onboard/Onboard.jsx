import {useState, useEffect} from "react"
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";


export default function Onboard() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0)
    const [progressVal, setProgressVal] = useState(20) 

    // page 1
    const [name, setName] = useState("")

    const [core, setCore] = useState([]) //page 3
    const [lowerBody, setLowerBody] = useState([]) //page 4
    const [upperBody, setUpperBody] = useState([]) // page 5

    const decision = () => {
    if (page === 0) {
        return navigate("/")
    }
    else {
        setPage((pageIndex) => pageIndex - 1)
        setProgressVal((prevProgress) => prevProgress - 20)
    }
    }

    const canProceed = () => {
        switch (page) {
            case 0:
                return name // Check if all fields on page 1 are filled
            case 1:
                return core.length > 0; // Check if core strength selection is made
            case 2:
                return lowerBody.length > 0; // Check if lower body strength selection is made
            case 3:
                return upperBody.length > 0; // Check if upper body strength selection is made
            default:
                return false;
        }
    }

    const nextPage = () => {
        if (canProceed()) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
            setPage((pageIndex) => pageIndex + 1);
            setProgressVal((prevProgress) => prevProgress + 25);
        } else {
            alert("Please fill in all fields before continuing.");
        }
    }

    const handleCheckboxChange = (event, from) => {
        const { value } = event.target;

        if (value === "None") {
            //if none is seleceted, removes all other stuff
            switch (from) {
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
    if (page === 4) {
        const data = [name, core, lowerBody, upperBody]
        return navigate("/loading", {state: {data: data}})
    }
    }, [page, navigate, core, lowerBody, upperBody, name])

    return (
        <div>
            
            <div className="container mx-auto p-3 flex flex-col">
 
                {/* back button and progress */}
                <div className="flex gap-4">
                    <div>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={decision}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.41379 11.0011H18.9998C19.6668 11.0011 19.9998 11.3351 19.9998 12.0011C19.9998 12.6681 19.6668 13.0011 18.9998 13.0011H7.41379L10.7068 16.2941C10.8023 16.3863 10.8785 16.4967 10.9309 16.6187C10.9833 16.7407 11.0109 16.8719 11.012 17.0047C11.0132 17.1375 10.9879 17.2691 10.9376 17.392C10.8873 17.5149 10.8131 17.6266 10.7192 17.7205C10.6253 17.8144 10.5136 17.8886 10.3907 17.9389C10.2678 17.9892 10.1362 18.0145 10.0034 18.0133C9.87061 18.0122 9.73939 17.9846 9.61738 17.9322C9.49538 17.8798 9.38503 17.8036 9.29279 17.7081L4.29279 12.7081C4.10532 12.5206 4 12.2662 4 12.0011C4 11.7359 4.10532 11.4816 4.29279 11.2941L9.29379 6.29308C9.38603 6.19757 9.49638 6.12139 9.61838 6.06898C9.74039 6.01657 9.87161 5.98898 10.0044 5.98783C10.1372 5.98668 10.2688 6.01198 10.3917 6.06226C10.5146 6.11254 10.6263 6.18679 10.7202 6.28069C10.8141 6.37458 10.8883 6.48623 10.9386 6.60913C10.9889 6.73202 11.0142 6.8637 11.013 6.99648C11.0119 7.12926 10.9843 7.26048 10.9319 7.38249C10.8795 7.50449 10.8033 7.61483 10.7078 7.70708L7.41379 11.0011Z" fill="#476380"/>
                        </svg>
                    </div>

                    <div className="flex items-center w-full">
                        <progress className="progress w-full [&::-webkit-progress-value]:bg-blueGreen" value={progressVal} max="100"></progress>
                    </div>
                </div>
                
                {/* First page */}
                {page === 0 && <div className="p-3">
                    {/* Header */}
                    <p className="text-lg text-pretty">Basic Information</p>
                    <p className="text-3xl font-bold text-balance">Please share some details about yourself</p>
                
                    {/* Inputs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3 lg:max-w-5xl">
                        {/* name */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Name</span>
                            </div>
                            <input type="text" placeholder="Type here" className="input input-bordered w-full" value={name} onChange={(event) => setName(event.target.value)}/>
                        </label>
                    </div>
                </div>}

                {/* Second page */}
                {page === 1 && <div>
                    {/* Header */}
                    <p className="text-lg mt-3 text-pretty">Core Strength Assessment</p>
                    <p className="text-3xl font-bold">Do you face difficulties in any of the following:</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6 lg:max-w-lg" >
                        {[
                            "Sitting up after lying down",
                            "Balancing on uneven ground",
                            "Sitting up straight",
                            "None"
                            ].map((data, index) => (
                        <div key={index} className={`card w-full shadow-md ${core.includes(data) ? "border-themeGreen border-2": "border-slate-300 border"}`}>
                        <div className="card-body h-16 flex justify-center">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="checkbox" name="core" className="checkbox" value={data} checked={core.includes(data)} onChange={(event) => handleCheckboxChange(event, "core")}/>
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

                {/* Third page */}
                {page === 2 && <div>
                    {/* Header */}
                    <p className="text-lg mt-3 text-pretty">Lower Body Strength Assessment</p>
                    <p className="text-3xl font-bold">Do you face difficulties in any of the following:</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6 lg:max-w-lg" >
                        {[
                            "Standing up from sitting on the floor or squatting",
                            "Getting out of a car or vehicle",
                            "Walking up or down stairs",
                            "None"
                            ].map((data, index) => (
                        <div key={index} className={`card w-full shadow-md ${lowerBody.includes(data) ? "border-themeGreen border-2": "border-slate-300 border"}`}>
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

                {/* Fourth page */}
                {page === 3 && <div>
                    {/* Header */}
                    <p className="text-lg mt-3 text-pretty">Upper Body Strength Assessment</p>
                    <p className="text-3xl font-bold">Do you face difficulties in any of the following:</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6 lg:max-w-lg" >
                        {[
                            "Carrying groceries",
                            "Pushing a pram or wheelchair",
                            "Lifting heavy objects",
                            "None"
                            ].map((data, index) => (
                        <div key={index} className={`card w-full shadow-md ${upperBody.includes(data) ? "border-themeGreen border-2": "border-slate-300 border"}`}>
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
                <button className="btn bg-themeGreen text-center w-full text-black mt-auto mb-6 rounded-full lg:max-w-sm" onClick={nextPage}>Continue</button>
            </div>
        </div>
    )
}