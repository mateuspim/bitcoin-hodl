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
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";

function ResetPassword({ onBackToLogin }) {
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
            Password reset! You can now log in.
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
            Reset Password
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              type="text"
              label="Reset token"
              value={token}
              onChange={e => setToken(e.target.value)}
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
                  <VpnKeyIcon sx={{ color: "#f7931a", mr: 1 }} />
                ),
              }}
            />
            <TextField
              type="password"
              label="New password"
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
                  <LockResetIcon sx={{ color: "#f7931a", mr: 1 }} />
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
            >
              Reset Password
            </Button>
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

export default ResetPassword;