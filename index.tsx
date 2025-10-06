import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';

const main = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </React.StrictMode>
  );
};

// Wait for the DOM to be fully loaded before running the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  // The DOM is already ready
  main();
}
