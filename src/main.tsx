import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, I18nProvider, ErrorBoundary, embedApi } from '@core/index';
import './styles.css';

embedApi.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
