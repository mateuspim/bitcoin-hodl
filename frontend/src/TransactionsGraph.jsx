import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import { DataGrid } from "@mui/x-data-grid";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

// Defensive data preparation: convert strings to numbers, avoid NaN
function prepareChartData(transactions, currentBitcoinPrice) {
  return transactions
    .map((tx) => {
      const btcBought = Number(tx.btc_bought) || 0;
      const usdSpent = Number(tx.usd_spent) || 0;
      const btcPrice = Number(tx.btc_price) || 0;
      const btcValueToday = btcBought * currentBitcoinPrice || 0;
      const gainLoss = btcValueToday - usdSpent || 0;
      return {
        date: tx.date,
        btc_price: btcPrice,
        btc_bought: btcBought,
        btc_value_today: btcValueToday,
        gain_loss: gainLoss,
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function PortfolioValueOverTime({ transactions, currentBitcoinPrice }) {
  const data = prepareChartData(transactions, currentBitcoinPrice);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 60, left: 60, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis
          dataKey="date"
          tickFormatter={(dateStr) =>
            new Date(dateStr).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          }
          tick={{ fill: "#f7931a" }}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis
          yAxisId="left"
          width={80}
          tick={{ fill: "#f7931a" }}
          tickFormatter={(val) => (isNaN(val) ? "N/A" : `$${val.toFixed(2)}`)}
          label={{
            value: "BTC Bought / Gain/Loss ($)",
            angle: -90,
            position: "insideLeft",
            fill: "#f7931a",
            offset: 0,
            style: { fontSize: 12, fontWeight: "bold" },
          }}
          padding={{ top: 10, bottom: 10 }}
          domain={["auto", "auto"]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          width={80}
          tick={{ fill: "#8884d8" }}
          tickFormatter={(val) => (isNaN(val) ? "N/A" : `$${val.toFixed(0)}`)}
          label={{
            value: "BTC Price ($)",
            angle: 90,
            position: "insideRight",
            fill: "#8884d8",
            offset: 0,
            style: { fontSize: 12, fontWeight: "bold" },
          }}
          padding={{ top: 10, bottom: 10 }}
          domain={["auto", "auto"]}
        />
        <Tooltip
          formatter={(value, name) => {
            if (value === null || value === undefined || isNaN(value))
              return "N/A";
            if (name === "gain_loss" || name === "btc_value_today")
              return `$${value.toFixed(2)}`;
            if (name === "btc_bought") return value.toFixed(6);
            if (name === "btc_price") return `$${value.toFixed(0)}`;
            return value;
          }}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="btc_price"
          stroke="#8884d8"
          name="BTC Price"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="btc_bought"
          stroke="#82ca9d"
          name="BTC Bought"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="btc_value_today"
          stroke="#ff7300"
          name="BTC Value Today"
          dot={false}
          isAnimationActive={false}
          strokeWidth={2}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="gain_loss"
          stroke="#f7931a"
          name="Gain/Loss"
          dot={false}
          isAnimationActive={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const gainLossEntry = payload.find((p) => p.dataKey === "gain_loss");
    const gainLoss = gainLossEntry ? gainLossEntry.value : null;
    return (
      <div
        style={{
          backgroundColor: "#222",
          color: "#f7931a",
          padding: "10px",
          borderRadius: "5px",
          fontWeight: "bold",
        }}
      >
        <div>Date: {formatDate(label)}</div>
        <div>
          Gain/Loss:{" "}
          <span style={{ color: gainLoss >= 0 ? "#4caf50" : "#f44336" }}>
            {gainLoss !== null && gainLoss !== undefined
              ? `$${gainLoss.toFixed(2)}`
              : "N/A"}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

function prepareDailyGainLossData(transactions, currentBitcoinPrice) {
  const dailyData = transactions.reduce((acc, tx) => {
    const date = tx.date;
    if (!acc[date]) {
      acc[date] = { date, usd_spent: 0, btc_bought: 0 };
    }
    acc[date].usd_spent += Number(tx.usd_spent) || 0;
    acc[date].btc_bought += Number(tx.btc_bought) || 0;
    return acc;
  }, {});

  return Object.values(dailyData)
    .map((day) => {
      const btcValueToday = day.btc_bought * currentBitcoinPrice || 0;
      const gainLoss = btcValueToday - day.usd_spent || 0;
      return { date: day.date, gain_loss: gainLoss };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function DailyGainLossChart({ transactions, currentBitcoinPrice }) {
  const data = prepareDailyGainLossData(transactions, currentBitcoinPrice);

  const getBarColor = (entry) => (entry.gain_loss >= 0 ? "#4caf50" : "#f44336");

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#f7931a" }}
          tickFormatter={formatDate}
        />
        <YAxis tick={{ fill: "#f7931a" }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="gain_loss"
          name="Gain / Loss"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BTCVsUSDPieChart({ transactions, currentBitcoinPrice }) {
  function preprocessTransactions(rawTransactions) {
    return rawTransactions.map((tx) => ({
      ...tx,
      usd_spent: Number(tx.usd_spent),
      btc_price: Number(tx.btc_price),
      btc_bought: Number(tx.btc_bought),
    }));
  }
  const new_transactions = preprocessTransactions(transactions);
  const totalBTC = new_transactions.reduce((sum, tx) => sum + tx.btc_bought, 0);
  const totalUSD = new_transactions.reduce((sum, tx) => sum + tx.usd_spent, 0);

  const data = [
    { name: "BTC Bought", value: totalBTC * currentBitcoinPrice },
    { name: "USD Spent", value: totalUSD },
  ];

  const COLORS = ["#f7931a", "#85bb65"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DailyPriceVsAvgPurchase({ transactions }) {
  let totalBTC = 0;
  let totalUSD = 0;
  const data = transactions
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((tx) => {
      totalBTC += Number(tx.btc_bought) || 0;
      totalUSD += Number(tx.usd_spent) || 0;
      const avgPurchasePrice = totalBTC ? totalUSD / totalBTC : 0;
      return {
        date: tx.date,
        btc_price: Number(tx.btc_price) || 0,
        avg_purchase_price: avgPurchasePrice,
      };
    });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value) => (isNaN(value) ? "N/A" : `$${value.toFixed(2)}`)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="btc_price"
          stroke="#f7931a"
          name="BTC Price"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="avg_purchase_price"
          stroke="#82ca9d"
          name="Avg Purchase Price"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TransactionVolumeByDay({ transactions }) {
  const data = transactions
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((tx) => ({
      date: tx.date,
      btc_bought: Number(tx.btc_bought) || 0,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value) => (isNaN(value) ? "N/A" : value.toFixed(6))}
        />
        <Bar dataKey="btc_bought" fill="#f7931a" name="BTC Bought" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Example DataGrid wrapper with explicit height to fix MUI warning
export function TransactionsTableWrapper({ rows, columns }) {
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
}

const heatmapColors = {
  empty: "#eee",
  gain1: "#d0f0c0",
  gain2: "#a0d080",
  gain3: "#70b050",
  gain4: "#409020",
  loss1: "#f0c0c0",
  loss2: "#d08080",
  loss3: "#b05050",
  loss4: "#902020",
};

function getClassForValue(value, maxAbsGainLoss) {
  if (!value || value.gain_loss === 0) return "color-empty";

  const intensity = Math.min(Math.abs(value.gain_loss) / maxAbsGainLoss, 1);

  if (value.gain_loss > 0) {
    if (intensity > 0.75) return "color-gain-4";
    if (intensity > 0.5) return "color-gain-3";
    if (intensity > 0.25) return "color-gain-2";
    return "color-gain-1";
  } else {
    if (intensity > 0.75) return "color-loss-4";
    if (intensity > 0.5) return "color-loss-3";
    if (intensity > 0.25) return "color-loss-2";
    return "color-loss-1";
  }
}

export function DailyGainLossCalendarHeatmap({
  transactions,
  currentBitcoinPrice,
}) {
  const data = prepareDailyGainLossData(transactions, currentBitcoinPrice);

  // Use gain_loss values for max absolute calculation
  const maxAbsGainLoss = Math.max(
    ...data.map((d) => Math.abs(d.gain_loss)),
    1
  );

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <CalendarHeatmap
        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
        endDate={new Date()}
        values={data}
        classForValue={(value) => getClassForValue(value, maxAbsGainLoss)}
        tooltipDataAttrs={(value) => {
          if (!value || !value.date) return null;
          return {
            "data-tooltip-id": "gainLossTooltip",
            "data-tooltip-html": `${value.date}: ${
              value.gain_loss >= 0
                ? `Gain $${value.gain_loss.toFixed(2)}`
                : `Loss $${Math.abs(value.gain_loss).toFixed(2)}`
            }`,
          };
        }}
        showWeekdayLabels
        gutterSize={4}
        horizontal={true}
      />
      <ReactTooltip
        id="gainLossTooltip"
        place="top"
        type="dark"
        effect="float"
        delayShow={100}
      />
      <style>{`
        .color-empty { fill: ${heatmapColors.empty}; }
        .color-gain-1 { fill: ${heatmapColors.gain1}; }
        .color-gain-2 { fill: ${heatmapColors.gain2}; }
        .color-gain-3 { fill: ${heatmapColors.gain3}; }
        .color-gain-4 { fill: ${heatmapColors.gain4}; }
        .color-loss-1 { fill: ${heatmapColors.loss1}; }
        .color-loss-2 { fill: ${heatmapColors.loss2}; }
        .color-loss-3 { fill: ${heatmapColors.loss3}; }
        .color-loss-4 { fill: ${heatmapColors.loss4}; }
        .react-calendar-heatmap .color-empty:hover,
        .react-calendar-heatmap .color-gain-1:hover,
        .react-calendar-heatmap .color-gain-2:hover,
        .react-calendar-heatmap .color-gain-3:hover,
        .react-calendar-heatmap .color-gain-4:hover,
        .react-calendar-heatmap .color-loss-1:hover,
        .react-calendar-heatmap .color-loss-2:hover,
        .react-calendar-heatmap .color-loss-3:hover,
        .react-calendar-heatmap .color-loss-4:hover {
          stroke: #333;
          stroke-width: 1.5px;
          cursor: pointer;
          transition: stroke-width 0.2s ease;
        }
      `}</style>
    </div>
  );
}

export default function TransactionsGraph({
  transactions,
  currentBitcoinPrice,
}) {
  return (
    <div style={{ padding: 20 }}>
      <h2>1. Portfolio Value Over Time</h2>
      <PortfolioValueOverTime
        transactions={transactions}
        currentBitcoinPrice={currentBitcoinPrice}
      />

      <h2>2. Daily Gains and Losses</h2>
      <DailyGainLossChart
        transactions={transactions}
        currentBitcoinPrice={currentBitcoinPrice}
      />

      <h2>3. BTC accumulated (in USD today) vs USD Spent</h2>
      <BTCVsUSDPieChart
        transactions={transactions}
        currentBitcoinPrice={currentBitcoinPrice}
      />

      <h2>4. Daily BTC Price vs. Average Purchase Price</h2>
      <DailyPriceVsAvgPurchase transactions={transactions} />

      <h2>5. Transaction Volume by Day</h2>
      <TransactionVolumeByDay transactions={transactions} />

      <h2>6. Gain/Loss Heatmap by Day</h2>
      <DailyGainLossCalendarHeatmap
        transactions={transactions}
        currentBitcoinPrice={currentBitcoinPrice}
      />
    </div>
  );
}