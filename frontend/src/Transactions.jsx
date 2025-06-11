import React, { useState } from "react";
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
  Paper,
  Typography,
  Box,
} from "@mui/material";

function TransactionsTable({
  transactions,
  transactionsSummary,
  fetchTransactions,
  currency,
  bitcoinPrice,
}) {
  // All hooks at the top!
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: "",
    usd_spent: "",
    btc_price: "",
    btc_bought: "",
  });

  // Columns definition
  const columns = [
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "usd_spent",
      headerName: "USD Spent",
      flex: 1,
      valueGetter: (value) => (value ? `$ ${value}` : value),
    },
    {
      field: "btc_price",
      headerName: "BTC Price in USD",
      flex: 1,
      valueGetter: (value) =>
        value ? `$ ${Number(value).toLocaleString()}` : value,
    },
    {
      field: "btc_bought",
      headerName: "BTC Bought",
      flex: 1,
      valueGetter: (value) => (value ? `₿ ${Number(value).toFixed(8)}` : value),
    },
    {
      field: "btc_value_today",
      headerName: "BTC Value Today",
      flex: 1,
      valueGetter: (value, row) =>
        `${Number(
          row.btc_bought * bitcoinPrice
        ).toLocaleString()} ${currency.toUpperCase()}`,
    },
  ];

  // Prepare rows for DataGrid
  const rows = Array.isArray(transactions)
    ? transactions.map((tx, idx) => ({
        id: tx.id || idx,
        ...tx,
      }))
    : [];

  // Summary calculations
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

  // Custom Toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          background: "rgba(24,24,24,0.95)",
          borderBottom: "1px solid #f7931a",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 56,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src="https://cdn.jsdelivr.net/gh/selfhst/icons/png/bitcoin.png"
            alt="Bitcoin"
            style={{ width: 30, height: 30, marginRight: 8 }}
          />
          <Typography
            variant="h6"
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
        <Box sx={{ display: "flex", gap: 1 }}>
          <GridToolbarColumnsButton sx={{ color: "#f7931a" }} />
          <GridToolbarFilterButton sx={{ color: "#f7931a" }} />
          <GridToolbarDensitySelector sx={{ color: "#f7931a" }} />
          <GridToolbarExport sx={{ color: "#f7931a" }} />
          <Button
            variant="contained"
            color="error"
            disabled={selectedIds.length === 0 || deleting}
            onClick={handleDelete}
            sx={{ fontWeight: "bold", borderRadius: 2, minWidth: 120 }}
          >
            {deleting ? "Deleting..." : "Delete Selected"}
          </Button>
        </Box>
      </GridToolbarContainer>
    );
  }

  // Handlers
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #181818 0%, #232526 100%)",
        padding: 32,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 4,
          fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.4)",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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
          <Button
            variant="contained"
            color="warning"
            sx={{ fontWeight: "bold", borderRadius: 2, boxShadow: 2 }}
            onClick={handleOpen}
          >
            Create Transaction
          </Button>
        </Box>

        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              background: "#232526",
              color: "#fff",
              borderRadius: 3,
              boxShadow: 8,
            },
          }}
        >
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
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="USD Spent"
              name="usd_spent"
              type="number"
              value={form.usd_spent}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="BTC Price"
              name="btc_price"
              type="number"
              value={form.btc_price}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="BTC Bought"
              name="btc_bought"
              type="number"
              value={form.btc_bought}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="warning">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Summary Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            background: "#232526",
            color: "#FFFFFF",
            padding: "16px 24px",
            fontWeight: "bold",
            fontSize: 18,
            borderRadius: 2,
            mb: 2,
            boxShadow: 1,
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
        </Box>

        {/* DataGrid */}
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={handleSelectionChange}
          pageSize={5}
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
              transition: "background 0.2s",
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
      </Paper>
    </div>
  );
}

export default TransactionsTable;