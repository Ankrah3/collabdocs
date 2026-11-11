import type { Document } from "../types/document";
import { supabase } from "./supabase";

interface DatabaseDocument {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function mapDocument(row: DatabaseDocument): Document {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    owner: row.owner_id,
    permission: "owner",
  };
}

// Fetch owned and RLS-visible shared documents for the logged-in user.
export async function getUserDocuments(
  userId: string,
  userEmail: string,
): Promise<Document[]> {
  const [
    { data: documents, error: documentsError },
    { data: shares, error: sharesError },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false }),

    supabase
      .from("document_shares")
      .select("document_id, permission")
      .eq("shared_with_email", userEmail),
  ]);

  if (documentsError) throw documentsError;
  if (sharesError) throw sharesError;

  const permissionMap = new Map(
    shares.map((share) => [share.document_id, share.permission]),
  );

  return (documents as DatabaseDocument[]).map((row) => ({
    ...mapDocument(row),
    permission:
      row.owner_id === userId
        ? "owner"
        : (permissionMap.get(row.id) as "viewer" | "editor" | undefined),
  }));
}

// Create a new document.
export async function createUserDocument(userId: string): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      owner_id: userId,
      title: "Untitled document",
      content: "<p>Start writing your document here...</p>",
    })
    .select()
    .single();

  if (error) throw error;

  return mapDocument(data as DatabaseDocument);
}

// Update an existing document.
export async function updateUserDocument(
  id: string,
  updates: Pick<Document, "title" | "content">,
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update({
      title: updates.title,
      content: updates.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

// Delete a document.
export async function deleteUserDocument(id: string): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) throw error;
}
