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
import LockResetIcon from "@mui/icons-material/LockReset";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
      if (onResetPassword) onResetPassword();
    } catch (err) {
      setError("Network error.");
    }
  };

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
          <LockResetIcon sx={{ fontSize: 48, color: "#f7931a" }} />
          <Typography
            variant="h5"
            sx={{
              color: "#f7931a",
              fontWeight: "bold",
              letterSpacing: 1,
              mb: 1,
            }}
          >
            Forgot Password
          </Typography>
          {sent ? (
            <Alert severity="success" sx={{ width: "100%" }}>
              If your email is registered, a reset link has been sent.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <TextField
                type="email"
                label="Your email"
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
              />
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="warning"
                  sx={{ fontWeight: "bold", borderRadius: 2, minWidth: 140 }}
                >
                  Send Reset Token
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
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default ForgotPassword;