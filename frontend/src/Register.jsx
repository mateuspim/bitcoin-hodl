import React, { useState } from "react";

function Register({ onRegister, onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Registration failed");
        return;
      }
      setDone(true);
      if (onRegister) onRegister();
    } catch (err) {
      setError("Network error.");
    }
  };

  if (done) {
    return (
      <div>
        Registration successful! You can now log in.
        <br />
        <button onClick={onBackToLogin}>Back to Login</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      /><br />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      /><br />
      <button type="submit">Register</button>
      <button type="button" onClick={onBackToLogin}>Back to Login</button>
      {error && <div style={{color: "red"}}>{error}</div>}
    </form>
  );
}

export default Register;