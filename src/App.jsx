import "./App.css";
import TelaLogin from "./components/TelaLogin";
import TelaPrincipal from "./components/TelaPrincipal";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {
  return <div>
    <Router>
      <Routes>
        <Route path="/telaPrincipal" element={<TelaPrincipal />} />
        <Route path="/login" element={<TelaLogin />} />
      </Routes>
    </Router>

  </div>;
}

export default App;