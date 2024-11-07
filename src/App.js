import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DetailHalaman from "./pages/DetailHalaman";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:id/:slug" element={<DetailHalaman />} />
        <Route path="/:id" element={<DetailHalaman />} />
      </Routes>
    </Router>
  );
}

export default App;