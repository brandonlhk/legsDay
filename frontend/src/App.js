import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login"
import Onboard from "./pages/Onboard"
import NotFound from "./pages/NotFound"
import Loading from "./pages/Loading"

export default function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="*" element={<NotFound />}/>

          <Route path="/onboard" element={<Onboard />}/>
          <Route path="/loading" element={<Loading />}/>
      </Routes>
    </Router>
  );
}

