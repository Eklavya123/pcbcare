import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './global.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// NOTE: previously wrapped in <AuthProvider> from './firebase' — that
// provider's useAuth()/AuthContext were never consumed anywhere in the
// app, and its useEffect ran an env-var-based Firebase init that crashed
// the whole tree with auth/invalid-api-key (no error boundary above it).
// The app's real auth flow is self-contained in App.js (script-tag-loaded
// window.firebase with a working hardcoded config) and needs none of this.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
