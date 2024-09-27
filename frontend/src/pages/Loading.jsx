import {useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function Loading() {

    // over here we do async call
    // send all the data to the backend
    // wait for the data to be returned
    // setTimeOut if data comes back too fast
    // once the training is done, store user id & training prog in sessionStorage
    // navigate to homepage
    
    //send the props to next page to be displayed
    const location = useLocation()
    const navigate = useNavigate()
    const receivedData = location.state?.data

    const [age, setAge] = useState("") //page 1
    const [gender, setGender] = useState("") //page 1
    const [level, setLevel] = useState("") //page 2
    const [days, setDays] = useState("") //page 3
    const [duration, setDuration] = useState("") //page 4
    const [injuries, setInjuries] = useState([]) //page 5
    const [core, setCore] = useState([]) //page 6
    const [lowerBody, setLowerBody] = useState([]) //page 7
    const [upperBody, setUpperBody] = useState([]) // page 8
    const [isDataInitialized, setIsDataInitialized] = useState(false)

    localStorage.setItem("age", age)
    localStorage.setItem("gender", gender)
    localStorage.setItem("level", level)
    localStorage.setItem("days", days)
    localStorage.setItem("duration", duration)
    localStorage.setItem("injuries", JSON.stringify(injuries))
    localStorage.setItem("core", JSON.stringify(core))
    localStorage.setItem("lowerbody", JSON.stringify(lowerBody))
    localStorage.setItem("upperbody", JSON.stringify(upperBody))
    
    // receive from prev page
    useEffect(() => {
        if (receivedData) {
            setAge(receivedData[0])
            setGender(receivedData[1])
            setLevel(receivedData[2])
            setDays(receivedData[3])
            setDuration(receivedData[4])
            setInjuries(receivedData[5])
            setCore(receivedData[6])
            setLowerBody(receivedData[7])
            setUpperBody(receivedData[8])
            setIsDataInitialized(true)
        }
    }, [receivedData])

    // send info to userdb manager
    useEffect(() => {
        if (isDataInitialized) {
            const sendData = async () => {
                
                try {
                    const response = await fetch('https://bfg-backend-gcp-image-719982789123.us-central1.run.app/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "age" : age,
                            "gender": gender,
                            "level": level,
                            "days": days,
                            "duration": duration,
                            "injuries": injuries,
                            "core_strength" : core,
                            "lower_body_strength": lowerBody,
                            "upper_body_strength": upperBody
                        }),
                    });
        
                    if (!response.ok) {
                        throw new Error('Failed to send data to userdbmanager');
                    }
        
                    const result = await response.json();
                    const userid = result.userid
                    console.log(userid)
                    localStorage.setItem("userid", userid)
                    localStorage.setItem("seenOnboard", true)
                    try {
                        const response = await fetch('https://bfg-backend-gcp-image-719982789123.us-central1.run.app/recommend', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                "userid": userid
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to send data to recommend new info');
                        }
            
                        const result = await response.json();
                        const program = result.data
                        localStorage.setItem("program", JSON.stringify(program))
                        console.log("Created your program! Moving you to the homepage!")

                        navigate("/home")
                    } catch (error) {
                        console.error("Error sending data to recommend program", error)
                    }

                }
                catch (error) {
                    console.error('Error sending data:', error);
                } finally {
                    console.log("Request to userdbmanager complete")
                }
            }
            
            sendData()
        }
    }, [age, core, days, duration, gender, injuries, isDataInitialized, level, lowerBody, navigate, upperBody])

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <span className="loading loading-spinner text-primary loading-lg"></span>
            <p className="text-4xl font-bold text-center mt-4">Creating your customised program</p>
            
            <div className="px-4">
                <p className="mt-12 p-2 border-2 border-purple rounded-lg text-balance text-dark-purple"> <span className="font-bold text-dark-purple">Did you know:</span> 30 to 60 minutes of strength training a week reduces the risk of mortality, cardiovascular disease and cancer <span className="font-bold text-dark-purple">by 10 to 20%!</span></p>
            </div>
        </div>
    )
}