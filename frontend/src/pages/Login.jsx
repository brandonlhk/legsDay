import { useNavigate } from 'react-router-dom';

export default function Login() {

  const navigate = useNavigate()

  return (
    <div className="">
      {/* Container */}
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center">
            <img src="workout_icon.png" alt="workout icon" className="object-contain"/>

            <div className="mt-6 text-center">
              <p className="font-bold text-4xl">Own Time</p>
              <p className="font-bold text-4xl">Own Target</p>
              <p className="text-content mt-6 text-gray-600 text-xl">Your health, your way</p>
            </div>

            <button className="btn bg-black btn-lg mt-12 w-full text-white rounded-full" onClick={() => navigate("/healthinfo")}>Get started</button>
        </div>
      </div>

    </div>
  );
}