import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // Removing React.StrictMode to prevent double-renders of Socket connections in dev mode, 
  // which can cause issues with timer events during development.
  <App />
);
