// import { useState } from 'react'
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebase"
import { useNavigate } from 'react-router-dom';
import workoutImg from "../images/workout_icon.png"

export default function Login() {

  // const [userValue, setUserValue] = useState({
  //   emailAddress: "",
  //   password : ""
  // })
  const navigate = useNavigate();

  // const handleChange = (event) => {
  //   const { name, value } = event.target;
  //   setUserValue({
  //     ...userValue,
  //     [name]: value
  //   });
  // }

  // const login = (event) => {
  //   event.preventDefault()
  //   signInWithEmailAndPassword(auth, userValue.emailAddress, userValue.password)
  //   .then((userCredential) => {

  //       const user = userCredential.user;
  //       console.log(user)
  //       navigate("/onboard")
        
  //   })
  //   .catch((error) => {
        
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       alert(errorCode, errorMessage)

  //   });
  // }

  return (
    <div className="min-h-screen">
      
      {/* Container */}
      <div className="container mx-auto p-12">
        <div className="flex flex-col items-center">
            <img src={workoutImg} alt="workout icon" className="object-contain"/>

            <div className="mt-12 text-center">
              <p className="font-bold text-4xl">Own Time</p>
              <p className="font-bold text-4xl">Own Target</p>
              <p className="text-content mt-6 text-gray-500 font-bold">For a healthy you 💚</p>
            </div>

            <button className="btn bg-purple btn-lg mt-12 w-full text-white rounded-full" onClick={() => navigate("/onboard")}>Create Account</button>
        </div>
      </div>

    </div>
  );
}