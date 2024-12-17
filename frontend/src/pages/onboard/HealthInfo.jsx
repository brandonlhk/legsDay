import {useState} from "react"
import { useNavigate } from 'react-router-dom';

export default function HealthInfo() {
    const navigate = useNavigate();
    const [index, setIndex] = useState(0)

    // functions
    const nextPage = () => {
        setIndex((prevIndex) => prevIndex + 1)
    }

    const skip = () => {
        setIndex(2)
    }

    return (
        <div className="">
            
            <div className="container mx-auto p-6 ">

                {/* First page */}
                {index === 0 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3 text-balance">Share your Profile and Set Your Workout Goals</p>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        {/* img here */}
                        <div className="flex flex-col items-center justify-center lg:w-1/2 lg:mt-24">
                            <img src="goal_1.png" alt="" className="w-3/4 md:w-2/3 lg:w-full max-w-[700px] object-contain lg:px-12"/>

                            <div className="hidden lg:flex justify-center gap-4 my-12">
                            <button className="tab tab-bordered tab-active bg-themeGreen text-white w-12 h-2 rounded-full"></button>
                            <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                            <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        </div>
                        </div>

                        <div className="lg:w-1/2">
                            <div className="text-lg space-y-4 text-pretty lg:mb-12 lg:text-2xl">
                                <p>Define your fitness journey!</p>
                                <p>Share your profile and set your workout goals to stay focused, track progress, and achieve results faster.</p>
                            </div>

                            {/* progress */}
                            <div className="flex justify-center gap-4 my-12 lg:hidden">
                                <button className="tab tab-bordered tab-active bg-themeGreen text-white w-12 h-2 rounded-full"></button>
                                <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                                <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                            </div>

                            {/* Buttons */}
                            <div>
                                {(index === 0 || index === 1) && 
                                <div className="flex gap-6 justify-center">
                                    <button className="btn btn-outline text-center w-full max-w-[40%] border-themeGreen border-2 text-black rounded-full" onClick={skip}>Skip</button>
                                    <button className="btn bg-themeGreen text-center w-full max-w-[40%] text-black rounded-full" onClick={nextPage}>Next</button>
                                </div>}

                                {index === 2 && 
                                <div className="">
                                    <button className="btn bg-themeGreen text-center w-full text-black rounded-full" onClick={() => navigate("/onboard")}>Get started</button>
                                </div>}
                            </div>
                        </div>
                    </div>
     
                </div>}

                {/* Second page */}
                {index === 1 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3 text-balance">Assess Your Body</p>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        {/* img here */}
                        <div className="flex flex-col items-center justify-center lg:w-1/2 lg:mt-24">
                            <img src="goal_2.png" alt="" className="w-3/4 md:w-2/3 lg:w-full max-w-[700px] object-contain lg:px-12"/>

                            <div className="hidden lg:flex justify-center gap-4 my-12">
                            <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                            <button className="tab tab-bordered tab-active bg-themeGreen w-12 h-2 rounded-full"></button>
                            <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        </div>
                        </div>

                        <div className="lg:w-1/2">
                            <div className="text-lg space-y-4 text-pretty lg:mb-12 lg:text-2xl">
                                <p>Stay safe and strong!</p>
                                <p>Take an injury and strength assessment to understand your body&apos;s limits, prevent setbacks, and build a solid foundation for progress.</p>
                            </div>

                            {/* progress */}
                            <div className="flex justify-center gap-4 my-12 lg:hidden">
                                <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                                <button className="tab tab-bordered tab-active bg-themeGreen text-white w-12 h-2 rounded-full"></button>
                                <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                            </div>

                            {/* Buttons */}
                            <div>
                                {(index === 0 || index === 1) && 
                                <div className="flex gap-6 justify-center">
                                    <button className="btn btn-outline text-center w-full max-w-[40%] border-themeGreen border-2 text-black rounded-full" onClick={skip}>Skip</button>
                                    <button className="btn bg-themeGreen text-center w-full max-w-[40%] text-black rounded-full" onClick={nextPage}>Next</button>
                                </div>}

                                {index === 2 && 
                                <div className="">
                                    <button className="btn bg-themeGreen text-center w-full text-black rounded-full" onClick={() => navigate("/onboard")}>Get started</button>
                                </div>}
                            </div>
                        </div>
                    </div>
     
                </div>}

                {/* Last page */}
                {index === 2 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Discover Workout Spots Nearby and Form Fitness Buddy Groups</p>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        {/* img here */}
                        <div className="flex flex-col items-center justify-center lg:w-1/2 lg:mt-24">
                            <img src="goal_3.png" alt="" className="w-3/4 md:w-2/3 lg:w-full max-w-[700px] object-contain lg:px-12"/>

                            <div className="hidden lg:flex justify-center gap-4 my-12">
                            <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                            <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                            <button className="tab tab-bordered tab-active bg-themeGreen w-12 h-2 rounded-full"></button>
                        </div>
                        </div>

                        <div className="lg:w-1/2">
                            <div className="text-lg space-y-4 text-pretty lg:mb-12 lg:text-2xl">
                                <p>Find nearby workout locations and connect with others to form supportive fitness buddy groups, making exercise both fun and motivating.</p>
                            </div>

                            {/* progress */}
                            <div className="flex justify-center gap-4 my-12 lg:hidden">
                                <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                                <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                                <button className="tab tab-bordered tab-active bg-themeGreen text-white w-12 h-2 rounded-full"></button>
                            </div>

                            {/* Buttons */}
                            <div>
                                {(index === 0 || index === 1) && 
                                <div className="flex gap-6 justify-center">
                                    <button className="btn btn-outline text-center w-full max-w-[40%] border-themeGreen border-2 text-black rounded-full" onClick={skip}>Skip</button>
                                    <button className="btn bg-themeGreen text-center w-full max-w-[40%] text-black rounded-full" onClick={nextPage}>Next</button>
                                </div>}

                                {index === 2 && 
                                <div className="">
                                    <button className="btn bg-themeGreen text-center w-full text-black rounded-full" onClick={() => navigate("/onboard")}>Get started</button>
                                </div>}
                            </div>
                        </div>
                    </div>
     
                </div>}
                
            </div>
        </div>
    )
}