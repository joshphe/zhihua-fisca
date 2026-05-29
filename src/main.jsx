import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { DataProvider } from './context/DataContext';
import { UserProvider } from './context/UserContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <DataProvider>
        <App />
        <Analytics />
      </DataProvider>
    </UserProvider>
  </React.StrictMode>
);
