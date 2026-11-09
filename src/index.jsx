import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './desing/Global.css';
import { App } from './routes/routes.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
