import {useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function Loading() {
    
    //send the props to next page to be displayed
    const location = useLocation()
    const navigate = useNavigate()
    const receivedData = location.state?.data
    const [step, setStep] = useState(1)

    useEffect(() => {
        if (step === 1) {
          const timer = setTimeout(() => {
            setStep(2)
          }, 3000)
    
          return () => clearTimeout(timer)
        } else if (step === 2) {
          const timer = setTimeout(() => {
            navigate("/recommendations")
          }, 3000);
    
          return () => clearTimeout(timer)
        }
      }, [step, navigate]);

    //page 1
    localStorage.setItem("name", receivedData[0])
    localStorage.setItem("age", receivedData[1])
    localStorage.setItem("gender", receivedData[2])
    localStorage.setItem("race", receivedData[3])

    localStorage.setItem("workoutFreq", receivedData[4]) //page 2
    localStorage.setItem("core", JSON.stringify(receivedData[5])) //page 5
    localStorage.setItem("lowerbody", JSON.stringify(receivedData[6])) //page 6
    localStorage.setItem("upperbody", JSON.stringify(receivedData[7])) //page 7

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <span className="loading loading-spinner w-48 text-themeGreen"></span>
            {step === 1 ? (
        <>
          <p className="text-2xl font-bold text-center mt-4">
            Assessing your information...
          </p>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-center mt-4">
            Generating recommendations for your workout plans...
          </p>
        </>
      )}
            
        </div>
    )
}