import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './main.jsx'; // Ensure correct path if "main.jsx" is your main component
import './style.css'; // Ensure styles are loaded

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
