import {useState, useEffect} from "react"
import {useLocation} from "react-router-dom"
import JSConfetti from 'js-confetti'
import CountdownModal from '../components/CountdownModal';

export default function Homepage() {

  const location = useLocation()
  const receivedData = location.state?.data
  const userID = localStorage.getItem("userid")
  // data receive from prev page
  const [freq, setFreq] = useState("")
  const [exercisesDone, setExercisesDone] = useState(0)
  const [daysDone, setDaysDone] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [core, setCore] = useState(["None"])
  const [lowerBody, setLowerbody] = useState(["None"])
  const [upperBody, setUpperBody] = useState(["None"])
  
  // check if user finish the exercise for that day
  const [finishExerciseCheck, setFinishExerciseCheck] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [currProgram, setCurrProgram] = useState("")

  // check if user start exercise, true -> open modal
  const [startExercise, setStartExercise] = useState(false)
  const [openStartExercise, setOpenStartExercise] = useState(false)

  // onboarding modal (show difficulties)
  const [difficultyModal, setDifficultyModal] = useState(true)


  // others
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [progress, setProgress] = useState(0)

  const handleStartOpen = () => {
    setCountdown(5)
    setStartExercise(true)
    setIsModalOpen(false);

    //open the new workout modal
    setOpenStartExercise(true)
  }

  const handleStartClose = () => {
    setStartExercise(false)
  }

  const calculateProgress = () => {

    const toAdd = 100/freq/3
    setProgress((prevProgress) => prevProgress + toAdd)
  }

  const addWord = (exercise) => {
    if (!exercise.includes("seconds") && !exercise.includes("metres")) {
      exercise = exercise + " reps" 
    }

    return exercise
  }

  const embed = (link) => {
    const videoID = link.split("v=")[1]
    const newLink = `https://www.youtube.com/embed/${videoID}?autoplay=1`
    return newLink
  }

  const seperateMuscleGroups = (groups) => {
    const muscleGroups = groups.split(";")
    return muscleGroups
  }

  const intoOL = (words) => {
    const newWord = words.split(".")
    return newWord
  }
  
  const processExercise = (exercise) => {
    return {
      ...exercise,
      youtube_link: embed(exercise.youtube_link),
      muscle_groups: seperateMuscleGroups(exercise.muscle_groups),
      form_tips: intoOL(exercise.form_tips),
      progressions: exercise.progression !== "" ? intoOL(exercise.progressions) : [],
      recommended_reps: addWord(exercise.recommended_reps)
    }
  }

  const openModal = (exercise) => {
    setCurrentExercise(exercise);
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExercise(null);
  }

  const finishExercise = () => {
    setFinishExerciseCheck(true)
    setCompletedExercises((prevCompleted) => [...prevCompleted, currentExercise._id]);
    calculateProgress()
    setExercisesDone((prevExercisesDone) => prevExercisesDone + 1)
  }

  //refresh the exercises
  const refreshExercises = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://bfg-backend-gcp-image-719982789123.us-central1.run.app/recommend', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              "userid": userID
          }),
      });

              
      if (!response.ok) {
          throw new Error('Failed to send data to recommend new info');
      }

      const result = await response.json();
      const program = result.data
      // console.log(Object.values(program))
      setCompletedExercises([])
      const processedProgram = Object.values(program).map((exercise) => processExercise(exercise))
      // console.log(processedProgram)
    
      setCurrProgram(processedProgram)
      
  } catch (error) {
      console.error("Error sending data to recommend program", error)
  } finally {
    setIsLoading(false)
  }
  }


  // receive from prev page
  useEffect(() => {
    if (receivedData) {
        setFreq(receivedData[0])
        setCore(receivedData[1])
        setLowerbody(receivedData[2])
        setUpperBody(receivedData[3])
        
        const processedProgram = Object.values(receivedData[4]).map((exercise) => processExercise(exercise))
        // console.log(processedProgram)
        setCurrProgram(processedProgram)
    }
}, [receivedData])
  
  // if every exercise done, can increase by 1, if all exercises done, refresh exercises
  useEffect(() => {

    if (exercisesDone === 3 && daysDone !== freq-1) {
      setDaysDone((prevDays) => prevDays + 1)
      refreshExercises()
      setExercisesDone(0)
    } else if (exercisesDone === 3 && daysDone === freq-1) {
      setDaysDone((prevDays) => prevDays + 1)
      setExercisesDone(0)
      const jsConfetti = new JSConfetti()
      jsConfetti.addConfetti()
    }
  }, [exercisesDone])

  

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


            {/* havent implement the logic for the progress */}
            <div className="w-full">
              <p className="font-bold">Complete the full program for {freq} days</p>
              <div className="flex items-center">
                <progress className="progress progress-error" value={progress} max="100"></progress>
                <span className="ml-2">{daysDone}/{freq}</span>
              </div>
            </div>

           
          </div>
        </div>

        {/* today program */}
        <div className="bg-red-400 mt-6 text-center text-white rounded-lg">
          <p className="text-2xl p-6">Today's program</p>
          <p className="text-lg">Est time to complete: 15 mins</p>

          {/* Exercises */}
          <div className="flex-col flex gap-6 p-2 mt-3 mb-20">
            {Object.keys(currProgram).map((program)=> {
              const exercise = currProgram[program]
              const isCompleted = completedExercises.includes(exercise._id)

              return (
                <div key={exercise.id} className="card card-side bg-white w-full shadow-xl h-48" 
                onClick={() => openModal(exercise)}>
                  <figure className="w-1/3">
                    <img className=""
                      src = {exercise.image_binary}
                      alt="hehe"
                    />
                  </figure>
                  <div className="card-body text-black text-left w-2/3">
                    <p className="text-lg text-clip font-bold">{exercise.name}</p>
                    <p>{exercise.recommended_reps}</p>
                    <div className={`${isCompleted ? 'bg-myYellow' : 'bg-gray-300'} rounded-lg p-3 text-center`}>
                        {isCompleted ? 'Completed' : 'Not completed'}
                      </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* sticky bottom tab */}
        <div>
          <div className="btm-nav">
            <button className="active">
              Workout
            </button>
            <button>
              Library
            </button>
            <button>
              Settings
            </button>

          </div>
        </div>

        {/* Onboarding modal */}
        {difficultyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-gray-50 rounded-lg shadow-lg w-full max-w-sm max-h-[50vh] overflow-auto relative">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-6xl p-2 rounded-full transition duration-200 ease-in-out font-bold"
                onClick={closeModal}
                aria-label="Close modal"
              >
                &times; {/* Close icon */}
              </button>

              {/* YouTube Video */}
              <iframe
                className="w-full rounded-t-lg"
                width="100%"
                height="300"
                src={currentExercise.youtube_link}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              <div className="container mx-auto p-6">
                <h2 className="text-3xl font-bold mb-4 text-center text-wrap">{currentExercise.name}</h2>
                <p className="text-center font-bold text-lg">x {currentExercise.recommended_reps}</p>
                <p className="mt-3 font-bold">Tips on form</p>
                <ul className="list-disc ml-4">
                  {currentExercise.form_tips.map((instructions, index) => {
                    if (instructions !== "") {
                      return <li key={index}>{instructions}</li>;
                    } else {
                      return null
                    }
                  })}
                </ul>

                {currentExercise.progressions !== "" && (
                  <div>
                    <p className="mt-3 font-bold">Progression tips</p>
                    <ul className="list-disc ml-4">
                      {currentExercise.progressions.map((instructions, index) => {
                        if (index !== currentExercise.progressions.length && instructions !== "") {
                          return <li key={index}>{instructions}</li>;
                        } else {
                          return null
                        }
                      })}
                    </ul>
                  </div>
                )}

                <p className="mt-3 font-bold">Focus areas</p>
                <div className="flex flex-row gap-3 mt-3">
                  {currentExercise.muscle_groups.map((muscleGroup) => {
                    return <div className="badge badge-outline">{muscleGroup}</div>;
                  })}
                </div>

                <div>
                  {/* Start Exercise Button */}
                  <button className="btn btn-primary w-full mt-6 rounded-full text-lg" onClick={handleStartOpen}>
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex flex-col justify-center items-center z-50">
            <span className="loading loading-spinner text-primary loading-lg"></span>
            <p className="text-4xl font-bold text-center mt-4 text-white">Creating your customised program</p>
          </div>
        )}

        {/* Countdown */}
        {startExercise && <CountdownModal isOpen={startExercise} onClose={handleStartClose} countdown={countdown}/>}
        
        {/* Start exercise modal -> actual workout page */}
        {startExercise && currentExercise && ( 
          <div className="fixed inset-0 bg-black bg-opacity-50 z-25 flex justify-center items-center">
            <div className="bg-gray-50 rounded-lg shadow-lg w-full min-h-screen overflow-auto relative">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-6xl p-2 rounded-full transition duration-200 ease-in-out font-bold"
                onClick={closeModal}
                aria-label="Close modal"
              >
                &times; {/* Close icon */}
              </button>

              {/* YouTube Video */}
              <iframe
                className="w-full rounded-t-lg"
                width="100%"
                height="300"
                src={currentExercise.youtube_link}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              <div className="container mx-auto p-6">
                <h2 className="text-3xl font-bold mb-4 text-center text-wrap">{currentExercise.name}</h2>
                <p className="text-center font-bold text-lg">x {currentExercise.recommended_reps}</p>

                <div>
                  {/* Start Exercise Button */}
                  <button className="btn btn-primary w-full mt-6 rounded-full text-lg">
                    Finish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actual workout modal */}


      </div>


    </div>

    </div>
  )
}
