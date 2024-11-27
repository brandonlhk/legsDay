import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ViewportHeight from './components/ViewportHeight';
import Start from "./pages/Start"

//onboard
import HealthInfo from "./pages/onboard/HealthInfo"
import Onboard from "./pages/onboard/Onboard"
import Loading from "./pages/onboard/Loading"
import Recommendations from "./pages/onboard/Recommendations"

//auth
import Signin from "./pages/auth/Signin"
import Register from "./pages/auth/Register"

import NotFound from "./pages/NotFound"

// homepages
import Homepage from "./pages/homepage/Homepage"
import Preview from "./pages/homepage/AccountlessHomepage"
// import Settings from "./pages/Settings"

// features
import Booking from "./pages/features/Booking"
import Message from "./pages/features/MessageGroup"

export default function App() {
  return (
    <Router>
      <ViewportHeight>
      <Routes>
          <Route path="*" element={<NotFound />}/>
          <Route path="/" element={<Start />}/>

          {/* auth */}
          <Route path="/signin" element={<Signin />}/>
          <Route path="/register" element={<Register />}/>

          {/* onboard */}
          <Route path="/healthinfo" element={<HealthInfo />}/>
          <Route path="/onboard" element={<Onboard />}/>
          <Route path="/loading" element={<Loading />}/>
          <Route path="/recommendations" element={<Recommendations />}/>

          {/* homepages */}
          <Route path="/home" element={<Homepage />}/>
          <Route path="/preview" element={<Preview />}/>
          {/* <Route path="/settings" element={<Settings />}/> */}

          {/* features */}
          <Route path="/booking" element={<Booking />}/>
          <Route path="/message-groups" element={<Message />}/>


      </Routes>
      </ViewportHeight>
    </Router>
  );
}