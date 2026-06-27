'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    handleClose();
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    handleClose();
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Çerez onayı"
      aria-describedby="cookie-description"
      aria-live="polite"
      className={`fixed inset-x-0 bottom-0 z-[9999] transition-all duration-300 ${
        isExiting
          ? 'translate-y-full opacity-0'
          : 'translate-y-0 opacity-100 animate-slide-up'
      }`}
    >
      {/* Banner Container */}
      <div
        className="border-t border-primary/20 bg-[rgba(26,26,26,0.95)] shadow-[0_-4px_20px_rgba(0,0,0,0.6)]"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="container mx-auto max-w-7xl px-6 py-6 sm:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Content */}
            <div className="flex flex-1 items-start gap-4">
              <div className="hidden flex-shrink-0 rounded-lg bg-primary/10 p-3 sm:block">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-base font-semibold text-primary">Çerez Kullanımı</h3>
                <p id="cookie-description" className="text-sm leading-relaxed text-text-secondary">
                  Bu site, deneyiminizi geliştirmek için çerezler kullanmaktadır. Siteyi
                  kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz. Daha fazla
                  bilgi için{' '}
                  <Link
                    href="/privacy"
                    className="underline transition-colors hover:text-primary"
                  >
                    Gizlilik Politikası
                  </Link>{' '}
                  sayfasını ziyaret edebilirsiniz.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                onClick={handleReject}
                aria-label="Çerezleri reddet"
                className="rounded-lg border-2 border-primary/40 bg-transparent px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary hover:text-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                Reddet
              </button>
              <button
                onClick={handleAccept}
                aria-label="Çerezleri kabul et"
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-background shadow-lg transition-all hover:scale-105 hover:bg-primary-hover hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                Kabul Et
              </button>
            </div>
          </div>

          {/* Close Button (Mobile) */}
          <button
            onClick={handleClose}
            aria-label="Bildirimi kapat"
            className="absolute right-4 top-4 rounded-lg p-1 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
