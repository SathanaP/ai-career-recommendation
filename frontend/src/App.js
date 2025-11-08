import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("⚠️ Please upload a resume PDF file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setError("❌ Failed to connect to backend or invalid response!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">AI Career Recommendation System</h1>
        <p className="subtitle">
          Upload your resume (PDF) to get a personalized career suggestion.
        </p>

        <div className="upload-section">
          <label htmlFor="fileInput" className="file-label">
            Choose Resume
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            hidden
          />
          {file && <p className="file-name">📄 {file.name}</p>}

          <button onClick={handleUpload} disabled={loading}>
            {loading ? <div className="spinner"></div> : "Upload & Analyze"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {result && (
          <div className="result-box">
            <h2>Recommended Career:</h2>
            <p className="career-name">{result.recommended_career}</p>

            <h3>Skills Found:</h3>
            {result.skills_found.length > 0 ? (
              <div className="skills-list">
                {result.skills_found.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p>No skills detected in the resume ❗</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
