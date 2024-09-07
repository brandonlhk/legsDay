import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login"
import Onboard from "./pages/Onboard"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/onboard" element={<Onboard />}/>
          <Route path="*" element={<NotFound />}/>
      </Routes>
    </Router>
  );
}

