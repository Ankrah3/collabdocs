# CollabDocs

**A collaborative document editor for creating, editing, importing, exporting, and sharing documents.**

[Live Application](https://collabdocs-tan.vercel.app) · [GitHub Repository](https://github.com/Ankrah3/collabdocs)

## Overview

CollabDocs is a web-based document management and editing application inspired by Google Docs. It provides a clean workspace where authenticated users can create, edit, organize, and manage documents with rich-text formatting and automatic saving.

The application uses Supabase for authentication, database persistence, and document access management.

## Features

- **Authentication:** User registration and login using Supabase Auth.
- **Document Management:** Create, edit, and delete documents.
- **Rich-Text Editor:** Bold, italic, underline, headings, bullet lists, and numbered lists.
- **Automatic Saving:** Debounced autosave keeps document changes persisted.
- **Document Import:** Import `.txt`, `.html`, and `.htm` files.
- **Document Export:** Export documents as HTML or plain text.
- **Document Sharing:** Share documents with specified email addresses using viewer or editor permissions.
- **Access Management:** View and revoke document-sharing permissions.
- **Responsive Interface:** Modern workspace designed for a clean editing experience.

## Technology Stack

| Technology   | Purpose                                |
| ------------ | -------------------------------------- |
| React        | Frontend application                   |
| TypeScript   | Type safety                            |
| Vite         | Development and build tooling          |
| Tailwind CSS | Styling                                |
| Tiptap       | Rich-text editing                      |
| Supabase     | Authentication and PostgreSQL database |
| Lucide React | Icons                                  |
| Vitest       | Automated testing                      |
| Vercel       | Production deployment                  |

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project

### Installation

Clone the repository:

```bash
git clone https://github.com/Ankrah3/collabdocs.git
cd collabdocs
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

Use your own Supabase project URL and publishable key. Never expose a Supabase service-role or secret key in frontend code.

### Run Locally

```bash
npm run dev
```

Open the local URL displayed by Vite.

## Database Setup

CollabDocs uses Supabase PostgreSQL.

The application requires:

- A `documents` table for document records.
- A `document_shares` table for sharing permissions.
- Supabase Row Level Security (RLS) policies to control document access.

Configure the corresponding tables, relationships, and RLS policies in your Supabase project before running the application.

## Testing

Run the automated tests:

```bash
npm run test:run
```

Run TypeScript checks:

```bash
npx tsc --noEmit
```

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Deployment

The production application is deployed using Vercel and connected to the GitHub repository.

Production URL:

https://collabdocs-tan.vercel.app

Configure the required Supabase environment variables
