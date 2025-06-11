import React, { useState, useEffect } from "react";
import Login from "./Login";
import Logout from "./Logout";
import TransactionsTable from "./Transactions";

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
  }, [token]);

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        handleLogout();
        throw new Error("Failed to fetch user")
      };
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
    } catch (err) {
      setTransactionsError("Could not load transactions.");
    }
  }

  async function fetchTransactionsSummary(){
    try {
      const res = await fetch("http://localhost:8000/transactions/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch transactions summary");
      const data = await res.json();
      setTransactionsSummary(data);
    } catch (err) {
      setTransactionsSummaryError("Could not load transactions summary.");
    }
  };

  if (transactionsError) return <div style={{ color: "red" }}>{transactionsError}</div>;

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.reload();
  } 

  return (
    <div>
      <Logout onLogout={() => handleLogout()} />
      <h2>Welcome{user ? `, ${user.username || user.email}` : ""}!</h2>
      <h3>Get Current Bitcoin Price</h3>
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="usd">USD</option>
        <option value="eur">EUR</option>
        <option value="brl">BRL</option>
        <option value="jpy">JPY</option>
      </select>
      <button onClick={getBitcoinPrice} disabled={loading}>
        {loading ? "Loading..." : "Get Price"}
      </button>
      {bitcoinPrice && (
        <div>
          1 BTC = {bitcoinPrice} {currency.toUpperCase()}
        </div>
      )}
      {error && <div style={{color: "red"}}>{error}</div>}
      <TransactionsTable transactions={transactions} transactionsSummary={transactionsSummary} fetchTransactions={fetchTransactions} currency={currency} bitcoinPrice={bitcoinPrice} />
    </div>
  );
}

export default App;
