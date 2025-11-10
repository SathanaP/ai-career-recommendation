import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";
import ResultPage from "./components/ResultPage";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  const [result, setResult] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<HomePage setResult={setResult} />} />
        <Route path="/result" element={<ResultPage result={result} />} />
      </Routes>
    </Router>
  );
}

export default App;
