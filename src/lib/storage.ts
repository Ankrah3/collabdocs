import type { Document } from "../types/document";

const STORAGE_KEY = "collabdocs_documents";

export function getDocuments(): Document[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Document[]) : [];
  } catch {
    return [];
  }
}

export function saveDocuments(documents: Document[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}
