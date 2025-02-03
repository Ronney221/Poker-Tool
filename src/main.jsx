import React, { useState } from 'react';
import PokerProfitTracker from './PokerProfitTracker';
import HomeGameSessionTracker from './HomeGameSessionTracker';
import './style.css';

function App() {
  // "profit" and "home" represent the two tabs
  const [activeTab, setActiveTab] = useState("profit");

  return (
    <div className="container">
      <header>
        <h1>Poker Tracker App</h1>
        <nav className="nav-tabs">
          <button 
            className={`tab-button ${activeTab === "profit" ? "active" : ""}`}
            onClick={() => setActiveTab("profit")}
          >
            Profit Tracker
          </button>
          <button 
            className={`tab-button ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Home Game Session
          </button>
        </nav>
      </header>
      
      <main>
        {activeTab === "profit" && <PokerProfitTracker />}
        {activeTab === "home" && <HomeGameSessionTracker />}
      </main>
      
      <footer>
        <p>&copy; 2025 Poker Tracker App. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
