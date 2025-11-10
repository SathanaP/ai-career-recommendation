import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Spinner from "./Spinner";

export default function HomePage({ setResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => setFile(e.target.files[0]);

 const handleUpload = async () => {
  if (!file) {
    alert("Please upload a resume PDF file!");
    return;
  }

  if (!file.name.endsWith(".pdf")) {
    alert("Please upload a PDF file only!");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Please log in before uploading.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", user.uid);

  setLoading(true);
  try {
    const response = await fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Backend not responding!");

    const data = await response.json();
    setResult(data);

    // ⚡ Only save to Firestore if XP earned > 0 (not duplicate)
    if (data.xp_earned > 0) {
      const userRef = doc(db, "users", user.uid);
      await addDoc(collection(userRef, "history"), {
        recommendedCareer: data.recommended_career || "N/A",
        skills: data.skills_found || [],
        xp: data.xp_earned || 0,
        level: data.level || 1,
        badges: data.badges || [],
        timestamp: serverTimestamp(),
      });
      console.log("✅ Analysis saved to Firestore!");
      navigate("/result"); // ✅ Navigate only after saving
    } else {
      console.log("⚠ Duplicate resume upload — not saved.");
      alert(
        data.message ||
          "Duplicate upload detected. XP not awarded for identical resume."
      );
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to connect to backend. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error logging out. Please try again.");
    }
  };

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#007bff" }}>AI Career Recommendation System 🎯</h1>
      <p style={{ marginBottom: "20px" }}>
        Upload your resume (PDF) to get a personalized career recommendation
        and earn XP badges!
      </p>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ marginBottom: "20px" }}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          backgroundColor: "#28a745",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? <Spinner /> : "📄 Upload & Analyze"}
      </button>

      <div style={{ marginTop: "40px", display: "flex", gap: "10px" }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          📊 View Dashboard
        </button>
      </div>
    </div>
  );
}
