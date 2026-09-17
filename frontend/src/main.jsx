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
      refetchOnWindowFocus: true,   // refetch when user returns to a tab
      refetchOnReconnect: true,     // refetch when network reconnects
      refetchOnMount: true,         // refetch if data might be stale
      staleTime: 0,                 // always treat data as potentially stale so mutations show up immediately
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Service worker: register in production; on localhost dev, unregister any
// pre-existing production SW so HMR is never shadowed by a stale cached shell.
const isLocalhost =
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

if ('serviceWorker' in navigator) {
  // 1) Dev: ensure no production SW from a prior deploy is intercepting fetches.
  if (import.meta.env.DEV || isLocalhost) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    // Also clear caches that might be holding stale app-shell HTML.
    if (window.caches?.keys) {
      window.caches.keys().then((keys) => keys.forEach((k) => window.caches.delete(k)));
    }
  }

  // 2) Production: register with autoUpdate.
  if (!import.meta.env.DEV) {
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
