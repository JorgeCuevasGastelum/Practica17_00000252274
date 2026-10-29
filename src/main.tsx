import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.tsx';
import { SesionProvider } from './sesion/SesionContext.tsx';

// BrowserRouter envuelve TODA la app: sin él, Routes, Link y los hooks
// de React Router no tienen de dónde leer la URL.
// SesionProvider también: así cualquier página o el encabezado leen la sesión.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        <App />
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
);
