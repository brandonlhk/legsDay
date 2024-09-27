import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login"
import Onboard from "./pages/Onboard"
import NotFound from "./pages/NotFound"
import Loading from "./pages/Loading"
import Homepage from "./pages/Homepage"
import Library from "./pages/Library"
import Settings from "./pages/Settings"

export default function App() {
  return (
    <Router>
      <Routes>
          <Route path="*" element={<NotFound />}/>
          <Route path="/" element={<Login />}/>

          <Route path="/onboard" element={<Onboard />}/>
          <Route path="/loading" element={<Loading />}/>
          <Route path="/home" element={<Homepage />}/>
          <Route path="/library" element={<Library />}/>
          <Route path="/settings" element={<Settings />}/>
          
      </Routes>
    </Router>
  );
}

