import React, { useState } from "react";

function ForgotPassword({ onBackToLogin, onResetPassword }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError("Could not send reset email.");
        return;
      }
      setSent(true);
      if (onResetPassword) onResetPassword(); // Switch to reset password view
    } catch (err) {
      setError("Network error.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      /><br />
      <button type="submit">Send Reset Token</button>
      <button type="button" onClick={onBackToLogin}>Back to Login</button>
      {error && <div style={{color: "red"}}>{error}</div>}
    </form>
  );
}

export default ForgotPassword;