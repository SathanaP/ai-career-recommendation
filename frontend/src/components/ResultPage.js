import React from "react";
import { useNavigate } from "react-router-dom";

export default function ResultPage({ result }) {
  const navigate = useNavigate();

  if (!result)
    return (
      <div className="App">
        <p>No result found. Please go back and upload a resume.</p>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "10px 20px",
            marginTop: "20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ⬅ Back to Upload
        </button>
      </div>
    );

  return (
    <div className="App result-page">
      <h1>Career Recommendation Result</h1>

      <div
        className="columns-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "40px",
          marginTop: "30px",
        }}
      >
        <div
          className="column"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            width: "300px",
          }}
        >
          <h3>Matched Skills:</h3>
          <ul className="skills-container" style={{ listStyleType: "circle" }}>
            {result.skills_found && result.skills_found.length > 0 ? (
              result.skills_found.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))
            ) : (
              <p>No skills detected</p>
            )}
          </ul>
        </div>

        <div
          className="column"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            width: "300px",
          }}
        >
          <h3>Recommended Career:</h3>
          <h2 style={{ color: "green" }}>
            {result.recommended_career || "N/A"}
          </h2>
        </div>
      </div>

      <button
        onClick={() => navigate("/home")}
        style={{
          padding: "12px 24px",
          marginTop: "40px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        ⬅ Back to Upload
      </button>
    </div>
  );
}
