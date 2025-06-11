import React, { useState, useEffect } from "react";
import Login from "./Login";
import Logout from "./Logout";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchUser();
      fetchTransactions();
    } else {
      localStorage.removeItem("token");
      setUser(null);
      setTransactions([]);
    }
    // eslint-disable-next-line
  }, [token]);

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setUser(null);
    }
  }

  async function fetchTransactions() {
    try {
      const res = await fetch("http://localhost:8000/transactions/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      setTransactions([]);
    }
  }

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div>
      <Logout onLogout={() => setToken(null)} />
      <h2>Welcome{user ? `, ${user.username || user.email}` : ""}!</h2>
      <h3>Your Transactions</h3>
      <ul>
        {transactions.length === 0 && <li>No transactions found.</li>}
        {transactions.map(tx => (
          <li key={tx.id}>
            {tx.date}: {tx.btc_bought} BTC @ ${tx.btc_price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;