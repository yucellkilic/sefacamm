# Tasks: Admin Panel & Cookie Consent

## Overview

This document breaks down the implementation of the Admin Panel and Cookie Consent feature into actionable tasks organized by the 6 phases defined in the design document. Each task includes specific file paths, dependencies, and acceptance criteria.

**Total Estimated Tasks: 48**

## Task Status Legend

- `[ ]` - Not started
- `[x]` - Completed
- `[~]` - In progress
- `[-]` - Blocked

---

## Phase 1: Database & Authentication (Priority 1)

**Goal:** Establish the authentication foundation with database setup, JWT session management, and protected routes.

**Dependencies:** None (foundational phase)

### 1.1 Database Setup

- [ ] **1.1.1** Create `site_settings` table in Supabase
  - **Files:** Supabase Dashboard (SQL Editor)
  - **Dependencies:** None
  - **Acceptance Criteria:**
    - Table created with columns: `id` (UUID), `key` (TEXT UNIQUE), `value` (TEXT), `updated_at` (TIMESTAMP)
    - Unique index on `key` column exists
    - Initial data inserted for hero section (hero_title, hero_subtitle, hero_button_text)
    - Verify with SQL query: `SELECT * FROM site_settings;`
  - **Reference:** Design Doc Section 2.1

- [ ] **1.1.2** Set up environment variables
  - **Files:** `.env.local`
  - **Dependencies:** None
  - **Acceptance Criteria:**
    - `ADMIN_EMAIL` set to `sefacam@gmail.com`
    - `ADMIN_PASSWORD` set to `sefa@2026`
    - `SESSION_SECRET` generated (minimum 32 characters, cryptographically random)
    - All Supabase variables already exist (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
    - `.env.example` updated with new variables (without sensitive values)
  - **Reference:** Design Doc Section 11

### 1.2 Install Dependencies

- [ ] **1.2.1** Install `jose` package for JWT handling
  - **Files:** `package.json`, `package-lock.json`
  - **Dependencies:** None
  - **Acceptance Criteria:**
    - Run: `npm install jose`
    - Version `^5.2.0` or later installed
    - Package appears in `dependencies` section of `package.json`
  - **Reference:** Design Doc Section 13

### 1.3 Session Utilities

- [ ] **1.3.1** Create session utility functions
  - **Files:** `lib/auth/session.ts` (create new)
  - **Dependencies:** 1.2.1 (jose package)
  - **Acceptance Criteria:**
    - `signToken(email: string): Promise<string>` - Creates JWT with 7-day expiration
    - `verifyToken(token: string): Promise<SessionPayload | null>` - Verifies JWT and checks expiration
    - `SessionPayload` interface defined with `email`, `iat`, `exp` fields
    - Uses `process.env.SESSION_SECRET` for signing/verification
    - Error handling for invalid tokens
  - **Reference:** Design Doc Section 3, Section 7.1

### 1.4 Authentication API Routes

- [ ] **1.4.1** Create login API route
  - **Files:** `app/api/auth/login/route.ts` (create new)
  - **Dependencies:** 1.3.1 (session utilities)
  - **Acceptance Criteria:**
    - POST endpoint accepts `{ email: string, password: string }` JSON body
    - Validates credentials against `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars
    - Returns 401 with error message if credentials invalid
    - On success: signs JWT, sets HTTP-only cookie `admin_session`, returns 200
    - Cookie options: `httpOnly: true`, `secure: production`, `sameSite: lax`, `maxAge: 7 days`
    - Test with curl/Postman: valid and invalid credentials
  - **Reference:** Design Doc Section 5.1, Section 7.1

- [ ] **1.4.2** Create logout API route
  - **Files:** `app/api/auth/logout/route.ts` (create new)
  - **Dependencies:** None
  - **Acceptance Criteria:**
    - POST endpoint clears `admin_session` cookie by setting `maxAge: 0`
    - Returns 200 with success message
    - Test: verify cookie deleted after logout request
  - **Reference:** Design Doc Section 5.1, Section 7.3

### 1.5 Middleware Protection

- [ ] **1.5.1** Create authentication middleware
  - **Files:** `middleware.ts` (create new in project root)
  - **Dependencies:** 1.3.1 (session utilities)
  - **Acceptance Criteria:**
    - Runs on Edge Runtime (`export const config = { runtime: 'edge' }`)
    - Matches `/admin/*` paths (except `/admin/login` and `/admin/api/auth/*`)
    - Extracts `admin_session` cookie from request
    - Verifies JWT using `verifyToken` utility
    - Redirects to `/admin/login` if token missing, invalid, or expired
    - Allows request to proceed if token valid
    - Test: access `/admin` without cookie (should redirect), with valid cookie (should allow)
  - **Reference:** Design Doc Section 1.2, Section 7.2

### 1.6 Login Page

- [ ] **1.6.1** Create LoginForm component
  - **Files:** `components/admin/LoginForm.tsx` (create new)
  - **Dependencies:** None
  - **Acceptance Criteria:**
    - Client component (`'use client'`)
    - Email and password input fields with validation
    - Submit button with loading state
    - Error message display for failed login attempts
    - Calls `/api/auth/login` on submit
    - On success, redirects to `/admin` dashboard
    - Auto-focus email field on mount
    - Keyboard Enter submits form
    - Dark theme styling matching design system
  - **Reference:** Design Doc Section 6.2, Requirements 1

- [ ] **1.6.2** Create login page
  - **Files:** `app/admin/login/page.tsx` (create new)
  - **Dependencies:** 1.6.1 (LoginForm component)
  - **Acceptance Criteria:**
    - Server component that renders `LoginForm`
    - Centered layout with dark background
    - Logo/branding at top
    - Form card with border and shadow
    - Metadata set (title: "Admin Giriş")
    - Test: navigate to `/admin/login`, verify form displays
  - **Reference:** Design Doc Section 1.4, Section 6.2

---

## Phase 2: Admin Layout & Dashboard (Priority 1)

**Goal:** Build the admin panel structure with sidebar navigation and a functional dashboard showing site statistics.

**Dependencies:** Phase 1 completed (authentication working)

### 2.1 Admin Layout Components

- [ ] **2.1.1** Create AdminSidebar component
  - **Files:** `components/admin/AdminSidebar.tsx` (create new)
  - **Dependencies:** Phase 1 (authentication)
  - **Acceptance Criteria:**
    - Client component with navigation items: Dashboard, Yazılar, Aboneler, Hero Editör, Çıkış Yap
    - Icons from `lucide-react`: LayoutDashboard, FileText, Users, Edit, LogOut
    - Active item highlighted with golden left border (4px) and background
    - Hover state with `--admin-sidebar-hover` background
    - Fixed position, 250px width on desktop, 100vh height
    - Dark background (`--admin-sidebar-bg`: #141414)
    - Logout button calls `/api/auth/logout` and redirects to `/admin/login`
    - Logo/brand area at top
    - Responsive: slide-in overlay on mobile (<1024px)
  - **Reference:** Design Doc Section 6.1, Section 10.1

- [ ] **2.1.2** Create admin layout
  - **Files:** `app/admin/layout.tsx` (create new)
  - **Dependencies:** 2.1.1 (AdminSidebar)
  - **Acceptance Criteria:**
    - Server component wrapping all `/admin/*` pages (except login)
    - Renders `AdminSidebar` with current path prop
    - Main content area with `margin-left: 250px` on desktop
    - Responsive layout: full-width on mobile
    - Dark theme background
    - Metadata set for admin pages
  - **Reference:** Design Doc Section 1.4, Section 10.2

### 2.2 Dashboard Statistics

- [ ] **2.2.1** Create dashboard stats API
  - **Files:** `app/api/admin/stats/route.ts` (create new)
  - **Dependencies:** Phase 1 (authentication)
  - **Acceptance Criteria:**
    - GET endpoint protected by middleware
    - Queries Supabase for:
      - `publishedPosts`: count of posts where `published = true`
      - `draftPosts`: count of posts where `published = false`
      - `subscribers`: count of all subscribers
      - `contactMessages`: count of all contact_messages (if table exists)
    - Returns JSON: `{ publishedPosts, draftPosts, subscribers, contactMessages }`
    - Error handling for database failures
  - **Reference:** Design Doc Section 5.2, Requirements 3

- [ ] **2.2.2** Create StatsCard component
  - **Files:** `components/admin/StatsCard.tsx` (create new)
  - **Dependencies:** None
  - **Acceptance Criteria:**
    - Props: `title: string`, `value: number | string`, `icon: LucideIcon`
    - Dark card with `--surface` background, rounded-xl border
    - Icon in golden circle top-left
    - Large bold number centered
    - Label below number
    - Hover effect: scale(1.02) transition
    - Animation: scaleUp 300ms ease-out on mount
  - **Reference:** Design Doc Section 6.1, Section 4.3

- [ ] **2.2.3** Create dashboard page
  - **Files:** `app/admin/page.tsx` (create new)
  - **Dependencies:** 2.2.1 (stats API), 2.2.2 (StatsCard)
  - **Acceptance Criteria:**
    - Server component fetching data from `/api/admin/stats`
    - Grid layout with 4 StatsCards: Yayınlanan Yazılar, Taslaklar, Aboneler, Mesajlar
    - Quick actions section with links: Yeni Yazı, Yazıları Yönet, Aboneleri Yönet
    - Page title: "Dashboard"
    - Responsive: 2 columns on mobile, 4 on desktop
    - Loading state with skeleton cards
  - **Reference:** Design Doc Section 1.4, Requirements 3

---

## Phase 3: Posts Management (Priority 1)

**Goal:** Implement full CRUD operations for blog posts including create, read, update, delete, and publish/unpublish.

**Dependencies:** Phase 2 completed (admin layout exists)

### 3.1 Posts List

- [ ] **3.1.1** Create posts list API
  - **Files:** `app/api/admin/posts/route.ts` (create new for GET)
  - **Dependencies:** Phase 1 (authentication)
  - **Acceptance Criteria:**
    - GET endpoint returns all posts (published + drafts)
    - Ordered by `created_at DESC` (newest first)
    - Returns array with fields: id, title, slug, category, published, created_at, updated_at
    - Error handling for database failures
  - **Reference:** Design Doc Section 5.3, Requirements 5

- [ ] **3.1.2** Create PostsTable component
  - **Files:** `components/admin/PostsTable.tsx` (create new)
  - **Dependencies:** None
  - **Acceptance Criteria:**
    - Client component (`'use client'`)
    - Props: `posts`, `onEdit`, `onDelete`, `onTogglePublish` callbacks
    - Table columns: Title, Slug, Category, Status, Created Date, Actions
    - Status badge: green "Yayında" or gray "Taslak"
    - Actions: Edit (pencil icon), Delete (trash icon), Publish/Unpublish (toggle)
    - Alternating row colors for readability
    - Hover effect on rows
    - Delete confirmation modal
    - Responsive: horizontal scroll on mobile
  - **Reference:** Design Doc Section 6.3, Requirements 5

- [ ] **3.1.3** Create posts list page
  - **Files:** `app/admin/posts/page.tsx` (create new)
  - **Dependencies:** 3.1.1 (posts API), 3.1.2 (PostsTable)
  - **Acceptance Criteria:**
    - Server component fetching posts from API
    - Page header with title "Yazılar" and "Yeni Yazı Ekle" button
    - Renders PostsTable with fetched data
    - "Yeni Yazı Ekle" navigates to `/admin/posts/new`
    - Edit action navigates to `/admin/posts/[id]/edit`
    - Delete action calls delete API and refreshes
    - Toggle publish calls update API with new status
    - Loading state while fetching
  - **Reference:** Design Doc Section 1.4, Requirements 5

### 3.2 Create Post

- [ ] **3.2.1** Create post creation API
  - **Files:** `app/api/admin/posts/route.ts` (add POST handler)
  - **Dependencies:** 3.1.1 (GET already exists)
  - **Acceptance Criteria:**
    - POST endpoint accepts: title, slug, excerpt, content, category, featured_image_url, published
    - Validates required fields: title, slug, content, category
    - Checks slug uniqueness, returns 409 if duplicate
    - Inserts new post into Supabase `posts` table
    - Calls `revalidatePath('/blog')` to clear cache
    - Returns 201 with created post data
    - Error handling for database errors
  - **Reference:** Design Doc Section 5.3, Requirements 6

- [ ] **3.2.2** Create PostForm component
  - **Files:** `components/admin/PostForm.tsx` (create new)
  - **Dependencies:** None
  - **Acceptance Criteria:**
    - Client component with form fields: title, slug, excerpt, content, category, featured_image_url, published
    - Props: `initialData` (optional), `onSubmit`, `isEdit` flag
    - Slug auto-generation from title (optional, user can override)
    - Textarea for content (markdown support - future: rich text editor)
    - Category dropdown or input
    - Image URL input with optional preview
    - Published toggle switch
    - Buttons: "Kaydet" (save), "Taslak Olarak Kaydet" (save draft)
    - Client-side validation for required fields
    - Loading state during submission
    - Error message display
    - Success message/redirect on completion
  - **Reference:** Design Doc Section 6.2, Requirements 6

- [ ] **3.2.3** Create new post page
  - **Files:** `app/admin/posts/new/page.tsx` (create new)
  - **Dependencies:** 3.2.1 (POST API), 3.2.2 (PostForm)
  - **Acceptance Criteria:**
    - Client page (uses form)
    - Renders PostForm with no initial data
    - Page title: "Yeni Yazı Ekle"
    - onSubmit calls POST `/api/admin/posts`
    - On success, redirects to `/admin/posts` with success toast
    - Cancel button returns to `/admin/posts`
  - **Reference:** Design Doc Section 1.4, Requirements 6

### 3.3 Update Post

- [ ] **3.3.1** Create single post API
  - **Files:** `app/api/admin/posts/[id]/route.ts` (create new)
  - **Dependencies:** None
  - **Acceptance Criteria:**
    - GET endpoint returns single post by ID
    - Returns 404 if post not found
    - Returns all post fields for editing
  - **Reference:** Design Doc Section 5.3, Requirements 7

- [ ] **3.3.2** Create post update API
  - **Files:** `app/api/admin/posts/[id]/route.ts` (add PUT handler)
  - **Dependencies:** 3.3.1 (GET already exists)
