import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, I18nProvider, embedApi } from '@core/index';
import './styles.css';

embedApi.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
