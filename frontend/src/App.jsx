import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ViewportHeight from './components/ViewportHeight';
import Start from "./pages/Start"

import HealthInfo from "./pages/HealthInfo"

import Signin from "./pages/Signin"
import Onboard from "./pages/Onboard"
import NotFound from "./pages/NotFound"
import Loading from "./pages/Loading"
import Recommendations from "./pages/Recommendations"
import Register from "./pages/Register"
import Homepage from "./pages/Homepage"
import Library from "./pages/Library"
import Settings from "./pages/Settings"

export default function App() {
  return (
    <Router>
      <ViewportHeight>
      <Routes>
          <Route path="*" element={<NotFound />}/>
          <Route path="/" element={<Start />}/>

          <Route path="/signin" element={<Signin />}/>
          <Route path="/healthinfo" element={<HealthInfo />}/>
          <Route path="/onboard" element={<Onboard />}/>
          <Route path="/loading" element={<Loading />}/>
          <Route path="/recommendations" element={<Recommendations />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/home" element={<Homepage />}/>
          <Route path="/library" element={<Library />}/>
          <Route path="/settings" element={<Settings />}/>
          
      </Routes>
      </ViewportHeight>
    </Router>
  );
}