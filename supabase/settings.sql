-- Admin Panel için gerekli tablolar ve konfigürasyonlar

-- ============================================
-- 1. Site Settings Table (Hero editor için)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster key lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Initial hero section data
INSERT INTO site_settings (key, value) VALUES
  ('hero_title', 'Sefa Çam'),
  ('hero_subtitle', 'İçerik Üreticisi · YouTuber · Blogger'),
  ('hero_button_text', 'Blog Yazıları')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. Updated_at trigger function (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Apply trigger to site_settings
-- ============================================
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Verify posts table has required columns
-- ============================================
-- Add is_published column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add category column as TEXT (simple string category)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'category'
  ) THEN
    ALTER TABLE posts ADD COLUMN category TEXT DEFAULT 'Genel';
  END IF;
END $$;

-- Apply trigger to posts table
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Messages table (if contact_messages doesn't exist)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- 6. Row Level Security Policies (Optional)
-- ============================================
-- Enable RLS on site_settings (if you want extra security)
-- ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
-- CREATE POLICY "Service role can do anything" ON site_settings
--   FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- ============================================
-- 7. Grants (ensure proper permissions)
-- ============================================
-- Grant permissions to authenticated and service roles
GRANT ALL ON site_settings TO postgres, anon, authenticated, service_role;
GRANT ALL ON messages TO postgres, anon, authenticated, service_role;

-- ============================================
-- 8. Sample data for testing (optional)
-- ============================================
-- Uncomment if you want some test posts
-- INSERT INTO posts (title, slug, excerpt, content, category, featured_image_url, is_published) VALUES
--   ('İlk Blog Yazım', 'ilk-blog-yazim', 'Bu benim ilk blog yazım', '# Merhaba\n\nBu benim ilk blog yazım.', 'Genel', null, true),
--   ('Taslak Yazı', 'taslak-yazi', 'Bu bir taslak', '# Taslak\n\nBu henüz yayınlanmadı.', 'Teknoloji', null, false)
-- ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- BAŞARILI! ✓
-- ============================================
-- Tabloları oluşturmak için bu SQL dosyasını
-- Supabase SQL Editor'da çalıştırın.
-- ============================================
