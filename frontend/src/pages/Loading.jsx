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

    
    const [username, setUsername] = useState("")
    const [emailAddress, setEmailAddress] = useState("")
    const [password, setPassword] = useState("")
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [age, setAge] = useState("")
    const [gender, setGender] = useState("")
    const [days, setDays] = useState("")
    const [duration, setDuration] = useState("")
    const [isDataInitialized, setIsDataInitialized] = useState(false);
    
    // receive from prev page
    useEffect(() => {
        if (receivedData) {
            setUsername(receivedData[0])
            setEmailAddress(receivedData[1])
            setPassword(receivedData[2])
            setHeight(receivedData[3])
            setWeight(receivedData[4])
            setAge(receivedData[5])
            setGender(receivedData[6])
            setDays(receivedData[7])
            setDuration(receivedData[8])
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
                            "username": username,
                            "email": emailAddress,
                            "password": password,
                            "height": height,
                            "weight": weight,
                            "age": age,
                            "gender": gender,
                            "frequency": days,
                            "duration": duration,
                        }),
                    });
        
                    if (!response.ok) {
                        throw new Error('Failed to send data to userdbmanager');
                    }
        
                    const result = await response.json();
                    const userid = result.userid
                    console.log(userid)
                    localStorage.setItem("userid", userid)

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
    
                        const data = [days, program]
                        navigate("/home", {state: {data: data}})
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
    }, [isDataInitialized])

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <span className="loading loading-spinner text-primary loading-lg"></span>
            <p className="text-4xl font-bold text-center mt-4">Creating your customised program</p>
        </div>
    )
}