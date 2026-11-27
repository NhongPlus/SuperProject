import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css';
import { theme } from './theme';
import { MantineProvider } from '@mantine/core';
// Phông chữ tự lưu trữ: Cormorant Garamond (tiêu đề) và Be Vietnam Pro (thân bài), có tiếng Việt
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import './styles/global.css';
import App from './App';
import { ErrorBoundary } from './pages/exception/ErrorBoundary';
import '@mantine/dates/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>,
);