import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch user analysis history
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
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        // Sort by timestamp (latest first)
        const sortedData = data.sort(
          (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
        );

        setHistory(sortedData);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ✅ Delete a history record
  const handleDelete = async (itemId) => {
    try {
      const user = auth.currentUser;
      const itemRef = doc(db, "users", user.uid, "history", itemId);
      await deleteDoc(itemRef);
      setHistory(history.filter((h) => h.id !== itemId));
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "750px",
        margin: "40px auto",
        padding: "25px",
        textAlign: "center",
        backgroundColor: "#f5f7fa",
        borderRadius: "15px",
        boxShadow: "0 0 15px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#007bff", marginBottom: "10px" }}>User Dashboard</h2>
      <p style={{ color: "#555" }}>Welcome, {auth.currentUser?.email}</p>

      {/* Action Buttons */}
      <div style={{ margin: "25px 0" }}>
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
          📄 Upload 
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

      <h3 style={{ color: "#333", marginBottom: "15px" }}>
        Your Analysis History
      </h3>

      <div style={{ textAlign: "left" }}>
        {loading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p>No history yet.</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "15px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 6px 14px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 10px rgba(0,0,0,0.05)";
              }}
            >
              <h3 style={{ color: "#007bff", marginBottom: "10px" }}>
                {item.recommendedCareer || "No Career Found"}
              </h3>
              <p style={{ margin: "5px 0" }}>
                <strong>Skills:</strong>{" "}
                {item.skills?.join(", ") || "Not available"}
              </p>
              <p style={{ margin: "5px 0", color: "#555" }}>
                <strong>Date:</strong>{" "}
                {item.timestamp?.seconds
                  ? new Date(item.timestamp.seconds * 1000).toLocaleString()
                  : "Unknown"}
              </p>

              <button
                onClick={() => handleDelete(item.id)}
                style={{
                  backgroundColor: "#ff4d4d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  marginTop: "8px",
                  cursor: "pointer",
                }}
              >
                🗑 Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
