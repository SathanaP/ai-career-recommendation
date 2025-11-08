import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

// Simple Spinner Component
function Spinner() {
  return <div className="spinner"></div>;
}

// Home Page Component
function HomePage({ setResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a resume PDF file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/upload", { method: "POST", body: formData });
      const data = await response.json();
      setResult(data); // Save result
      navigate("/result"); // Go to Result page
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>AI Career Recommendation System</h1>
      <p>Upload your resume (PDF) to get a career recommendation</p>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? <Spinner /> : "Upload & Analyze"}
      </button>
    </div>
  );
}

// Result Page Component
function ResultPage({ result }) {
  if (!result) return <p>No result found. Please go back and upload a resume.</p>;

  return (
    <div className="App result-page">
      <h1>Career Recommendations</h1>
      <div className="columns-container">
        {/* Skills Column */}
        <div className="column">
          <h3>Matched Skills:</h3>
          <ul className="skills-container">
            {result.skills_found.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>

        {/* Career Recommendations Column */}
        <div className="column">
          <h3>Top Career Matches:</h3>
          <ol>
            {result.recommendations.map((rec, index) => (
              <li key={index}>
                {rec.career} (Score: {rec.score})
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}



// Main App Component with Router
function App() {
  const [result, setResult] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage setResult={setResult} />} />
        <Route path="/result" element={<ResultPage result={result} />} />
      </Routes>
    </Router>
  );
}

export default App;
