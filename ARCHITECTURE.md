# CollabDocs – Architecture

## 1. Overview

CollabDocs is a client-side web application built with React and TypeScript. It uses Supabase as its backend service for authentication, PostgreSQL data storage, and access control.

The application follows a component-based architecture, separating the user interface, business logic, data access, and shared types.

## 2. Technology Architecture

- **Presentation layer:** React, TypeScript, Tailwind CSS.
- **Rich-text editing:** Tiptap.
- **Application services:** Supabase JavaScript client.
- **Authentication:** Supabase Auth.
- **Persistence:** Supabase PostgreSQL.
- **Access control:** PostgreSQL Row Level Security.
- **Testing:** Vitest.
- **Hosting:** Vercel.

## 3. Application Structure

The main application areas include:

- `src/components/` – reusable UI components, authentication screens, editor toolbar, document editor, and sharing dialog.
- `src/lib/` – Supabase client, document operations, sharing operations, and document import/export utilities.
- `src/types/` – shared TypeScript interfaces and types.
- `src/test/` – test setup and testing configuration.
- `src/App.tsx` – application entry point and authenticated workspace management.

## 4. Data Model

### Documents

The `documents` table stores:

- `id` – unique document identifier.
- `owner_id` – authenticated document owner's user ID.
- `title` – document title.
- `content` – rich-text HTML content.
- `created_at` – creation timestamp.
- `updated_at` – last update timestamp.

### Document Shares

The `document_shares` table stores:

- `id` – unique share identifier.
- `document_id` – associated document.
- `owner_id` – document owner's user ID.
- `shared_with_email` – recipient email address.
- `permission` – either `viewer` or `editor`.
- `created_at` – share creation timestamp.

## 5. Authentication and Authorization

Supabase Auth manages user registration and login.

PostgreSQL Row Level Security policies enforce access to documents:

- Owners can manage their documents.
- Viewers can read documents shared with their email address.
- Editors can read and update shared documents.
- Owners can create, update, and revoke sharing permissions.

The application also applies permission checks in its interface to prevent unauthorized editing and deletion actions.

## 6. Document Editing and Persistence

Tiptap provides rich-text editing functionality.

When document content or its title changes:

1. The application updates the local interface.
2. A debounce timer delays the database update.
3. After approximately 800 milliseconds without another change, the application saves to Supabase.
4. The saved document can be retrieved after refreshing the application.

## 7. Import and Export

The application supports:

- TXT import, converting plain-text lines into paragraphs.
- HTML and HTM import.
- HTML export.
- Plain-text export.

## 8. Deployment

The frontend is deployed to Vercel and connected to the GitHub repository.

Supabase provides the backend services. The frontend receives its Supabase URL and publishable key through Vercel environment variables.

Production URL: https://collabdocs-tan.vercel.app

## 9. Current Limitations

- Sharing permissions have not been independently verified using a second user account.
- The current implementation uses Supabase directly from the frontend rather than a separate custom backend API.
- Real-time simultaneous editing and live collaborator cursors are not implemented.
