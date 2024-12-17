import { useNavigate } from "react-router-dom";

export default function Start() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex justify-center items-center">
      {/* Container */}
      <div className="container mx-auto p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Image Section */}
        <div className="lg:w-1/2 flex justify-center mb-10 lg:mb-0">
          <img
            src="landing.jpg"
            alt="workout icon"
            className="w-3/4 md:w-2/3 lg:w-full max-w-[500px] object-contain"
          />
        </div>

        {/* Text Section */}
        <div className="lg:w-1/2 text-center px-4">
          <h1 className="font-bold text-4xl lg:text-5xl mb-4">
            Own Time
            <br />
            Own Target
          </h1>
          <p className="text-gray-600 text-lg lg:text-xl mb-8">
            Connect with others and stay active at your own pace.
          </p>

          {/* Buttons */}
          <div className="space-y-3 flex flex-col items-center">
            <button
              className="bg-themeGreen w-full px-8 py-3 lg:max-w-[350px] text-black font-semibold rounded-full"
              onClick={() => navigate("/healthinfo")}
            >
              Try Now
            </button>

            <button
              className="border-2 border-themeGreen w-full lg:max-w-[350px] px-8 py-3 text-black font-semibold rounded-full"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
