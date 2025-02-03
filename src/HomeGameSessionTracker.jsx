import React, { useState } from 'react';
import './style.css';

function HomeGameSessionTracker() {
  // State to hold players
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [settlements, setSettlements] = useState([]);

  // Add a new player with a default emoji avatar (🃏)
  const addPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName) return;
    const newPlayer = {
      id: Date.now(),
      name: newPlayerName,
      avatar: "🃏", // default emoji avatar
      buyIns: [],
      cashOut: 0,
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    // Clear any previous settlement results
    setSettlements([]);
  };

  // Add a buy-in for a specific player
  const addBuyIn = (playerId, amount) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId
          ? { ...player, buyIns: [...player.buyIns, parseFloat(amount)] }
          : player
      )
    );
    setSettlements([]);
  };

  // Update a player's cash-out amount
  const updateCashOut = (playerId, amount) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId ? { ...player, cashOut: parseFloat(amount) } : player
      )
    );
    setSettlements([]);
  };

  // Calculate overall totals
  const totalBuyInAll = players.reduce(
    (sum, player) => sum + player.buyIns.reduce((acc, a) => acc + a, 0),
    0
  );
  const totalCashOutAll = players.reduce((sum, player) => sum + player.cashOut, 0);

  // Settlement Calculation Function
  // For each player, net = cashOut - totalBuyIn.
  // Negative net: owes money; positive net: should receive money.
  function calculateSettlements() {
    const settlementsList = [];
    // Build an array of net values with player info
    let nets = players.map(player => ({
      id: player.id,
      name: player.name,
      net: player.cashOut - player.buyIns.reduce((sum, a) => sum + a, 0)
    }));

    // Separate into creditors (net > 0) and debtors (net < 0)
    let creditors = nets.filter(p => p.net > 0);
    let debtors = nets.filter(p => p.net < 0);

    // Sort creditors descending and debtors ascending (by net)
    creditors.sort((a, b) => b.net - a.net);
    debtors.sort((a, b) => a.net - b.net);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(creditor.net, -debtor.net);
      settlementsList.push({
        from: debtor.name,
        to: creditor.name,
        amount: amount
      });
      // Update net values
      creditor.net -= amount;
      debtor.net += amount;
      if (Math.abs(creditor.net) < 0.01) {
        j++;
      }
      if (Math.abs(debtor.net) < 0.01) {
        i++;
      }
    }
    return settlementsList;
  }

  const handleCalculateSettlements = () => {
    const result = calculateSettlements();
    setSettlements(result);
  };

  return (
    <div className="home-game-session">
      <h1>Home Game Poker Session Tracker</h1>
      <form onSubmit={addPlayer} className="add-player-form">
        <input
          type="text"
          placeholder="Player Name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          required
        />
        <button type="submit">Add Player</button>
      </form>

      <div className="players-list">
        {players.map((player) => {
          const totalBuyIn = player.buyIns.reduce((sum, a) => sum + a, 0);
          const winLoss = player.cashOut - totalBuyIn;
          return (
            <div key={player.id} className="player-card">
              <div className="player-header">
                <div className="default-avatar">{player.avatar}</div>
                <h2>{player.name}</h2>
              </div>
              <div className="buy-ins">
                <h3>Buy-Ins</h3>
                {player.buyIns.length === 0 ? (
                  <p className="no-buyins">No buy-ins yet</p>
                ) : (
                  <ul>
                    {player.buyIns.map((amount, index) => (
                      <li key={index}>Buy-In {index + 1}: ${amount.toFixed(2)}</li>
                    ))}
                  </ul>
                )}
                <AddBuyInForm playerId={player.id} addBuyIn={addBuyIn} />
              </div>
              <div className="cash-out">
                <label>
                  Cash Out:
                  <input
                    type="number"
                    step="0.01"
                    value={player.cashOut}
                    onChange={(e) => updateCashOut(player.id, e.target.value)}
                  />
                </label>
              </div>
              <div className="player-summary">
                <p>Total Buy-In: ${totalBuyIn.toFixed(2)}</p>
                <p>Cash Out: ${player.cashOut.toFixed(2)}</p>
                <p>{winLoss >= 0 ? 'Win' : 'Loss'}: ${Math.abs(winLoss).toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overall-summary card">
        <h2>Overall Session Summary</h2>
        <p>Total Buy-In: ${totalBuyInAll.toFixed(2)}</p>
        <p>Total Cash Out: ${totalCashOutAll.toFixed(2)}</p>
        {totalBuyInAll === totalCashOutAll ? (
          <p>Buy-In matches Cash Out</p>
        ) : (
          <p>Discrepancy: ${Math.abs(totalCashOutAll - totalBuyInAll).toFixed(2)}</p>
        )}
      </div>

      <div className="settlement-section">
        <button className="settlement-btn" onClick={handleCalculateSettlements}>
          Calculate Settlements
        </button>
        {settlements.length > 0 && (
          <div className="settlement-card card">
            <h2>Settlement Transactions</h2>
            <ul>
              {settlements.map((s, index) => (
                <li key={index}>
                  {s.from} pays {s.to}: ${s.amount.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function AddBuyInForm({ playerId, addBuyIn }) {
  const [buyInAmount, setBuyInAmount] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    addBuyIn(playerId, buyInAmount);
    setBuyInAmount('');
  };
  return (
    <form onSubmit={handleSubmit} className="add-buyin-form">
      <input
        type="number"
        step="0.01"
        placeholder="Buy-In Amount"
        value={buyInAmount}
        onChange={(e) => setBuyInAmount(e.target.value)}
        required
      />
      <button type="submit">Add Buy-In</button>
    </form>
  );
}

export default HomeGameSessionTracker;
