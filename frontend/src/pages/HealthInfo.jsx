import {useState, useEffect} from "react"
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
                    <p className="text-3xl font-bold mt-3">Do a Free Health Assessment</p>

                    {/* img here */}
                    <img src="placeholder.jpg" alt="" className="object-cover rounded-md my-6"/>

                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Magni in facere amet cupiditate aspernatur quisquam labore, aliquam vel laborum eaque consectetur eum dolor commodi. Reiciendis vero aspernatur sint cumque facilis.</p>

                    {/* progress */}
                    <div className="flex justify-center gap-4 my-12">
                        <button class="tab tab-bordered tab-active bg-black text-white w-12 h-2 rounded-full"></button>
                        <button class="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button class="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
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
                        <button class="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button class="tab tab-bordered tab-active bg-black text-white w-12 h-2 rounded-full"></button>
                        <button class="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
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
                        <button class="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button class="tab tab-bordered bg-gray-300 w-12 h-2 rounded-full"></button>
                        <button class="tab tab-bordered tab-active bg-black text-white w-12 h-2 rounded-full"></button>
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
                        <button className="btn bg-black text-center w-full text-white rounded-full" onClick={() => navigate("/onboard")}>Begin Health Assessment</button>
                    </div>}
                </div>
                {/* Next page */}
                {/* <button className="btn bg-purple text-center w-full text-white mt-auto mb-6" onClick={nextPage}>Continue</button> */}
            </div>
        </div>
    )
}