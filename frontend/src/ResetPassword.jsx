import React, { useState } from "react";

function ResetPassword({onBackToLogin }) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        setError("Could not reset password.");
        return;
      }
      setDone(true);
    } catch (err) {
      setError("Network error.");
    }
  };

  if (done) {
    return (
      <div>
        Password reset! You can now log in.
        <br />
        <button onClick={onBackToLogin}>Back to Login</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input
        type="text"
        placeholder="Reset token"
        value={token}
        onChange={e => setToken(e.target.value)}
        required
      /><br />
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      /><br />
      <button type="submit">Reset Password</button>
      {error && <div style={{color: "red"}}>{error}</div>}
    </form>
  );
}

export default ResetPassword;