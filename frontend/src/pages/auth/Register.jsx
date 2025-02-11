import {useState} from "react"
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Signin() {

  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeat, setRepeat] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const register = async () => {
    const requestData = {
      name: localStorage.getItem("name"), 
      core: JSON.parse(localStorage.getItem("core")),
      upperBody: JSON.parse(localStorage.getItem("upperBody")), 
      lowerBody: JSON.parse(localStorage.getItem("lowerBody")), 
      email,
      password
    }

    try {
      const response = await fetch (`${import.meta.env.VITE_PROTOCOL}${import.meta.env.VITE_HOST}${import.meta.env.VITE_PORT}/register`, {
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()


      if (response.ok) {
        setSuccess("Registered sucessfully! Directing you to sign in page...")
        await wait(3000)
        navigate("/signin")
      } else {
        setError("Error occurred during registration, try again")
      }
    } catch (error) {
      setError("Error occurred during registration, try again")
    }
  }

  const handleCreateAccount = () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password !== repeat) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 5) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // If everything is valid, clear error and navigate
    setError("")
    register()
  };

  return (
    <div className="">
      {/* Container */}
      <div className="mx-auto p-6">
        <div className="flex flex-col">
            <img src="auth.png" alt="workout icon" className="object-contain mx-auto"/>

            <div className="mt-6">
              <p className="font-bold text-4xl">Create An Account</p>
              <p className="mt-3 text-lg">Connect with like-minded people and join workout groups in your community</p>

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

              {/* retype password */}
              <label className="form-control w-full mt-6">
                <div className="label">
                  <span className="label-text font-bold">Repeat Password</span>
                </div>


                <div className="flex items-center border border-gray-300 rounded-lg">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input w-full"
                    value={repeat}
                    onChange={(event) => setRepeat(event.target.value)}
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
              
              {error && (
              <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
            )}
              {success && (
              <p className="text-green-500 text-sm mt-2 font-medium">{success}</p>
            )}

            </div>

            <button className="btn bg-themeGreen btn-lg mt-8 w-full text-black rounded-full" onClick={handleCreateAccount}>Create an account</button>

        </div>
      </div>

    </div>
  );
}