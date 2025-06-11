import React, { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import Register from "./Register";
import ResetPassword from "./ResetPassword";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyIcon from "@mui/icons-material/VpnKey";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("login"); // "login", "register", "forgot", "reset"

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          minWidth: 350,
          color: "#fff",
          fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
        }}
      >
        <Stack spacing={3} alignItems="center">
          <LockIcon sx={{ fontSize: 48, color: "#f7931a" }} />
          <Typography
            variant="h5"
            sx={{
              color: "#f7931a",
              fontWeight: "bold",
              letterSpacing: 1,
              mb: 1,
            }}
          >
            Login
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={{
                mb: 2,
                input: { color: "#fff" },
                label: { color: "#f7931a" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#f7931a",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#f7931a" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              sx={{
                mb: 2,
                input: { color: "#fff" },
                label: { color: "#f7931a" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#f7931a",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon sx={{ color: "#f7931a" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      sx={{ color: "#f7931a" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="warning"
              fullWidth
              sx={{
                fontWeight: "bold",
                borderRadius: 2,
                minHeight: 48,
                fontSize: 18,
                mb: 2,
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Login
            </Button>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 1 }}>
              <Button
                type="button"
                variant="text"
                onClick={() => setView("forgot")}
                sx={{
                  color: "#f7931a",
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                Forgot Password?
              </Button>
              <Button
                type="button"
                variant="text"
                onClick={() => setView("register")}
                startIcon={<PersonAddIcon />}
                sx={{
                  color: "#f7931a",
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                Register
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Login;