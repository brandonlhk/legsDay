import { useNavigate } from "react-router-dom"

export default function Library() {
    const navigate = useNavigate()



    return (
        <div className="bg-[#f5f5f5] min-h-screen">

            <p className="text-center text-dark-purple font-bold text-3xl pt-6">Content for you</p>
            
            <div className="container mx-auto p-6 overflow-hidden">
                {/* Assess body strength */}
                <p className="font-bold text-dark-purple">Assess your body strength</p>

                <div className="carousel carousel-center rounded-box max-w-md space-x-4 pr-24">

                    <a href="https://youtu.be/LzzWM-Pyf2w?si=FRBwgPRvk1Rbm2Yt" target="_blank" rel="noopener noreferrer" className="carousel-item rounded-box">
                        <div className="flex flex-col items-center">
                            <div className="card w-44 h-44 relative">
                                <figure>
                                    <img src="images/plank_strength.png" alt="plank" className="rounded-lg object-cover w-full h-full absolute inset-0"/>
                                </figure>
                            </div>
                            <p className="font-bold text-wrap">Core Strength: Plank test</p>
                            <p>3 min video</p>
                        </div>
                    </a>

                    <a href="https://youtu.be/7w18frhPupg?si=OHXaPvfrvwRfP9ju" target="_blank" rel="noopener noreferrer" className="carousel-item rounded-box">
                        <div className="flex flex-col items-center">
                            <div className="card w-44 h-44 relative">
                                <figure>
                                    <img src="images/sit_strength.png" alt="plank" className="rounded-lg object-cover w-full h-full absolute inset-0"/>
                                </figure>
                            </div>
                            <p className="font-bold whitespace-pre text-center">Lower body strength: <br/> Sit-to-Stand test</p>
                            <p>3 min video</p>
                        </div>
                    </a>

                    <a href="https://youtu.be/U99m3uMuuhY?si=0I7VGiVakW9s0XTC" target="_blank" rel="noopener noreferrer" className="carousel-item rounded-box">
                        <div className="flex flex-col items-center">
                            <div className="card w-44 h-44 relative">
                                <figure>
                                    <img src="images/push_up_test.png" alt="plank" className="rounded-lg object-cover w-full h-full absolute inset-0"/>
                                </figure>
                            </div>
                            <p className="font-bold whitespace-pre text-center">Upper body strength: <br/> Push-up test</p>
                            <p>3 min video</p>
                        </div>
                    </a>
                </div>

                {/* Common questions */}
                <p className="font-bold text-dark-purple mt-4">Common Qns and Misconceptions</p>

                <div className="carousel carousel-center rounded-box max-w-md space-x-4 pr-24">

                    <a href="https://www.healthhub.sg/live-healthy/ladies-lifting-weights-wont-make-you-look-masculine" target="_blank" rel="noopener noreferrer" className="carousel-item rounded-box">
                        <div className="flex flex-col items-center">
                            <div className="card w-44 h-44 relative">
                                <figure>
                                    <img src="images/qns_1.png" alt="qns1" className="rounded-lg object-fill w-full h-full absolute inset-0"/>
                                </figure>
                            </div>
                        </div>
                    </a>

                    <a href="https://www.healthhub.sg/live-healthy/dont-forget-your-form" target="_blank" rel="noopener noreferrer" className="carousel-item rounded-box">
                        <div className="flex flex-col items-center">
                            <div className="card w-44 h-44 relative">
                                <figure>
                                    <img src="images/qns_2.png" alt="qns2" className="rounded-lg object-cover w-full h-full absolute inset-0"/>
                                </figure>
                            </div>
                        </div>
                    </a>

                    <a href="https://www.healthhub.sg/live-healthy/no_gym_membership_1" target="_blank" rel="noopener noreferrer" className="carousel-item rounded-box">
                        <div className="flex flex-col items-center">
                            <div className="card w-44 h-44 relative">
                                <figure>
                                    <img src="images/qns_3.png" alt="qns3" className="rounded-lg object-cover w-full h-full absolute inset-0"/>
                                </figure>
                            </div>
                        </div>
                    </a>
                </div>

                {/* OTOT Recommends */}
                <p className="font-bold text-dark-purple mt-4">OTOT Recommends</p>

                <div className="carousel carousel-center rounded-box max-w-md space-x-4 pr-24 pb-14">

                    <a href="https://www.healthhub.sg/programmes/nsc" target="_blank" rel="noopener noreferrer" className="carousel-item rounded-box">
                        <div className="flex flex-col items-center">
                            <div className="card w-44 h-44 relative">
                                <figure>
                                    <img src="images/otot_1.png" alt="qns1" className="rounded-lg object-fill w-full h-full absolute inset-0"/>
                                </figure>
                            </div>
                        </div>
                    </a>

                    <a href="https://www.healthhub.sg/programmes/screen_for_life" target="_blank" rel="noopener noreferrer" className="carousel-item rounded-box">
                        <div className="flex flex-col items-center">
                            <div className="card w-44 h-44 relative">
                                <figure>
                                    <img src="images/otot_2.png" alt="qns2" className="rounded-lg object-cover w-full h-full absolute inset-0"/>
                                </figure>
                            </div>
                        </div>
                    </a>

                    <a href="https://www.healthhub.sg/programmes/letsmoveit/start2move#home" target="_blank" rel="noopener noreferrer" className="carousel-item rounded-box">
                        <div className="flex flex-col items-center">
                            <div className="card w-44 h-44 relative">
                                <figure>
                                    <img src="images/otot_3.png" alt="qns3" className="rounded-lg object-cover w-full h-full absolute inset-0"/>
                                </figure>
                            </div>
                        </div>
                    </a>
                </div>
            </div>



            {/* sticky bottom tab */}
            <div>
                <div className="btm-nav">
                    <button onClick={() => navigate("/home")}>
                    Workout
                    </button>
                    <button className="active" >
                    Library
                    </button>
                    <button onClick={() => navigate("/settings")}>
                    Settings
                    </button>
                </div>
            </div>
        </div>
    )
}