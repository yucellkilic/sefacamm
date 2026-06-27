# Design Document: Admin Panel & Cookie Consent

## 1. High-Level Architecture

### 1.1 System Overview

The admin panel is a single-user authentication system integrated into the Next.js application with the following components:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐      ┌──────────────────────────────┐     │
│  │   Public Routes │      │      Admin Routes (/admin)    │     │
│  │   - Blog        │      │  - Dashboard                  │     │
│  │   - About       │      │  - Posts Management           │     │
│  │   - Contact     │      │  - Hero Editor                │     │
│  └─────────────────┘      │  - Subscribers Management     │     │
│                            └──────────────────────────────┘     │
│                                      ↑                           │
│                            ┌─────────┴─────────┐                │
│                            │    Middleware     │                │
│                            │  (Auth Guard)     │                │
│                            └─────────┬─────────┘                │
│                                      ↓                           │
│                            ┌─────────────────┐                  │
│                            │  Auth API       │                  │
│                            │  - /api/auth    │                  │
│                            └─────────────────┘                  │
│                                      ↓                           │
│                            ┌─────────────────┐                  │
│                            │   iron-session  │                  │
│                            │   (JWT + Cookie)│                  │
│                            └─────────────────┘                  │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                        Supabase Database                         │
│  - posts                                                          │
│  - subscribers                                                    │
│  - site_settings (new)                                           │
│  - contact_messages                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Middleware Authentication Flow

```
┌──────────────┐
│ User Request │
│  /admin/*    │
└──────┬───────┘
       │
       ↓
┌──────────────────────────────┐
│   Middleware (Edge Runtime)  │
│                               │
│  1. Extract cookie from req  │
│  2. Verify JWT using jose    │
│  3. Check expiration         │
└──────┬───────────────────────┘
       │
       ├─── Valid Session ────→ Allow Request → Admin Page
       │
       └─── Invalid/Expired ──→ Redirect → /admin/login
```

**Key Points:**
- Middleware runs on Edge Runtime for optimal performance
- Uses `jose` package for JWT signing/verification (Edge-compatible)
- Exempts `/admin/login` and `/admin/api/auth` from validation
- Session cookie is HTTP-only, Secure (in production), SameSite=Lax

### 1.3 API Routes Structure

```
/app/api/
├── auth/
│   ├── login/route.ts       # POST: Validates credentials, creates session
│   └── logout/route.ts      # POST: Destroys session cookie
├── admin/
│   ├── posts/
│   │   ├── route.ts         # GET: List all posts, POST: Create new post
│   │   └── [id]/route.ts    # GET: Get single post, PUT: Update, DELETE: Delete
│   ├── subscribers/
│   │   ├── route.ts         # GET: List all subscribers
│   │   └── [id]/route.ts    # DELETE: Remove subscriber
│   ├── settings/
│   │   └── route.ts         # GET: Fetch settings, PUT: Update hero settings
│   └── stats/
│       └── route.ts         # GET: Dashboard statistics
```

### 1.4 Component Hierarchy

```
app/
├── layout.tsx (root)
│   ├── CookieConsent (client component)
│   └── {children}
│
├── admin/
│   ├── layout.tsx
│   │   ├── AdminSidebar (client component)
│   │   └── {children}
│   │
│   ├── page.tsx (Dashboard)
│   │   ├── StatsCard × 4
│   │   └── QuickActions
│   │
│   ├── login/
│   │   └── page.tsx
│   │       └── LoginForm (client component)
│   │
│   ├── posts/
│   │   ├── page.tsx (Posts List)
│   │   │   ├── PostsTable
│   │   │   └── PostActions (Edit/Delete/Publish)
│   │   ├── new/
│   │   │   └── page.tsx
│   │   │       └── PostForm (client component)
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   │               └── PostForm (pre-filled)
│   │
│   ├── subscribers/
│   │   └── page.tsx
│   │       ├── SubscribersTable
│   │       └── SubscriberActions
│   │
│   └── hero-editor/
│       └── page.tsx
│           └── HeroEditorForm (client component)
```

## 2. Database Schema

### 2.1 New Table: `site_settings`

```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on key
CREATE UNIQUE INDEX idx_site_settings_key ON site_settings(key);

-- Initial hero section data
INSERT INTO site_settings (key, value) VALUES
  ('hero_title', 'Sefa Çam Blog'),
  ('hero_subtitle', 'İçerik Üreticisinin Kişisel Blogu'),
  ('hero_button_text', 'Bloglara Göz At');
```

**Rationale:**
- UUID primary key for uniqueness
- `key` column with UNIQUE constraint prevents duplicates
- `value` stored as TEXT for flexibility
- `updated_at` tracks last modification time
- Supports upsert operations for settings updates

### 2.2 Existing Tables (Reference)

**posts table:**
```sql
posts (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  featured_image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

**subscribers table:**
```sql
subscribers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## 3. Session Management

### 3.1 JWT Structure

```typescript
interface SessionPayload {
  email: string;           // Admin email (sefacam@gmail.com)
  iat: number;             // Issued at timestamp
  exp: number;             // Expiration timestamp (7 days from iat)
}
```

### 3.2 Cookie Configuration

```typescript
const cookieOptions = {
  name: 'admin_session',
  httpOnly: true,                    // Prevent JS access
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'lax' as const,          // CSRF protection
  maxAge: 7 * 24 * 60 * 60,          // 7 days in seconds
  path: '/',
};
```

### 3.3 Session Flow

**Login:**
1. User submits email + password
2. Server validates against env vars (ADMIN_EMAIL, ADMIN_PASSWORD)
3. If valid, create JWT with 7-day expiration using `jose`
4. Set HTTP-only cookie with signed JWT
5. Return success response

**Validation (Middleware):**
1. Extract `admin_session` cookie from request
2. Verify JWT signature using SECRET_KEY
3. Check expiration timestamp
4. If valid, allow request; otherwise redirect to login

**Logout:**
1. Clear `admin_session` cookie
2. Redirect to login page

## 4. Theme Design System

### 4.1 Color Palette (Matching Existing)

```css
/* Admin Panel extends existing theme */
:root {
  /* From globals.css - reused */
  --background: #0a0a0a;
  --surface: #1a1a1a;
  --surface-hover: #2a2a2a;
  --primary: #ffd700;
  --primary-hover: #ffe55c;
  --secondary: #ffc107;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --text-tertiary: #6b7280;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --border: #2a2a2a;
  --shadow-glow: 0 0 20px rgba(255, 215, 0, 0.3);
  
  /* Admin-specific additions */
  --admin-sidebar-bg: #141414;
  --admin-sidebar-hover: #1f1f1f;
  --admin-sidebar-active: #2a2a2a;
  --admin-input-bg: #1a1a1a;
  --admin-input-border: #2a2a2a;
  --admin-input-focus: #ffd700;
}
```

### 4.2 Typography

```css
/* Fonts from existing system */
--font-inter: 'Inter', sans-serif;        /* Body text */
--font-poppins: 'Poppins', sans-serif;    /* Headings */

/* Admin-specific type scale */
.admin-h1 { font-size: 2.5rem; font-weight: 700; font-family: var(--font-poppins); }
.admin-h2 { font-size: 2rem; font-weight: 700; font-family: var(--font-poppins); }
.admin-h3 { font-size: 1.5rem; font-weight: 600; font-family: var(--font-poppins); }
.admin-body { font-size: 1rem; font-family: var(--font-inter); }
.admin-small { font-size: 0.875rem; font-family: var(--font-inter); }
```

### 4.3 Animation Patterns (From Existing System)

```css
/* Reuse existing animations from globals.css */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Admin component animations */
.admin-card {
  animation: scaleUp 0.3s ease-out;
}

.admin-modal {
  animation: fadeIn 0.3s ease-out;
}

.admin-notification {
  animation: slideUp 0.3s ease-out;
}
```

### 4.4 Spacing & Layout

```css
/* Consistent spacing scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */

/* Border radius */
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
```

## 5. Low-Level Design: API Endpoints

### 5.1 Authentication API

#### POST `/api/auth/login`

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  message: "Giriş başarılı";
}
```

**Response (Error - 401):**
```typescript
{
  success: false;
  error: "Geçersiz email veya şifre";
}
```

**Logic:**
1. Extract email and password from request body
2. Compare with `process.env.ADMIN_EMAIL` and `process.env.ADMIN_PASSWORD`
3. If match, create JWT with 7-day expiration
4. Set HTTP-only cookie
5. Return success response

---

#### POST `/api/auth/logout`

**Response (Success - 200):**
```typescript
{
  success: true;
  message: "Çıkış başarılı";
}
```

**Logic:**
1. Clear `admin_session` cookie by setting maxAge to 0
2. Return success response

### 5.2 Dashboard Stats API

#### GET `/api/admin/stats`

**Response (Success - 200):**
```typescript
{
  publishedPosts: number;
  subscribers: number;
  contactMessages: number;
  draftPosts: number;
}
```

**Logic:**
1. Query Supabase: `posts.count({ published: true })`
2. Query Supabase: `subscribers.count()`
3. Query Supabase: `contact_messages.count()`
4. Query Supabase: `posts.count({ published: false })`
5. Return aggregated stats

---

### 5.3 Posts Management API

#### GET `/api/admin/posts`

**Response (Success - 200):**
```typescript
{
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    published: boolean;
    created_at: string;
    updated_at: string;
  }>;
}
```

**Logic:**
1. Query Supabase: `posts.select('*').order('created_at', { ascending: false })`
2. Return all posts (including drafts)

#### POST `/api/admin/posts`

**Request:**
```typescript
{
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  featured_image_url?: string;
  published: boolean;
}
```

**Response (Success - 201):**
```typescript
{
  success: true;
  post: {
    id: string;
    title: string;
    slug: string;
    // ... other post fields
  };
}
```

**Response (Error - 409):**
```typescript
{
  success: false;
  error: "Bu slug zaten kullanılıyor";
}
```

**Logic:**
1. Validate required fields (title, slug, content, category)
2. Check slug uniqueness in Supabase
3. Insert post into Supabase
4. Revalidate `/blog` path using `revalidatePath`
5. Return created post

#### GET `/api/admin/posts/[id]`

**Response (Success - 200):**
```typescript
{
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}
```

**Response (Not Found - 404):**
```typescript
{
  success: false;
  error: "Post bulunamadı";
}
```

---

#### PUT `/api/admin/posts/[id]`

**Request:**
```typescript
{
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  featured_image_url?: string;
  published?: boolean;
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  post: { /* updated post */ };
}
```

**Logic:**
1. Fetch existing post by ID
2. If slug changed, validate uniqueness
3. Update post in Supabase (preserve created_at, update updated_at)
4. Revalidate `/blog` and `/blog/[slug]` paths
5. Return updated post

#### DELETE `/api/admin/posts/[id]`

**Response (Success - 200):**
```typescript
{
  success: true;
  message: "Post silindi";
}
```

**Logic:**
1. Delete post from Supabase by ID
2. Revalidate `/blog` path
3. Return success message

---

### 5.4 Subscribers API

#### GET `/api/admin/subscribers`

**Response (Success - 200):**
```typescript
{
  subscribers: Array<{
    id: string;
    email: string;
    verified: boolean;
    created_at: string;
  }>;
}
```

**Logic:**
1. Query Supabase: `subscribers.select('*').order('created_at', { ascending: false })`
2. Return all subscribers

---

#### DELETE `/api/admin/subscribers/[id]`

**Response (Success - 200):**
```typescript
{
  success: true;
  message: "Abone silindi";
}
```

**Logic:**
1. Delete subscriber from Supabase by ID
2. Return success message

### 5.5 Site Settings API

#### GET `/api/admin/settings`

**Response (Success - 200):**
```typescript
{
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
}
```

**Logic:**
1. Query Supabase: `site_settings.select('key, value').in('key', ['hero_title', 'hero_subtitle', 'hero_button_text'])`
2. Transform array to object: `{ [key]: value }`
3. Return settings object

---

#### PUT `/api/admin/settings`

**Request:**
```typescript
{
  hero_title?: string;
  hero_subtitle?: string;
  hero_button_text?: string;
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  message: "Ayarlar güncellendi";
}
```

**Logic:**
1. For each provided setting key-value pair:
   - Upsert into Supabase: `site_settings.upsert({ key, value, updated_at: now() })`
2. Revalidate `/` (home page)
3. Return success message

## 6. Component Interfaces

### 6.1 Admin Layout Components

#### AdminSidebar

```typescript
// components/admin/AdminSidebar.tsx
'use client';

import { ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface AdminSidebarProps {
  currentPath: string;
}

export default function AdminSidebar({ currentPath }: AdminSidebarProps);
```

**Visual Design:**
- Fixed left sidebar (250px width on desktop)
- Dark background: `--admin-sidebar-bg` (#141414)
- Logo at top
- Navigation items with icons (LayoutDashboard, FileText, Users, Settings, LogOut)
- Active item highlighted with golden left border and background
- Hover state with `--admin-sidebar-hover`

---

#### StatsCard

```typescript
// components/admin/StatsCard.tsx
'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps);
```

**Visual Design:**
- Card with `--surface` background, rounded-xl, border `--border`
- Icon in golden circle top-left
- Large bold number in center
- Label below number
- Optional trend indicator (green/red arrow + percentage)
- Hover: subtle scale effect (1.02)

### 6.2 Form Components

#### LoginForm

```typescript
// components/admin/LoginForm.tsx
'use client';

import { useState } from 'react';

interface LoginFormProps {
  onSuccess: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm({ onSuccess }: LoginFormProps);
```

**Features:**
- Email and password inputs with validation
- Submit button with loading state
- Error message display
- Keyboard Enter submit
- Auto-focus email field

---

#### PostForm

```typescript
// components/admin/PostForm.tsx
'use client';

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image_url: string;
  published: boolean;
}

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => Promise<void>;
  isEdit?: boolean;
}

export default function PostForm({ initialData, onSubmit, isEdit }: PostFormProps);
```

**Features:**
- All post fields with validation
- Slug auto-generation from title (optional)
- Rich text editor for content (react-markdown or similar)
- Image URL input with preview
- Published toggle switch
- Save Draft / Publish buttons
- Loading states during submission

#### HeroEditorForm

```typescript
// components/admin/HeroEditorForm.tsx
'use client';

interface HeroSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
}

interface HeroEditorFormProps {
  initialData: HeroSettings;
  onSubmit: (data: HeroSettings) => Promise<void>;
}

export default function HeroEditorForm({ initialData, onSubmit }: HeroEditorFormProps);
```

---

### 6.3 Table Components

#### PostsTable

```typescript
// components/admin/PostsTable.tsx
'use client';

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  created_at: string;
}

interface PostsTableProps {
  posts: Post[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onTogglePublish: (id: string, currentStatus: boolean) => Promise<void>;
}

export default function PostsTable({ posts, onEdit, onDelete, onTogglePublish }: PostsTableProps);
```

**Visual Design:**
- Table with alternating row colors
- Header row with golden bottom border
- Actions column with icon buttons (Edit, Delete, Publish toggle)
- Status badge (Published/Draft)
- Hover effect on rows
- Responsive: scroll horizontally on mobile

#### SubscribersTable

```typescript
// components/admin/SubscribersTable.tsx
'use client';

interface Subscriber {
  id: string;
  email: string;
  verified: boolean;
  created_at: string;
}

interface SubscribersTableProps {
  subscribers: Subscriber[];
  onDelete: (id: string) => Promise<void>;
}

export default function SubscribersTable({ subscribers, onDelete }: SubscribersTableProps);
```

---

### 6.4 Cookie Consent Component

#### CookieConsent

```typescript
// components/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent();
```

**Implementation Details:**
- Check localStorage for 'cookie-consent' on mount
- If no preference, show banner with slide-up animation
- Banner positioned fixed bottom, full-width, semi-transparent dark surface
- Two buttons: Accept (primary golden), Reject (outline)
- On Accept/Reject: store preference in localStorage, hide banner with fade-out
- Accessible: keyboard navigation, ARIA labels, focus management

**Visual Design:**
- Background: `rgba(26, 26, 26, 0.95)` with backdrop-blur
- Border-top: 1px golden glow
- Padding: 20px
- Max-width content centered
- Buttons side-by-side on desktop, stacked on mobile
- Animation: slideUp 300ms ease-out

## 7. Authentication Logic Pseudocode

### 7.1 Login Flow

```
FUNCTION handleLogin(email, password):
  // Validate input
  IF email is empty OR password is empty:
    RETURN error "Email ve şifre gerekli"
  
  // Check credentials
  IF email !== process.env.ADMIN_EMAIL:
    RETURN error "Geçersiz email veya şifre"
  
  IF password !== process.env.ADMIN_PASSWORD:
    RETURN error "Geçersiz email veya şifre"
  
  // Create JWT
  payload = {
    email: email,
    iat: currentTimestamp,
    exp: currentTimestamp + (7 * 24 * 60 * 60)  // 7 days
  }
  
  token = jwt.sign(payload, process.env.SESSION_SECRET)
  
  // Set cookie
  response.setCookie('admin_session', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  })
  
  RETURN success { message: "Giriş başarılı" }
```

### 7.2 Middleware Session Validation

```
FUNCTION middleware(request):
  path = request.nextUrl.pathname
  
  // Exempt login and auth API routes
  IF path === '/admin/login' OR path.startsWith('/admin/api/auth'):
    RETURN next()
  
  // Check if accessing admin route
  IF path.startsWith('/admin'):
    token = request.cookies.get('admin_session')
    
    IF token is null:
      RETURN redirect('/admin/login')
    
    TRY:
      // Verify JWT using jose
      payload = jwt.verify(token, process.env.SESSION_SECRET)
      
      // Check expiration
      IF payload.exp < currentTimestamp:
        RETURN redirect('/admin/login')
      
      // Valid session
      RETURN next()
      
    CATCH error:
      // Invalid token
      RETURN redirect('/admin/login')
  
  // Not an admin route
  RETURN next()
```

### 7.3 Logout Flow

```
FUNCTION handleLogout():
  // Clear cookie by setting maxAge to 0
  response.setCookie('admin_session', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
  
  RETURN success { message: "Çıkış başarılı" }
```

---

## 8. Data Flow Diagrams

### 8.1 Dashboard Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ GET /admin
       ↓
┌──────────────────┐
│  Middleware      │ ← Validates session
└──────┬───────────┘
       │ Authorized
       ↓
┌──────────────────┐
│  Dashboard Page  │
└──────┬───────────┘
       │ Fetch stats
       ↓
┌──────────────────┐
│  /api/admin/stats│
└──────┬───────────┘
       │ Query DB
       ↓
┌──────────────────┐
│    Supabase      │
│  - posts count   │
│  - subscribers   │
│  - messages      │
└──────┬───────────┘
       │ Return data
       ↓
┌──────────────────┐
│  Dashboard UI    │
│  - StatsCards    │
│  - QuickActions  │
└──────────────────┘
```

### 8.2 Post Creation Data Flow

```
┌─────────────┐
│   Admin UI  │
│  PostForm   │
└──────┬──────┘
       │ Submit form data
       ↓
┌──────────────────────────┐
│  POST /api/admin/posts   │
└──────┬───────────────────┘
       │ 1. Validate data
       │ 2. Check slug uniqueness
       ↓
┌──────────────────┐
│    Supabase      │
│  INSERT post     │
└──────┬───────────┘
       │ 3. Post created
       ↓
┌──────────────────┐
│  revalidatePath  │
│  ('/blog')       │
└──────┬───────────┘
       │ 4. Cache invalidated
       ↓
┌──────────────────┐
│  Return success  │
│  Redirect to     │
│  posts list      │
└──────────────────┘
```

### 8.3 Hero Settings Update Flow

```
┌─────────────┐
│   Admin UI  │
│ HeroEditor  │
└──────┬──────┘
       │ Submit updated values
       ↓
┌──────────────────────────┐
│  PUT /api/admin/settings │
└──────┬───────────────────┘
       │ For each setting
       ↓
┌──────────────────┐
│    Supabase      │
│  UPSERT into     │
│  site_settings   │
└──────┬───────────┘
       │ Settings saved
       ↓
┌──────────────────┐
│  revalidatePath  │
│  ('/')           │
└──────┬───────────┘
       │ Home page cache cleared
       ↓
┌──────────────────┐
│  Return success  │
│  Show toast      │
└──────────────────┘
```

### 8.4 Cookie Consent Flow

```
┌─────────────┐
│   Browser   │
│  Page Load  │
└──────┬──────┘
       │ Check localStorage
       ↓
┌─────────────────────────┐
│  cookie-consent exists? │
└──────┬──────────────────┘
       │
       ├─── YES ──→ Do nothing, banner hidden
       │
       └─── NO ───→ Display banner (slideUp animation)
                    ┌──────────────────┐
                    │  Cookie Banner   │
                    │  [Accept][Reject]│
                    └──────┬───────────┘
                           │
                    ┌──────┴──────┐
                    │             │
             User clicks     User clicks
              Accept          Reject
                │               │
                ↓               ↓
    localStorage.setItem    localStorage.setItem
    ('cookie-consent',      ('cookie-consent',
     'accepted')             'rejected')
                │               │
                └───────┬───────┘
                        │
                  Hide banner
                  (fadeOut 300ms)
```

---

## 9. Cookie Consent Banner Design

### 9.1 Visual Specification

**Position:**
- Fixed to bottom of viewport
- z-index: 9999 (above all content)
- Full width (100vw)

**Colors & Effects:**
- Background: `rgba(26, 26, 26, 0.95)` with `backdrop-blur(12px)`
- Border-top: `1px solid rgba(255, 215, 0, 0.2)`
- Box-shadow: `0 -4px 20px rgba(0, 0, 0, 0.6)`

**Layout:**
- Inner container: max-width 1200px, centered
- Padding: 24px 32px
- Flex layout: text on left, buttons on right (desktop)
- Stack vertically on mobile (<768px)

**Typography:**
- Heading: 16px, font-semibold, text-primary (#ffd700)
- Body text: 14px, font-normal, text-secondary (#9ca3af)
- Link (privacy policy): text-primary with underline on hover

**Buttons:**
- Accept: Primary variant (golden background, black text)
  - Padding: 12px 32px
  - Border-radius: 8px
  - Hover: scale(1.05), shadow-glow
  
- Reject: Outline variant (golden border, transparent bg)
  - Padding: 12px 32px
  - Border-radius: 8px
  - Hover: golden background, black text

**Animation:**
- Enter: slideUp from bottom (300ms ease-out)
- Exit: fadeOut + translateY(100%) (300ms ease-in)

### 9.2 Content

```
Heading: "Çerez Kullanımı"

Body: "Bu site, deneyiminizi geliştirmek için çerezler kullanmaktadır. 
       Siteyi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz. 
       Daha fazla bilgi için [Gizlilik Politikası](/privacy) sayfasını ziyaret edebilirsiniz."

Buttons: [Kabul Et] [Reddet]
```

### 9.3 Accessibility Features

- `role="dialog"` on banner container
- `aria-label="Çerez onayı"` on dialog
- `aria-live="polite"` for screen reader announcements
- Keyboard navigation: Tab between buttons, Enter/Space to activate
- Focus trap while banner is visible
- First button (Accept) receives initial focus

## 10. Admin Panel Layout Design

### 10.1 Sidebar Navigation

**Structure:**
```
┌────────────────────┐
│     LOGO + NAME    │ ← Brand area
├────────────────────┤
│                    │
│  Dashboard    icon │ ← Nav items with icons
│  Posts        icon │
│  Subscribers  icon │
│  Hero Editor  icon │
│  Settings     icon │
│                    │
│  [Spacer]          │
│                    │
│  Logout       icon │ ← Bottom aligned
└────────────────────┘
```

**Dimensions:**
- Width: 250px (desktop), full-width overlay (mobile)
- Height: 100vh, fixed position
- Mobile: Hamburger menu, slide-in sidebar

**Navigation Items:**
```typescript
const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Yazılar', href: '/admin/posts', icon: FileText },
  { label: 'Aboneler', href: '/admin/subscribers', icon: Users },
  { label: 'Hero Editör', href: '/admin/hero-editor', icon: Edit },
  { label: 'Çıkış Yap', href: '#', icon: LogOut, action: 'logout' },
];
```

**Active State:**
- Golden left border (4px)
- Background: `--admin-sidebar-active` (#2a2a2a)
- Text color: `--primary` (#ffd700)
- Icon color: `--primary`

**Hover State:**
- Background: `--admin-sidebar-hover` (#1f1f1f)
- Smooth transition (200ms)

### 10.2 Main Content Area

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Header: Page Title + Action Buttons                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Content Area                                       │
│  - Dashboard: Stats grid + Quick actions            │
│  - Posts: Table + Create button                     │
│  - Form pages: Form centered                        │
│                                                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Dimensions:**
- Margin-left: 250px (to account for sidebar on desktop)
- Padding: 32px
- Max-width: 1400px (for large screens)
- Mobile: Full-width, sidebar overlay

**Page Header:**
- Height: 80px
- Border-bottom: 1px solid `--border`
- Flex layout: title left, actions right
- Title: H1, 32px, font-poppins, bold
- Action buttons: Primary variant, with icons

### 10.3 Responsive Breakpoints

```css
/* Desktop (default) */
@media (min-width: 1024px) {
  .admin-sidebar { position: fixed; width: 250px; }
  .admin-content { margin-left: 250px; }
}

/* Tablet */
@media (max-width: 1023px) {
  .admin-sidebar { transform: translateX(-100%); }
  .admin-sidebar.open { transform: translateX(0); }
  .admin-content { margin-left: 0; }
}

/* Mobile */
@media (max-width: 640px) {
  .admin-content { padding: 16px; }
  .admin-header { flex-direction: column; gap: 16px; }
}
```

## 11. Environment Variables

### Required Environment Variables

```bash
# Admin Authentication
ADMIN_EMAIL=sefacam@gmail.com
ADMIN_PASSWORD=sefa@2026

# Session Secret (minimum 32 characters)
SESSION_SECRET=your-secure-random-secret-min-32-chars

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Node Environment
NODE_ENV=production
```

**Security Notes:**
- `SESSION_SECRET` must be cryptographically random, minimum 32 characters
- Never commit `.env.local` to version control
- Use different `SESSION_SECRET` for each environment (dev, staging, prod)
- Rotate `SESSION_SECRET` periodically

---

## 12. File Structure

```
app/
├── admin/
│   ├── layout.tsx                 # Admin layout with sidebar
│   ├── page.tsx                   # Dashboard
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── posts/
│   │   ├── page.tsx               # Posts list
│   │   ├── new/
│   │   │   └── page.tsx           # Create post
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx       # Edit post
│   ├── subscribers/
│   │   └── page.tsx               # Subscribers list
│   └── hero-editor/
│       └── page.tsx               # Hero section editor
│
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts           # POST login
│   │   └── logout/
│   │       └── route.ts           # POST logout
│   └── admin/
│       ├── stats/
│       │   └── route.ts           # GET dashboard stats
│       ├── posts/
│       │   ├── route.ts           # GET list, POST create
│       │   └── [id]/
│       │       └── route.ts       # GET, PUT, DELETE
│       ├── subscribers/
│       │   ├── route.ts           # GET list
│       │   └── [id]/
│       │       └── route.ts       # DELETE
│       └── settings/
│           └── route.ts           # GET, PUT hero settings
│
├── middleware.ts                  # Auth middleware
│
components/
├── admin/
│   ├── AdminSidebar.tsx           # Navigation sidebar
│   ├── StatsCard.tsx              # Dashboard stat card
│   ├── LoginForm.tsx              # Login form
│   ├── PostForm.tsx               # Post create/edit form
│   ├── PostsTable.tsx             # Posts list table
│   ├── SubscribersTable.tsx       # Subscribers table
│   └── HeroEditorForm.tsx         # Hero editor form
│
└── CookieConsent.tsx              # Cookie consent banner
│
lib/
└── auth/
    └── session.ts                 # Session utilities (JWT sign/verify)
```

## 13. Dependencies

### New Dependencies to Install

```json
{
  "dependencies": {
    "jose": "^5.2.0"              // JWT for Edge Runtime (replaces jsonwebtoken)
  },
  "devDependencies": {
    "@types/react": "^18.2.0"     // Already installed
  }
}
```

**Why `jose`?**
- Compatible with Next.js Edge Runtime (middleware)
- Modern, maintained, secure JWT implementation
- Tree-shakeable, smaller bundle size
- Built-in TypeScript support

---

## 14. Testing Considerations

### 14.1 Manual Testing Checklist

**Authentication:**
- [ ] Login with correct credentials succeeds
- [ ] Login with incorrect credentials fails with error message
- [ ] Session persists across page refreshes
- [ ] Session expires after 7 days
- [ ] Logout clears session and redirects to login
- [ ] Accessing /admin without session redirects to login
- [ ] Middleware allows /admin/login without session

**Dashboard:**
- [ ] Stats display correct counts from database
- [ ] Quick action links navigate to correct pages

**Posts Management:**
- [ ] All posts (published + drafts) display in table
- [ ] Create new post with valid data succeeds
- [ ] Create post with duplicate slug fails with error
- [ ] Edit post updates data correctly
- [ ] Delete post removes from database
- [ ] Publish/unpublish toggle works
- [ ] Cache revalidation works (blog page updates)

**Hero Editor:**
- [ ] Current values load from site_settings table
- [ ] Updating values saves to database
- [ ] Home page revalidates and shows new content
- [ ] Success message displays after save

**Subscribers:**
- [ ] All subscribers display with correct data
- [ ] Delete subscriber removes from database
- [ ] Confirmation prompt appears before deletion

**Cookie Consent:**
- [ ] Banner displays on first visit
- [ ] Banner does not display if preference exists
- [ ] Accept stores 'accepted' in localStorage and hides banner
- [ ] Reject stores 'rejected' in localStorage and hides banner
- [ ] Banner is keyboard accessible (Tab, Enter)
- [ ] Animations are smooth (slideUp, fadeOut)
- [ ] Privacy policy link navigates correctly

### 14.2 Edge Cases

- [ ] Multiple tabs: session works across tabs
- [ ] Session expiration: redirects to login when expired
- [ ] Network errors: display user-friendly error messages
- [ ] Empty states: posts list, subscribers list show empty state UI
- [ ] Long content: text truncation, scroll behavior
- [ ] Mobile: all features work on small screens
- [ ] Concurrent edits: last write wins (acceptable for single-user)

---

## 15. Security Measures

### 15.1 Authentication Security

✅ **HTTP-only cookies** - Prevents XSS attacks from stealing session tokens
✅ **Secure flag** - Cookies only sent over HTTPS in production
✅ **SameSite=Lax** - Prevents CSRF attacks
✅ **JWT expiration** - Sessions automatically expire after 7 days
✅ **Middleware validation** - All admin routes protected at edge
✅ **Environment variables** - Credentials never hardcoded
✅ **Strong secret** - SESSION_SECRET minimum 32 characters

### 15.2 API Security

✅ **Middleware protection** - Admin APIs only accessible with valid session
✅ **Input validation** - All user inputs validated before database operations
✅ **Prepared statements** - Supabase client uses parameterized queries (SQL injection prevention)
✅ **Error handling** - Generic error messages (don't leak system details)

### 15.3 Database Security

✅ **Supabase RLS** - Consider enabling Row Level Security policies
✅ **Unique constraints** - Prevent duplicate slugs/emails
✅ **Type validation** - TypeScript interfaces ensure type safety
✅ **Connection security** - Supabase client uses TLS encryption

### 15.4 Cookie Consent Security

✅ **localStorage only** - No PII stored in cookies without consent
✅ **Client-side only** - Consent preference managed client-side
✅ **Transparent** - Clear explanation of cookie usage
✅ **Revocable** - Users can clear localStorage to reset preference

---

## 16. Performance Optimizations

### 16.1 Next.js Optimizations

✅ **Edge Middleware** - Faster auth validation at edge locations
✅ **Server Components** - Default to server components for admin pages
✅ **Dynamic imports** - Code splitting for admin components
✅ **Cache revalidation** - Selective cache invalidation on content updates

```typescript
// Example: Dynamic import for heavy components
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <Skeleton height={400} />,
});
```

### 16.2 Database Optimizations

✅ **Indexes** - Unique index on site_settings.key for fast lookups
✅ **Select specific fields** - Only query needed columns
✅ **Pagination** - For large datasets (future enhancement)
✅ **Connection pooling** - Supabase handles this automatically

### 16.3 UI Optimizations

✅ **Skeleton states** - Show loading UI while fetching data
✅ **Debouncing** - For search/filter inputs (future)
✅ **Optimistic updates** - Update UI before API confirmation (future)
✅ **Image optimization** - Next.js Image component for post images

## 17. Accessibility (WCAG 2.1 AA Compliance)

### 17.1 Keyboard Navigation

✅ **Tab order** - Logical tab order through all interactive elements
✅ **Focus indicators** - Visible focus rings on all focusable elements
✅ **Keyboard shortcuts** - Enter to submit forms, Escape to close modals
✅ **Skip links** - Skip to main content link (future enhancement)

### 17.2 Screen Reader Support

✅ **Semantic HTML** - Proper heading hierarchy, landmarks
✅ **ARIA labels** - `aria-label` on icon buttons
✅ **ARIA live regions** - Announcements for dynamic content updates
✅ **Form labels** - All inputs have associated labels

### 17.3 Visual Accessibility

✅ **Color contrast** - WCAG AA compliant (4.5:1 for text)
✅ **Text scaling** - UI works at 200% zoom
✅ **Focus visible** - Clear focus indicators
✅ **No color-only indicators** - Use icons + text for status

### 17.4 Cookie Banner Accessibility

```typescript
<div
  role="dialog"
  aria-label="Çerez onayı"
  aria-describedby="cookie-description"
  aria-live="polite"
>
  <p id="cookie-description">{/* Cookie text */}</p>
  <button aria-label="Çerezleri kabul et">Kabul Et</button>
  <button aria-label="Çerezleri reddet">Reddet</button>
</div>
```

---

## 18. Implementation Phases

### Phase 1: Database & Authentication (Priority 1)
1. Create `site_settings` table in Supabase
2. Set up environment variables
3. Implement JWT utilities with `jose`
4. Create login API route
5. Create logout API route
6. Implement middleware for route protection
7. Create login page

**Deliverable:** Working authentication system

### Phase 2: Admin Layout & Dashboard (Priority 1)
1. Create AdminSidebar component
2. Create admin layout with sidebar
3. Create StatsCard component
4. Implement dashboard stats API
5. Create dashboard page

**Deliverable:** Functional admin dashboard

### Phase 3: Posts Management (Priority 1)
1. Create posts list API
2. Create PostsTable component
3. Create posts list page
4. Create PostForm component
5. Implement create post API
6. Create new post page
7. Implement update post API
8. Create edit post page
9. Implement delete post API
10. Add publish/unpublish functionality

**Deliverable:** Complete posts CRUD

### Phase 4: Settings & Subscribers (Priority 2)
1. Create hero settings API (GET/PUT)
2. Create HeroEditorForm component
3. Create hero editor page
4. Create subscribers list API
5. Create SubscribersTable component
6. Create subscribers page
7. Implement delete subscriber API

**Deliverable:** Settings management and subscribers

### Phase 5: Cookie Consent (Priority 2)
1. Create CookieConsent component
2. Integrate into root layout
3. Test localStorage persistence
4. Test animations and accessibility

**Deliverable:** GDPR-compliant cookie banner

### Phase 6: Polish & Testing (Priority 3)
1. Responsive design testing
2. Accessibility audit
3. Security review
4. Performance optimization
5. Error handling improvements
6. Loading states refinement

**Deliverable:** Production-ready admin panel

## 19. Future Enhancements

### Potential Future Features (Out of Scope)

1. **Multi-user support** - Multiple admin accounts with role-based permissions
2. **2FA authentication** - Two-factor authentication for enhanced security
3. **Activity logs** - Audit trail of all admin actions
4. **Draft auto-save** - Periodic auto-saving of post drafts
5. **Image upload** - Direct image uploads to Supabase Storage
6. **Rich text WYSIWYG** - Advanced markdown editor with preview
7. **Post scheduling** - Schedule posts for future publication
8. **Analytics dashboard** - Page views, popular posts, traffic stats
9. **Comment moderation** - Approve/reject comments from admin panel
10. **Bulk actions** - Bulk publish/delete operations
11. **Search & filters** - Search posts by title, filter by category/status
12. **Email templates** - Customize newsletter email templates
13. **SEO management** - Meta tags, Open Graph editor per post
14. **Media library** - Centralized image/media management
15. **Version history** - Track post revisions and rollback

---

## 20. Documentation Links

### Internal References
- [Requirements Document](./requirements.md)
- [Tasks Document](./tasks.md) *(to be created)*

### External Documentation
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [jose JWT Library](https://github.com/panva/jose)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [GDPR Cookie Consent](https://gdpr.eu/cookies/)

---

## 21. Design Approval

This design document is ready for review and approval before proceeding to task breakdown and implementation.

**Key Design Decisions:**
1. ✅ Single-user authentication with JWT sessions
2. ✅ Edge middleware for route protection
3. ✅ Premium dark theme matching existing site design
4. ✅ Supabase for all data persistence
5. ✅ Client-side cookie consent management
6. ✅ Responsive design with mobile support
7. ✅ WCAG AA accessibility compliance
8. ✅ `jose` library for Edge Runtime compatibility

**Next Steps:**
1. Review and approve design document
2. Create tasks.md with detailed implementation tasks
3. Begin Phase 1 implementation (Database & Authentication)
