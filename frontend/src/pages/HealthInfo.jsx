import {useState} from "react"
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWeightScale, faTape } from "@fortawesome/free-solid-svg-icons";


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
                    <p className="text-3xl font-bold mt-3">Do a Free Health Assessment</p>

                    {/* img here */}
                    <img src="placeholder.jpg" alt="" className="object-cover rounded-md my-6"/>

                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Magni in facere amet cupiditate aspernatur quisquam labore, aliquam vel laborum eaque consectetur eum dolor commodi. Reiciendis vero aspernatur sint cumque facilis.</p>

                    {/* progress */}
                    <div className="flex justify-center gap-4 my-12">
                        <button className="tab tab-bordered tab-active bg-black text-white w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                    </div>
     
                </div>}

                {/* Second page */}
                {index === 1 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Get a Personalised Health Report</p>

                    {/* img here */}
                    <img src="placeholder.jpg" alt="" className="object-cover rounded-md my-6"/>

                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Magni in facere amet cupiditate aspernatur quisquam labore, aliquam vel laborum eaque consectetur eum dolor commodi. Reiciendis vero aspernatur sint cumque facilis.</p>

                    {/* progress */}
                    <div className="flex justify-center gap-4 my-12">
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered tab-active bg-black text-white w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                    </div>
     
                </div>}

                {/* Last page */}
                {index === 2 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold mt-3">Explore Free Workout Classes Near You</p>

                    {/* img here */}
                    <img src="placeholder.jpg" alt="" className="object-cover rounded-md my-6"/>

                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Magni in facere amet cupiditate aspernatur quisquam labore, aliquam vel laborum eaque consectetur eum dolor commodi. Reiciendis vero aspernatur sint cumque facilis.</p>

                    {/* progress */}
                    <div className="flex justify-center gap-4 my-12">
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button className="tab tab-bordered tab-active bg-black text-white w-12 h-2 rounded-full"></button>
                    </div>
     
                </div>}

                {/* Last page */}
                {index === 3 && <div>
                    {/* Header */}
                    <p className="text-3xl font-bold my-3">Free Health Assessment</p>

                    <p className="text-lg my-3">Welcome to Own Time Own Target! Please have the equipment following ready before you begin your health assessment.</p>
                    {/* icons */}
                    <div className="space-y-3 mb-6">
                        <div className="flex">
                            <FontAwesomeIcon icon={faWeightScale} className="w-6 h-6"/>
                            <p className="ml-4 text-lg font-semibold">Weighing scale</p>
                        </div>

                        <div className="flex">
                            <FontAwesomeIcon icon={faTape} className="w-6 h-6"/>
                            <p className="ml-4 text-lg font-semibold">Body measuring tape</p>
                        </div>
                    </div>


                </div>}
                
                {/* Buttons */}
                <div>
                    {(index === 0 || index === 1) && 
                    <div className="flex gap-6 justify-center">
                        <button className="btn btn-outline text-center w-full max-w-[40%] border border-gray-500 text-black rounded-full" onClick={skip}>Skip</button>
                        <button className="btn bg-black text-center w-full max-w-[40%] text-white rounded-full" onClick={nextPage}>Next</button>
                    </div>}

                    {index === 2 && 
                    <div className="">
                        <button className="btn bg-black text-center w-full text-white rounded-full" onClick={nextPage}>Begin Health Assessment</button>
                    </div>}

                    {index === 3 && 
                    <div className="">
                        <button className="btn bg-black text-center w-full text-white rounded-full mt-60" onClick={() => navigate("/onboard")}>Continue</button>
                    </div>}
                </div>
            </div>
        </div>
    )
}