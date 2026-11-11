import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Settings,
  Users,
  Clock3,
  Star,
  Menu,
  Save,
  Upload,
  Download,
} from "lucide-react";
import {
  importDocumentFile,
  exportDocumentFile,
} from "./lib/documentFiles";
import type { Document } from "./types/document";
import type { User } from "@supabase/supabase-js";
import {
  getUserDocuments,
  createUserDocument,
  updateUserDocument,
  deleteUserDocument,
} from "./lib/documents";
import DocumentEditor from "./components/DocumentEditor";
import ShareDialog from "./components/ShareDialog";
import type { Session } from "@supabase/supabase-js";
import AuthScreen from "./components/AuthScreen";
import { supabase } from "./lib/supabase";

function Workspace({ user }: { user: User }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [shareOpen, setShareOpen] = useState(false);
  const saveTimers = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const pendingSaves = useRef<
    Record<string, Pick<Document, "title" | "content">>
  >({});

  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeDocument =
    documents.find((document) => document.id === activeId) ?? documents[0];

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      try {
        setLoadingDocuments(true);

        const result = await getUserDocuments(
          user.id,
          user.email ?? "",
        );

        if (!cancelled) {
          setDocuments(result);
          setActiveId(result[0]?.id ?? "");
        }
      } catch (error) {
        console.error("Failed to load documents:", error);
        if (!cancelled) {
          setSaveStatus("Failed to load documents");
        }
      } finally {
        if (!cancelled) {
          setLoadingDocuments(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [user.id, user.email]);

  async function addDocument() {
    try {
      setSaveStatus("Creating...");

      const document = await createUserDocument(user.id);
      const ownedDocument: Document = {
        ...document,
        permission: "owner",
      };

      setDocuments((current) => [ownedDocument, ...current]);
      setActiveId(ownedDocument.id);
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Failed to create document:", error);
      setSaveStatus("Failed to create document");
    }
  }

  function updateDocument(
    id: string,
    updates: Partial<Document>,
  ) {
    const existing = documents.find((document) => document.id === id);

    if (!existing || existing.permission === "viewer") return;

    // Update the interface immediately.
    setDocuments((current) =>
      current.map((document) =>
        document.id === id
          ? { ...document, ...updates, updatedAt: new Date().toISOString() }
          : document,
      ),
    );

    // Combine changes so title and content updates aren't lost.
    const previous = pendingSaves.current[id] ?? {
      title: existing.title,
      content: existing.content,
    };

    const next = {
      ...previous,
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.content !== undefined && { content: updates.content }),
    };

    pendingSaves.current[id] = next;
    setSaveStatus("Unsaved changes");

    // Reset the timer whenever another edit occurs.
    clearTimeout(saveTimers.current[id]);

    saveTimers.current[id] = setTimeout(async () => {
      try {
        await updateUserDocument(id, pendingSaves.current[id]);

        delete pendingSaves.current[id];
        delete saveTimers.current[id];

        setSaveStatus("Saved");
      } catch (error) {
        console.error("Failed to save document:", error);
        setSaveStatus("Save failed");
      }
    }, 800);
  }

  async function removeDocument(id: string) {
    const existing = documents.find((document) => document.id === id);

    if (!existing || existing.permission !== "owner") return;

    try {
      clearTimeout(saveTimers.current[id]);
      delete saveTimers.current[id];
      delete pendingSaves.current[id];

      await deleteUserDocument(id);

      setDocuments((current) =>
        current.filter((document) => document.id !== id),
      );

      if (activeId === id) {
        const remaining = documents.filter(
          (document) => document.id !== id,
        );

        setActiveId(remaining[0]?.id ?? "");
      }

      setSaveStatus("Saved");
    } catch (error) {
      console.error("Failed to delete document:", error);
      setSaveStatus("Delete failed");
    }
  }

  async function saveActiveDocument() {
    if (
      !activeDocument ||
      activeDocument.permission === "viewer"
    ) {
      return;
    }

    try {
      setSaveStatus("Saving...");

      // Cancel a pending autosave so it cannot race with this save.
      clearTimeout(saveTimers.current[activeDocument.id]);
      delete saveTimers.current[activeDocument.id];

      const pending = pendingSaves.current[activeDocument.id];

      const updates = pending ?? {
        title: activeDocument.title,
        content: activeDocument.content,
      };

      await updateUserDocument(activeDocument.id, updates);

      if (pendingSaves.current[activeDocument.id] === pending) {
        delete pendingSaves.current[activeDocument.id];
      }

      setSaveStatus("Saved");
    } catch (error) {
      console.error("Failed to save document:", error);
      setSaveStatus("Save failed");
    }
  }

  async function handleImportDocument(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file || !activeDocument) return;

    if (activeDocument.permission === "viewer") {
      setSaveStatus("You don't have permission to import files");
      event.target.value = "";
      return;
    }

    try {
      const content = await importDocumentFile(file);

      const title = file.name.replace(/\.(txt|html?)$/i, "");

      updateDocument(activeDocument.id, { title, content });

      setSaveStatus("Imported — saving...");
    } catch (error) {
      console.error("Import failed:", error);
      setSaveStatus(
        error instanceof Error ? error.message : "Import failed",
      );
    } finally {
      event.target.value = "";
    }
  }

  function handleExportDocument(format: "html" | "txt") {
    if (!activeDocument) return;

    exportDocumentFile(
      activeDocument.title,
      activeDocument.content,
      format,
    );
  }

  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } shrink-0 overflow-hidden border-r border-slate-200 bg-white transition-all duration-300`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
            <FileText size={21} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              CollabDocs
            </h1>
            <p className="text-xs text-slate-500">Workspace</p>
          </div>
        </div>

        <div className="p-5">
          <button
            onClick={addDocument}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            <Plus size={18} />
            New document
          </button>

          <div className="relative mt-7">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400"
            />
          </div>

          <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-lg bg-indigo-500/10 px-3 py-2.5 text-left text-sm text-indigo-300">
              <FileText size={17} />
              All documents
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100">
              <Users size={17} />
              Shared with me
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100">
              <Star size={17} />
              Starred
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100">
              <Clock3 size={17} />
              Recent
            </button>
          </nav>

          <div className="mt-9">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                My documents
              </p>
              <span className="text-xs text-slate-500">{documents.length}</span>
            </div>

            <div className="space-y-1">
              {filteredDocuments.map((document) => (
                <button
                  key={document.id}
                  onClick={() => setActiveId(document.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeId === document.id
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FileText size={16} className="shrink-0" />
                  <span className="truncate">{document.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 flex w-72 items-center gap-3 border-t border-slate-200 bg-white p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-300">
            DA
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">David</p>
            <p className="text-xs text-slate-500">Personal workspace</p>
          </div>
          <Settings size={18} className="text-slate-500" />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {activeDocument?.title ?? "No document selected"}
              </p>
              <p className="text-xs text-slate-500">Saved in your workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-emerald-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {saveStatus}
            </span>
            <button
              onClick={saveActiveDocument}
              disabled={
                !activeDocument ||
                activeDocument.permission === "viewer" ||
                saveStatus === "Saving..."
              }
              className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={() => {
                if (
                  activeDocument &&
                  window.confirm("Are you sure you want to delete this document?")
                ) {
                  removeDocument(activeDocument.id);
                }
              }}
              disabled={
                !activeDocument ||
                activeDocument.permission !== "owner"
              }
              className="rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              Delete document
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-5 py-12 sm:px-10">
          {loadingDocuments ? (
            <div className="py-24 text-center text-slate-500">
              Loading your documents...
            </div>
          ) : activeDocument ? (
            <>
              <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-400">
                    Document editor
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Your workspace
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Create, edit and organise your documents.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className={`flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 ${
                      activeDocument.permission === "viewer"
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer text-slate-700"
                    }`}
                  >
                    <Upload size={16} />
                    Import
                    <input
                      type="file"
                      accept=".txt,.html,.htm"
                      onChange={handleImportDocument}
                      disabled={activeDocument.permission === "viewer"}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => handleExportDocument("html")}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Download size={16} />
                    HTML
                  </button>

                  <button
                    onClick={() => handleExportDocument("txt")}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Download size={16} />
                    TXT
                  </button>

                  <button
                    onClick={() => setShareOpen(true)}
                    disabled={activeDocument.permission !== "owner"}
                    className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Users size={16} className="mr-2 inline" />
                    Share
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-8">
                <input
                  value={activeDocument.title}
                  disabled={activeDocument.permission === "viewer"}
                  onChange={(event) =>
                    updateDocument(activeDocument.id, {
                      title: event.target.value,
                    })
                  }
                  placeholder="Untitled document"
                  className="mb-6 w-full border-b border-slate-200 bg-transparent pb-4 text-2xl font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 sm:text-3xl"
                />

                <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-5 text-xs text-slate-500">
                  <span>
                    Created{" "}
                    {new Date(activeDocument.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    Edited{" "}
                    {new Date(activeDocument.updatedAt).toLocaleTimeString()}
                  </span>
                </div>

                <DocumentEditor
                  key={activeDocument.id}
                  content={activeDocument.content}
                  editable={activeDocument.permission !== "viewer"}
                  onChange={(content) =>
                    updateDocument(activeDocument.id, { content })
                  }
                />
              </div>
            </>
          ) : (
            <div className="py-24 text-center">
              <FileText size={40} className="mx-auto mb-4 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                No documents yet
              </h2>
              <button
                onClick={addDocument}
                className="mt-5 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white"
              >
                Create your first document
              </button>
            </div>
          )}
        </section>
      </main>
      {shareOpen && activeDocument && (
        <ShareDialog
          documentId={activeDocument.id}
          ownerId={user.id}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (mounted) {
        if (error) {
          console.error("Could not retrieve session:", error);
        }

        setSession(data.session);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        Loading your workspace...
      </div>
    );
  }

  return session ? <Workspace user={session.user} /> : <AuthScreen />;
}
