import { useState } from 'react'
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"
import { useNavigate } from 'react-router-dom';

export default function Login() {

  const [userValue, setUserValue] = useState({
    emailAddress: "",
    password : ""
  })
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserValue({
      ...userValue,
      [name]: value
    });
  }

  const login = (event) => {
    event.preventDefault()
    signInWithEmailAndPassword(auth, userValue.emailAddress, userValue.password)
    .then((userCredential) => {

        const user = userCredential.user;
        console.log(user)
        navigate("/onboard")
        
    })
    .catch((error) => {
        
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode, errorMessage)

    });
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      
      {/* Card */}
      <div className="card bg-base-100 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-6">Sign in</h2>
          <form>
            {/* emailaddress */}
            <label className="input input-bordered flex items-center gap-2 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                  d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path
                  d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              <input className="grow" name="emailAddress" type="email" placeholder="Email address"value={userValue.emailAddress} onChange={handleChange} />
            </label>

            {/* password */}
            <label className="input input-bordered flex items-center gap-2 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd" />
              </svg>
              <input name="password" type="password" className="grow" placeholder="Password" value={userValue.password} onChange={handleChange}/>
            </label>
        
          </form>

          <div className="card-actions justify-end">
            <button className="btn btn-neutral w-full" onClick={login}>Sign in</button>
          </div>
        </div>
      </div>

    </div>
  );
}