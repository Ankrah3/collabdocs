import { supabase } from "./supabase";

export type SharePermission = "viewer" | "editor";

export interface DocumentShare {
  id: string;
  document_id: string;
  owner_id: string;
  shared_with_email: string;
  permission: SharePermission;
  created_at: string;
}

// Share a document with another registered user.
export async function shareDocument(
  documentId: string,
  ownerId: string,
  email: string,
  permission: SharePermission,
): Promise<void> {
  const { error } = await supabase
    .from("document_shares")
    .upsert(
      {
        document_id: documentId,
        owner_id: ownerId,
        shared_with_email: email.trim().toLowerCase(),
        permission,
      },
      {
        onConflict: "document_id,shared_with_email",
      },
    );

  if (error) throw error;
}

// Retrieve sharing invitations for a document.
export async function getDocumentShares(
  documentId: string,
): Promise<DocumentShare[]> {
  const { data, error } = await supabase
    .from("document_shares")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as DocumentShare[];
}

// Revoke access to a document.
export async function revokeDocumentShare(
  shareId: string,
): Promise<void> {
  const { error } = await supabase
    .from("document_shares")
    .delete()
    .eq("id", shareId);

  if (error) throw error;
}
