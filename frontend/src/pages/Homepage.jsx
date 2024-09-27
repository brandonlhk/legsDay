import {useState, useEffect, useRef} from "react"
import {useLocation, useNavigate} from "react-router-dom"
import JSConfetti from 'js-confetti'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faVolumeMute, faPause, faPlay, faUndoAlt, faArrowLeft, faArrowUp, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import CountdownModal from '../components/CountdownModal';

export default function Homepage() {
  const navigate = useNavigate()
  
  // data receive from localStorage
  const userID = localStorage.getItem("userid")
  const [days, setDays] = useState(localStorage.getItem("days"))
  const [duration, setDuration] = useState(localStorage.getItem("duration"))
  const [core, setCore] = useState(JSON.parse(localStorage.getItem("core")))
  const [lowerBody, setLowerbody] = useState(JSON.parse(localStorage.getItem("lowerbody")))
  const [upperBody, setUpperBody] = useState(JSON.parse(localStorage.getItem("upperbody")))

  // count current days and exercises
  const [exercisesDone, setExercisesDone] = useState(0)
  const [daysDone, setDaysDone] = useState(0)
  
  // check if user finish the exercise for that day
  const [finishExerciseCheck, setFinishExerciseCheck] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [currProgram, setCurrProgram] = useState(JSON.parse(localStorage.getItem("program")))

  // check if user start exercise, true -> open modal
  const [startExercise, setStartExercise] = useState(false)
  const [openStartExercise, setOpenStartExercise] = useState(false)

  // onboarding modal (show difficulties)
  const [difficultyModal, setDifficultyModal] = useState(true)

  // audio related
  const [isMuted, setIsMuted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioFilePath, setAudioFilePath] = useState("")
  const audioRef =  useRef(null)
  const [audioCountDown, setAudioCountDown] = useState(5)

  // others
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [progress, setProgress] = useState(0)

  //post progression index
  const [postIndex, setPostIndex] = useState(0)
  const [postModal, setPostModal] = useState(false)
  const slides = [
    {
      title: 'Congrats on completing! 🥳',
      description: 'You have completed all the exercises in this today’s program! Well done! \n\n Tap on the right to see a summary of your achievements so far.',
      img: '/images/post_1.png'
    },
    {
      title: "Let's recap",
      description: "You have spent this amount of time doing strength training today. \n\n Keep Going, each workout is making you stronger and healthier :)",
      stat: "30 mins"
    },
    {
      title: "What today's workout did for your health",
      description: "You have increased your overall fitness by this much after today's program!",
      icon: faArrowUp,
      stat: "14%",
      footer: "References: \n 1. Evaluation of the '15 Minute Challenge': A Workplace Health and Wellbeing Program doi: 10.3390/healthcare12131255"
    },
    {
      title: "Your hard work is paying off!",
      description: "Keep going - your progress is impressive and just the beginning.",
      img: "/images/post_2.png",
      button: "yes"
    }

  ]
  
  //countdown for exercises
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false)
  const intervalRef = useRef(null);
 
  const toggleCountdown = () => {
    setIsWorkoutPaused(!isWorkoutPaused);
  };

  //refreshing exercise
  const [loadingExercises, setLoadingExercises] = useState({});

  const handleRefreshExercise = async (exercise) => {
    // Set the specific exercise to loading state
    setLoadingExercises((prev) => ({ ...prev, [exercise.exercise._id]: true }));

    const body = {
      "userid" : userID,
      "substitution" : {
        "exercise_id" : exercise.exercise._id,
        "name" : exercise.exercise.name,
        "body_part" : exercise.bodyPart
      }
    }
    try {
          const response = await fetch('https://bfg-backend-gcp-image-719982789123.us-central1.run.app/substitute', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
          })
                  
          if (!response.ok) {
              throw new Error('Failed to send data to recommend new info');
          }
    
          const result = await response.json();
          const program = result.data
          console.log(exercise.bodyPart)
          updateCurrProgram(program, exercise.bodyPart)
          console.log(currProgram)
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingExercises((prev) => ({ ...prev, [exercise.exercise._id]: false }));
    }
   
  }

  const updateCurrProgram = (newExercise, bodyPart) => {
    setCurrProgram(prevProgram => {
      const updatedProgram ={...prevProgram}
      console.log(newExercise[bodyPart])
      console.log(updatedProgram.abs)

      if (bodyPart === "abs") {
        updatedProgram.abs = newExercise[bodyPart];
      } else if (bodyPart === "lower") {
        updatedProgram.lower = newExercise[bodyPart];
      } else if (bodyPart === "upper") {
        updatedProgram.upper = newExercise[bodyPart];
      }
      
      localStorage.setItem("program", JSON.stringify(updatedProgram))
      return updatedProgram;
    })
  }


  //ig story kinda feel
  const handleTap = (e) => {
    const width = e.target.offsetWidth; // Get the width of the carousel
    const clickX = e.clientX; // Get the X position of the click

    if (clickX < width / 2) {
      setPostIndex((prevIndex) => (prevIndex - 1) % slides.length) ; // If clicked on the left half, go to the previous slide
    } else {
      setPostIndex((prevIndex) => (prevIndex + 1) % slides.length); // If clicked on the right half, go to the next slide
    }
  };

  const handleStartOpen = (exercise) => {
    setCountdown(5)
    setStartExercise(true)
    setIsModalOpen(false);

    //open the new workout modal
    console.log(exercise)
    setOpenStartExercise(true)
    setAudioFilePath(`/audio/${exercise}.mp3`);
    setAudioCountDown(5);
    setTimeLeft(60)
    setIsPaused(false)
    setIsMuted(false)
  }

  const handleStartClose = () => {
    setStartExercise(false)
  }

  const calculateProgress = () => {

    const toAdd = 100/days/3
    setProgress((prevProgress) => prevProgress + toAdd)
  }

  // audio
  const handleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPaused(false);
    }
  };
  //end audio

  const openModal = (exercise) => {
    setCurrentExercise(exercise);
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExercise(null);
  }

  const goBack = () => {
    setIsModalOpen(true)
    setOpenStartExercise(false)
    setIsWorkoutPaused(false)
    setTimeLeft(60)
  }

  const finishExercise = () => {
    setFinishExerciseCheck(true)
    setCompletedExercises((prevCompleted) => [...prevCompleted, currentExercise.exercise._id]);
    calculateProgress()
    setExercisesDone((prevExercisesDone) => prevExercisesDone + 1)
    setOpenStartExercise(false)
    setIsWorkoutPaused(false)
    setTimeLeft(60)
    setIsMuted(false)
    setIsPaused(false)
  }

  
  // if every exercise done, can increase by 1, if all exercises done, refresh exercises
  useEffect(() => {

    if (exercisesDone === 3) {
      setDaysDone((prevDays) => prevDays + 1)
      setExercisesDone(0)
      //add the post workout modal here
      setPostModal(true)
      const jsConfetti = new JSConfetti()
      jsConfetti.addConfetti()
    }
  }, [exercisesDone])

  //check if pausing workout
  useEffect(() => {
    if (isWorkoutPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 || !isWorkoutPaused) {
      clearInterval(intervalRef.current);
    }

    // Cleanup function to clear interval on unmount
    return () => clearInterval(intervalRef.current);
  }, [isWorkoutPaused, timeLeft])

  // make modal scroll better 
  useEffect(() => {
    if (postModal) {
      const modalElement = document.getElementById('completionModal')
      if (modalElement) {
        modalElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [postModal])

  useEffect(() => {
    if (openStartExercise) {
      const modalElement = document.getElementById('startExerciseModal')
      if (modalElement) {
        modalElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [openStartExercise]);

  useEffect(() => {
    if (difficultyModal) {
      const modalElement = document.getElementById('onboardModal')
      if (modalElement) {
        modalElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [difficultyModal]);

  useEffect(() => {
    if (isModalOpen) {
      const modalElement = document.getElementById('infoModal')
      if (modalElement) {
        modalElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gray-50">

    <div className="container mx-auto p-3 flex min-h-screen">

      {/* Headers */}
  
      <div className="flex-col w-full">
        <p className="text-center text-3xl font-bold mt-6">This week's progress</p>

        {/* progress */}
        <div className="card bg-white w-full border mt-6">
          <div className="card-body flex-row">

            <div>
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.666504 19C0.666504 8.87449 8.87434 0.666656 18.9998 0.666656C29.1253 0.666656 37.3332 8.87449 37.3332 19C37.3332 29.1237 29.1253 37.3333 18.9998 37.3333C8.87434 37.3333 0.666504 29.1237 0.666504 19ZM4.33317 19C4.33317 22.8898 5.8784 26.6204 8.62894 29.3709C11.3795 32.1214 15.11 33.6667 18.9998 33.6667C22.8897 33.6667 26.6202 32.1214 29.3707 29.3709C32.1213 26.6204 33.6665 22.8898 33.6665 19C33.6665 15.1101 32.1213 11.3796 29.3707 8.62909C26.6202 5.87856 22.8897 4.33332 18.9998 4.33332C15.11 4.33332 11.3795 5.87856 8.62894 8.62909C5.8784 11.3796 4.33317 15.1101 4.33317 19V19ZM25.0388 12.2038C25.3846 11.8699 25.8477 11.6851 26.3284 11.6893C26.8091 11.6934 27.2689 11.8862 27.6088 12.2262C27.9488 12.5661 28.1416 13.0259 28.1457 13.5066C28.1499 13.9873 27.9651 14.4504 27.6312 14.7962L16.6312 25.7962C16.2874 26.1399 15.8211 26.3329 15.335 26.3329C14.8489 26.3329 14.3826 26.1399 14.0388 25.7962L8.537 20.2943C8.20305 19.9486 8.01826 19.4854 8.02243 19.0048C8.02661 18.5241 8.21942 18.0642 8.55934 17.7243C8.89925 17.3844 9.35907 17.1916 9.83977 17.1874C10.3205 17.1832 10.7836 17.368 11.1293 17.702L15.335 21.9077L25.0388 12.2038V12.2038Z" fill="#E26972"/>
              </svg>
            </div>

            <div className="w-full">
              <p className="font-bold text-[13px]">Complete the full program for {days} days</p>
              <div className="flex items-center">
                <progress className="progress progress-error" value={progress} max="100"></progress>
                <span className="ml-2">{daysDone}/{days}</span>
              </div>
            </div>

           
          </div>
        </div>

        {/* today program */}
        <div className="bg-red-400 mt-6 text-center text-white rounded-lg">
          <p className="text-2xl p-6">Today's program</p>
          <p className="text-lg">Est time to complete: {duration} mins</p>

          {/* Exercises */}
          <div className="flex-col flex gap-6 p-2 mt-3 mb-20">
            {Object.keys(currProgram).map((program)=> {
              let exercise = currProgram[program]
              exercise = {...exercise, "bodyPart": program}
              const isCompleted = completedExercises.includes(exercise.exercise._id)
              const isLoading = loadingExercises[exercise.exercise._id]

              return (
                <div
                  key={exercise.exercise._id}
                  className="card card-side bg-white w-full shadow-xl h-48"
                  onClick={() => !isLoading && openModal(exercise)} // Prevent modal open if loading
                >
                  {/* Conditionally show the entire card as loading spinner */}
                  {isLoading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <span className="loading loading-spinner loading-md text-black"></span>
                        <p className="text-black">Loading new exercise...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <figure className="w-1/3">
                        <img className="w-full" src={exercise.exercise.image_binary} alt={exercise.exercise.name} />
                      </figure>
                      <div className="card-body text-black text-left w-2/3">
                        <p className="text-sm truncate font-bold">{exercise.exercise.name}</p>
                        <p className="text-sm">{exercise.reps.includes("seconds")  ? `1 min` : `2 sets x (${exercise.reps})`}</p>
              
                        {/* Show Completed if done, else show Change Exercise button */}
                        {isCompleted ? (
                          <div className="bg-myYellow rounded-lg p-3 text-center">
                            Completed
                          </div>
                        ) : (
                          <button
                            className="bg-[#f5f5f5] rounded-md p-2 mt-3 text-black text-sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent parent click event
                              handleRefreshExercise(exercise); // Set loading and refresh
                            }}
                          >
                            <FontAwesomeIcon icon={faArrowsRotate} className="mr-2"/>
                            Change exercise
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
              
            })}
          </div>
        </div>

        {/* sticky bottom tab */}
        <div>
          <div className="btm-nav">
            <button className="active">
              Workout
            </button>
            <button onClick={() => navigate("/library")}>
              Library
            </button>
            <button onClick={() => navigate("/settings")}>
              Settings
            </button>

          </div>
        </div>

        {/* Onboarding modal */}
        {difficultyModal && (
          <div id="onboardModal" className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-sm max-h-[80vh] overflow-auto relative">

              {/* Congrats Img */}
              {/* if user dont have any difficulties */}
              {core.includes("None") && lowerBody.includes("None") && upperBody.includes("None") && 
              (<div className="flex flex-col mx-auto p-6 gap-6">
                <img src="/images/congrats_2.png" alt="workout congrats" className="object-contain"/>

                  <p className="font-bold">You’re doing an amazing job with your health and taking care of your body strength — keep it up!</p>
                  <p>Complete the recommended exercises to maintain your strength and carry out daily activities with ease~ 💪🏻</p>

                  <button className="w-full btn btn-outline border-purple border-2" onClick={() => setDifficultyModal(false)}><p className="text-purple font-bold">Let's go!</p></button>

              </div>)}
              
              {/* if user has some difficulties */}
              {(!core.includes("None") || !lowerBody.includes("None") || !upperBody.includes("None")) && 
              (<div className="flex flex-col mx-auto p-6 gap-6">
                <img src="/images/congrats_1.png" alt="workout congrats" className="object-contain"/>

                  <p className="font-bold">Seems like you may have poor body strength in these areas:</p>

                  <ul className="list-disc ml-5">
                    {!core.includes("None") && (<li>core</li>)}
                    {!lowerBody.includes("None") && (<li>lower body</li>)}
                    {!upperBody.includes("None") && (<li>upper body</li>)}
                  </ul>
                  <p>Complete the recommended exercises to maintain your strength and carry out daily activities with ease~ 💪🏻</p>

                  <button className="w-full btn btn-outline border-purple border-2" onClick={() => setDifficultyModal(false)}><p className="text-purple font-bold">Let's go!</p></button>

              </div>)}
            </div>
          </div>
        )}

        {/* Exercise information modal */}
        {isModalOpen && currentExercise && (
          <div id="infoModal" className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-gray-50 rounded-lg shadow-lg w-full max-w-sm max-h-[70vh] overflow-auto ">
              {/* Close Button */}
              <button
                className="top-0 right-0 text-gray-600 text-4xl font-bold w-full flex justify-end px-3 py-2"
                onClick={closeModal}
                aria-label="Close modal"
              >
                &times; {/* Close icon */}
              </button>

              {/* gif */}
              <div className="flex justify-center">
                <img className="object-cover h-[390px] w-full" src={currentExercise.exercise.gif} alt="exercise gif"/>
              </div>

              <div className="container mx-auto p-6">
                <h2 className="text-3xl font-bold mb-4 text-center text-wrap">{currentExercise.exercise.name}</h2>
                <p className="mt-3 font-bold">Tips on form</p>
                <p className="list-disc ml-4 text-wrap">
                {currentExercise.exercise.form_tips.split('\n').filter(tip => tip.trim() !== '').map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </p>

                <p className="mt-3 font-bold">Focus areas</p>
                <div className="flex flex-row gap-3 mt-3">
                  {currentExercise.exercise.muscle_groups.split('; ').map((group) =>  (
                      <div className="badge badge-outline" key={group}>{group.charAt(0).toUpperCase() + group.slice(1)}</div>
                  ))}
                </div>

                <div>
                  {/* Start Exercise Button */}
                  <button className="btn btn-lg bg-purple text-white w-full mt-6 rounded-lg text-lg" onClick={() => handleStartOpen(currentExercise.exercise.audio)} disabled={completedExercises.includes(currentExercise.exercise._id)}>
                    Start this exercise
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Countdown to start working out*/}
        {startExercise && <CountdownModal isOpen={startExercise} onClose={handleStartClose} countdown={countdown} audioRef={audioRef} setIsWorkoutPaused={setIsWorkoutPaused}/>}
        
        {/* Start exercise modal -> actual workout page */}
        {openStartExercise && currentExercise && ( 
          <div id="startExerciseModal" className="sticky inset-0 bg-black bg-opacity-50 z-25 flex justify-center items-center">
            <div className="bg-[#f5f5f5] rounded-lg w-full overflow-visible">
              {/* Close Button */}
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="absolute top-4 left-4 w-5 h-5 bg-white rounded-full p-4 z-1000"
                onClick={goBack}
              />
              
              {/* gif */}
              <div className="flex justify-center">
                <img className="rounded-lg object-cover h-[390px] w-full" src={currentExercise.exercise.gif} alt="exercise gif"/>
              </div>

              {/* content of the exercise page */}
              <div className="container mx-auto p-6 text-dark-purple text-center">
                <h2 className="text-3xl font-bold mb-4 text-center text-wrap">{currentExercise.exercise.name}</h2>
                {!currentExercise.reps.includes("seconds") && <p className="text-center font-bold text-5xl">2 sets x ({currentExercise.reps})</p>}
                {currentExercise.reps.includes("seconds") && 
                (<div>
                  <p className="text-center font-bold text-5xl">{timeLeft}</p>
                  <button className="btn bg-white text-dark-purple my-4 w-36" onClick={toggleCountdown}
                  >
                    {isWorkoutPaused ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} /> }
                    {isWorkoutPaused ? 'Pause Timer' : 'Resume Timer'}
                </button>
                  </div>)}
                <div className="divider before:bg-purple after:bg-purple"></div>

                <div>
                  <p className="text-pretty font-semibold">Make sure your volume is turned on to hear the audio instructions.</p>

                  {/* audio stuff */}
                  <div className="text-center">
                    <div className="flex justify-center space-x-8 mt-4">

                      {/* mute */}
                      <button onClick={handleMute} className="flex flex-col items-center">
                        <FontAwesomeIcon
                          icon={isMuted ? faVolumeMute : faVolumeUp}
                          className="flex flex-col items-center justify-center w-8 h-8 bg-white rounded-full p-6 text-dark-purple"
                        />
                        <p className="mt-2 font-semibold text-wrap max-w-14">{isMuted ? "Unmute audio": "Mute audio"}</p>
                      </button>

                      {/* pause */}
                      <button onClick={handlePause} className="flex flex-col items-center">
                        <FontAwesomeIcon
                          icon={isPaused ? faPlay : faPause}
                          className="flex flex-col items-center justify-center w-8 h-8 bg-white rounded-full p-6 text-dark-purple"
                        />
                        <p className="mt-2 font-semibold text-wrap max-w-14">{isPaused ? "Unpause audio": "Pause audio"}</p>
                      </button>

                      {/* restart */}
                      <button onClick={handleRestart} className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faUndoAlt} className="flex flex-col items-center justify-center w-8 h-8 bg-white rounded-full p-6 text-dark-purple" />
                        <p className="mt-2 font-semibold text-wrap max-w-14">Restart audio</p>
                      </button>
                    </div>
                    <audio ref={audioRef} src={audioFilePath} preload="auto"></audio>
                  </div>

                  {/* Start Exercise Button */}
                  <button className="btn btn-lg bg-purple text-white w-full mt-6 rounded-lg text-lg" onClick={finishExercise}>
                    Finish Exercise
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Completion */}
        {postModal &&
          <div id="postModal" className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="carousel bg-white rounded-lg shadow-lg w-full max-w-sm min-h-[50vh] max-h-[80vh] overflow-auto relative" onClick={handleTap}>
                {/* Progress bar at the top like Instagram Stories */}
                <div className="absolute top-2 left-0 right-0 flex justify-around px-2 z-10">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 mx-1 rounded-lg bg-gray-300 ${index === postIndex ? 'bg-purple' : ''}`}
                    >
                      {/* Animated progress for the current slide */}
                      {index === postIndex && (
                        <div
                          className="h-full bg-purple rounded-lg"
                          style={{ width: `${((postIndex + 1) / slides.length) * 100}%`, transition: 'width 0.3s ease-in-out' }}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Carousel items */}
                <div className="carousel-item relative w-full flex items-center justify-center">
                  {slides[postIndex] && (
                    <div className="flex flex-col items-center justify-start bg-white p-6 h-full mt-6">
                      <h3 className="text-2xl font-bold mb-2">{slides[postIndex].title}</h3>
                      {slides[postIndex].img && (<img
                        src={slides[postIndex].img}
                        alt="completion"
                        className="h-60 mb-4"
                      />)}

                        {slides[postIndex].stat &&
                          <div className="my-14 flex items-center">
                            {slides[postIndex].icon && (<FontAwesomeIcon icon={slides[postIndex].icon} className="text-[80px] text-purple"/>)}
                            {slides[postIndex].stat && (
                              <p className="text-[80px] font-bold">{slides[postIndex].stat}</p>
                            )}
                          </div>
                        }

                      <p className="text-center text-md text-black whitespace-pre-line text-pretty">
                        {slides[postIndex].description}
                      </p>

                      {slides[postIndex].footer && (<p className="text-gray-400 text-[10px] text-balance mt-6 whitespace-pre-line">{slides[postIndex].footer}</p>)}

                      {slides[postIndex].button && (<button className="btn btn-outline border-purple border-2 text-purple w-full mt-6 font-bold" onClick={() => setPostModal(false)}>Close</button>)}
                    </div>
                  )}
                </div>
  
            </div>
          </div>
        }

      </div>


    </div>

    </div>
  )
}
