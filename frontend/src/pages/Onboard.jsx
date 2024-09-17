import {useState, useEffect} from "react"
import { useNavigate } from 'react-router-dom';


export default function Onboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0)
  const [progressVal, setProgressVal] = useState(20) 
  const [username, setUsername] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [days, setDays] = useState("")
  const [duration, setDuration] = useState("")

  
  const decision = () => {
    if (page === 0) {
        return navigate("/")
    }
    else {
        setPage((pageIndex) => pageIndex - 1)
        setProgressVal((prevProgress) => prevProgress - 20)
    }
  }

  const nextPage = () => {
    setPage((pageIndex) => pageIndex + 1)
    setProgressVal((prevProgress) => prevProgress + 20)
  }

  useEffect(() => {
    if (page === 4) {
        const data = [username, emailAddress, password, height, weight, age, gender, days, duration]
        return navigate("/loading", {state: {data: data}})
    }
  }, [page, navigate, username, emailAddress, password, height, weight, age, gender, days, duration])

    return (
        <div className="min-h-screen bg-gray-50">
            
            <div className="container mx-auto p-3 flex flex-col min-h-screen">
 
                {/* back button and progress */}
                <div className="flex gap-4">
                    <div>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={decision}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.41379 11.0011H18.9998C19.6668 11.0011 19.9998 11.3351 19.9998 12.0011C19.9998 12.6681 19.6668 13.0011 18.9998 13.0011H7.41379L10.7068 16.2941C10.8023 16.3863 10.8785 16.4967 10.9309 16.6187C10.9833 16.7407 11.0109 16.8719 11.012 17.0047C11.0132 17.1375 10.9879 17.2691 10.9376 17.392C10.8873 17.5149 10.8131 17.6266 10.7192 17.7205C10.6253 17.8144 10.5136 17.8886 10.3907 17.9389C10.2678 17.9892 10.1362 18.0145 10.0034 18.0133C9.87061 18.0122 9.73939 17.9846 9.61738 17.9322C9.49538 17.8798 9.38503 17.8036 9.29279 17.7081L4.29279 12.7081C4.10532 12.5206 4 12.2662 4 12.0011C4 11.7359 4.10532 11.4816 4.29279 11.2941L9.29379 6.29308C9.38603 6.19757 9.49638 6.12139 9.61838 6.06898C9.74039 6.01657 9.87161 5.98898 10.0044 5.98783C10.1372 5.98668 10.2688 6.01198 10.3917 6.06226C10.5146 6.11254 10.6263 6.18679 10.7202 6.28069C10.8141 6.37458 10.8883 6.48623 10.9386 6.60913C10.9889 6.73202 11.0142 6.8637 11.013 6.99648C11.0119 7.12926 10.9843 7.26048 10.9319 7.38249C10.8795 7.50449 10.8033 7.61483 10.7078 7.70708L7.41379 11.0011Z" fill="#572C57"/>
                        </svg>
                    </div>

                    <div className="flex items-center w-full">
                        <progress className="progress w-full" value={progressVal} max="100"></progress>
                    </div>
                </div>
                
                {/* First page */}
                {page === 0 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Create Account</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4">
                        {/* username */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Enter username</span>
                            </div>
                            <input type="text" placeholder="Type here" className="input input-bordered w-full" value={username} onChange={(event) => setUsername(event.target.value)}/>
                        </label>

                        {/* email address */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Enter email address</span>
                            </div>
                            <input type="email" placeholder="Type here" className="input input-bordered w-full" value={emailAddress} onChange={(event) => setEmailAddress(event.target.value)}/>
                        </label>

                        {/* password */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Enter password</span>
                            </div>
                            <input type="password" placeholder="Type here" className="input input-bordered w-full" value={password} onChange={(event) => setPassword(event.target.value)}/>
                        </label>
                    </div>
                </div>}

                {/* Second page */}
                {page === 1 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Enter your details</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4">
                        {/* Height */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Height (in cm)</span>
                            </div>
                            <input type="text" placeholder="Type here" className="input input-bordered w-full" value={height} onChange={(event) => setHeight(event.target.value)}/>
                        </label>

                        {/* weight */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Weight (in kg)</span>
                            </div>
                            <input type="email" placeholder="Type here" className="input input-bordered w-full" value={weight} onChange={(event) => setWeight(event.target.value)}/>
                        </label>

                        {/* age */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Age</span>
                            </div>
                            <input type="email" placeholder="Type here" className="input input-bordered w-full" value={age} onChange={(event) => setAge(event.target.value)}/>
                        </label>

                        {/* Gender */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-bold text-xl">Gender</span>
                            </div>
                            <select className="select select-bordered" value={gender} onChange={(event) => setGender(event.target.value)}>
                                <option disabled selected value="">Pick one option</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </label>
                    </div>
                </div>}

                {/* Third page */}
                {page === 2 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">How many days do you plan to work out a week?</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6" >
                        {/* 2 days */}
                        {["2 days", "3 days", "4 days", "5 days", "6 days", "7 days"].map((day, index) => (
                        <div key={day} className="card border border-slate-300 w-full shadow-md" onClick={() => setDays(index+2)}>
                        <div className="card-body">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="radio" name="days" className="radio" value={index+2} checked={days === index+2}/>
                                <span className="label-text ml-2">{day}</span>
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
                    <p className="text-3xl font-bold mt-3">How many long do you plan to work out each day?</p>
                
                    {/* Inputs */}
                    <div className="flex flex-col mt-12 gap-4 mb-6" >
                        {/* 2 days */}
                        {[
                        {
                            "day" : "15 min / day",
                            "info": "(for sedentary beginners)",
                            "value": "15"
                        },
                        {
                            "day" : "20 min / day",
                            "info": "(for active beginners)",
                            "value": "20"
                        },
                        {
                            "day" : "25 min / day",
                            "info": "(for more active beginners)",
                            "value": "25"
                        },
                        {
                            "day" : "30 min / day",
                            "info": "(for super active beginners)",
                            "value": "30"
                        },
                            ].map((data, index) => (
                        <div key={index} className="card border border-slate-300 w-full shadow-md" onClick={() => setDuration(data.value)}>
                        <div className="card-body">
                            <div className="form-control">
                                <label className="label cursor-pointer flex justify-start">
                                <input type="radio" name="freq" className="radio" value={data.value} checked={duration === data.value}/>
                                <div className="ml-3">
                                    <span className="label-text">{data.day}</span>
                                    <p className="label-text text-gray-500">{data.info}</p>

                                </div>
                                </label>
                            </div>
                        </div>
                    </div>
                        ))}

                    </div>
                </div>}
                
                
                {/* Next page */}
                <button className="btn bg-purple text-center w-full text-white mt-auto mb-6" onClick={nextPage}>Continue</button>
            </div>
        </div>
    )
}