import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyIcon from "@mui/icons-material/VpnKey";

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
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #181818 0%, #232526 100%)",
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
            background: "#181818",
            color: "#fff",
            fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
            textAlign: "center",
          }}
        >
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful! You can now log in.
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBackToLogin}
            sx={{
              color: "#f7931a",
              borderColor: "#f7931a",
              fontWeight: "bold",
              borderRadius: 2,
              minWidth: 140,
              "&:hover": {
                borderColor: "#f7931a",
                background: "#232526",
              },
            }}
          >
            Back to Login
          </Button>
        </Paper>
      </Box>
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
          <PersonAddIcon sx={{ fontSize: 48, color: "#f7931a" }} />
          <Typography
            variant="h5"
            sx={{
              color: "#f7931a",
              fontWeight: "bold",
              letterSpacing: 1,
              mb: 1,
            }}
          >
            Register
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
                  <EmailIcon sx={{ color: "#f7931a", mr: 1 }} />
                ),
              }}
            />
            <TextField
              type="text"
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
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
                  <AccountCircleIcon sx={{ color: "#f7931a", mr: 1 }} />
                ),
              }}
            />
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
                  <KeyIcon sx={{ color: "#f7931a", mr: 1 }} />
                ),
              }}
            />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="warning"
                sx={{ fontWeight: "bold", borderRadius: 2, minWidth: 140 }}
              >
                Register
              </Button>
              <Button
                type="button"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onBackToLogin}
                sx={{
                  color: "#f7931a",
                  borderColor: "#f7931a",
                  fontWeight: "bold",
                  borderRadius: 2,
                  minWidth: 140,
                  "&:hover": {
                    borderColor: "#f7931a",
                    background: "#232526",
                  },
                }}
              >
                Back to Login
              </Button>
            </Stack>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </form>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Register;