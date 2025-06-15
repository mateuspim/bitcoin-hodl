import "./index.css";
import React, { useState, useEffect } from "react";
import Login from "./Login";
import Logout from "./Logout";
import TransactionsTable from "./Transactions";
import TransactionsGraph from "./TransactionsGraph";
import {
  Paper,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  TextField,
  CircularProgress,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TableRowsIcon from "@mui/icons-material/TableRows";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [currency, setCurrency] = useState("usd");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transactionsError, setTransactionsError] = useState("");
  const [transactionsSummary, setTransactionsSummary] = useState([]);
  const [transactionsSummaryError, setTransactionsSummaryError] = useState("");
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState("");
  const [tab, setTab] = useState(0);

  // Calculate which price to use
  const effectiveBitcoinPrice =
    useCustomPrice && customPrice ? parseFloat(customPrice) : bitcoinPrice;

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchUser();
      getBitcoinPrice();
      fetchTransactions();
      fetchTransactionsSummary();
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
    // eslint-disable-next-line
  }, [token]);

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        handleLogout();
        throw new Error("Failed to fetch user");
      }
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setUser(null);
    }
  }

  const getBitcoinPrice = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8000/bitcoin/price?currency=${currency}`
      );
      if (!res.ok) throw new Error("Failed to fetch price");
      const data = await res.json();
      setBitcoinPrice(data.price);
    } catch (err) {
      setError("Could not fetch price.");
    }
    setLoading(false);
  };

  async function fetchTransactions() {
    try {
      const res = await fetch("http://localhost:8000/transactions/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data);
      setTransactionsError("");
    } catch (err) {
      setTransactionsError("Could not load transactions.");
    }
  }

  async function fetchTransactionsSummary() {
    try {
      const res = await fetch("http://localhost:8000/transactions/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch transactions summary");
      const data = await res.json();
      setTransactionsSummary(data);
      setTransactionsSummaryError("");
    } catch (err) {
      setTransactionsSummaryError("Could not load transactions summary.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.reload();
  }

  // Early returns (after all hooks)
  if (transactionsError)
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "transparent" }}>
        <Typography color="error" variant="h5">
          {transactionsError}
        </Typography>
      </Box>
    );

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #181818 0%, #232526 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Login onLogin={setToken} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #181818 0%, #232526 100%)",
        padding: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 4,
          fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.4)",
          maxWidth: "70%",
          margin: "0 auto",
          backgroundColor: "#232526",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <img
              src="https://cdn.jsdelivr.net/gh/selfhst/icons/png/bitcoin.png"
              alt="Bitcoin"
              style={{ width: 36, height: 36 }}
            />
            <Typography
              variant="h4"
              sx={{
                color: "#f7931a",
                fontWeight: "bold",
                letterSpacing: 1,
                fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
              }}
            >
              Bitcoin Portfolio
            </Typography>
          </Box>
          <Logout onLogout={handleLogout} />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 500 }}>
            Welcome{user ? `, ${user.username || user.email}` : ""}!
          </Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: "#f7931a" }}>Currency</InputLabel>
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              label="Currency"
              sx={{
                color: "#fff",
                ".MuiOutlinedInput-notchedOutline": { borderColor: "#f7931a" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#f7931a",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#f7931a",
                },
                ".MuiSvgIcon-root ": {
                  fill: "#f7931a !important",
                },
              }}
            >
              <MenuItem value="usd">USD</MenuItem>
              <MenuItem value="eur">EUR</MenuItem>
              <MenuItem value="brl">BRL</MenuItem>
              <MenuItem value="jpy">JPY</MenuItem>
            </Select>
          </FormControl>
          <Button
            onClick={getBitcoinPrice}
            disabled={loading}
            variant="contained"
            color="warning"
            sx={{ fontWeight: "bold", borderRadius: 2, minWidth: 120 }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Get Price"
            )}
          </Button>
          {bitcoinPrice && (
            <Typography sx={{ color: "#f7931a", fontWeight: "bold" }}>
              1 BTC = {bitcoinPrice} {currency.toUpperCase()}
            </Typography>
          )}
          <Typography sx={{ fontSize: 14, color: "#888" }}>
            Price source: <b>Backend API (CoinGecko)</b>
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={useCustomPrice}
                onChange={(e) => setUseCustomPrice(e.target.checked)}
                color="warning"
              />
            }
            label={
              <Typography sx={{ color: "#f7931a", fontWeight: 500 }}>
                Use custom price
              </Typography>
            }
          />
          {useCustomPrice && (
            <TextField
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="Enter custom BTC price"
              size="small"
              sx={{
                width: 180,
                input: { color: "#fff" },
                label: { color: "#f7931a" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#f7931a",
                },
              }}
            />
          )}
          {error && (
            <Typography color="error" sx={{ ml: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ style: { background: "#f7931a" } }}
          sx={{
            mb: 2,
            "& .MuiTab-root": {
              color: "#fff",
              fontWeight: "bold",
              fontSize: 18,
              minWidth: 160,
            },
            "& .Mui-selected": {
              color: "#f7931a !important",
            },
          }}
        >
          <Tab
            icon={<TableRowsIcon />}
            iconPosition="start"
            label="Transactions"
          />
          <Tab icon={<ShowChartIcon />} iconPosition="start" label="Graphs" />
        </Tabs>

        {/* Tab Panels */}
        <Box hidden={tab !== 0}>
          <TransactionsTable
            key={tab}
            transactions={transactions}
            transactionsSummary={transactionsSummary}
            fetchTransactions={fetchTransactions}
            fetchTransactionsSummary={fetchTransactionsSummary}
            currency={currency}
            bitcoinPrice={effectiveBitcoinPrice}
          />
        </Box>
        <Box hidden={tab !== 1}>
          <TransactionsGraph
            transactions={transactions}
            currentBitcoinPrice={effectiveBitcoinPrice}
          />
          <Paper
            elevation={2}
            sx={{
              p: 4,
              backgroundColor: "#232526",
              borderRadius: 3,
              color: "#fff",
              textAlign: "center",
              minHeight: 300,
            }}
          >
            <ShowChartIcon sx={{ fontSize: 60, color: "#f7931a", mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              More Graphs Coming Soon!
            </Typography>
            <Typography>
              Here you can visualize your Bitcoin portfolio with interactive
              charts.
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );

  // Note: fetchTransactions, fetchTransactionsSummary, fetchUser, getBitcoinPrice, handleLogout are declared above
}

export default App;