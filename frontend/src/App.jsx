import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ViewportHeight from './components/ViewportHeight';
import Start from "./pages/Start"

import HealthInfo from "./pages/HealthInfo"

import Login from "./pages/Login"
import Onboard from "./pages/Onboard"
import NotFound from "./pages/NotFound"
import Loading from "./pages/Loading"
import Homepage from "./pages/Homepage"
import Map from "./pages/Map"
import Library from "./pages/Library"
import Settings from "./pages/Settings"

export default function App() {
  return (
    <Router>
      <ViewportHeight>
      <Routes>
          <Route path="*" element={<NotFound />}/>
          <Route path="/" element={<Start />}/>

          <Route path="/login" element={<Login />}/>
          <Route path="/healthinfo" element={<HealthInfo />}/>
          <Route path="/onboard" element={<Onboard />}/>
          <Route path="/loading" element={<Loading />}/>
          <Route path="/home" element={<Homepage />}/>
          <Route path="/map" element={<Map />}/>
          <Route path="/library" element={<Library />}/>
          <Route path="/settings" element={<Settings />}/>
          
      </Routes>
      </ViewportHeight>
    </Router>
  );
}