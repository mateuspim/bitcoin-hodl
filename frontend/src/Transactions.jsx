import * as React from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import Button from "@mui/material/Button";

function TransactionsTable({ transactions, currency, bitcoinPrice }) {
  const columns = [
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "usd_spent",
      headerName: "USD Spent",
      flex: 1,
      valueFormatter: ({ value }) =>
        !isNaN(Number(value)) ? Number(value).toFixed(2) : "",
      renderCell: ({ value }) =>
        !isNaN(Number(value)) ? `$${Number(value).toFixed(2)}` : "",
    },
    {
      field: "btc_price",
      headerName: "BTC Price",
      flex: 1,
      valueFormatter: ({ value }) =>
        !isNaN(Number(value)) ? Number(value).toFixed(2) : "",
      renderCell: ({ value }) =>
        !isNaN(Number(value)) ? `$${Number(value).toFixed(2)}` : "",
    },
    {
      field: "btc_bought",
      headerName: "BTC Bought",
      flex: 1,
      valueFormatter: ({ value }) =>
        !isNaN(Number(value)) ? Number(value).toFixed(8) : "",
      renderCell: ({ value }) =>
        !isNaN(Number(value)) ? `₿ ${Number(value).toFixed(8)}` : "",
    },
    {
      field: "btc_value_today",
      headerName: "BTC Value Today",
      flex: 1,
      valueFormatter: ({ value }) =>
        !isNaN(Number(value)) ? Number(value).toFixed(2) : "",
      renderCell: ({ value }) =>
        !isNaN(Number(value)) ? `$${Number(value).toFixed(2)}` : "",
    },
  ];

  const rows = Array.isArray(transactions)
    ? transactions.map((tx, idx) => ({
        id: tx.id || idx,
        ...tx,
        btc_value_today:
          !isNaN(Number(tx.btc_bought)) && !isNaN(Number(bitcoinPrice))
            ? (Number(tx.btc_bought) * Number(bitcoinPrice)).toFixed(2)
            : "",
      }))
    : [];

  const safeTxs = Array.isArray(transactions) ? transactions : [];

  const sumUsdSpent = safeTxs.reduce(
    (sum, tx) => sum + (Number(tx.usd_spent) || 0),
    0
  );

  const avgBtcPrice =
    safeTxs.length > 0
      ? safeTxs.reduce((sum, tx) => sum + (Number(tx.btc_price) || 0), 0) /
        safeTxs.length
      : 0;

  const totalBtcBought = safeTxs.reduce(
    (sum, tx) => sum + (Number(tx.btc_bought) || 0),
    0
  );

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
      </div>
    </GridToolbarContainer>
  );
}

  return (
    <div style={{ width: "100%" }}>
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
        <span>
          Total USD Spent: $
          {sumUsdSpent.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span>
          Avg BTC Price: $
          {avgBtcPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
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
