import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Register the service worker (Workbox). Prompts the user when a new version is available.
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span>A new version is available.</span>
            <button
              className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
              onClick={() => {
                updateSW(true);
                toast.dismiss(t.id);
              }}
            >
              Reload
            </button>
          </div>
        ),
        { duration: Infinity, id: 'pwa-update' }
      );
    },
    onOfflineReady() {
      toast.success('App is ready to work offline', { duration: 3000 });
    },
    onRegisterError(err) {
      console.warn('SW registration failed:', err);
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                className:
                  '!bg-white !text-slate-800 dark:!bg-slate-800 dark:!text-slate-100 !border !border-slate-200 dark:!border-slate-700',
                duration: 3500,
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
