import {useState, useEffect} from "react"

export default function Onboard() {
    const [trainingBG, setTrainingBG] = useState("")
    const [currentWeight, setCurrentWeight] = useState(0.0)
    const [gender, setGender] = useState("")
    const [goals, setGoals] = useState("")
    
    useEffect(() => {
        // Open modal when loaded
        const modal = document.getElementById("modal")

        if (modal) {
            modal.showModal()
        }

        // prevent escaping with esc
        const handleKeydown = (event) => {
            if (event.key === 'Escape') {
            event.preventDefault();
            }
      }
      modal.addEventListener('keydown', handleKeydown);
    }, [])

    return (
        <div>
            <dialog id="modal" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Input your details for your workout plan!</h3>

                {/* Training background */}
                <label className="form-control w-full mt-3">
                    <div className="label">
                        <span className="label-text">What your's training background?</span>
                    </div>
                    <select className="select select-bordered" value={trainingBG} onChange={(event) => setTrainingBG(event.target.value)}>
                        <option disabled selected value="" >Pick your training background</option>
                        <option value="B">Beginner</option>
                        <option value="I">Intermediate</option>
                        <option value="A">Advanced</option>
                    </select>
                </label>

                {/* Weight */}
                <label className="form-control w-full mt-3">
                    <div className="label">
                        <span className="label-text">What's your current bodyweight in kg?</span>
                    </div>
                    <input type="number" placeholder="Type here" className="input input-bordered w-full" value={currentWeight} onChange={(event) => setCurrentWeight(event.target.value) }/>
                </label>

                {/* Gender */}
                <label className="form-control w-full mt-3">
                    <div className="label">
                        <span className="label-text">What your's gender?</span>
                    </div>
                    <select className="select select-bordered" value={gender} onChange={(event) => setGender(event.target.value)}>
                        <option disabled selected value="" >Pick your gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                </label>

                {/* Gender */}
                <label className="form-control w-full mt-3">
                    <div className="label">
                        <span className="label-text">What your fitness goals?</span>
                    </div>
                    <select className="select select-bordered" value={goals} onChange={(event) => setGoals(event.target.value)}>
                        <option disabled selected value="" >Pick your fitness goals</option>
                        <option value="gain">Gain muscle</option>
                        <option value="maintain">Maintain weight</option>
                        <option value="lose">Lose weight</option>
                    </select>
                </label>


                <div className="modal-action">
                <form method="dialog">
                    <button className="btn btn-primary">Generate my workout plan!</button>
                </form>
                </div>
            </div>
            </dialog>
        </div>
    )
}