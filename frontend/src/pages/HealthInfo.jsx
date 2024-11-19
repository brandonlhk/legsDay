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
            
            <div className="container mx-auto p-6 flex flex-col">

                {/* First page */}
                {index === 0 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3 whitespace-pre-wrap">Share your Profile and <br></br>Set Your Workout Goals</p>

                    {/* img here */}
                    <img src="placeholder.jpg" alt="" className="object-cover rounded-md my-6"/>

                    <div className="text-md">
                        <p>Define your fitness journey!</p>
                        <p>Share your profile and set your workout goals to stay focused, track progress, and achieve results faster.</p>
                    </div>

                    {/* progress */}
                    <div className="flex justify-center gap-4 my-12">
                        <button className="tab tab-bordered tab-active bg-themeGreen text-white w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                    </div>
     
                </div>}

                {/* Second page */}
                {index === 1 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Assess Your Body</p>

                    {/* img here */}
                    <img src="placeholder.jpg" alt="" className="object-cover rounded-md my-6"/>

                    <div className="text-md">
                        <p>Stay safe and strong!</p>
                        <p>Take an injury and strength assessment to understand your body&apos;s limits, prevent setbacks, and build a solid foundation for progress.</p>
                    </div>

                    {/* progress */}
                    <div className="flex justify-center gap-4 my-12">
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered tab-active bg-themeGreen text-white w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                    </div>
     
                </div>}

                {/* Last page */}
                {index === 2 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Discover Workout Spots Nearby and Form Fitness Buddy Groups</p>

                    {/* img here */}
                    <img src="placeholder.jpg" alt="" className="object-cover rounded-md my-6"/>


                    <div className="text-md">
                        <p>Find nearby workout locations and connect with others to form supportive fitness buddy groups, making exercise both fun and motivating.</p>
                    </div>

                    {/* progress */}
                    <div className="flex justify-center gap-4 my-12">
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered tab-active bg-themeGreen text-white w-12 h-2 rounded-full"></button>
                    </div>
     
                </div>}
                
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
    )
}