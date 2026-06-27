# Requirements Document

## Introduction

This document specifies the requirements for adding an Admin Panel and Cookie Consent Banner to the Sefa Çam blog site. The Admin Panel provides a single-user, password-protected interface for managing blog content, subscribers, and site settings. The Cookie Consent Banner ensures GDPR compliance by allowing users to accept or reject cookies before tracking begins.

## Glossary

- **Admin_Panel**: The password-protected web interface for site administration accessible at /admin route
- **Admin_User**: The authenticated user with email sefacam@gmail.com who can access the Admin Panel
- **Session**: A secure, time-limited authenticated state managed by iron-session with HTTP-only cookies
- **Cookie_Consent_Banner**: A UI component that displays cookie policy information and collects user consent
- **User_Preference**: The stored choice (accept/reject) for cookie consent saved in localStorage
- **Site_Settings**: Key-value configuration data stored in Supabase site_settings table
- **Post**: A blog article with properties including title, slug, excerpt, content, category, featured_image_url, and published status
- **Subscriber**: An email address stored in the subscribers table that has opted in to receive updates
- **Dashboard**: The main landing page of the Admin Panel showing statistics and quick actions
- **Middleware**: Next.js middleware that intercepts requests to protected routes and validates sessions
- **JWT**: JSON Web Token used for session authentication, signed and verified using the jose package
- **Supabase_Client**: The database client for reading and writing data to Supabase tables
- **Hero_Section**: The prominent banner section on the home page with customizable title, subtitle, and button text

## Requirements

### Requirement 1: Authentication System

**User Story:** As an admin user, I want to log in securely to the admin panel, so that I can manage my blog content without unauthorized access.

#### Acceptance Criteria

1. WHEN the Admin User navigates to /admin without a valid session, THE Admin_Panel SHALL redirect to the login page
2. WHEN the Admin User submits valid credentials (sefacam@gmail.com / sefa@2026), THE Admin_Panel SHALL create a Session with an HTTP-only cookie containing a JWT
3. WHEN the Admin User submits invalid credentials, THE Admin_Panel SHALL return an error message and SHALL NOT create a Session
4. THE Session SHALL expire after 7 days of inactivity
5. WHEN the Admin User clicks logout, THE Admin_Panel SHALL destroy the Session and redirect to the login page
6. THE Admin_Panel SHALL store admin credentials in environment variables (ADMIN_EMAIL and ADMIN_PASSWORD)
7. THE Admin_Panel SHALL use the jose package to sign and verify JWT tokens for Edge Runtime compatibility

### Requirement 2: Route Protection

**User Story:** As a site owner, I want admin routes protected by middleware, so that unauthorized users cannot access sensitive functionality.

#### Acceptance Criteria

1. WHEN any user requests a path starting with /admin, THE Middleware SHALL verify the Session JWT
2. IF the Session JWT is invalid or expired, THEN THE Middleware SHALL redirect to /admin/login
3. IF the Session JWT is valid, THEN THE Middleware SHALL allow the request to proceed to the admin route
4. THE Middleware SHALL run on Edge Runtime for optimal performance
5. THE Middleware SHALL exempt /admin/login and /admin/api/auth routes from session validation

### Requirement 3: Admin Dashboard

**User Story:** As an admin user, I want to see key statistics on the dashboard, so that I can quickly understand my blog's performance.

#### Acceptance Criteria

1. WHEN the Admin User accesses /admin, THE Dashboard SHALL display the total count of published posts from the Supabase_Client
2. THE Dashboard SHALL display the total count of subscribers from the Supabase_Client
3. THE Dashboard SHALL display the total count of contact form messages from the Supabase_Client
4. THE Dashboard SHALL display quick action links to create new post, manage posts, and manage subscribers
5. THE Dashboard SHALL use a premium dark theme with a sidebar navigation layout

### Requirement 4: Hero Section Editor

**User Story:** As an admin user, I want to edit the hero section content, so that I can update the home page messaging without code changes.

#### Acceptance Criteria

1. WHEN the Admin User accesses the hero editor, THE Admin_Panel SHALL fetch current values (hero_title, hero_subtitle, hero_button_text) from the Site_Settings table
2. WHEN the Admin User submits updated hero section values, THE Admin_Panel SHALL write the new values to the Site_Settings table with keys hero_title, hero_subtitle, and hero_button_text
3. WHEN the hero section values are updated, THE Admin_Panel SHALL revalidate the home page cache
4. THE Admin_Panel SHALL display a success message after successfully saving hero section changes
5. IF the Site_Settings table write fails, THEN THE Admin_Panel SHALL display an error message with details

### Requirement 5: Post Management List

**User Story:** As an admin user, I want to see all posts including drafts, so that I can manage my entire content library.

#### Acceptance Criteria

1. WHEN the Admin User accesses the post management page, THE Admin_Panel SHALL display all posts from the Supabase_Client including both published and draft posts
2. THE Admin_Panel SHALL display for each Post: title, slug, category, published status, and created date
3. THE Admin_Panel SHALL provide action buttons for each Post: Edit, Publish/Unpublish, and Delete
4. WHEN the Admin User clicks Publish on a draft Post, THE Admin_Panel SHALL update the Post published field to true
5. WHEN the Admin User clicks Unpublish on a published Post, THE Admin_Panel SHALL update the Post published field to false
6. WHEN the Admin User clicks Delete on a Post, THE Admin_Panel SHALL prompt for confirmation before deleting the Post from Supabase
7. THE Admin_Panel SHALL sort posts by created_at date in descending order (newest first)

### Requirement 6: Post Creation

**User Story:** As an admin user, I want to create new blog posts, so that I can publish content to my blog.

#### Acceptance Criteria

1. WHEN the Admin User accesses the new post form, THE Admin_Panel SHALL display input fields for title, slug, excerpt, content, category, featured_image_url, and published status
2. WHEN the Admin User submits the new post form with valid data, THE Admin_Panel SHALL insert a new Post record into Supabase with all provided fields
3. WHEN the Admin User submits the new post form with a duplicate slug, THE Admin_Panel SHALL return an error message indicating the slug must be unique
4. THE Admin_Panel SHALL validate that title, slug, content, and category fields are not empty before submission
5. WHEN a new Post is successfully created, THE Admin_Panel SHALL revalidate the blog list page cache
6. WHEN a new Post is successfully created, THE Admin_Panel SHALL redirect to the post management page with a success message
7. THE Admin_Panel SHALL provide a rich text editor for the content field supporting markdown syntax

### Requirement 7: Post Editing

**User Story:** As an admin user, I want to edit existing posts, so that I can update content and fix errors.

#### Acceptance Criteria

1. WHEN the Admin User clicks Edit on a Post, THE Admin_Panel SHALL navigate to an edit form pre-populated with the Post's current values
2. WHEN the Admin User submits the edit form with valid data, THE Admin_Panel SHALL update the Post record in Supabase with the modified fields
3. WHEN the Admin User changes the slug to a value already used by another Post, THE Admin_Panel SHALL return an error message
4. WHEN a Post is successfully updated, THE Admin_Panel SHALL revalidate both the blog list page and the individual post page cache
5. THE Admin_Panel SHALL preserve the original created_at timestamp when updating a Post
6. THE Admin_Panel SHALL update the updated_at timestamp to the current time when a Post is modified

### Requirement 8: Subscriber Management

**User Story:** As an admin user, I want to view and manage subscribers, so that I can maintain my mailing list.

#### Acceptance Criteria

1. WHEN the Admin User accesses the subscriber management page, THE Admin_Panel SHALL display all subscriber email addresses from the Supabase_Client
2. THE Admin_Panel SHALL display for each Subscriber: email address, subscription date, and verification status
3. WHEN the Admin User clicks Delete on a Subscriber, THE Admin_Panel SHALL prompt for confirmation before removing the Subscriber from Supabase
4. THE Admin_Panel SHALL sort subscribers by created_at date in descending order (newest first)
5. THE Admin_Panel SHALL display the total count of subscribers at the top of the page

### Requirement 9: Cookie Consent Banner

**User Story:** As a site visitor, I want to accept or reject cookies, so that I have control over my privacy and comply with GDPR requirements.

#### Acceptance Criteria

1. WHEN a user visits any page without a stored User_Preference, THE Cookie_Consent_Banner SHALL display with a slide-up animation from the bottom of the viewport
2. THE Cookie_Consent_Banner SHALL display text explaining cookie usage, an Accept button, and a Reject button
3. WHEN the user clicks Accept, THE Cookie_Consent_Banner SHALL store "accepted" in localStorage with key "cookie-consent" and hide the banner
4. WHEN the user clicks Reject, THE Cookie_Consent_Banner SHALL store "rejected" in localStorage with key "cookie-consent" and hide the banner
5. WHEN a user has a stored User_Preference in localStorage, THE Cookie_Consent_Banner SHALL NOT display on any page
6. THE Cookie_Consent_Banner SHALL be rendered in app/layout.tsx to appear site-wide
7. THE Cookie_Consent_Banner SHALL use a fixed position overlay that does not block critical page content
8. THE Cookie_Consent_Banner SHALL be accessible via keyboard navigation and screen readers

### Requirement 10: Database Schema

**User Story:** As a developer, I want the necessary database tables created, so that the admin panel can store and retrieve data.

#### Acceptance Criteria

1. THE Supabase_Client SHALL have a site_settings table with columns: id (uuid primary key), key (text unique), value (text), updated_at (timestamp)
2. THE Supabase_Client SHALL support querying the site_settings table by key to retrieve configuration values
3. THE Supabase_Client SHALL support upserting records in the site_settings table to update configuration values
4. THE subscribers table SHALL already exist with columns: id, email, created_at, verified
5. THE posts table SHALL already exist with columns: id, title, slug, excerpt, content, category, featured_image_url, published, created_at, updated_at

### Requirement 11: Session Security

**User Story:** As a site owner, I want secure session management, so that admin sessions cannot be hijacked or tampered with.

#### Acceptance Criteria

1. THE Session SHALL use HTTP-only cookies to prevent client-side JavaScript access
2. THE Session SHALL use SameSite=Lax cookie attribute to prevent CSRF attacks
3. THE Session SHALL use Secure cookie attribute when running on HTTPS
4. THE JWT SHALL be signed with a secret key stored in environment variable SESSION_SECRET with minimum 32 characters
5. THE JWT SHALL include expiration timestamp and SHALL be rejected if expired
6. THE JWT SHALL include the Admin User email as the subject claim

### Requirement 12: Admin Panel UI Theme

**User Story:** As an admin user, I want a premium dark theme interface, so that I have a professional and comfortable working environment.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use a dark color scheme with high contrast for text readability
2. THE Admin_Panel SHALL display a persistent sidebar navigation with links to Dashboard, Posts, Subscribers, Hero Editor, and Logout
3. THE Admin_Panel SHALL use consistent spacing, typography, and component styling across all admin pages
4. THE Admin_Panel SHALL be responsive and functional on desktop viewports (minimum 1024px width)
5. THE Admin_Panel SHALL use smooth transitions and hover states for interactive elements
6. THE Admin_Panel SHALL display loading states during asynchronous operations (saving, loading data)

