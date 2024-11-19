import { useNavigate } from 'react-router-dom';

export default function Start() {

  const navigate = useNavigate()

  return (
    <div className="">
      {/* Container */}
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center">
            <img src="workout_icon.png" alt="workout icon" className="object-contain max-w-[80%]"/>

            <div className="mt-6 text-center">
              <p className="font-bold text-4xl">Own Time</p>
              <p className="font-bold text-4xl">Own Target</p>
              <p className="text-content mt-6 text-gray-600 text-xl">Your health, your way</p>
            </div>

            <div className="space-y-3 w-full">
              <button className="btn bg-themeGreen btn-lg mt-12 w-full text-black rounded-full" onClick={() => navigate("/healthinfo")}>Try now</button>

              <button className="btn btn-outline btn-lg w-full text-black rounded-full border-themeGreen border-2" onClick={() => navigate("/signin")}>Sign in</button>
            </div>

        </div>
      </div>

    </div>
  );
}