import React, { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import Register from "./Register";
import ResetPassword from "./ResetPassword";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState("login"); // "login", "register", "forgot"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/jwt/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      if (!res.ok) {
        setError("Invalid credentials");
        return;
      }
      const data = await res.json();
      onLogin(data.access_token);
    } catch (err) {
      setError("Network error");
    }
  };

  if (view === "forgot") {
    return (
      <ForgotPassword
        onBackToLogin={() => setView("login")}
        onResetPassword={() => setView("reset")}
      />
    );
  }

  if (view === "reset") {
    return <ResetPassword onBackToLogin={() => setView("login")} />;
  }
  if (view === "register") {
    return (
      <Register
        onRegister={() => setView("login")}
        onBackToLogin={() => setView("login")}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />
      <button type="submit">Login</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="button" onClick={() => setView("forgot")}>
        Forgot Password?
      </button>
      <button type="button" onClick={() => setView("register")}>
        Register
      </button>
    </form>
  );
}

export default Login;
