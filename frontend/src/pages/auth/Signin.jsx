import {useState} from "react"
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Signin() {

  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("")

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSignin = async () => {
    const requestData = {
      email,
      password
    }

    try {
      const response = await fetch ("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("userId", data.userid)
        localStorage.setItem("gender", data.gender)
        localStorage.setItem("workoutCounter", data.workoutCounter)
        localStorage.setItem("workoutFreq", data.workoutFreq)
        localStorage.setItem("age", data.age)
        navigate("/home")
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError("Email or password is wrong")
      console.log(error)
    }
  }

  return (
    <div className="">
      {/* Container */}
      <div className="mx-auto p-6">
        <div className="flex flex-col">
            <img src="auth.png" alt="workout icon" className="object-contain mx-auto"/>

            <div className="mt-6">
              <p className="font-bold text-4xl">Sign in to Own Time Own Target</p>

              {/* email */}
              <label className="form-control w-full mt-6">
                    <div className="label">
                        <span className="label-text font-bold">Email</span>
                    </div>
                    <input type="email" className="input input-bordered w-full" value={email} onChange={(event) => setEmail(event.target.value)}/>
              </label>

              {/* password */}
              <label className="form-control w-full mt-6">
                <div className="label">
                  <span className="label-text font-bold">Password</span>
                </div>


                <div className="flex items-center border border-gray-300 rounded-lg">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input w-full"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  
                  {/* Eye Icon Button to Toggle Visibility */}
                  <button
                    type="button"
                    className="p-2 text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
                  </button>
                </div>
              </label>
              {error !== "" && <p className="text-red-600 font-bold mt-3">{error}</p>}
            </div>

            <button className="btn bg-themeGreen btn-lg mt-6 w-full text-black rounded-full" onClick={handleSignin}>Sign in</button>

        </div>
      </div>

    </div>
  );
}