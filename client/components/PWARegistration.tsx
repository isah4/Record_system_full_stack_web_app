"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Bell } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true ||
                        window.location.search.includes('standalone=true');
    
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('🎉 Install prompt triggered!');
      console.log('Event details:', e);
      console.log('Platforms:', (e as any).platforms);
      console.log('User engagement level:', navigator.userActivation?.hasBeenActive);
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Debug logging
    console.log('PWA Registration: Checking browser capabilities...');
    console.log('Service Worker support:', 'serviceWorker' in navigator);
    console.log('BeforeInstallPrompt support:', 'BeforeInstallPromptEvent' in window);
    console.log('Display mode:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('User agent:', navigator.userAgent);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline events
    const handleOnline = () => {
      // App is back online
    };

    const handleOffline = () => {
      // App is offline
    };

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (confirm('A new version of BizTracker is available. Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      setShowNotificationPrompt(true);
    }

    // Fallback: Show install prompt after a delay if no beforeinstallprompt event
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && 'serviceWorker' in navigator) {
        console.log('Showing fallback install prompt');
        setShowInstallPrompt(true);
      }
    }, 3000);

    // Check if user has engaged with the page
    const checkUserEngagement = () => {
      if (navigator.userActivation?.hasBeenActive) {
        console.log('✅ User has engaged with the page');
        // Force check for install prompt
        if (deferredPrompt) {
          console.log('🎯 Install prompt available after user engagement');
          setShowInstallPrompt(true);
        }
      }
    };

    // Listen for user interaction
    document.addEventListener('click', checkUserEngagement, { once: true });
    document.addEventListener('scroll', checkUserEngagement, { once: true });
    document.addEventListener('touchstart', checkUserEngagement, { once: true });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('click', checkUserEngagement);
      document.removeEventListener('scroll', checkUserEngagement);
      document.removeEventListener('touchstart', checkUserEngagement);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } else {
      // Fallback: Show manual installation instructions
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let message = '';
    if (isIOS) {
      message = 'To install: Tap the share button (📤) and select "Add to Home Screen"';
    } else if (isAndroid) {
      message = 'To install: Tap the menu (⋮) and select "Add to Home Screen" or "Install app"';
    } else {
      message = 'To install: Look for the install button in your browser\'s address bar or menu';
    }
    
    alert(message);
    setShowInstallPrompt(false);
  };

  // Force trigger the beforeinstallprompt if available
  const forceInstallPrompt = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      showManualInstallInstructions();
    }
  };

  const handleNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setShowNotificationPrompt(false);
      // Show welcome notification
      new Notification('Welcome to BizTracker!', {
        body: 'You\'ll now receive important business updates and reminders.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
      });
    }
  };

  // Don't show anything if app is already installed
  if (isInstalled) return null;

  // Show manual install button if no automatic prompt
  const showManualInstall = !deferredPrompt && !showInstallPrompt;

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Install BizTracker</h3>
              <p className="text-sm text-slate-600">Add to home screen for quick access</p>
            </div>
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              Install
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInstallPrompt(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Notification Permission Prompt */}
      {showNotificationPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Enable Notifications</h3>
              <p className="text-sm text-slate-600">Get important business updates and reminders</p>
            </div>
            <Button
              onClick={handleNotificationPermission}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            >
              Enable
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotificationPrompt(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Manual Install Button - Always visible for better UX */}
      {showManualInstall && (
        <div className="fixed bottom-20 left-4 right-4 z-[9999]">
          <Button
            onClick={forceInstallPrompt}
            size="sm"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Install BizTracker
          </Button>
        </div>
      )}
    </>
  );
}
