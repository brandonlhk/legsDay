import {useState} from "react"
import { useNavigate } from "react-router-dom"

export default function Recommendations() {
    const navigate = useNavigate()
    const [core, setCore] = useState(JSON.parse(localStorage.getItem("core")))
    const [lowerBody, setLowerBody] = useState(JSON.parse(localStorage.getItem("lowerbody")))
    const [upperBody, setUpperBody] = useState(JSON.parse(localStorage.getItem("upperbody")))

    //default states
    const weakness = []
    const recommendations = [
        {"workout" : "Bodyweight Exercises", "info" : "Strengthens muscles with bodyweight exercises like push-ups and squats, improving endurance and core stability", "img" : "bodyweight.png"},
        {"workout" : "Functional Mobility Training", "info" : "Boost strength by improving joint mobility and movement patterns through stretches, rotations, and resistance exercises.", "img" : "functional.png"}
    ]
    let display = ""

    //determine the permutation here
    if (!(core.includes("None"))) {
        weakness.push("Core")
    }
    if (!(upperBody.includes("None"))) {
        weakness.push("Upper Body")
    }
    if (!(lowerBody.includes("None"))) {
        weakness.push("Lower Body")
    }

    // check if user has any weakness
    if (weakness.length == 0) {
        recommendations.length = 0 //reset recommendations
        recommendations.push({"workout" : "General Strength Training", "info" : "Builds muscle by using resistance exercises to target different muscle groups, promoting growth and strength through progressive overload", "img" : "strength.png"})
        recommendations.push({"workout" : "Powerlifting", "info" : "Builds muscle by heavy compound lifts like squats, deadlift, and bench presses, promoting growth and power with progressive overload.", "img" : "powerlifting.png"})
        recommendations.push({"workout" : "Running", "info" : "Strengthens the legs, hips, and core, improving muscle endurance, toning muscles, and boosting cardiovascular health.", "img" : "running.png"})
    } else if(weakness.includes("Upper Body")) {
        recommendations.push({"workout" : "Brisk walks (with arm engagement)", "info" : "Strengthen both the lower and upper body improving muscle tone, endurance, and coordination.", "img" : "brisk.png"})
    } else {
        recommendations.push({"workout" : "Brisk walks", "info" : "Strengthen the lower body, improve endurance, and tone muscles with low impact, moderate-intensity movement.", "img" : "brisk.png"})
    }

    //for the display message
    for (let i=0; i<weakness.length; i++) {
        if (i == weakness.length-1) {
            display += ` and ${weakness[weakness.length-1]}`
        } else {
            display += ` ${weakness[i]},`
        }
    }
 
    return (
        <div className="min-h-screen flex flex-col items-center px-6 py-6">
          <div className="w-full">
            {/* Header */}
            <h1 className="text-2xl font-bold text-center mb-4">Recommended Workout</h1>
    
            {/* Assessment */}
            <p className="text-lg mt-3 ">
              {weakness.length > 0 ? "Based on your assessment, it looks like you have poor body strength in the following areas:": "You're doing an amazing job taking care of your health and body - keep it up!"}
            </p>

            {weakness.length>0 && (
                <ul className="list-disc text-gray-700 mt-2 ml-8">
                    {weakness.map((data, index) => (
                        <li key={index}>{data}</li>
                    ))}
                </ul>
            )}

    
            {/* Recommendations */}
            <h2 className="text-lg font-semibold mt-6">Recommended Workout For {display} Strengthening</h2>
    
            <div className="mt-4 space-y-4 flex flex-col items-center">
                {recommendations.map((data, index) => (
                  <div className="card border border-gray-200" key={index}>
                    <div className="card-body p-6">
                      <h2 className="card-title text-xl font-semibold flex justify-between items-center">{data.workout}</h2>
                      <img src={data.img} alt="" />
                      <p className="font-semibold">Strengthens muscles with bodyweight exercises like push-ups and squats, improving endurance and core stability without equipment.</p>
                    </div>
                  </div>
                ))}
            </div>
    
            {/* Footer */}
            <div className="mt-6 text-lg text-gray-600 flex items-center space-x-2">
              <span>✨</span>
              <p>Create an account to explore workout groups in your community!</p>
            </div>
    
            {/* Call to Action */}
            <button className="w-full bg-[#00C9A7] text-black py-3 rounded-full mt-4 " onClick={() => navigate("/register")}>
              Proceed to Create Account
            </button>
          </div>
        </div>
      );
}