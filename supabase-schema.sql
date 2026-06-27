-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Authors table
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  faq_schema JSONB,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post-Tags junction table
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscribers table
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(is_published, published_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);

-- Enable Row Level Security
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts (public can read published, authenticated can write)
CREATE POLICY "Public can view published posts" ON posts
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Authenticated users can insert posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update posts" ON posts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete posts" ON posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for authors (public read)
CREATE POLICY "Public can view authors" ON authors
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can manage authors" ON authors
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for categories (public read)
CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can manage categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for tags (public read)
CREATE POLICY "Public can view tags" ON tags
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can manage tags" ON tags
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for post_tags
CREATE POLICY "Public can view post_tags" ON post_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can manage post_tags" ON post_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for comments (public can insert, authenticated can moderate)
CREATE POLICY "Public can view approved comments" ON comments
  FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Public can insert comments" ON comments
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can manage comments" ON comments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete comments" ON comments
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for subscribers (public can subscribe, no one can read)
CREATE POLICY "Public can subscribe" ON subscribers
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can view subscribers" ON subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for settings
CREATE POLICY "Public can view settings" ON settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can manage settings" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for messages (public can insert, authenticated can manage)
CREATE POLICY "Public can insert messages" ON messages
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can view messages" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete messages" ON messages
  FOR DELETE USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
