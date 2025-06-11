import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

function TransactionsTable({
  transactions,
  transactionsSummary,
  fetchTransactions,
  currency,
  bitcoinPrice,
}) {
  const columns = [
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "usd_spent",
      headerName: "USD Spent",
      flex: 1,
      valueGetter: (value) => {
        if (!value) {
          return value;
        }
        return `$ ${value}`;
      },
    },
    {
      field: "btc_price",
      headerName: "BTC Price in USD",
      flex: 1,
      valueGetter: (value) => {
        if (!value) {
          return value;
        }
        return `$ ${Number(value).toLocaleString()}`;
      },
    },
    {
      field: "btc_bought",
      headerName: "BTC Bought",
      flex: 1,
      valueGetter: (value) => {
        if (!value) {
          return value;
        }
        return `₿ ${Number(value).toFixed(8)}`;
      },
    },
    {
      field: "btc_value_today",
      headerName: "BTC Value Today",
      flex: 1,
      valueGetter: (value, row) => {
        return `${Number(
          row.btc_bought * bitcoinPrice
        ).toLocaleString()} ${currency.toUpperCase()}`;
      },
    },
  ];

  const rows = Array.isArray(transactions)
    ? transactions.map((tx, idx) => ({
        id: tx.id || idx,
        ...tx,
      }))
    : [];

  const safeTxs = Array.isArray(transactions) ? transactions : [];

  const sumUsdSpent = Number(transactionsSummary?.total_usd_spent ?? 0);
  const avgBtcPrice = Number(transactionsSummary?.avg_btc_price ?? 0);
  const totalBtcBought = Number(transactionsSummary?.total_btc_bought ?? 0);

  const sumBtcValueToday = safeTxs.reduce(
    (sum, tx) =>
      sum +
      (!isNaN(Number(tx.btc_bought)) && !isNaN(Number(bitcoinPrice))
        ? Number(tx.btc_bought) * Number(bitcoinPrice)
        : 0),
    0
  );

  const gainOrLoss = sumBtcValueToday - sumUsdSpent;
  const gainOrLossPercent =
    sumUsdSpent !== 0 ? (gainOrLoss / sumUsdSpent) * 100 : 0;

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 56,
          position: "relative",
        }}
      >
        {/* Left (empty, for spacing) */}
        <div style={{ flex: 1 }} />

        {/* Centered image and text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <img
            src="https://cdn.jsdelivr.net/gh/selfhst/icons/png/bitcoin.png"
            alt="Bitcoin"
            style={{ width: 30, height: 30, marginRight: 8 }}
          />
          <span
            style={{
              color: "#f7931a",
              fontWeight: "bold",
              fontSize: 20,
              whiteSpace: "nowrap",
            }}
          >
            Bitcoin Portfolio
          </span>
        </div>

        {/* Right (toolbar buttons) */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <GridToolbarColumnsButton sx={{ color: "#f7931a" }} />
          <GridToolbarFilterButton sx={{ color: "#f7931a" }} />
          <GridToolbarDensitySelector sx={{ color: "#f7931a" }} />
          <GridToolbarExport sx={{ color: "#f7931a" }} />
          <Button
            variant="contained"
            color="error"
            disabled={selectedIds.length === 0 || deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting..." : "Delete Selected"}
          </Button>
        </div>
      </GridToolbarContainer>
    );
  }
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);

    // Optimistically remove from UI (optional, if you want instant feedback)
    // setTransactions((prev) => prev.filter(tx => !selectedIds.includes(tx.id)));

    try {
      // Delete all selected in parallel
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`http://localhost:8000/transactions/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
        )
      );
      // Refresh data from server to ensure consistency
      await fetchTransactions();
      setSelectedIds([]);
    } catch (error) {
      alert("Failed to delete one or more transactions.");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectionChange = (selection) => {
    if (selection && selection.ids) {
      setSelectedIds(Array.from(selection.ids));
    } else if (Array.isArray(selection)) {
      setSelectedIds(selection);
    }
  };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: "",
    usd_spent: "",
    btc_price: "",
    btc_bought: "",
  });

  const btcBought =
    form.usd_spent && form.btc_price
      ? (parseFloat(form.usd_spent) / parseFloat(form.btc_price)).toFixed(8)
      : "";
  const handleOpen = () => {
    setForm({
      date: "",
      usd_spent: "",
      btc_price: bitcoinPrice || "",
      btc_bought: "",
    });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };

    if (name === "usd_spent" || name === "btc_price") {
      const usd_spent = name === "usd_spent" ? value : updatedForm.usd_spent;
      const btc_price = name === "btc_price" ? value : updatedForm.btc_price;
      updatedForm.btc_bought =
        usd_spent && btc_price
          ? (parseFloat(usd_spent) / parseFloat(btc_price)).toFixed(8)
          : "";
    }

    setForm(updatedForm);
  };
  // Submit new transaction
  const handleSubmit = async () => {
    // Convert btc_bought to satoshis (integer)
    const btc_bought_sats = Math.round(
      parseFloat(form.btc_bought) * 100_000_000
    );

    const payload = {
      date: form.date,
      usd_spent: parseFloat(form.usd_spent),
      btc_price: parseFloat(form.btc_price),
      btc_bought: btc_bought_sats, // send as integer
    };

    try {
      const res = await fetch("http://localhost:8000/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Failed to create transaction: " + JSON.stringify(errorData));
        return;
      }

      await fetchTransactions();
      setOpen(false);
      setForm({
        date: "",
        usd_spent: "",
        btc_price: bitcoinPrice || "",
        btc_bought: "",
      });
    } catch (error) {
      alert("Failed to create transaction.");
      console.error(error);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Add Transaction Button */}
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Create Transaction
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Transaction</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="USD Spent"
            name="usd_spent"
            type="number"
            value={form.usd_spent}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="BTC Price"
            name="btc_price"
            type="number"
            value={form.btc_price}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="BTC Bought"
            name="btc_bought"
            type="number"
            value={form.btc_bought}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Summary Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          background: "#222",
          color: "#FFFFFF",
          padding: "12px 24px",
          fontWeight: "bold",
          fontSize: 18,
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <span>Total USD Spent: ${sumUsdSpent.toFixed(2)}</span>
        <span>Avg BTC Price: ${avgBtcPrice.toFixed(2)}</span>
        <span>Total BTC Bought: ₿ {totalBtcBought.toFixed(8)}</span>
        <span>
          Sum of Today's Value: $
          {sumBtcValueToday.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span>
          Gain/Loss:{" "}
          <span style={{ color: gainOrLoss >= 0 ? "#4caf50" : "#f44336" }}>
            $
            {gainOrLoss.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            ({gainOrLossPercent.toFixed(2)}%)
          </span>
        </span>
      </div>

      {/* DataGrid */}
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        checkboxSelection
        // rowSelectionModel={selectedIds}
        onRowSelectionModelChange={handleSelectionChange}
        eSize={5}
        rowsPerPageOptions={[5, 10, 25]}
        disableSelectionOnClick
        rowHeight={60}
        slots={{ toolbar: CustomToolbar }}
        showToolbar
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          border: "none",
          backgroundColor: "#181818",
          color: "#fff",
          "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeaderRow, & .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderTitle":
            {
              backgroundColor: "#f7931a !important",
              color: "#fff !important",
              fontSize: 22,
              fontWeight: "bold",
              whiteSpace: "nowrap",
              overflow: "visible",
              textOverflow: "unset",
            },
          "& .MuiDataGrid-filler": {
            backgroundColor: "#f7931a",
            color: "#fff",
          },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#222",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#333",
          },
          "& .MuiDataGrid-cell": {
            fontSize: 16,
            color: "#fff",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#f7931a",
            color: "#181818",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          },
          "& .MuiDataGrid-toolbarContainer": {
            backgroundColor: "#181818",
            color: "#f7931a",
          },
          "& .MuiDataGrid-selectedRowCount": {
            color: "#ffffff",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "#faa31a !important",
            color: "#181818 !important",
          },
          "& .MuiDataGrid-row.Mui-selected:hover": {
            backgroundColor: "#ffa940 !important",
            color: "#181818 !important",
          },
          "& .MuiDataGrid-toolbarContainer button, & .MuiDataGrid-toolbarContainer svg":
            {
              color: "#ffffff",
            },
        }}
      />
    </div>
  );
}

export default TransactionsTable;
