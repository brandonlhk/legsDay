import {useState, useEffect} from "react"
import {useLocation} from "react-router-dom"
import JSConfetti from 'js-confetti'

export default function Homepage() {

  const location = useLocation()
  const receivedData = location.state?.data
  const [freq, setFreq] = useState("")
  const [exercisesDone, setExercisesDone] = useState(0)
  const [daysDone, setDaysDone] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [finishExerciseCheck, setFinishExerciseCheck] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selected, setSelected] = useState(null)

  const userID = localStorage.getItem("userid")
  const [currProgram, setCurrProgram] = useState("")

  const [completedExercises, setCompletedExercises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [progress, setProgress] = useState(0)

  const handleFeedback = () => {
    setFinishExerciseCheck(false)
    setSubmitted(true)
    setSelected(null)
  }

  const handleSelect = (index) => {
    setSelected(index);
  };
  
  const handleSubmitted = () => {
    setSubmitted(false)
    closeModal();
  }

  const calculateProgress = () => {

    const toAdd = 100/freq/3
    setProgress((prevProgress) => prevProgress + toAdd)
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
      progressions: exercise.progression !== "" ? intoOL(exercise.progressions) : []
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

        const processedProgram = Object.values(receivedData[1]).map((exercise) => processExercise(exercise))
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
                    <img className="w-full h-full"
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
              Settings
            </button>

          </div>
        </div>


        {/* Modal */}
        {isModalOpen && currentExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-gray-50 w-full h-full max-w-screen max-h-screen relative overflow-auto">
            {/* YouTube Video */}
            <iframe
              className="w-full "
              width="100%"
              height="400"
              src={currentExercise.youtube_link}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>

            <div className="container mx-auto p-6 ">

              <h2 className="text-3xl font-bold mb-4 text-center text-wrap">{currentExercise.name}</h2>
              <p className="text-center font-bold text-lg">x {currentExercise.recommended_reps}</p>
              <p className="mt-3 font-bold">Tips on form</p>
              
              <ul className="list-disc ml-4">
                {currentExercise.form_tips.map((instructions, index) => {
                  if (instructions !== "") {
                    return (<li key={index}>{instructions}</li>)
                  }
                })}
              </ul>

              {currentExercise.progressions !== "" && (
                <div>
                <p className="mt-3 font-bold">Progression tips</p>
                <ul className="list-disc ml-4">
                {currentExercise.progressions.map((instructions, index) => {
                  if (index !== currentExercise.progressions.length && instructions !== "") {
                    return (<li key={index}>{instructions}</li>)
                  }
                })}
              </ul>
                </div>
              )}

              <p className="mt-3 font-bold">Focus areas</p>
              <div className="flex flex-row gap-3 mt-3">
                {currentExercise.muscle_groups.map((muscleGroup) => {
                  return(
                      <div className="badge badge-outline">{muscleGroup}</div>
                  )
                })}
              </div>

              <div >
                {/* Finish Exercise Button */}
                <button className="btn btn-primary w-full mt-4 rounded-full" onClick={finishExercise}>
                  Finish Exercise
                </button>
                {/* Finish Exercise Button */}
                <button className="btn btn-outline w-full mt-4 rounded-full" onClick={closeModal}>
                  Exit
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

        {/* Finish exercise overlay */}
        {finishExerciseCheck &&(
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex flex-col justify-center items-center z-50">
            
            <div className="card bg-white w-full border mt-6">
              <div className="card-body flex">
                <p className="text-lg text-center font-bold">Did you like this exercise?</p>

                <div className="flex justify-center gap-32">
                  <div onClick={() => handleSelect(0)}>
                    {selected === 0 ? (<div><svg width="44" height="43" viewBox="0 0 44 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.4432 19.6482H3.7693C3.06849 19.6482 2.5 20.1583 2.5 20.7874V39.8606C2.5 40.4899 3.06849 40.9998 3.7693 40.9998H9.15226C9.84228 40.9998 10.4059 40.5051 10.4216 39.8859L10.4432 39.0109V19.6482Z" fill="#9F5F91"/>
                    <path d="M35.0862 16.7296C31.8824 16.7296 26.4531 16.7296 26.4531 16.7296C26.4531 16.7296 26.7618 15.3422 27.622 9.25727C28.3531 4.08623 24.3299 3 21.7303 3L12.8813 21.9998V38.5709L17.417 39.6698C19.4999 40.1745 21.649 40.4306 23.8067 40.4306H29.961C32.3645 40.4306 34.4926 39.0295 35.2173 36.9731C37.2363 31.246 39.3403 25.2821 40.1649 22.9323C41.5725 18.9224 38.2912 16.7296 35.0862 16.7296Z" fill="#9F5F91"/>
                    </svg></div>) : (<div><svg width="44" height="43" viewBox="0 0 44 43" fill="" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M7.66684 17.9166C7.66683 17.9166 7.66683 17.9166 7.66683 17.9166C7.66683 17.9166 7.66683 17.9166 7.66683 17.9166V35.8333H11.2502V17.9166H7.66684ZM4.0835 17.9166C4.0835 15.9376 5.68782 14.3333 7.66683 14.3333H13.0418C14.0313 14.3333 14.8335 15.1354 14.8335 16.1249V37.6249C14.8335 38.6144 14.0313 39.4166 13.0418 39.4166H7.66683C5.68784 39.4166 4.0835 37.8123 4.0835 35.8333V17.9166Z" fill="#9F5F91"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M23.7917 16.1249C23.7917 15.1354 24.5938 14.3333 25.5833 14.3333H33.8951C37.2166 14.3333 39.7428 17.3157 39.197 20.5918L39.1969 20.5919L37.0575 33.4281L35.2902 33.1336L37.0575 33.4281C36.4816 36.8839 33.4916 39.4166 29.9883 39.4166H20.5866C18.8179 39.4166 17.0889 38.893 15.6174 37.9121L15.6174 37.912L12.0478 35.5323C11.5494 35.2 11.25 34.6406 11.25 34.0416V19.7083C11.25 18.7187 12.0522 17.9166 13.0417 17.9166C14.0312 17.9166 14.8333 18.7187 14.8333 19.7083V33.0827L17.605 34.9305C17.605 34.9305 17.605 34.9305 17.605 34.9305C18.4881 35.5191 19.5255 35.8333 20.5866 35.8333H29.9883C31.74 35.8333 33.235 34.5669 33.5229 32.839L35.0732 33.0974L33.5229 32.839L35.6623 20.0029C35.8443 18.9106 35.0021 17.9166 33.8951 17.9166H25.5833C24.5938 17.9166 23.7917 17.1144 23.7917 16.1249Z" fill="#9F5F91"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.1419 7.08522C20.2611 4.84668 22.8559 3.77188 25.2302 4.56329L25.2303 4.5633C27.6363 5.36531 29.0688 7.83346 28.5714 10.3205L28.5714 10.3206L27.3402 16.4765C27.1461 17.4468 26.2022 18.076 25.2319 17.882C24.2617 17.6879 23.6324 16.744 23.8265 15.7737L25.0577 9.61786C25.0577 9.61785 25.0577 9.61783 25.0577 9.61782C25.2006 8.90293 24.7889 8.19334 24.0971 7.96275M19.1419 7.08522C19.1419 7.08524 19.1419 7.08527 19.1418 7.0853L19.1419 7.08522ZM19.1418 7.0853L13.726 17.9168H13.0417C12.0522 17.9168 11.25 18.7189 11.25 19.7084C11.25 20.6979 12.0522 21.5001 13.0417 21.5001H14.8333C15.512 21.5001 16.1323 21.1167 16.4358 20.5097L22.3469 8.68775L22.347 8.68767C22.6686 8.04422 23.4145 7.73522 24.0971 7.96274" fill="#9F5F91"/>
                  </svg></div>)}
                  </div>
                  
                  <div onClick={() => handleSelect(1)}>
                      {selected === 1 ? (<div><svg width="44" height="43" viewBox="0 0 44 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M33.5568 23.3518H40.2307C40.9315 23.3518 41.5 22.8417 41.5 22.2126V3.13941C41.5 2.51013 40.9315 2.00017 40.2307 2.00017H34.8477C34.1577 2.00017 33.5941 2.49493 33.5784 3.11414L33.5568 3.9891V23.3518Z" fill="#9F5F91"/>
                        <path d="M8.91375 26.2704C12.1176 26.2704 17.5469 26.2704 17.5469 26.2704C17.5469 26.2704 17.2382 27.6578 16.378 33.7427C15.6469 38.9138 19.6701 40 22.2697 40L31.1187 21.0002V4.42915L26.583 3.33018C24.5001 2.82555 22.351 2.56943 20.1933 2.56943H14.039C11.6355 2.56943 9.50745 3.97049 8.7827 6.02686C6.76367 11.754 4.65973 17.7179 3.83505 20.0677C2.42749 24.0776 5.70884 26.2704 8.91375 26.2704Z" fill="#9F5F91"/>
                        </svg></div>) : 
                        (<div><svg width="44" height="43" viewBox="0 0 44 43" fill="" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M36.3332 25.0834C36.3332 25.0834 36.3332 25.0834 36.3332 25.0834C36.3332 25.0834 36.3332 25.0834 36.3332 25.0834V7.16675H32.7498V25.0834H36.3332ZM39.9165 25.0834C39.9165 27.0624 38.3122 28.6667 36.3332 28.6667H30.9582C29.9687 28.6667 29.1665 27.8646 29.1665 26.8751L29.1665 5.37508C29.1665 4.38557 29.9687 3.58342 30.9582 3.58342H36.3332C38.3122 3.58342 39.9165 5.18768 39.9165 7.16675V25.0834Z" fill="#9F5F91"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M20.2083 26.8751C20.2083 27.8646 19.4062 28.6667 18.4167 28.6667L10.1049 28.6667C6.78338 28.6667 4.25724 25.6843 4.80304 22.4082L4.80306 22.4081L6.94249 9.57188L8.70977 9.86643L6.94249 9.57188C7.51845 6.1161 10.5084 3.58342 14.0117 3.58342L23.4134 3.58342C25.1821 3.58342 26.9111 4.10705 28.3826 5.08792L28.3826 5.08797L31.9522 7.46766C32.4506 7.79995 32.75 8.35937 32.75 8.95842V23.2917C32.75 24.2813 31.9478 25.0834 30.9583 25.0834C29.9688 25.0834 29.1667 24.2813 29.1667 23.2917L29.1667 9.91729L26.395 8.06953C26.395 8.06951 26.395 8.0695 26.395 8.06948C25.5119 7.48089 24.4745 7.16675 23.4134 7.16675L14.0117 7.16675C12.26 7.16675 10.765 8.43311 10.4771 10.161L8.92681 9.90261L10.4771 10.161L8.33765 22.9971C8.15567 24.0894 8.99787 25.0834 10.1049 25.0834L18.4167 25.0834C19.4062 25.0834 20.2083 25.8856 20.2083 26.8751Z" fill="#9F5F91"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M24.8581 35.9148C23.7389 38.1533 21.1441 39.2281 18.7698 38.4367L18.7697 38.4367C16.3637 37.6347 14.9312 35.1665 15.4286 32.6795L15.4286 32.6794L16.6598 26.5235C16.8539 25.5532 17.7978 24.924 18.7681 25.118C19.7383 25.3121 20.3676 26.256 20.1735 27.2263L18.9423 33.3821C18.9423 33.3822 18.9423 33.3822 18.9423 33.3822C18.7994 34.0971 19.2111 34.8067 19.9029 35.0373M24.8581 35.9148C24.8581 35.9148 24.8581 35.9147 24.8582 35.9147L24.8581 35.9148ZM24.8582 35.9147L30.274 25.0832H30.9583C31.9478 25.0832 32.75 24.2811 32.75 23.2916C32.75 22.3021 31.9478 21.4999 30.9583 21.4999H29.1667C28.488 21.4999 27.8677 21.8833 27.5642 22.4903L21.6531 34.3122L21.653 34.3123C21.3314 34.9558 20.5855 35.2648 19.9029 35.0373" fill="#9F5F91"/>
                        </svg></div>)}
                  </div>


                </div>

                <button className="btn btn-outline border border-purple w-full mt-4 rounded" onClick={handleFeedback}>
                  <p className="text-purple">Submit</p>
                </button>
              
              </div>
        </div>
          </div>
        )}

        {/* Submitted overlay */}
        {submitted && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex flex-col justify-center items-center z-50">
            <div className="card bg-white w-full border mt-6 flex items-center">
              <div className="card-body flex items-center">
              {/* tick */}
              <div>
              <svg width="100" height="100" viewBox="0 0 38 38" fill="#9F5F91" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.666504 19C0.666504 8.87449 8.87434 0.666656 18.9998 0.666656C29.1253 0.666656 37.3332 8.87449 37.3332 19C37.3332 29.1237 29.1253 37.3333 18.9998 37.3333C8.87434 37.3333 0.666504 29.1237 0.666504 19ZM4.33317 19C4.33317 22.8898 5.8784 26.6204 8.62894 29.3709C11.3795 32.1214 15.11 33.6667 18.9998 33.6667C22.8897 33.6667 26.6202 32.1214 29.3707 29.3709C32.1213 26.6204 33.6665 22.8898 33.6665 19C33.6665 15.1101 32.1213 11.3796 29.3707 8.62909C26.6202 5.87856 22.8897 4.33332 18.9998 4.33332C15.11 4.33332 11.3795 5.87856 8.62894 8.62909C5.8784 11.3796 4.33317 15.1101 4.33317 19V19ZM25.0388 12.2038C25.3846 11.8699 25.8477 11.6851 26.3284 11.6893C26.8091 11.6934 27.2689 11.8862 27.6088 12.2262C27.9488 12.5661 28.1416 13.0259 28.1457 13.5066C28.1499 13.9873 27.9651 14.4504 27.6312 14.7962L16.6312 25.7962C16.2874 26.1399 15.8211 26.3329 15.335 26.3329C14.8489 26.3329 14.3826 26.1399 14.0388 25.7962L8.537 20.2943C8.20305 19.9486 8.01826 19.4854 8.02243 19.0048C8.02661 18.5241 8.21942 18.0642 8.55934 17.7243C8.89925 17.3844 9.35907 17.1916 9.83977 17.1874C10.3205 17.1832 10.7836 17.368 11.1293 17.702L15.335 21.9077L25.0388 12.2038V12.2038Z" fill="#9F5F91"/>
              </svg>
            </div>
              <div><p className="text-purple font-bold">Feedback successfully submitted!</p></div>
              </div>
            <button className="btn btn-outline border border-purple w-96 mb-4" onClick={handleSubmitted}>
                <p className="text-purple">Back to Homepage</p>
            </button>
            </div>
          </div>
        )}
        
      </div>
    </div>

    </div>
  )
}
