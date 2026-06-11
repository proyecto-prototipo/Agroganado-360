import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AgroProvider } from './shared/store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AgroProvider>
        <App />
      </AgroProvider>
    </BrowserRouter>
  </React.StrictMode>
);
