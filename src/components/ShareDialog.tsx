import { useEffect, useState } from "react";
import { Mail, Trash2, X, UserPlus } from "lucide-react";
import {
  shareDocument,
  getDocumentShares,
  revokeDocumentShare,
  type DocumentShare,
  type SharePermission,
} from "../lib/sharing";

interface ShareDialogProps {
  documentId: string;
  ownerId: string;
  onClose: () => void;
}

export default function ShareDialog({
  documentId,
  ownerId,
  onClose,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("viewer");
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchShares() {
      try {
        const result = await getDocumentShares(documentId);

        if (!cancelled) {
          setShares(result);
        }
      } catch (err) {
        console.error("Failed to load shares:", err);

        if (!cancelled) {
          setError("Could not load sharing permissions.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchShares();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  async function handleShare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      await shareDocument(documentId, ownerId, normalizedEmail, permission);

      const updatedShares = await getDocumentShares(documentId);

      setShares(updatedShares);
      setEmail("");
      setMessage("Document access updated successfully.");
    } catch (err) {
      console.error("Failed to share document:", err);
      setError("Could not share this document. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(shareId: string) {
    if (!window.confirm("Revoke this person's access?")) return;

    setError("");
    setMessage("");

    try {
      await revokeDocumentShare(shareId);

      setShares((current) => current.filter((share) => share.id !== shareId));

      setMessage("Access revoked successfully.");
    } catch (err) {
      console.error("Failed to revoke access:", err);
      setError("Could not revoke access.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              id="share-dialog-title"
              className="text-xl font-bold text-slate-900"
            >
              Share document
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage who can access this document.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sharing dialog"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label
              htmlFor="share-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
              <Mail size={17} className="text-slate-500" />
              <input
                id="share-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="colleague@example.com"
                className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="share-permission"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Permission
            </label>

            <select
              id="share-permission"
              value={permission}
              onChange={(event) =>
                setPermission(event.target.value as SharePermission)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="viewer">Viewer - Can read</option>
              <option value="editor">Editor - Can edit</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            <UserPlus size={17} />
            {submitting ? "Sharing..." : "Share document"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="mt-4 text-sm text-emerald-400">
            {message}
          </p>
        )}

        <div className="mt-7 border-t border-slate-200 pt-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            People with access
          </h3>

          {loading ? (
            <p className="text-sm text-slate-500">Loading permissions...</p>
          ) : shares.length === 0 ? (
            <p className="text-sm text-slate-500">
              This document hasn't been shared yet.
            </p>
          ) : (
            <div className="space-y-3">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-900">
                      {share.shared_with_email}
                    </p>
                    <p className="mt-1 text-xs capitalize text-slate-400">
                      {share.permission}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRevoke(share.id)}
                    aria-label={`Revoke access for ${share.shared_with_email}`}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
