import { useNavigate } from 'react-router-dom';
import workoutImg from "../images/workout_icon.png"

export default function Login() {

  const navigate = useNavigate()

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