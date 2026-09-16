import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

// Detects iOS Safari (where beforeinstallprompt does NOT fire).
const isIos = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
};

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    // Already running as installed iOS app
    if (window.navigator.standalone === true) {
      setInstalled(true);
      return;
    }

    const onBeforeInstall = (e) => {
      // Prevent Chrome's mini-infobar so we can show our own button
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    // iOS: surface a tutorial hint
    if (isIos()) {
      const dismissedFlag = localStorage.getItem('pwa-ios-hint-dismissed') === '1';
      if (!dismissedFlag) setShowIosHint(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  const closeIos = () => {
    setShowIosHint(false);
    setDismissed(true);
    localStorage.setItem('pwa-ios-hint-dismissed', '1');
  };

  if (installed) return null;

  // Android / Chrome / Edge — show install button whenever event is available
  if (deferredPrompt && !dismissed) {
    return (
      <div className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <button
          onClick={install}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 transition text-white px-5 py-3 rounded-full shadow-lg shadow-brand-600/40 font-semibold text-sm"
          aria-label="Install app"
        >
          <Download className="h-4 w-4" />
          Install App
        </button>
      </div>
    );
  }

  // iOS — show one-time hint card with instructions
  if (showIosHint) {
    return (
      <div className="lg:hidden fixed inset-x-3 bottom-24 z-50 animate-slide-up">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Install Pharma Sales
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Tap the <strong className="font-semibold">Share button</strong> below, then choose{' '}
                <strong className="font-semibold">Add to Home Screen</strong>.
              </p>
            </div>
            <button
              onClick={closeIos}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
