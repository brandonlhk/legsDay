import { useNavigate } from "react-router-dom"

export default function Library() {
    const navigate = useNavigate()



    return (
        <div>

        




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