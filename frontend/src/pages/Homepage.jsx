import {useState} from "react"

export default function Homepage() {
  
  const userID = localStorage.getItem("userid")
  const currProgram = JSON.parse(localStorage.getItem("program"))
  const [completedExercises, setCompletedExercises] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [progress, setProgress] = useState(0)

  const calculateProgress = () => {
    const freq = 2
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

  const openModal = (exercise) => {
    exercise.youtube_link = embed(exercise.youtube_link)
    exercise.muscle_groups = seperateMuscleGroups(exercise.muscle_groups)
    exercise.form_tips = intoOL(exercise.form_tips)
    if (exercise.progressions !== "") {
      exercise.progressions = intoOL(exercise.progressions)
    }
    setCurrentExercise(exercise);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExercise(null);
  };

  const finishExercise = () => {
    setCompletedExercises((prevCompleted) => [...prevCompleted, currentExercise._id]);
    calculateProgress()
    closeModal();
  };

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
              <p className="font-bold">Complete the full program for X days</p>
              <div className="flex items-center">
                <progress className="progress progress-error" value={progress} max="100"></progress>
                <span className="ml-2">0/X</span>
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
                    <img className="w-full h-full object-cover"
                      src = ""
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
                  if (index !== currentExercise.form_tips.length-1) {
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
      </div>
    </div>

    </div>
  )
}
