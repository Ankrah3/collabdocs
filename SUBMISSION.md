# CollabDocs – Assessment Submission

## Project Information

**Project:** CollabDocs  
**Developer:** David Ankrah  
**Project Type:** AI-Native Full-Stack Development Assessment

## Project Links

- **Live Application:** https://collabdocs-tan.vercel.app
- **GitHub Repository:** https://github.com/Ankrah3/collabdocs
- **Deployment Platform:** Vercel
- **Backend Platform:** Supabase

## Project Description

CollabDocs is a web-based collaborative document editor inspired by Google Docs. Users can register, log in, create and manage documents, edit content using rich-text formatting, automatically save changes, import and export documents, and share documents with viewer or editor permissions.

## Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Tiptap
- Supabase
- PostgreSQL
- Vitest
- Vercel

## Implemented Features

- User registration and authentication.
- Document creation and management.
- Rich-text editing.
- Debounced automatic saving.
- TXT, HTML, and HTM document import.
- TXT and HTML document export.
- Document sharing with viewer and editor permission options.
- Share access management and revocation.
- Database persistence and Row Level Security.

## Testing Results

The following were manually verified in the production application:

- Authentication and login.
- Document creation.
- Rich-text formatting.
- Autosave and persistence after refresh.
- Document import and export.
- Document deletion.

Automated testing:

- Six document import/export tests passed.
- TypeScript checks passed.
- ESLint passed.
- Production build completed successfully.

**Testing limitation:** Cross-account sharing permissions have not been independently verified using a second user account.

## Documentation

- `README.md` – project overview and setup instructions.
- `ARCHITECTURE.md` – application architecture and technical decisions.
- `AI_WORKFLOW.md` – AI-assisted development workflow.

## Demonstration Video

**Video link:** [ADD YOUR 3–5 MINUTE WALKTHROUGH VIDEO LINK]

The demonstration should cover:

1. Application overview and login.
2. Creating a document.
3. Rich-text editing.
4. Autosave and refreshing.
5. Importing and exporting a document.
6. Document management.

## Screenshots

Add screenshots of:

- Login screen.

![login screen](image.png)

- Main workspace.

![Main workspace](image-1.png)

- Rich-text editor.

![Rich-text editor](image-2.png)

- Document import/export functionality.

![Document import/export functionality](image-3.png)

**Screenshot folder:**
![Screenshot files](image-4.png)

## Test Account

Provide an assessment test account separately or through the approved submission folder.

- **Email:** ankrahd75@gmail.com
- **Password:** 123456

Do not include Supabase secret or service-role credentials.

## Deployment

The production application is hosted on Vercel:

https://collabdocs-tan.vercel.app

## Final Notes

CollabDocs was developed using React, TypeScript, and Supabase, with AI assistance supporting planning, implementation, debugging, and documentation.

The production application has been deployed and its principal document-management workflows have been manually tested.
