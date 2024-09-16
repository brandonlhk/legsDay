export default function Loading() {

    // over here we do async call
    // send all the data to the backend
    // wait for the data to be returned
    // setTimeOut if data comes back too fast
    
    //send the props to next page to be displayed

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <span className="loading loading-spinner text-primary loading-lg"></span>
            <p className="text-4xl font-bold text-center mt-4">Creating your customised program</p>
        </div>
    )
}