import React, { useState, useEffect } from 'react';
import './style.css';



// Total Earnings Card Component (as before, moved to bottom)
function TotalEarningsCard({ sessions }) {
  const total = sessions.reduce((acc, s) => acc + s.profit, 0);
  return (
    <div className="total-earnings-card">
      <h2>Total Earnings</h2>
      <p>{total >= 0 ? '+' : ''}${total.toFixed(2)}</p>
    </div>
  );
}

// Analytics Summary Component
function AnalyticsSummary({ sessions }) {
  const totalSessions = sessions.length;
  const totalProfit = sessions.reduce((acc, s) => acc + s.profit, 0);
  const averageProfit = totalSessions ? totalProfit / totalSessions : 0;
  const bestWin = totalSessions ? Math.max(...sessions.map(s => s.profit)) : 0;
  const worstLoss = totalSessions ? Math.min(...sessions.map(s => s.profit)) : 0;
  const winCount = sessions.filter(s => s.profit > 0).length;
  const winRate = totalSessions ? ((winCount / totalSessions) * 100).toFixed(1) : 0;

  return (
    <div className="analytics-summary">
      <h3>Analytics Summary</h3>
      <ul>
        <li>Total Sessions: {totalSessions}</li>
        <li>Win Rate: {winRate}%</li>
        <li>Average Profit: ${averageProfit.toFixed(2)}</li>
        <li>Best Win: ${bestWin}</li>
        <li>Worst Loss: ${worstLoss}</li>
      </ul>
    </div>
  );
}

// CSV Export Button Component
function ExportCSVButton({ sessions }) {
  // Convert sessions array to CSV string
  const handleExport = () => {
    const header = "Date,Buy In,Cash Out,Profit\n";
    const rows = sessions
      .map(
        s =>
          `${s.date},${s.buyIn},${s.cashOut},${s.profit}`
      )
      .join("\n");
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and click it to trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "poker_sessions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="export-csv">
      <button onClick={handleExport}>Export Sessions to CSV</button>
    </div>
  );
}

// Graph component that renders an SVG line graph
function Graph({ sessions }) {
  if (sessions.length === 0) return null;

  // Determine min and max profit for scaling
  const profits = sessions.map((s) => s.profit);
  const maxProfit = Math.max(...profits, 0);
  const minProfit = Math.min(...profits, 0);
  const range = maxProfit - minProfit || 1;

  const svgWidth = 500;
  const svgHeight = 250;
  const padding = 50;
  const graphWidth = svgWidth - padding * 2;
  const graphHeight = svgHeight - padding * 2;

  // Y coordinate for $0 reference line
  const yZero = svgHeight - padding - ((0 - minProfit) / range) * graphHeight;

  // Calculate points for each session
  const points = sessions.map((s, i) => {
    const x = padding + (i / (sessions.length - 1)) * graphWidth;
    const yNormalized = (s.profit - minProfit) / range;
    const y = svgHeight - padding - yNormalized * graphHeight;
    return { x, y, ...s };
  });

  // Build line segments that change color when crossing $0
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if ((p1.profit >= 0 && p2.profit >= 0) || (p1.profit < 0 && p2.profit < 0)) {
      segments.push({
        start: p1,
        end: p2,
        color: p1.profit >= 0 ? 'green' : 'red',
      });
    } else {
      // Calculate intersection if segment crosses $0
      const t = (yZero - p1.y) / (p2.y - p1.y);
      const xi = p1.x + t * (p2.x - p1.x);
      const intersection = { x: xi, y: yZero };
      segments.push({
        start: p1,
        end: intersection,
        color: p1.profit >= 0 ? 'green' : 'red',
      });
      segments.push({
        start: intersection,
        end: p2,
        color: p2.profit >= 0 ? 'green' : 'red',
      });
    }
  }

  return (
    <div className="graph-container">
      <h4>Profit Graph ($)</h4>
      <svg width={svgWidth} height={svgHeight} className="graph-svg">
        {/* Dashed $0 line */}
        <line
          x1={padding}
          y1={yZero}
          x2={svgWidth - padding}
          y2={yZero}
          stroke="#444"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} stroke="#888" strokeWidth="2" />
        <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#888" strokeWidth="2" />
        {/* Dynamic Y-axis labels */}
        <text x={padding - 10} y={padding + 5} textAnchor="end" fontSize="12" fill="#333">
          ${maxProfit}
        </text>
        <text x={padding - 10} y={yZero + 5} textAnchor="end" fontSize="12" fill="#333">
          $0
        </text>
        <text x={padding - 10} y={svgHeight - padding} textAnchor="end" fontSize="12" fill="#333">
          ${minProfit}
        </text>
        {/* Draw line segments */}
        {segments.map((seg, i) => (
          <line
            key={i}
            x1={seg.start.x}
            y1={seg.start.y}
            x2={seg.end.x}
            y2={seg.end.y}
            stroke={seg.color}
            strokeWidth="2"
          />
        ))}
        {/* Data points with static date labels and profit values */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#007BFF" />
            <text x={p.x} y={p.y + 15} textAnchor="middle" fontSize="10" fill="#333">
              {p.date}
            </text>
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="10" fill="#333">
              {p.profit >= 0 ? '+' : ''}${p.profit}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Table component for session history
function HistoryTable({ sessions }) {
  return (
    <table className="history-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Buy-In</th>
          <th>Cash-Out</th>
          <th>Profit</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((s, index) => (
          <tr key={index}>
            <td>{s.date}</td>
            <td>${s.buyIn.toFixed(2)}</td>
            <td>${s.cashOut.toFixed(2)}</td>
            <td className={s.profit >= 0 ? 'profit-positive' : 'profit-negative'}>
              {s.profit >= 0 ? '+' : ''}${s.profit.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PokerProfitTracker() {
  // Provided session data (with computed profit)
  const [sessions, setSessions] = useState([
    { date: '1/6/2025', buyIn: 800, cashOut: 772, profit: 772 - 800 },    // -28
    { date: '1/9/2025', buyIn: 800, cashOut: 1009, profit: 1009 - 800 },   // 209
    { date: '1/23/2025', buyIn: 750, cashOut: 0, profit: 0 - 750 },        // -750
    { date: '1/25/2025', buyIn: 100, cashOut: 790, profit: 790 - 100 },      // 690
    { date: '1/31/2025', buyIn: 1000, cashOut: 1605, profit: 1605 - 1000 }   // 605
  ]);

  const [buyIn, setBuyIn] = useState('');
  const [cashOut, setCashOut] = useState('');

  useEffect(() => {
    document.title = 'Poker Profit Tracker';
  }, []);

  const addSession = (e) => {
    e.preventDefault();
    const bi = parseFloat(buyIn);
    const co = parseFloat(cashOut);
    if (isNaN(bi) || isNaN(co)) return;
    const profit = co - bi;
    const date = new Date().toLocaleDateString();
    const newSession = { date, buyIn: bi, cashOut: co, profit };
    setSessions([...sessions, newSession]);
    setBuyIn('');
    setCashOut('');
  };

  return (
    <div>
      <header>
        <h1>Poker Profit Tracker</h1>
        <p>Track your sessions and visualize your profit and loss over time.</p>
      </header>


      <div className="tracker-card">
        {/* Input Form */}
        <form onSubmit={addSession} className="tracker-form">
          <div className="form-group">
            <label htmlFor="buyIn">Buy-In Price:</label>
            <input
              id="buyIn"
              type="number"
              step="0.01"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cashOut">Cash-Out Price:</label>
            <input
              id="cashOut"
              type="number"
              step="0.01"
              value={cashOut}
              onChange={(e) => setCashOut(e.target.value)}
              required
            />
          </div>
          <button type="submit">Add Session</button>
        </form>

        {/* Graph */}
        <Graph sessions={sessions} />

        {/* History Table */}
        <h3>Session History</h3>
        <HistoryTable sessions={sessions} />

        {/* Analytics Summary */}
        <AnalyticsSummary sessions={sessions} />

        {/* CSV Export Button */}
        <ExportCSVButton sessions={sessions} />

        {/* Total Earnings Card at the bottom */}
        <TotalEarningsCard sessions={sessions} />
      </div>

      <footer>
        <p>&copy; 2025 Poker Profit Tracker. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default PokerProfitTracker;
