import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, getDocs, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const historyRef = collection(userRef, "history");
        const snapshot = await getDocs(historyRef);
        const data = snapshot.docs.map((doc) => doc.data());
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2>User Dashboard</h2>
      <p>Welcome, {auth.currentUser?.email}</p>

      <div style={{ margin: "20px 0" }}>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          📄 Upload New Resume
        </button>

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
      </div>

      <h3>Your Analysis History</h3>
      <div style={{ textAlign: "left", marginTop: "15px" }}>
        {loading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p>No history yet.</p>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#fff",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "10px",
                boxShadow: "0 0 5px rgba(0,0,0,0.1)",
              }}
            >
              <h4>{item.recommendedCareer}</h4>
              <p>
                <strong>Skills:</strong> {item.skills?.join(", ") || "N/A"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {item.timestamp?.toDate
                  ? item.timestamp.toDate().toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
