import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {App} from './routes/routes'
import './desing/Global.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);