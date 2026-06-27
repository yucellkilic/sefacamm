'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Giriş başarısız');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Background effects */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,215,0,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-md animate-scale-up">
        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Image
                src="/logo.png"
                alt="Logo"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-text-primary">Admin Panel</h1>
            <p className="text-sm text-text-secondary">Devam etmek için giriş yapın</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error animate-slide-down">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-primary">
                Email Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sefacam@gmail.com"
                  required
                  autoFocus
                  disabled={isLoading}
                  className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-primary">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-lg bg-primary py-3 font-semibold text-background transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-5 w-5" />
                  Giriş Yap
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-text-tertiary">
            Güvenli admin paneli girişi
          </div>
        </div>

        {/* Back to Site Link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-text-secondary transition-colors hover:text-primary"
          >
            ← Siteye Geri Dön
          </a>
        </div>
      </div>
    </div>
  );
}
