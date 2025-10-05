import React from "react";
import { useNavigate } from "react-router-dom";
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
    color: "#2d3748",
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
  },
  card: {
    background: "#fff",
    padding: "2.5rem 2rem",
    borderRadius: "1.25rem",
    boxShadow: "0 8px 32px rgba(60, 72, 88, 0.12)",
    textAlign: "center",
    maxWidth: "400px",
  },
  emoji: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
    color: "#e53e3e",
  },
  message: {
    fontSize: "1.1rem",
    marginBottom: "1.5rem",
    color: "#4a5568",
  },
  button: {
    padding: "0.75rem 1.5rem",
    background: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

export default function BadOutputPage() {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.emoji}>😔</div>
        <div style={styles.title}>Sorry!</div>
        <div style={styles.message}>
          Something went wrong while generating your output.<br />
          Please try again later.
        </div>
        <button style={styles.button} onClick={handleBack}>
          Go Back Home
        </button>
      </div>
    </div>
  );
}