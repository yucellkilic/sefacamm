'use client';

import { useEffect, useState } from 'react';
import { Edit, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface HeroSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
}

export default function HeroEditorPage() {
  const [settings, setSettings] = useState<HeroSettings>({
    hero_title: '',
    hero_subtitle: '',
    hero_button_text: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setSettings({
        hero_title: data.hero_title || '',
        hero_subtitle: data.hero_subtitle || '',
        hero_button_text: data.hero_button_text || '',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Ayarlar yüklenemedi' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla güncellendi! ✓' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Ayarlar kaydedilemedi' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-text-primary">
          <Edit className="h-8 w-8 text-primary" />
          Hero Editör
        </h1>
        <p className="text-text-secondary">Ana sayfa hero bölümünü düzenleyin</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg border p-4 animate-slide-down ${
            message.type === 'success'
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-error/30 bg-error/10 text-error'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hero Title */}
          <div>
            <label htmlFor="hero_title" className="mb-2 block text-sm font-medium text-text-primary">
              Hero Başlık
            </label>
            <input
              type="text"
              id="hero_title"
              value={settings.hero_title}
              onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
              placeholder="Sefa Çam"
              maxLength={100}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              {settings.hero_title.length}/100 karakter
            </p>
          </div>

          {/* Hero Subtitle */}
          <div>
            <label htmlFor="hero_subtitle" className="mb-2 block text-sm font-medium text-text-primary">
              Hero Alt Başlık
            </label>
            <input
              type="text"
              id="hero_subtitle"
              value={settings.hero_subtitle}
              onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
              placeholder="İçerik Üreticisi · YouTuber · Blogger"
              maxLength={200}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              {settings.hero_subtitle.length}/200 karakter
            </p>
          </div>

          {/* Hero Button Text */}
          <div>
            <label htmlFor="hero_button_text" className="mb-2 block text-sm font-medium text-text-primary">
              Buton Metni
            </label>
            <input
              type="text"
              id="hero_button_text"
              value={settings.hero_button_text}
              onChange={(e) => setSettings({ ...settings, hero_button_text: e.target.value })}
              placeholder="Blog Yazıları"
              maxLength={30}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              {settings.hero_button_text.length}/30 karakter
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 border-t border-border pt-6">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={isSaving}
              className="rounded-lg border border-border px-6 py-3 font-medium text-text-secondary transition-all hover:bg-surface-hover disabled:opacity-50"
            >
              Sıfırla
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-background transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview */}
      <div className="mt-8 rounded-xl border border-border bg-surface p-8">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Önizleme</h2>
        <div className="rounded-lg border border-border bg-background p-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-primary">{settings.hero_title || 'Başlık'}</h1>
          <p className="mb-6 text-lg text-text-secondary">
            {settings.hero_subtitle || 'Alt başlık'}
          </p>
          <button className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-background">
            {settings.hero_button_text || 'Buton'}
          </button>
        </div>
      </div>
    </div>
  );
}
